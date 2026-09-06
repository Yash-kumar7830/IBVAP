// TODO: Implement FastAPI REST API integration.
// src/services/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

const request = async (requestFactory, retries = 2) => {
  try {
    const response = await requestFactory();
    return response.data;
  } catch (error) {
    if (retries > 0 && (!error.response || error.response.status >= 500)) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return request(requestFactory, retries - 1);
    }
    throw new Error(error.response?.data?.detail || error.message || 'Request failed', { cause: error });
  }
};

// Cameras
export const getCameras = () => request(() => api.get('/cameras'));
export const getCamera = (id) => request(() => api.get(`/cameras/${id}`));

// Zones
export const getZones = (cameraId) => request(() => api.get(`/cameras/${cameraId}/zones`));
export const saveZone = (cameraId, zoneData) =>
  request(() => api.post(`/cameras/${cameraId}/zones`, zoneData));
export const updateZone = (cameraId, zoneId, zoneData) =>
  request(() => api.put(`/cameras/${cameraId}/zones/${zoneId}`, zoneData));
export const deleteZone = (cameraId, zoneId) =>
  request(() => api.delete(`/cameras/${cameraId}/zones/${zoneId}`));

// Events & Alerts
export const getEvents = (params) => request(() => api.get('/events', { params }));
export const getAlerts = () => request(() => api.get('/alerts'));
export const getEvent = (id) => request(() => api.get(`/events/${id}`));

// Statistics & Analytics
export const getStatistics = () => request(() => api.get('/statistics'));
export const getEvidence = () => request(() => api.get('/evidence'));
export const getHealth = () => request(() => api.get('/health'));

export default api;