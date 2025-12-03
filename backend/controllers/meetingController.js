// /backend/controllers/meetingController.js
const Meeting = require('../models/Meeting');
const User = require('../models/User');
const Client = require('../models/Client');

/**
 * Get all meetings for the authenticated user
 */
exports.getMeetings = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      status, 
      clientId, 
      type,
      page = 1, 
      limit = 50 
    } = req.query;
    
    let query = { 
      $or: [
        { organizer: req.user._id },
        { participants: req.user._id }
      ]
    };
    
    // Date range filter
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Client filter
    if (clientId && clientId !== 'all') {
      query.client = clientId;
    }
    
    // Type filter
    if (type && type !== 'all') {
      query.type = type;
    }
    
    const meetings = await Meeting.find(query)
      .populate('organizer', 'firstName lastName email avatar')
      .populate('client', 'name email organization')
      .populate('participants', 'firstName lastName email avatar')
      .sort({ startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Meeting.countDocuments(query);
    
    res.json({
      success: true,
      meetings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch meetings',
      error: error.message 
    });
  }
};

/**
 * Get a single meeting by ID
 */
exports.getMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      $or: [
        { organizer: req.user._id },
        { participants: req.user._id }
      ]
    })
    .populate('organizer', 'firstName lastName email avatar')
    .populate('client', 'name email organization phone address')
    .populate('participants', 'firstName lastName email avatar')
    .populate('createdBy', 'firstName lastName email');
    
    if (!meeting) {
      return res.status(404).json({ 
        success: false,
        message: 'Meeting not found or access denied' 
      });
    }
    
    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch meeting',
      error: error.message 
    });
  }
};

/**
 * Create a new meeting
 */
exports.createMeeting = async (req, res) => {
  try {
    const meetingData = {
      ...req.body,
      organizer: req.user._id,
      createdBy: req.user._id
    };
    
    // Validate required fields
    if (!meetingData.title || !meetingData.startTime) {
      return res.status(400).json({
        success: false,
        message: 'Title and start time are required'
      });
    }
    
    // Validate client exists if provided
    if (meetingData.client) {
      const client = await Client.findOne({ 
        _id: meetingData.client, 
        userId: req.user._id 
      });
      
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }
    }
    
    // Validate participants exist
    if (meetingData.participants && meetingData.participants.length > 0) {
      const participants = await User.find({ 
        _id: { $in: meetingData.participants } 
      }).select('_id');
      
      const foundIds = participants.map(p => p._id.toString());
      const missingIds = meetingData.participants.filter(id => !foundIds.includes(id));
      
      if (missingIds.length > 0) {
        return res.status(404).json({
          success: false,
          message: `Some participants not found: ${missingIds.join(', ')}`
        });
      }
    }
    
    const meeting = new Meeting(meetingData);
    const savedMeeting = await meeting.save();
    
    // Populate references for response
    const populatedMeeting = await Meeting.findById(savedMeeting._id)
      .populate('organizer', 'firstName lastName email avatar')
      .populate('client', 'name email organization')
      .populate('participants', 'firstName lastName email avatar');
    
    res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      meeting: populatedMeeting
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to create meeting',
      error: error.message 
    });
  }
};

/**
 * Update a meeting
 */
exports.updateMeeting = async (req, res) => {
  try {
    // Check if user is organizer or has permission to update
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
    
    // Don't allow changing organizer
    if (req.body.organizer && req.body.organizer !== meeting.organizer.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot change meeting organizer'
      });
    }
    
    // Validate client exists if being updated
    if (req.body.client) {
      const client = await Client.findOne({ 
        _id: req.body.client, 
        userId: req.user._id 
      });
      
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }
    }
    
    // Validate participants exist if being updated
    if (req.body.participants && req.body.participants.length > 0) {
      const participants = await User.find({ 
        _id: { $in: req.body.participants } 
      }).select('_id');
      
      const foundIds = participants.map(p => p._id.toString());
      const missingIds = req.body.participants.filter(id => !foundIds.includes(id));
      
      if (missingIds.length > 0) {
        return res.status(404).json({
          success: false,
          message: `Some participants not found: ${missingIds.join(', ')}`
        });
      }
    }
    
    Object.assign(meeting, req.body);
    meeting.updatedAt = new Date();
    
    const updatedMeeting = await meeting.save();
    
    // Populate references for response
    const populatedMeeting = await Meeting.findById(updatedMeeting._id)
      .populate('organizer', 'firstName lastName email avatar')
      .populate('client', 'name email organization')
      .populate('participants', 'firstName lastName email avatar');
    
    res.json({
      success: true,
      message: 'Meeting updated successfully',
      meeting: populatedMeeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to update meeting',
      error: error.message 
    });
  }
};

/**
 * Delete a meeting
 */
exports.deleteMeeting = async (req, res) => {
  try {
    // Check if user is organizer
    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      organizer: req.user._id
    });
    
    if (!meeting) {
      return res.status(404).json({ 
        success: false,
        message: 'Meeting not found or you are not the organizer' 
      });
    }
    
    res.json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete meeting',
      error: error.message 
    });
  }
};

/**
 * Join a meeting (for participants)
 */
exports.joinMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      participants: req.user._id
    });
    
    if (!meeting) {
      return res.status(404).json({ 
        success: false,
        message: 'Meeting not found or you are not a participant' 
      });
    }
    
    // Update participant status
    const participant = meeting.participants.find(p => 
      p.toString() === req.user._id.toString()
    );
    
    if (participant) {
      // Update participant's status to "attended"
      meeting.participantStatus = meeting.participantStatus || {};
      meeting.participantStatus[req.user._id] = 'attended';
      
      await meeting.save();
    }
    
    res.json({
      success: true,
      message: 'Successfully joined meeting',
      meeting
    });
  } catch (error) {
    console.error('Join meeting error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to join meeting',
      error: error.message 
    });
  }
};

/**
 * Get meeting statistics
 */
exports.getMeetingStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const query = { 
      $or: [
        { organizer: req.user._id },
        { participants: req.user._id }
      ],
      startTime: { $gte: thirtyDaysAgo }
    };
    
    const meetings = await Meeting.find(query);
    
    const stats = {
      totalMeetings: meetings.length,
      upcoming: meetings.filter(m => m.status === 'scheduled' && m.startTime > new Date()).length,
      completed: meetings.filter(m => m.status === 'completed').length,
      cancelled: meetings.filter(m => m.status === 'cancelled').length,
      byType: {},
      byClient: {},
      weekly: {}
    };
    
    // Count by type
    meetings.forEach(meeting => {
      stats.byType[meeting.type] = (stats.byType[meeting.type] || 0) + 1;
    });
    
    // Calculate weekly distribution
    const now = new Date();
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weekKey = `Week ${i + 1}`;
      stats.weekly[weekKey] = meetings.filter(m => 
        m.startTime >= weekStart && m.startTime < weekEnd
      ).length;
    }
    
    // Average meeting duration
    const completedMeetings = meetings.filter(m => m.status === 'completed');
    if (completedMeetings.length > 0) {
      const totalDuration = completedMeetings.reduce((sum, meeting) => {
        if (meeting.startTime && meeting.endTime) {
          return sum + (new Date(meeting.endTime) - new Date(meeting.startTime));
        }
        return sum;
      }, 0);
      
      stats.averageDuration = totalDuration / completedMeetings.length;
    }
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get meeting stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch meeting statistics',
      error: error.message 
    });
  }
};

/**
 * Get upcoming meetings (for dashboard)
 */
exports.getUpcomingMeetings = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const upcomingMeetings = await Meeting.find({
      $or: [
        { organizer: req.user._id },
        { participants: req.user._id }
      ],
      status: 'scheduled',
      startTime: { $gte: new Date() }
    })
    .populate('organizer', 'firstName lastName email avatar')
    .populate('client', 'name email organization')
    .sort({ startTime: 1 })
    .limit(parseInt(limit));
    
    res.json({
      success: true,
      meetings: upcomingMeetings
    });
  } catch (error) {
    console.error('Get upcoming meetings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch upcoming meetings',
      error: error.message 
    });
  }
};

/**
 * Update meeting status
 */
exports.updateMeetingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['scheduled', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
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
    
    meeting.status = status;
    
    // Set end time if completing meeting
    if (status === 'completed' && !meeting.endTime) {
      meeting.endTime = new Date();
    }
    
    await meeting.save();
    
    res.json({
      success: true,
      message: `Meeting status updated to ${status}`,
      meeting
    });
  } catch (error) {
    console.error('Update meeting status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update meeting status',
      error: error.message 
    });
  }
};

/**
 * Send meeting reminders
 */
exports.sendMeetingReminder = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      _id: req.params.id,
      organizer: req.user._id
    })
    .populate('participants', 'email firstName lastName')
    .populate('client', 'name email');
    
    if (!meeting) {
      return res.status(404).json({ 
        success: false,
        message: 'Meeting not found or you are not the organizer' 
      });
    }
    
    // Check if meeting is in the future
    if (meeting.startTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send reminder for past or ongoing meetings'
      });
    }
    
    // Here you would integrate with your email service
    // For now, just return success
    res.json({
      success: true,
      message: 'Meeting reminders would be sent to participants',
      meeting: {
        id: meeting._id,
        title: meeting.title,
        startTime: meeting.startTime,
        participants: meeting.participants.length,
        client: meeting.client
      }
    });
  } catch (error) {
    console.error('Send meeting reminder error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send meeting reminders',
      error: error.message 
    });
  }
};