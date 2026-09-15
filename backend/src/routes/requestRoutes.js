import express from 'express';
import Request from '../models/Request.js';
import Group from '../models/Group.js';
import JoinRequest from '../models/JoinRequest.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { calculateHaversineDistance, calculateGeographicMidpoint, calculateGroupSplit } from '../utils/geo.js';

const router = express.Router();

// @route   POST /api/requests
// @desc    Create a new Blinkit order request & initialize group
router.post('/', protect, async (req, res) => {
  try {
    const { totalMrp, standaloneTotal, combinedOrderTotal, localityName, deadline, items, lat, lng } = req.body;

    if (!totalMrp || !standaloneTotal || !combinedOrderTotal || !localityName || !deadline) {
      return res.status(400).json({
        message: 'Mandatory fields missing: totalMrp, standaloneTotal, combinedOrderTotal, localityName, and deadline are required.'
      });
    }

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const maxDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ message: 'Invalid deadline date format' });
    }

    if (deadlineDate <= now) {
      return res.status(400).json({ message: 'Deadline must be a future time' });
    }

    if (deadlineDate > maxDeadline) {
      return res.status(400).json({ message: 'Deadline cannot exceed 2 days (48 hours) from now' });
    }

    const coords = [
      lng !== undefined ? parseFloat(lng) : (req.user.location?.coordinates?.[0] || 86.1438),
      lat !== undefined ? parseFloat(lat) : (req.user.location?.coordinates?.[1] || 22.7780)
    ];

    const timestampPart = Date.now().toString().slice(-4);
    const randomPart = Math.floor(100 + Math.random() * 900);
    const orderNumber = `CM-ORD-${timestampPart}${randomPart}`;

    const orderRequest = await Request.create({
      orderNumber,
      user: req.user._id,
      store: 'Blinkit',
      totalMrp: parseFloat(totalMrp),
      standaloneTotal: parseFloat(standaloneTotal),
      combinedOrderTotal: parseFloat(combinedOrderTotal),
      localityName,
      deadline: deadlineDate,
      items: Array.isArray(items) ? items : [],
      status: 'OPEN',
      isDeletedFromFeed: false,
      location: {
        type: 'Point',
        coordinates: coords
      }
    });

    const initialParticipant = {
      user: req.user._id,
      userName: req.user.name,
      totalMrp: parseFloat(totalMrp),
      itemMRP: parseFloat(totalMrp),
      standaloneTotal: parseFloat(standaloneTotal),
      standaloneTotalAlone: parseFloat(standaloneTotal),
      items: Array.isArray(items) ? items : [],
      shareRatio: 1.0,
      finalPayment: parseFloat(combinedOrderTotal),
      savings: Math.round((parseFloat(standaloneTotal) - parseFloat(combinedOrderTotal)) * 100) / 100,
      settled: false,
      paymentStatus: 'PENDING'
    };

    const group = await Group.create({
      request: orderRequest._id,
      owner: req.user._id,
      combinedOrderTotal: parseFloat(combinedOrderTotal),
      status: 'PENDING',
      isDeletedFromFeed: false,
      participants: [initialParticipant],
      meetingPoint: {
        name: `${localityName} (Meeting Point TBD in chat)`,
        coordinates: coords
      },
      suggestedMidpoint: {
        name: localityName,
        coordinates: coords
      }
    });

    res.status(201).json({ request: orderRequest, group });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: error.message || 'Server error creating request' });
  }
});

// @route   GET /api/requests/nearby
// @desc    Get active nearby requests sorted by proximity, strictly capped at max 5km radius
router.get('/nearby', protect, async (req, res) => {
  try {
    const userLng = req.query.lng !== undefined && req.query.lng !== ''
      ? parseFloat(req.query.lng)
      : (req.user.location?.coordinates?.[0] || 86.1438);
    const userLat = req.query.lat !== undefined && req.query.lat !== ''
      ? parseFloat(req.query.lat)
      : (req.user.location?.coordinates?.[1] || 22.7780);

    // STRICT CAP: Max radius 5 km
    const requestedRadius = req.query.radius ? parseFloat(req.query.radius) : 5;
    const radiusKm = Math.min(requestedRadius, 5.0);

    const now = new Date();
    const allRequests = await Request.find({
      isDeletedFromFeed: { $ne: true },
      status: { $in: ['OPEN', 'FULL'] }
    })
      .populate('user', 'name email customId completedOrdersCount localityName location averageRating ratings')
      .lean();

    const formattedRequests = [];

    for (const reqDoc of allRequests) {
      if (new Date(reqDoc.deadline) < now && reqDoc.status === 'OPEN') {
        await Request.findByIdAndUpdate(reqDoc._id, { status: 'CLOSED', closedAt: now });
        reqDoc.status = 'CLOSED';
        continue;
      }

      const reqLng = reqDoc.user?.location?.coordinates?.[0] || reqDoc.location?.coordinates?.[0] || 86.1438;
      const reqLat = reqDoc.user?.location?.coordinates?.[1] || reqDoc.location?.coordinates?.[1] || 22.7780;
      const distanceKm = calculateHaversineDistance(userLat, userLng, reqLat, reqLng);

      if (distanceKm <= radiusKm) {
        const group = await Group.findOne({ request: reqDoc._id }).populate('participants.user', 'name customId');

        // Check if viewing user is already a member or has a pending join request
        const isMember = group?.participants?.some(
          (p) => (p.user?._id || p.user)?.toString() === req.user._id.toString()
        );
        const userJoinReq = await JoinRequest.findOne({
          request: reqDoc._id,
          applicant: req.user._id
        }).sort({ createdAt: -1 });

        formattedRequests.push({
          ...reqDoc,
          distanceKm,
          participantCount: group ? group.participants.length : 1,
          maxParticipants: 4,
          groupId: group ? group._id : null,
          isUserMember: Boolean(isMember),
          userJoinRequestStatus: userJoinReq ? userJoinReq.status : null
        });
      }
    }

    formattedRequests.sort((a, b) => a.distanceKm - b.distanceKm);
    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching nearby requests:', error);
    res.status(500).json({ message: 'Server error fetching nearby requests' });
  }
});

// @route   GET /api/requests/my-requests
// @desc    Get user's own created and joined requests (including history / archived posts)
router.get('/my-requests', protect, async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id })
      .populate('user', 'name customId averageRating')
      .sort({ createdAt: -1 })
      .lean();

    const result = [];
    for (const reqDoc of requests) {
      const group = await Group.findOne({ request: reqDoc._id }).populate('participants.user', 'name customId');
      result.push({
        ...reqDoc,
        groupId: group ? group._id : null,
        participantCount: group ? group.participants.length : 1,
        participants: group ? group.participants : []
      });
    }

    // Also fetch groups where user is a participant but not the owner
    const joinedGroups = await Group.find({
      'participants.user': req.user._id,
      owner: { $ne: req.user._id }
    })
      .populate('request')
      .populate('owner', 'name customId averageRating localityName')
      .lean();

    res.json({
      myPosts: result,
      joinedPosts: joinedGroups
    });
  } catch (error) {
    console.error('Error fetching my-requests:', error);
    res.status(500).json({ message: 'Server error fetching user requests' });
  }
});

// @route   PUT /api/requests/:id
// @desc    Edit full request post details (Items, Date, Total MRP, Standalone Fee, Combined Total, Locality Name, Lat/Lng)
router.put('/:id', protect, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { totalMrp, standaloneTotal, combinedOrderTotal, localityName, deadline, items, lat, lng } = req.body;

    const orderRequest = await Request.findById(requestId);
    if (!orderRequest) {
      return res.status(404).json({ message: 'Order request not found' });
    }

    if (orderRequest.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this order request' });
    }

    if (totalMrp !== undefined) orderRequest.totalMrp = parseFloat(totalMrp);
    if (standaloneTotal !== undefined) orderRequest.standaloneTotal = parseFloat(standaloneTotal);
    if (combinedOrderTotal !== undefined) orderRequest.combinedOrderTotal = parseFloat(combinedOrderTotal);
    if (localityName) orderRequest.localityName = localityName;
    if (deadline) orderRequest.deadline = new Date(deadline);
    if (Array.isArray(items)) orderRequest.items = items;
    if (lat !== undefined && lng !== undefined) {
      orderRequest.location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      };
    }

    await orderRequest.save();

    // Also update associated group
    const group = await Group.findOne({ request: requestId });
    if (group) {
      if (combinedOrderTotal !== undefined) group.combinedOrderTotal = parseFloat(combinedOrderTotal);
      // Update poster participant MRP and items
      const posterPart = group.participants.find((p) => p.user.toString() === req.user._id.toString());
      if (posterPart) {
        if (totalMrp !== undefined) {
          posterPart.totalMrp = parseFloat(totalMrp);
          posterPart.itemMRP = parseFloat(totalMrp);
        }
        if (standaloneTotal !== undefined) {
          posterPart.standaloneTotal = parseFloat(standaloneTotal);
          posterPart.standaloneTotalAlone = parseFloat(standaloneTotal);
        }
        if (Array.isArray(items)) posterPart.items = items;
      }
      // Recalculate split
      group.participants = calculateGroupSplit(group.participants, group.combinedOrderTotal);
      await group.save();
    }

    res.json({ message: 'Order request updated successfully', orderRequest, group });
  } catch (error) {
    console.error('Edit request error:', error);
    res.status(500).json({ message: 'Server error editing order request' });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Immediately delete an order request from active feed & archive to history
router.delete('/:id', protect, async (req, res) => {
  try {
    const requestId = req.params.id;
    const orderRequest = await Request.findById(requestId);

    if (!orderRequest) {
      return res.status(404).json({ message: 'Order request not found' });
    }

    if (orderRequest.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this order request' });
    }

    // Mark as deleted from active feeds while preserving in user history
    orderRequest.isDeletedFromFeed = true;
    if (orderRequest.status === 'OPEN' || orderRequest.status === 'FULL') {
      orderRequest.status = 'CLOSED';
      orderRequest.closedAt = new Date();
    }
    await orderRequest.save();

    await Group.updateMany({ request: requestId }, { isDeletedFromFeed: true, status: 'CLOSED' });

    res.json({ message: 'Order request removed from active feed and saved to your history' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Server error deleting order request' });
  }
});

// @route   POST /api/requests/:id/join-request
// @desc    Send a join/chat request to postee
router.post('/:id/join-request', protect, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { totalMrp, standaloneTotal, items, message } = req.body;

    if (!totalMrp || !standaloneTotal) {
      return res.status(400).json({ message: 'totalMrp and standaloneTotal are required to request join' });
    }

    const orderRequest = await Request.findById(requestId);
    if (!orderRequest) {
      return res.status(404).json({ message: 'Order request not found' });
    }

    if (orderRequest.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot request to join your own order post' });
    }

    if (orderRequest.status !== 'OPEN') {
      return res.status(400).json({ message: `Order post is currently ${orderRequest.status}` });
    }

    const existing = await JoinRequest.findOne({
      request: requestId,
      applicant: req.user._id,
      status: 'PENDING'
    });

    if (existing) {
      return res.status(400).json({ message: 'You already have a pending join request for this order' });
    }

    const joinReq = await JoinRequest.create({
      request: requestId,
      applicant: req.user._id,
      totalMrp: parseFloat(totalMrp),
      standaloneTotal: parseFloat(standaloneTotal),
      items: Array.isArray(items) ? items : [],
      message: message || 'Hey! I would like to combine my Blinkit order with yours.'
    });

    res.status(201).json({ message: 'Join request sent to postee successfully', joinRequest: joinReq });
  } catch (error) {
    console.error('Join request error:', error);
    res.status(500).json({ message: 'Server error sending join request' });
  }
});

// @route   GET /api/requests/:id/join-requests
// @desc    Get pending join requests for a postee
router.get('/:id/join-requests', protect, async (req, res) => {
  try {
    const requestId = req.params.id;
    const joinRequests = await JoinRequest.find({ request: requestId })
      .populate('applicant', 'name email customId completedOrdersCount localityName location averageRating')
      .sort({ createdAt: -1 });

    res.json(joinRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching join requests' });
  }
});

// @route   PATCH /api/requests/:id/respond-request
// @desc    Accept or reject a join request
router.patch('/:id/respond-request', protect, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { joinRequestId, action } = req.body;

    if (!joinRequestId || !['ACCEPT', 'REJECT'].includes(action)) {
      return res.status(400).json({ message: 'joinRequestId and valid action (ACCEPT/REJECT) are required' });
    }

    const orderRequest = await Request.findById(requestId);
    if (!orderRequest) {
      return res.status(404).json({ message: 'Order request not found' });
    }

    if (orderRequest.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the order poster can accept or reject join requests' });
    }

    const joinReq = await JoinRequest.findById(joinRequestId).populate('applicant');
    if (!joinReq) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    if (action === 'REJECT') {
      joinReq.status = 'REJECTED';
      await joinReq.save();
      return res.json({ message: 'Join request rejected', joinRequest: joinReq });
    }

    const group = await Group.findOne({ request: requestId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found for this request' });
    }

    if (group.participants.length >= 4) {
      return res.status(400).json({ message: 'Group is already full! Maximum 4 participants allowed.' });
    }

    const alreadyMember = group.participants.some(
      (p) => p.user.toString() === joinReq.applicant._id.toString()
    );

    if (!alreadyMember) {
      group.participants.push({
        user: joinReq.applicant._id,
        userName: joinReq.applicant.name,
        totalMrp: joinReq.totalMrp,
        itemMRP: joinReq.totalMrp,
        standaloneTotal: joinReq.standaloneTotal,
        standaloneTotalAlone: joinReq.standaloneTotal,
        items: joinReq.items || [],
        settled: false,
        paymentStatus: 'PENDING'
      });
    }

    // Recalculate Combined Checkout Total Expected based on sum of members' added items + sharedHandlingFee
    const totalMRP = group.participants.reduce((sum, p) => sum + (p.itemMRP !== undefined ? p.itemMRP : p.totalMrp), 0);
    group.combinedOrderTotal = totalMRP + (group.sharedHandlingFee || 35);
    orderRequest.combinedOrderTotal = group.combinedOrderTotal;
    await orderRequest.save();

    const updatedParticipants = calculateGroupSplit(group.participants, group.combinedOrderTotal);
    group.participants = updatedParticipants;

    const allCoords = [];
    const posterUser = await Request.findById(requestId).populate('user');
    if (posterUser && posterUser.user && posterUser.user.location?.coordinates) {
      allCoords.push(posterUser.user.location.coordinates);
    }
    if (joinReq.applicant.location?.coordinates) {
      allCoords.push(joinReq.applicant.location.coordinates);
    }

    if (allCoords.length > 0) {
      const midpoint = calculateGeographicMidpoint(allCoords);
      group.suggestedMidpoint = {
        name: 'Suggested Geographic Midpoint',
        coordinates: midpoint
      };
    }

    if (group.participants.length >= 4) {
      group.status = 'MATCHED';
      orderRequest.status = 'FULL';
      await orderRequest.save();
    } else {
      group.status = 'MATCHED';
    }

    await group.save();
    joinReq.status = 'ACCEPTED';
    await joinReq.save();

    res.json({ message: 'Participant accepted successfully!', group, joinRequest: joinReq });
  } catch (error) {
    console.error('Respond request error:', error);
    res.status(500).json({ message: 'Server error responding to join request' });
  }
});

// @route   PATCH /api/requests/:id/status
// @desc    Update request status (CLOSED / COMPLETED) regardless of member count & increment completed orders stats
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;

    if (!['CLOSED', 'COMPLETED', 'OPEN'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Allowed values: CLOSED, COMPLETED, OPEN' });
    }

    const orderRequest = await Request.findById(requestId);
    if (!orderRequest) {
      return res.status(404).json({ message: 'Order request not found' });
    }

    if (orderRequest.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to change order status' });
    }

    orderRequest.status = status;
    if (status === 'COMPLETED') {
      orderRequest.completedAt = new Date();
    } else if (status === 'CLOSED') {
      orderRequest.closedAt = new Date();
    }
    await orderRequest.save();

    const group = await Group.findOne({ request: requestId });
    if (group) {
      group.status = status === 'COMPLETED' ? 'COMPLETED' : status === 'CLOSED' ? 'CLOSED' : 'PENDING';
      await group.save();

      // If COMPLETED, increment completedOrdersCount for all participants
      if (status === 'COMPLETED') {
        const participantUserIds = group.participants.map((p) => p.user);
        await User.updateMany(
          { _id: { $in: participantUserIds } },
          { $inc: { completedOrdersCount: 1 } }
        );
      }
    }

    res.json({ message: `Order status updated to ${status}`, orderRequest, group });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ message: 'Server error updating request status' });
  }
});

export default router;
