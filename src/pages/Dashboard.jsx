// TODO: Implement the main surveillance dashboard.
// src/pages/Dashboard.jsx
import { useState } from 'react';
import VideoPanel from '../components/VideoPanel';
import { Activity, AlertTriangle, Users, Car, Video } from 'lucide-react';

// Mock cameras for demo (replace with API call when backend ready)
const DEMO_CAMERAS = [
  {
    id: 1,
    name: 'Shibuya Crossing',
    location: 'Tokyo, Japan',
    originalStream: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    aiStream: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    category: 'traffic',
    status: 'online'
  },
  {
    id: 2,
    name: 'Times Square',
    location: 'New York, USA',
    originalStream: 'https://demo.unified-streaming.com/livetest/live.isml/.m3u8',
    aiStream: 'https://demo.unified-streaming.com/livetest/live.isml/.m3u8',
    category: 'traffic',
    status: 'online'
  },
  {
    id: 3,
    name: 'Waikiki Beach',
    location: 'Hawaii, USA',
    originalStream: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    aiStream: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    category: 'beach',
    status: 'online'
  }
];

export default function Dashboard() {
  const [cameras] = useState(DEMO_CAMERAS);
  const [stats] = useState({
    activeCameras: 3,
    peopleDetected: 47,
    vehiclesDetected: 23,
    activeAlerts: 5,
    highRiskEvents: 2
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">IBVAP Dashboard</h1>
          <p className="text-gray-500">Intelligent Border & Video Analytics Platform</p>
        </div>
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded">
          <Activity className="w-5 h-5" />
          System Online
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.activeCameras}</div>
              <div className="text-sm text-gray-500">Active Cameras</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.peopleDetected}</div>
              <div className="text-sm text-gray-500">People Detected</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded">
              <Car className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.vehiclesDetected}</div>
              <div className="text-sm text-gray-500">Vehicles Detected</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.activeAlerts}</div>
              <div className="text-sm text-gray-500">Active Alerts</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.highRiskEvents}</div>
              <div className="text-sm text-gray-500">High Risk Events</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Surveillance */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Live Surveillance</h2>
        <div className="space-y-6">
          {cameras.map(camera => (
            <VideoPanel key={camera.id} camera={camera} />
          ))}
        </div>
      </div>
    </div>
  );
}