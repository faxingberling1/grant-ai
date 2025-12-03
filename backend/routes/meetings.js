// /backend/routes/meetings.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth'); // FIXED: Destructure authMiddleware
const meetingController = require('../controllers/meetingController'); // Added controller import

// ====================
// MEETING ROUTES
// ====================

// GET all meetings for user with filtering and pagination
router.get('/', authMiddleware, meetingController.getMeetings);

// GET single meeting by ID
router.get('/:id', authMiddleware, meetingController.getMeeting);

// CREATE new meeting
router.post('/', authMiddleware, meetingController.createMeeting);

// UPDATE meeting
router.put('/:id', authMiddleware, meetingController.updateMeeting);

// DELETE meeting
router.delete('/:id', authMiddleware, meetingController.deleteMeeting);

// ====================
// MEETING ACTIONS
// ====================

// JOIN meeting (for participants)
router.post('/:id/join', authMiddleware, meetingController.joinMeeting);

// UPDATE meeting status
router.patch('/:id/status', authMiddleware, meetingController.updateMeetingStatus);

// SEND meeting reminders
router.post('/:id/remind', authMiddleware, meetingController.sendMeetingReminder);

// ====================
// MEETING STATISTICS & DASHBOARD
// ====================

// GET meeting statistics
router.get('/stats/overview', authMiddleware, meetingController.getMeetingStats);

// GET upcoming meetings (for dashboard)
router.get('/upcoming/list', authMiddleware, meetingController.getUpcomingMeetings);

// ====================
// CALENDAR INTEGRATION
// ====================

// GET meetings for calendar view
router.get('/calendar/events', authMiddleware, async (req, res) => {
  try {
    const { start, end } = req.query;
    
    if (!start || !end) {
      return res.status(400).json({
        success: false,
        message: 'Start and end dates are required'
      });
    }
    
    const meetings = await Meeting.find({
      $or: [
        { organizer: req.user._id },
        { participants: req.user._id }
      ],
      startTime: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    })
    .populate('organizer', 'firstName lastName email')
    .populate('client', 'name')
    .select('title startTime endTime status type client organizer participants location');
    
    // Format for calendar
    const events = meetings.map(meeting => ({
      id: meeting._id,
      title: meeting.title,
      start: meeting.startTime,
      end: meeting.endTime,
      status: meeting.status,
      type: meeting.type,
      extendedProps: {
        client: meeting.client?.name || 'No Client',
        organizer: `${meeting.organizer?.firstName} ${meeting.organizer?.lastName}`,
        participants: meeting.participants?.length || 0,
        location: meeting.location
      }
    }));
    
    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch calendar events',
      error: error.message 
    });
  }
});

// ====================
// BATCH OPERATIONS
// ====================

// BATCH update meeting statuses
router.patch('/batch/status', authMiddleware, async (req, res) => {
  try {
    const { meetingIds, status } = req.body;
    
    if (!meetingIds || !Array.isArray(meetingIds) || !status) {
      return res.status(400).json({
        success: false,
        message: 'Meeting IDs array and status are required'
      });
    }
    
    // Only allow organizer to update
    const result = await Meeting.updateMany(
      { 
        _id: { $in: meetingIds },
        organizer: req.user._id 
      },
      { $set: { status } }
    );
    
    res.json({
      success: true,
      message: `Updated status for ${result.modifiedCount} meetings`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Batch update status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to batch update meeting statuses',
      error: error.message 
    });
  }
});

// BATCH delete meetings
router.delete('/batch/delete', authMiddleware, async (req, res) => {
  try {
    const { meetingIds } = req.body;
    
    if (!meetingIds || !Array.isArray(meetingIds)) {
      return res.status(400).json({
        success: false,
        message: 'Meeting IDs array is required'
      });
    }
    
    // Only allow organizer to delete
    const result = await Meeting.deleteMany({
      _id: { $in: meetingIds },
      organizer: req.user._id
    });
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} meetings`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Batch delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to batch delete meetings',
      error: error.message 
    });
  }
});

// ====================
// MEETING AVAILABILITY
// ====================

// CHECK meeting availability for time slot
router.post('/availability/check', authMiddleware, async (req, res) => {
  try {
    const { startTime, endTime, participants = [] } = req.body;
    
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time are required'
      });
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Check for conflicting meetings
    const conflicts = await Meeting.find({
      $or: [
        { organizer: req.user._id },
        { _id: { $in: participants } }
      ],
      $or: [
        // Meeting starts during existing meeting
        { startTime: { $lt: end }, endTime: { $gt: start } },
        // Existing meeting starts during new meeting
        { startTime: { $gte: start, $lte: end } }
      ],
      status: { $ne: 'cancelled' }
    })
    .populate('organizer', 'firstName lastName')
    .populate('participants', 'firstName lastName');
    
    const availability = {
      isAvailable: conflicts.length === 0,
      conflicts: conflicts.map(conflict => ({
        id: conflict._id,
        title: conflict.title,
        startTime: conflict.startTime,
        endTime: conflict.endTime,
        organizer: `${conflict.organizer?.firstName} ${conflict.organizer?.lastName}`,
        participants: conflict.participants?.map(p => `${p.firstName} ${p.lastName}`) || []
      }))
    };
    
    res.json({
      success: true,
      availability,
      requestedSlot: {
        startTime: start,
        endTime: end,
        duration: (end - start) / (1000 * 60) // Duration in minutes
      }
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to check meeting availability',
      error: error.message 
    });
  }
});

// ====================
// MEETING PARTICIPANTS
// ====================

// ADD participants to meeting
router.post('/:id/participants/add', authMiddleware, async (req, res) => {
  try {
    const { participants } = req.body;
    
    if (!participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: 'Participants array is required'
      });
    }
    
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      organizer: req.user._id
    });
    
    if (!meeting) {
      return res.status(404).json({ 
        success: false,
        message: 'Meeting not found or you are not the organizer' 
      });
    }
    
    // Validate participants exist
    const existingUsers = await User.find({ 
      _id: { $in: participants } 
    }).select('_id');
    
    const foundIds = existingUsers.map(u => u._id.toString());
    const newParticipants = participants.filter(id => {
      return !meeting.participants.includes(id) && foundIds.includes(id);
    });
    
    meeting.participants.push(...newParticipants);
    await meeting.save();
    
    res.json({
      success: true,
      message: `Added ${newParticipants.length} participants to meeting`,
      addedCount: newParticipants.length,
      totalParticipants: meeting.participants.length
    });
  } catch (error) {
    console.error('Add participants error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add participants',
      error: error.message 
    });
  }
});

// REMOVE participants from meeting
router.delete('/:id/participants/remove', authMiddleware, async (req, res) => {
  try {
    const { participants } = req.body;
    
    if (!participants || !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: 'Participants array is required'
      });
    }
    
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      organizer: req.user._id
    });
    
    if (!meeting) {
      return res.status(404).json({ 
        success: false,
        message: 'Meeting not found or you are not the organizer' 
      });
    }
    
    const initialCount = meeting.participants.length;
    meeting.participants = meeting.participants.filter(
      participantId => !participants.includes(participantId.toString())
    );
    
    await meeting.save();
    
    const removedCount = initialCount - meeting.participants.length;
    
    res.json({
      success: true,
      message: `Removed ${removedCount} participants from meeting`,
      removedCount,
      totalParticipants: meeting.participants.length
    });
  } catch (error) {
    console.error('Remove participants error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to remove participants',
      error: error.message 
    });
  }
});

// ====================
// MEETING NOTES & ATTACHMENTS
// ====================

// ADD meeting notes
router.post('/:id/notes', authMiddleware, async (req, res) => {
  try {
    const { notes } = req.body;
    
    if (!notes) {
      return res.status(400).json({
        success: false,
        message: 'Notes content is required'
      });
    }
    
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      $or: [
        { organizer: req.user._id },
        { participants: req.user._id }
      ]
    });
    
    if (!meeting) {
      return res.status(404).json({ 
        success: false,
        message: 'Meeting not found or access denied' 
      });
    }
    
    meeting.notes = meeting.notes || [];
    meeting.notes.push({
      content: notes,
      createdBy: req.user._id,
      createdAt: new Date()
    });
    
    await meeting.save();
    
    res.json({
      success: true,
      message: 'Notes added successfully',
      notesCount: meeting.notes.length
    });
  } catch (error) {
    console.error('Add notes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to add notes',
      error: error.message 
    });
  }
});

// GET meeting notes
router.get('/:id/notes', authMiddleware, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      $or: [
        { organizer: req.user._id },
        { participants: req.user._id }
      ]
    })
    .populate('notes.createdBy', 'firstName lastName email');
    
    if (!meeting) {
      return res.status(404).json({ 
        success: false,
        message: 'Meeting not found or access denied' 
      });
    }
    
    res.json({
      success: true,
      notes: meeting.notes || []
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch notes',
      error: error.message 
    });
  }
});

module.exports = router;