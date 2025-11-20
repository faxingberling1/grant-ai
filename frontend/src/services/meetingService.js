import api from './api';

const meetingService = {
  // Get all meetings
  async getMeetings() {
    try {
      const response = await api.get('/api/meetings');
      return response.data;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      // Fallback to localStorage if API fails
      const savedMeetings = localStorage.getItem('grantflow-meetings');
      return savedMeetings ? JSON.parse(savedMeetings) : [];
    }
  },

  // Get meeting by ID
  async getMeetingById(id) {
    try {
      const response = await api.get(`/api/meetings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meeting:', error);
      throw error;
    }
  },

  // Create new meeting
  async createMeeting(meetingData) {
    try {
      const response = await api.post('/api/meetings', meetingData);
      return response.data;
    } catch (error) {
      console.error('Error creating meeting:', error);
      // Fallback to localStorage
      const newMeeting = {
        _id: Date.now().toString(),
        ...meetingData,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage as fallback
      const savedMeetings = localStorage.getItem('grantflow-meetings');
      const meetings = savedMeetings ? JSON.parse(savedMeetings) : [];
      meetings.push(newMeeting);
      localStorage.setItem('grantflow-meetings', JSON.stringify(meetings));
      
      return newMeeting;
    }
  },

  // Update meeting
  async updateMeeting(id, meetingData) {
    try {
      const response = await api.put(`/api/meetings/${id}`, meetingData);
      return response.data;
    } catch (error) {
      console.error('Error updating meeting:', error);
      // Fallback to localStorage
      const savedMeetings = localStorage.getItem('grantflow-meetings');
      if (savedMeetings) {
        const meetings = JSON.parse(savedMeetings);
        const updatedMeetings = meetings.map(meeting =>
          meeting._id === id ? { ...meeting, ...meetingData } : meeting
        );
        localStorage.setItem('grantflow-meetings', JSON.stringify(updatedMeetings));
        return { ...meetingData, _id: id };
      }
      throw error;
    }
  },

  // Delete meeting
  async deleteMeeting(id) {
    try {
      const response = await api.delete(`/api/meetings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      // Fallback to localStorage
      const savedMeetings = localStorage.getItem('grantflow-meetings');
      if (savedMeetings) {
        const meetings = JSON.parse(savedMeetings);
        const filteredMeetings = meetings.filter(meeting => meeting._id !== id);
        localStorage.setItem('grantflow-meetings', JSON.stringify(filteredMeetings));
      }
      return { message: 'Meeting deleted locally' };
    }
  },

  // Update meeting status
  async updateMeetingStatus(id, status) {
    try {
      const response = await api.patch(`/api/meetings/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating meeting status:', error);
      // Fallback to localStorage
      const savedMeetings = localStorage.getItem('grantflow-meetings');
      if (savedMeetings) {
        const meetings = JSON.parse(savedMeetings);
        const updatedMeetings = meetings.map(meeting =>
          meeting._id === id ? { ...meeting, status } : meeting
        );
        localStorage.setItem('grantflow-meetings', JSON.stringify(updatedMeetings));
      }
      return { status };
    }
  },

  // Get meetings by date range
  async getMeetingsByDateRange(startDate, endDate) {
    try {
      const response = await api.get('/api/meetings/range', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching meetings by date range:', error);
      return [];
    }
  },

  // Get upcoming meetings
  async getUpcomingMeetings() {
    try {
      const response = await api.get('/api/meetings/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      // Fallback: filter upcoming meetings from localStorage
      const savedMeetings = localStorage.getItem('grantflow-meetings');
      if (savedMeetings) {
        const meetings = JSON.parse(savedMeetings);
        const now = new Date();
        return meetings
          .filter(meeting => {
            const meetingDate = new Date(meeting.date + 'T' + meeting.time);
            return meetingDate > now && meeting.status !== 'cancelled';
          })
          .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
      }
      return [];
    }
  }
};

export default meetingService;