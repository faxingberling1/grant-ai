import api from './api';

export const getGrantSources = async () => {
  try {
    const response = await api.get('/grant-sources');
    return response.data;
  } catch (error) {
    console.error('Error fetching grant sources:', error);
    throw error;
  }
};

export const getGrantSourceById = async (sourceId) => {
  try {
    const response = await api.get(`/grant-sources/${sourceId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching grant source:', error);
    throw error;
  }
};