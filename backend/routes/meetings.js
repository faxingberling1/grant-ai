// routes/meetings.js
const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');

// Get all meetings for user
router.get('/', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({ user: req.user.id }).sort({ date: 1, time: 1 });
    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get meeting by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ _id: req.params.id, user: req.user.id });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new meeting
router.post('/', auth, async (req, res) => {
  try {
    const meetingData = {
      ...req.body,
      user: req.user.id
    };
    
    const meeting = new Meeting(meetingData);
    await meeting.save();
    
    res.status(201).json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update meeting
router.put('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    res.json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete meeting
router.delete('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update meeting status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { status: req.body.status } },
      { new: true }
    );
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    res.json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming meetings
router.get('/upcoming', auth, async (req, res) => {
  try {
    const now = new Date();
    const meetings = await Meeting.find({
      user: req.user.id,
      $or: [
        { date: { $gt: now.toISOString().split('T')[0] } },
        { 
          date: now.toISOString().split('T')[0],
          time: { $gt: now.toTimeString().slice(0, 5) }
        }
      ],
      status: { $ne: 'cancelled' }
    }).sort({ date: 1, time: 1 });
    
    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;