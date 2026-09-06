// src/services/api.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 3000,
});

// Mock Initial Data Store
const INITIAL_CAMERAS = [
  {
    id: 'cam-01',
    name: 'Sector 1 - North Perimeter',
    location: 'Border Zone Alpha (32.41° N, 74.88° E)',
    sector: 'North Border',
    status: 'online',
    resolution: '4K UHD (3840x2160)',
    fps: 30,
    bitrate: 4200,
    latency: 18,
    model: 'YOLOv11x-Border',
    stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    ai_stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    zones_count: 2,
    has_ptz: true,
  },
  {
    id: 'cam-02',
    name: 'Sector 2 - Alpha Gate Entry',
    location: 'Checkpoint Alpha Main Barrier',
    sector: 'Main Gate',
    status: 'online',
    resolution: '1080p (1920x1080)',
    fps: 60,
    bitrate: 3500,
    latency: 14,
    model: 'YOLOv11-Security',
    stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    ai_stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    zones_count: 1,
    has_ptz: false,
  },
  {
    id: 'cam-03',
    name: 'Sector 3 - Watchtower Charlie IR',
    location: 'Elevated Post 03 (Thermal/Night Vision)',
    sector: 'Watchtower',
    status: 'online',
    resolution: '1080p Thermal',
    fps: 30,
    bitrate: 2800,
    latency: 22,
    model: 'ThermalNet-IR-v4',
    stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    ai_stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    zones_count: 3,
    has_ptz: true,
  },
  {
    id: 'cam-04',
    name: 'Sector 4 - Perimeter Fence East',
    location: 'Sensor Grid B2 Sector',
    sector: 'Perimeter Fence',
    status: 'online',
    resolution: '1080p (1920x1080)',
    fps: 30,
    bitrate: 3100,
    latency: 16,
    model: 'YOLOv11x-Border',
    stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    ai_stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    zones_count: 1,
    has_ptz: false,
  },
  {
    id: 'cam-05',
    name: 'Sector 5 - Drone Reconnaissance Unit 01',
    location: 'Aerial Patrol Vector Charlie-9',
    sector: 'Aerial Recon',
    status: 'online',
    resolution: '4K Aerial',
    fps: 60,
    bitrate: 5800,
    latency: 48,
    model: 'DroneVision-YOLOv11',
    stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    ai_stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    zones_count: 0,
    has_ptz: true,
  },
  {
    id: 'cam-06',
    name: 'Sector 6 - Logistics Depot South',
    location: 'Storage Warehouse Perimeter',
    sector: 'Logistics Depot',
    status: 'standby',
    resolution: '1080p (1920x1080)',
    fps: 30,
    bitrate: 2400,
    latency: 19,
    model: 'YOLOv8-Nano',
    stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    ai_stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    zones_count: 1,
    has_ptz: false,
  },
];

const INITIAL_ALERTS = [
  {
    id: 'alt-101',
    type: 'Perimeter Breach Detected',
    camera_id: 'cam-01',
    camera_name: 'Sector 1 - North Perimeter',
    risk_level: 'critical',
    track_id: 'TRK-9821',
    object_type: 'person',
    confidence: 0.964,
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    status: 'active',
    details: 'Individual breached restricted exclusion boundary at vector 44. Speed: 2.1 m/s.',
    snapshot_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'alt-102',
    type: 'Unauthorized Vehicle in Buffer Zone',
    camera_id: 'cam-02',
    camera_name: 'Sector 2 - Alpha Gate Entry',
    risk_level: 'high',
    track_id: 'TRK-9815',
    object_type: 'vehicle',
    confidence: 0.942,
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    status: 'active',
    details: 'Heavy tactical vehicle approached non-clearance lane without RFID transponder signal.',
    snapshot_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'alt-103',
    type: 'Low-Altitude Drone Intrusion',
    camera_id: 'cam-05',
    camera_name: 'Sector 5 - Drone Reconnaissance Unit 01',
    risk_level: 'critical',
    track_id: 'TRK-9790',
    object_type: 'drone',
    confidence: 0.918,
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    status: 'acknowledged',
    details: 'Unregistered quadcopter detected flying at 45m AGL entering military airspace.',
    snapshot_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'alt-104',
    type: 'Loitering Suspicion Near Fence',
    camera_id: 'cam-04',
    camera_name: 'Sector 4 - Perimeter Fence East',
    risk_level: 'medium',
    track_id: 'TRK-9774',
    object_type: 'person',
    confidence: 0.887,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'active',
    details: 'Subject remained in stationary perimeter buffer zone for over 380 seconds.',
    snapshot_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'alt-105',
    type: 'Thermal Anomaly Detected',
    camera_id: 'cam-03',
    camera_name: 'Sector 3 - Watchtower Charlie IR',
    risk_level: 'high',
    track_id: 'TRK-9742',
    object_type: 'person',
    confidence: 0.931,
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    status: 'resolved',
    details: 'Infrared heat signature detected moving through thick brushwood along ridge.',
    snapshot_url: 'https://images.unsplash.com/photo-1516116211227-bbc673752e50?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'alt-106',
    type: 'Fence Vibration Sensor Triggered',
    camera_id: 'cam-04',
    camera_name: 'Sector 4 - Perimeter Fence East',
    risk_level: 'low',
    track_id: 'TRK-9710',
    object_type: 'animal',
    confidence: 0.841,
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'resolved',
    details: 'Wildlife disturbance confirmed by secondary optical verification.',
    snapshot_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  },
];

const INITIAL_EVENTS = [
  {
    id: 'ev-301',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    camera_id: 'cam-01',
    camera_name: 'Sector 1 - North Perimeter',
    type: 'Perimeter Breach',
    object_type: 'person',
    track_id: 'TRK-9821',
    confidence: 0.964,
    risk: 'critical',
    bbox: [0.38, 0.42, 0.16, 0.38],
    snapshot_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ev-302',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    camera_id: 'cam-02',
    camera_name: 'Sector 2 - Alpha Gate Entry',
    type: 'Authorized Entry',
    object_type: 'vehicle',
    track_id: 'TRK-9818',
    confidence: 0.985,
    risk: 'low',
    bbox: [0.22, 0.35, 0.32, 0.44],
    snapshot_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ev-303',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    camera_id: 'cam-02',
    camera_name: 'Sector 2 - Alpha Gate Entry',
    type: 'Buffer Zone Infringement',
    object_type: 'vehicle',
    track_id: 'TRK-9815',
    confidence: 0.942,
    risk: 'high',
    bbox: [0.55, 0.48, 0.28, 0.36],
    snapshot_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ev-304',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    camera_id: 'cam-01',
    camera_name: 'Sector 1 - North Perimeter',
    type: 'Patrol Movement',
    object_type: 'person',
    track_id: 'TRK-9802',
    confidence: 0.978,
    risk: 'low',
    bbox: [0.12, 0.38, 0.14, 0.42],
    snapshot_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ev-305',
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    camera_id: 'cam-05',
    camera_name: 'Sector 5 - Drone Reconnaissance Unit 01',
    type: 'Aerial Airspace Breach',
    object_type: 'drone',
    track_id: 'TRK-9790',
    confidence: 0.918,
    risk: 'critical',
    bbox: [0.44, 0.18, 0.12, 0.14],
    snapshot_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ev-306',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    camera_id: 'cam-03',
    camera_name: 'Sector 3 - Watchtower Charlie IR',
    type: 'Thermal Signature',
    object_type: 'vehicle',
    track_id: 'TRK-9781',
    confidence: 0.952,
    risk: 'medium',
    bbox: [0.65, 0.44, 0.22, 0.28],
    snapshot_url: 'https://images.unsplash.com/photo-1516116211227-bbc673752e50?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ev-307',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    camera_id: 'cam-04',
    camera_name: 'Sector 4 - Perimeter Fence East',
    type: 'Loitering Alert',
    object_type: 'person',
    track_id: 'TRK-9774',
    confidence: 0.887,
    risk: 'medium',
    bbox: [0.48, 0.39, 0.15, 0.41],
    snapshot_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ev-308',
    timestamp: new Date(Date.now() - 1000 * 60 * 68).toISOString(),
    camera_id: 'cam-06',
    camera_name: 'Sector 6 - Logistics Depot South',
    type: 'Truck Unloading',
    object_type: 'vehicle',
    track_id: 'TRK-9760',
    confidence: 0.963,
    risk: 'low',
    bbox: [0.32, 0.36, 0.35, 0.48],
    snapshot_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ev-309',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    camera_id: 'cam-03',
    camera_name: 'Sector 3 - Watchtower Charlie IR',
    type: 'Night Vision Movement',
    object_type: 'person',
    track_id: 'TRK-9742',
    confidence: 0.931,
    risk: 'high',
    bbox: [0.72, 0.52, 0.14, 0.33],
    snapshot_url: 'https://images.unsplash.com/photo-1516116211227-bbc673752e50?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ev-310',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    camera_id: 'cam-01',
    camera_name: 'Sector 1 - North Perimeter',
    type: 'Routine Patrol',
    object_type: 'person',
    track_id: 'TRK-9730',
    confidence: 0.989,
    risk: 'low',
    bbox: [0.28, 0.42, 0.12, 0.36],
    snapshot_url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
  },
];

const INITIAL_ZONES = {
  'cam-01': [
    {
      id: 'zn-01',
      name: 'North Exclusion Line A',
      type: 'restricted',
      risk_level: 'critical',
      sensitivity: 90,
      points: [
        { x: 0.12, y: 0.22 },
        { x: 0.88, y: 0.22 },
        { x: 0.82, y: 0.72 },
        { x: 0.18, y: 0.72 },
      ],
    },
  ],
  'cam-02': [
    {
      id: 'zn-02',
      name: 'Entry Checkpoint Buffer',
      type: 'loitering',
      risk_level: 'high',
      sensitivity: 75,
      points: [
        { x: 0.25, y: 0.30 },
        { x: 0.75, y: 0.30 },
        { x: 0.70, y: 0.80 },
        { x: 0.20, y: 0.80 },
      ],
    },
  ],
};

// In-Memory Persistent Store
let mockCameras = [...INITIAL_CAMERAS];
let mockAlerts = [...INITIAL_ALERTS];
let mockEvents = [...INITIAL_EVENTS];
let mockZones = { ...INITIAL_ZONES };

// Generic request wrapper with fallback to mock data
const request = async (requestFactory, fallbackData) => {
  try {
    const response = await requestFactory();
    return response.data;
  } catch {
    // Return realistic fallback data
    return typeof fallbackData === 'function' ? fallbackData() : fallbackData;
  }
};

// Cameras
export const getCameras = () =>
  request(() => api.get('/cameras'), () => mockCameras);

export const getCamera = (id) =>
  request(
    () => api.get(`/cameras/${id}`),
    () => mockCameras.find((c) => c.id === id) || mockCameras[0]
  );

export const createCamera = (cameraData) =>
  request(
    () => api.post('/cameras', cameraData),
    () => {
      const newCamera = {
        id: `cam-${Date.now().toString().slice(-4)}`,
        status: 'online',
        fps: 30,
        bitrate: 3200,
        latency: 16,
        model: 'YOLOv11x-Border',
        zones_count: 0,
        stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        ai_stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        ...cameraData,
      };
      mockCameras.unshift(newCamera);
      return newCamera;
    }
  );

export const deleteCamera = (id) =>
  request(
    () => api.delete(`/cameras/${id}`),
    () => {
      mockCameras = mockCameras.filter((c) => c.id !== id);
      return { success: true, id };
    }
  );

// Zones
export const getZones = (cameraId) =>
  request(
    () => api.get(`/cameras/${cameraId}/zones`),
    () => mockZones[cameraId] || []
  );

export const saveZone = (cameraId, zoneData) =>
  request(
    () => api.post(`/cameras/${cameraId}/zones`, zoneData),
    () => {
      const newZone = {
        id: zoneData.id || `zn-${Date.now().toString().slice(-4)}`,
        ...zoneData,
      };
      if (!mockZones[cameraId]) mockZones[cameraId] = [];
      mockZones[cameraId] = [newZone, ...mockZones[cameraId].filter((z) => z.id !== newZone.id)];
      // Update camera zones count
      const cam = mockCameras.find((c) => c.id === cameraId);
      if (cam) cam.zones_count = mockZones[cameraId].length;
      return newZone;
    }
  );

export const updateZone = (cameraId, zoneId, zoneData) =>
  request(
    () => api.put(`/cameras/${cameraId}/zones/${zoneId}`, zoneData),
    () => {
      if (mockZones[cameraId]) {
        mockZones[cameraId] = mockZones[cameraId].map((z) =>
          z.id === zoneId ? { ...z, ...zoneData } : z
        );
      }
      return zoneData;
    }
  );

export const deleteZone = (cameraId, zoneId) =>
  request(
    () => api.delete(`/cameras/${cameraId}/zones/${zoneId}`),
    () => {
      if (mockZones[cameraId]) {
        mockZones[cameraId] = mockZones[cameraId].filter((z) => z.id !== zoneId);
        const cam = mockCameras.find((c) => c.id === cameraId);
        if (cam) cam.zones_count = mockZones[cameraId].length;
      }
      return { success: true, zoneId };
    }
  );

// Events & Alerts
export const getEvents = (params = {}) =>
  request(
    () => api.get('/events', { params }),
    () => {
      let filtered = [...mockEvents];
      if (params.type) {
        filtered = filtered.filter((e) =>
          e.type.toLowerCase().includes(params.type.toLowerCase()) ||
          e.object_type.toLowerCase().includes(params.type.toLowerCase())
        );
      }
      if (params.risk && params.risk !== 'all') {
        filtered = filtered.filter((e) => e.risk === params.risk);
      }
      if (params.camera_id && params.camera_id !== 'all') {
        filtered = filtered.filter((e) => e.camera_id === params.camera_id);
      }
      return filtered;
    }
  );

export const getAlerts = () =>
  request(() => api.get('/alerts'), () => mockAlerts);

export const acknowledgeAlert = (alertId) =>
  request(
    () => api.post(`/alerts/${alertId}/acknowledge`),
    () => {
      mockAlerts = mockAlerts.map((a) =>
        a.id === alertId ? { ...a, status: 'acknowledged' } : a
      );
      return { success: true, alertId };
    }
  );

export const resolveAlert = (alertId) =>
  request(
    () => api.post(`/alerts/${alertId}/resolve`),
    () => {
      mockAlerts = mockAlerts.map((a) =>
        a.id === alertId ? { ...a, status: 'resolved' } : a
      );
      return { success: true, alertId };
    }
  );

export const getEvent = (id) =>
  request(
    () => api.get(`/events/${id}`),
    () => mockEvents.find((e) => e.id === id) || mockEvents[0]
  );

// Statistics & Analytics
export const getStatistics = () =>
  request(
    () => api.get('/statistics'),
    () => ({
      active_cameras: mockCameras.filter((c) => c.status === 'online').length,
      total_cameras: mockCameras.length,
      people_detected: 148,
      vehicles_detected: 94,
      drones_detected: 12,
      active_alerts: mockAlerts.filter((a) => a.status === 'active').length,
      high_risk_events: mockEvents.filter((e) => e.risk === 'critical' || e.risk === 'high').length,
      system_uptime: '99.98%',
      avg_latency_ms: 18,
      ai_accuracy: '99.2%',
    })
  );

export const getEvidence = () =>
  request(
    () => api.get('/evidence'),
    () =>
      mockEvents.map((e) => ({
        id: `evd-${e.id}`,
        event_id: e.id,
        camera_id: e.camera_id,
        camera_name: e.camera_name,
        track_id: e.track_id,
        event_type: e.type,
        object_type: e.object_type,
        risk: e.risk,
        confidence: e.confidence,
        timestamp: e.timestamp,
        snapshot_url: e.snapshot_url,
      }))
  );

export const getHealth = () =>
  request(
    () => api.get('/health'),
    () => ({
      status: 'online',
      mode: 'simulation_ready',
      api_version: '2.4.0-defense',
      ai_model: 'YOLOv11x-Border (TensorRT FP16)',
      latency_ms: 14,
      fps_throughput: 120,
      gpu_utilization: '48%',
      memory_usage: '3.8 GB / 16.0 GB',
    })
  );

export default api;