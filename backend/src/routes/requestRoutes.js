import express from 'express';
import Request from '../models/Request.js';
import Group from '../models/Group.js';
import JoinRequest from '../models/JoinRequest.js';
import { protect } from '../middleware/auth.js';
import { calculateHaversineDistance, calculateGeographicMidpoint, calculateProportionalSplit } from '../utils/geo.js';

const router = express.Router();

// @route   POST /api/requests
// @desc    Create a new Blinkit order request & initialize group
router.post('/', protect, async (req, res) => {
  try {
    const { totalMrp, standaloneTotal, combinedOrderTotal, localityName, deadline, items, lat, lng } = req.body;

    // Validate mandatory fields
    if (!totalMrp || !standaloneTotal || !combinedOrderTotal || !localityName || !deadline) {
      return res.status(400).json({
        message: 'Mandatory fields missing: totalMrp, standaloneTotal, combinedOrderTotal, localityName, and deadline are required.'
      });
    }

    // Validate deadline (max 48 hours = 2 days)
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

    // Coords: use provided or fallback to user's saved location
    const coords = [
      lng !== undefined ? parseFloat(lng) : req.user.location.coordinates[0],
      lat !== undefined ? parseFloat(lat) : req.user.location.coordinates[1]
    ];

    const orderRequest = await Request.create({
      user: req.user._id,
      store: 'Blinkit',
      totalMrp: parseFloat(totalMrp),
      standaloneTotal: parseFloat(standaloneTotal),
      combinedOrderTotal: parseFloat(combinedOrderTotal),
      localityName,
      deadline: deadlineDate,
      items: Array.isArray(items) ? items : [],
      location: {
        type: 'Point',
        coordinates: coords
      }
    });

    // Automatically create Group for this request with poster as 1st participant
    const group = await Group.create({
      request: orderRequest._id,
      owner: req.user._id,
      combinedOrderTotal: parseFloat(combinedOrderTotal),
      status: 'PENDING',
      participants: [
        {
          user: req.user._id,
          totalMrp: parseFloat(totalMrp),
          standaloneTotal: parseFloat(standaloneTotal),
          items: Array.isArray(items) ? items : [],
          settled: false
        }
      ],
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
// @desc    Get active nearby requests sorted by proximity, applying 1-hour expiry visibility rules
router.get('/nearby', protect, async (req, res) => {
  try {
    const userLng = req.query.lng ? parseFloat(req.query.lng) : req.user.location.coordinates[0];
    const userLat = req.query.lat ? parseFloat(req.query.lat) : req.user.location.coordinates[1];
    const radiusKm = req.query.radius ? parseFloat(req.query.radius) : 15; // default 15 km

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Fetch all requests
    const allRequests = await Request.find()
      .populate('user', 'name email localityName location')
      .lean();

    const formattedRequests = [];

    for (const reqDoc of allRequests) {
      let isExpired = false;

      // Rule 1: Deadline passed
      if (new Date(reqDoc.deadline) < now) {
        isExpired = true;
        if (reqDoc.status === 'OPEN') {
          // Auto-mark closed and set closedAt if not already done
          await Request.findByIdAndUpdate(reqDoc._id, { status: 'CLOSED', closedAt: reqDoc.closedAt || now });
          reqDoc.status = 'CLOSED';
          reqDoc.closedAt = reqDoc.closedAt || now;
        }
      }

      // Check 1-hour disappearance rule for closed/completed/expired orders
      if (reqDoc.closedAt && new Date(reqDoc.closedAt) < oneHourAgo) {
        // Disappear from home feed after 1 hour of closure
        continue;
      }

      // Calculate distance
      const reqLng = reqDoc.location.coordinates[0];
      const reqLat = reqDoc.location.coordinates[1];
      const distanceKm = calculateHaversineDistance(userLat, userLng, reqLat, reqLng);

      if (distanceKm <= radiusKm) {
        // Fetch group details to get current participant count & status
        const group = await Group.findOne({ request: reqDoc._id }).populate('participants.user', 'name');

        formattedRequests.push({
          ...reqDoc,
          distanceKm,
          participantCount: group ? group.participants.length : 1,
          maxParticipants: 4,
          groupId: group ? group._id : null
        });
      }
    }

    // Sort closest first
    formattedRequests.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching nearby requests:', error);
    res.status(500).json({ message: 'Server error fetching nearby requests' });
  }
});

// @route   GET /api/requests/my-requests
// @desc    Get user's own created requests (including historical)
router.get('/my-requests', protect, async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const result = [];
    for (const reqDoc of requests) {
      const group = await Group.findOne({ request: reqDoc._id });
      result.push({
        ...reqDoc,
        groupId: group ? group._id : null
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user requests' });
  }
});

// @route   POST /api/requests/:id/join-request
// @desc    Send a join/chat request to postee (does NOT immediately add participant)
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

    // Check if user already sent a pending join request
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
// @desc    Get pending join requests for a request post (postee view)
router.get('/:id/join-requests', protect, async (req, res) => {
  try {
    const requestId = req.params.id;
    const joinRequests = await JoinRequest.find({ request: requestId })
      .populate('applicant', 'name email localityName location')
      .sort({ createdAt: -1 });

    res.json(joinRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching join requests' });
  }
});

// @route   PATCH /api/requests/:id/respond-request
// @desc    Accept or reject a join request (Postee action)
router.patch('/:id/respond-request', protect, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { joinRequestId, action } = req.body; // action: 'ACCEPT' or 'REJECT'

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

    // ACCEPT flow
    const group = await Group.findOne({ request: requestId });
    if (!group) {
      return res.status(404).json({ message: 'Group not found for this request' });
    }

    // Check 4 participant cap
    if (group.participants.length >= 4) {
      return res.status(400).json({ message: 'Group is already full! Maximum 4 participants allowed.' });
    }

    // Check if applicant is already in participants
    const alreadyMember = group.participants.some(
      (p) => p.user.toString() === joinReq.applicant._id.toString()
    );

    if (!alreadyMember) {
      group.participants.push({
        user: joinReq.applicant._id,
        totalMrp: joinReq.totalMrp,
        standaloneTotal: joinReq.standaloneTotal,
        items: joinReq.items || [],
        settled: false
      });
    }

    // Recalculate proportional fee split
    const updatedParticipants = calculateProportionalSplit(group.participants, group.combinedOrderTotal);
    group.participants = updatedParticipants;

    // Recalculate suggested geographic midpoint
    const allCoords = [];
    const posterUser = await Request.findById(requestId).populate('user');
    if (posterUser && posterUser.user) {
      allCoords.push(posterUser.user.location.coordinates);
    }
    joinReq.applicant.location && allCoords.push(joinReq.applicant.location.coordinates);

    if (allCoords.length > 0) {
      const midpoint = calculateGeographicMidpoint(allCoords);
      group.suggestedMidpoint = {
        name: 'Suggested Geographic Midpoint',
        coordinates: midpoint
      };
    }

    // If max 4 participants reached, mark FULL
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
// @desc    Update request status (CLOSED / COMPLETED) by poster, setting closedAt for 1-hour window
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body; // 'CLOSED' or 'COMPLETED'

    if (!['CLOSED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Allowed values: CLOSED, COMPLETED' });
    }

    const orderRequest = await Request.findById(requestId);
    if (!orderRequest) {
      return res.status(404).json({ message: 'Order request not found' });
    }

    if (orderRequest.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to change order status' });
    }

    orderRequest.status = status;
    orderRequest.closedAt = new Date();
    await orderRequest.save();

    const group = await Group.findOne({ request: requestId });
    if (group) {
      group.status = status === 'COMPLETED' ? 'COMPLETED' : 'CLOSED';
      await group.save();
    }

    res.json({ message: `Order status updated to ${status}`, orderRequest, group });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating request status' });
  }
});

export default router;
