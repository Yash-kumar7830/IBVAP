// TODO: Implement FastAPI REST API integration.
// src/services/api.js
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Cameras
export const getCameras = () => api.get('/cameras');
export const getCamera = (id) => api.get(`/cameras/${id}`);

// Zones
export const getZones = (cameraId) => api.get(`/cameras/${cameraId}/zones`);
export const saveZone = (cameraId, zoneData) => 
  api.post(`/cameras/${cameraId}/zones`, zoneData);
export const updateZone = (cameraId, zoneId, zoneData) =>
  api.put(`/cameras/${cameraId}/zones/${zoneId}`, zoneData);
export const deleteZone = (cameraId, zoneId) =>
  api.delete(`/cameras/${cameraId}/zones/${zoneId}`);

// Events & Alerts
export const getEvents = (params) => api.get('/events', { params });
export const getAlerts = () => api.get('/alerts');
export const getEvent = (id) => api.get(`/events/${id}`);

// Statistics & Analytics
export const getStatistics = () => api.get('/statistics');
export const getEvidence = () => api.get('/evidence');
export const getHealth = () => api.get('/health');

export default api;