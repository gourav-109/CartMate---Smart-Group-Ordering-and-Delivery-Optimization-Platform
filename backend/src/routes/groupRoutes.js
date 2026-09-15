import express from 'express';
import Group from '../models/Group.js';
import Request from '../models/Request.js';
import JoinRequest from '../models/JoinRequest.js';
import { protect } from '../middleware/auth.js';
import { calculateGroupSplit, calculateGeographicMidpoint } from '../utils/geo.js';

const router = express.Router();

// @route   GET /api/groups/:id
// @desc    Get group details by group ID or request ID
router.get('/:id', protect, async (req, res) => {
  try {
    let group = await Group.findById(req.params.id)
      .populate('owner', 'name email customId completedOrdersCount localityName location averageRating ratings')
      .populate('participants.user', 'name email customId completedOrdersCount localityName location averageRating ratings')
      .populate('request');

    if (!group) {
      group = await Group.findOne({ request: req.params.id })
        .populate('owner', 'name email customId completedOrdersCount localityName location averageRating ratings')
        .populate('participants.user', 'name email customId completedOrdersCount localityName location averageRating ratings')
        .populate('request');
    }

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const updatedParticipants = calculateGroupSplit(group.participants, group.combinedOrderTotal);

    const coordsList = group.participants
      .filter((p) => p.user && p.user.location && p.user.location.coordinates)
      .map((p) => p.user.location.coordinates);

    const midpointCoords = calculateGeographicMidpoint(coordsList);

    const userJoinReq = await JoinRequest.findOne({
      request: group.request._id,
      applicant: req.user._id
    }).sort({ createdAt: -1 });

    const isMember = group.participants.some(
      (p) => (p.user?._id || p.user)?.toString() === req.user._id.toString()
    );

    res.json({
      _id: group._id,
      request: group.request,
      owner: group.owner,
      participants: updatedParticipants,
      combinedOrderTotal: group.combinedOrderTotal,
      sharedHandlingFee: group.sharedHandlingFee,
      status: group.status,
      meetingPoint: group.meetingPoint,
      suggestedMidpoint: {
        name: 'Suggested Geographic Midpoint',
        coordinates: midpointCoords
      },
      meetingTime: group.meetingTime,
      userJoinRequest: userJoinReq,
      isUserMember: Boolean(isMember)
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ message: 'Server error fetching group' });
  }
});

// @route   POST /api/groups/:id/finalize-cost
// @desc    Finalize and persist proportional cost split
router.post('/:id/finalize-cost', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { combinedOrderTotal, sharedHandlingFee } = req.body;
    if (combinedOrderTotal) {
      group.combinedOrderTotal = parseFloat(combinedOrderTotal);
    }
    if (sharedHandlingFee !== undefined) {
      group.sharedHandlingFee = parseFloat(sharedHandlingFee);
    }

    const updatedParticipants = calculateGroupSplit(group.participants, group.combinedOrderTotal);
    group.participants = updatedParticipants;
    await group.save();

    res.json({ message: 'Cost split finalized successfully', group });
  } catch (error) {
    res.status(500).json({ message: 'Server error finalizing cost split' });
  }
});

// @route   PATCH /api/groups/:id/toggle-settled
// @desc    Toggle settled state for a participant
router.patch('/:id/toggle-settled', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const participant = group.participants.find(
      (p) => p.user.toString() === (userId || req.user._id).toString()
    );

    if (!participant) {
      return res.status(404).json({ message: 'Participant not found in group' });
    }

    participant.settled = !participant.settled;
    participant.paymentStatus = participant.settled ? 'PAID' : 'PENDING';
    await group.save();

    res.json({ message: 'Settled state toggled', participant, group });
  } catch (error) {
    res.status(500).json({ message: 'Server error toggling settled state' });
  }
});

// @route   PATCH /api/groups/:id/meeting-point
// @desc    Update group meeting point
router.patch('/:id/meeting-point', protect, async (req, res) => {
  try {
    const { name, lng, lat } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (name) group.meetingPoint.name = name;
    if (lng !== undefined && lat !== undefined) {
      group.meetingPoint.coordinates = [parseFloat(lng), parseFloat(lat)];
    }

    await group.save();
    res.json({ message: 'Meeting point updated', meetingPoint: group.meetingPoint });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating meeting point' });
  }
});

export default router;
