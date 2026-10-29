import React, { useState, useEffect } from 'react';
import {
  Camera, Plus, Wifi, WifiOff, Settings, Trash2, Eye, EyeOff,
  RefreshCw, CheckCircle, XCircle, AlertCircle, Globe, Lock,
  Monitor, Server, Zap, Filter, Search, Edit2, Save, X,
  Network, HardDrive, Shield, Play, Pause, Video, Radio
} from 'lucide-react';
import { sites } from '../data/mockData';

// ─── Types ────────────────────────────────────────────
interface CameraConfig {
  id: string;
  name: string;
  siteId: string;
  location: string;
  type: 'ip_camera' | 'dvr' | 'nvr' | 'access_control';
  brand: string;
  model: string;
  protocol: 'onvif' | 'rtsp' | 'http' | 'https' | 'proprietary';
  ipAddress: string;
  port: number;
  username: string;
  password: string;
  streamPath: string;
  channels?: number;
  status: 'online' | 'offline' | 'error' | 'testing' | 'discovering';
  resolution: string;
  fps: number;
  enabled: boolean;
  lastSeen?: string;
  firmware?: string;
  macAddress?: string;
  serialNumber?: string;
}

interface BrandPreset {
  brand: string;
  defaultPort: number;
  defaultStreamPath: string;
  rtspFormats: string[];
  onvifSupport: boolean;
  dvrSupport: boolean;
  nvrSupport: boolean;
  accessControlSupport: boolean;
}

interface NetworkDevice {
  ip: string;
  mac: string;
  brand: string;
  model: string;
  type: string;
  status: 'found' | 'verified' | 'added';
}

// ─── Presets par marque ───────────────────────────────
const BRAND_PRESETS: Record<string, BrandPreset> = {
  'Hikvision': {
    brand: 'Hikvision',
    defaultPort: 8000,
    defaultStreamPath: '/Streaming/Channels/101',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/Streaming/Channels/101',
      'rtsp://{user}:{pass}@{ip}:{port}/Streaming/Channels/102',
      'rtsp://{user}:{pass}@{ip}:554/Streaming/Channels/101',
    ],
    onvifSupport: true,
    dvrSupport: true,
    nvrSupport: true,
    accessControlSupport: true,
  },
  'Dahua': {
    brand: 'Dahua',
    defaultPort: 37777,
    defaultStreamPath: '/cam/realmonitor?channel=1&subtype=0',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/cam/realmonitor?channel=1&subtype=0',
      'rtsp://{user}:{pass}@{ip}:{port}/cam/realmonitor?channel=1&subtype=1',
      'rtsp://{user}:{pass}@{ip}:554/cam/realmonitor?channel=1&subtype=0',
    ],
    onvifSupport: true,
    dvrSupport: true,
    nvrSupport: true,
    accessControlSupport: true,
  },
  'Axis': {
    brand: 'Axis',
    defaultPort: 80,
    defaultStreamPath: '/axis-media/media.amp',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/axis-media/media.amp',
      'rtsp://{user}:{pass}@{ip}:{port}/axis-media/media.amp?resolution=1920x1080',
      'rtsp://{user}:{pass}@{ip}:554/axis-media/media.amp',
    ],
    onvifSupport: true,
    dvrSupport: false,
    nvrSupport: false,
    accessControlSupport: true,
  },
  'Hanwha': {
    brand: 'Hanwha',
    defaultPort: 80,
    defaultStreamPath: '/stream1',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/stream1',
      'rtsp://{user}:{pass}@{ip}:{port}/stream2',
      'rtsp://{user}:{pass}@{ip}:554/stream1',
    ],
    onvifSupport: true,
    dvrSupport: true,
    nvrSupport: true,
    accessControlSupport: true,
  },
  'Bosch': {
    brand: 'Bosch',
    defaultPort: 80,
    defaultStreamPath: '/rtsp_tunnel',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/rtsp_tunnel',
      'rtsp://{user}:{pass}@{ip}:554/rtsp_tunnel',
    ],
    onvifSupport: true,
    dvrSupport: true,
    nvrSupport: true,
    accessControlSupport: false,
  },
  'Milestone': {
    brand: 'Milestone',
    defaultPort: 554,
    defaultStreamPath: '/stream',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/stream',
    ],
    onvifSupport: true,
    dvrSupport: true,
    nvrSupport: true,
    accessControlSupport: false,
  },
  'Uniview': {
    brand: 'Uniview',
    defaultPort: 80,
    defaultStreamPath: '/stream1',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/stream1',
      'rtsp://{user}:{pass}@{ip}:554/stream1',
    ],
    onvifSupport: true,
    dvrSupport: true,
    nvrSupport: true,
    accessControlSupport: false,
  },
  'Autre': {
    brand: 'Autre',
    defaultPort: 554,
    defaultStreamPath: '/stream1',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/stream1',
      'rtsp://{user}:{pass}@{ip}:{port}/live',
      'rtsp://{user}:{pass}@{ip}:554/stream1',
    ],
    onvifSupport: false,
    dvrSupport: false,
    nvrSupport: false,
    accessControlSupport: false,
  },
};

// ─── Caméras mockées ──────────────────────────────────
const initialCameras: CameraConfig[] = [
  {
    id: 'CAM-001',
    name: 'Entrée principale',
    siteId: 'S001',
    location: 'Hall entrée',
    type: 'ip_camera',
    brand: 'Hikvision',
    model: 'DS-2CD2143G2-I',
    protocol: 'onvif',
    ipAddress: '192.168.1.101',
    port: 80,
    username: 'admin',
    password: '••••••••',
    streamPath: '/Streaming/Channels/101',
    status: 'online',
    resolution: '2688x1520',
    fps: 25,
    enabled: true,
    lastSeen: '2026-01-15T14:30:00',
    firmware: 'V5.7.1',
    macAddress: 'AA:BB:CC:DD:EE:01',
    serialNumber: 'DS2CD2143G2I20240001',
  },
  {
    id: 'DVR-001',
    name: 'DVR Parking',
    siteId: 'S001',
    location: 'Local technique',
    type: 'dvr',
    brand: 'Dahua',
    model: 'XVR5108HS-4KL',
    protocol: 'proprietary',
    ipAddress: '192.168.1.200',
    port: 37777,
    username: 'admin',
    password: '••••••••',
    streamPath: '/cam/realmonitor?channel=1&subtype=0',
    channels: 8,
    status: 'online',
    resolution: '3840x2160',
    fps: 30,
    enabled: true,
    lastSeen: '2026-01-15T14:30:00',
    firmware: '4.000.0000000.0',
    macAddress: 'AA:BB:CC:DD:EE:02',
    serialNumber: 'XVR5108HS20240001',
  },
  {
    id: 'NVR-001',
    name: 'NVR Principal',
    siteId: 'S002',
    location: 'Salle serveur',
    type: 'nvr',
    brand: 'Hikvision',
    model: 'DS-7608NI-K2/8P',
    protocol: 'onvif',
    ipAddress: '192.168.1.210',
    port: 8000,
    username: 'admin',
    password: '••••••••',
    streamPath: '/Streaming/Channels/101',
    channels: 8,
    status: 'online',
    resolution: '1920x1080',
    fps: 25,
    enabled: true,
    lastSeen: '2026-01-15T14:30:00',
    firmware: 'V4.30.081',
    macAddress: 'AA:BB:CC:DD:EE:03',
    serialNumber: 'DS7608NIK2P20240001',
  },
  {
    id: 'AC-001',
    name: 'Contrôle accès entrée',
    siteId: 'S001',
    location: 'Entrée principale',
    type: 'access_control',
    brand: 'Hikvision',
    model: 'DS-K1T671MWX',
    protocol: 'proprietary',
    ipAddress: '192.168.1.150',
    port: 8000,
    username: 'admin',
    password: '••••••••',
    streamPath: '',
    status: 'online',
    resolution: '',
    fps: 0,
    enabled: true,
    lastSeen: '2026-01-15T14:30:00',
    firmware: 'V2.1.3',
    macAddress: 'AA:BB:CC:DD:EE:04',
    serialNumber: 'DSK1T671MWX20240001',
  },
];

// ─── Component ────────────────────────────────────────
export const CameraConnection: React.FC = () => {
  const [cameras, setCameras] = useState<CameraConfig[]>(initialCameras);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('toutes');
  const [filterType, setFilterType] = useState<string>('tous');
  const [filterStatus, setFilterStatus] = useState<string>('tous');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [scanning, setScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<NetworkDevice[]>([]);

  const [newCamera, setNewCamera] = useState<Partial<CameraConfig>>({
    name: '',
    siteId: 'S001',
    location: '',
    type: 'ip_camera',
    brand: 'Hikvision',
    model: '',
    protocol: 'onvif',
    ipAddress: '',
    port: 80,
    username: 'admin',
    password: '',
    streamPath: '',
    resolution: '1920x1080',
    fps: 25,
    enabled: true,
  });

  const filteredCameras = cameras.filter(cam => {
    const matchesSearch = searchTerm === '' ||
      cam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cam.ipAddress.includes(searchTerm) ||
      cam.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filterBrand === 'toutes' || cam.brand === filterBrand;
    const matchesType = filterType === 'tous' || cam.type === filterType;
    const matchesStatus = filterStatus === 'tous' || cam.status === filterStatus;
    return matchesSearch && matchesBrand && matchesType && matchesStatus;
  });

  const stats = {
    total: cameras.length,
    online: cameras.filter(c => c.status === 'online').length,
    offline: cameras.filter(c => c.status === 'offline').length,
    error: cameras.filter(c => c.status === 'error').length,
    ipCameras: cameras.filter(c => c.type === 'ip_camera').length,
    dvr: cameras.filter(c => c.type === 'dvr').length,
    nvr: cameras.filter(c => c.type === 'nvr').length,
    accessControl: cameras.filter(c => c.type === 'access_control').length,
  };

  const handleAddCamera = () => {
    const cam: CameraConfig = {
      id: `${newCamera.type?.toUpperCase().substring(0, 3)}-${String(cameras.length + 1).padStart(3, '0')}`,
      name: newCamera.name || 'Nouvel appareil',
      siteId: newCamera.siteId || 'S001',
      location: newCamera.location || '',
      type: newCamera.type || 'ip_camera',
      brand: newCamera.brand || 'Hikvision',
      model: newCamera.model || '',
      protocol: newCamera.protocol || 'onvif',
      ipAddress: newCamera.ipAddress || '',
      port: newCamera.port || 80,
      username: newCamera.username || 'admin',
      password: newCamera.password || '',
      streamPath: newCamera.streamPath || BRAND_PRESETS[newCamera.brand || 'Hikvision'].defaultStreamPath,
      status: 'testing',
      resolution: newCamera.resolution || '1920x1080',
      fps: newCamera.fps || 25,
      enabled: newCamera.enabled ?? true,
      lastSeen: new Date().toISOString(),
    };
    setCameras([...cameras, cam]);
    setShowAddForm(false);
    setNewCamera({
      name: '',
      siteId: 'S001',
      location: '',
      type: 'ip_camera',
      brand: 'Hikvision',
      model: '',
      protocol: 'onvif',
      ipAddress: '',
      port: 80,
      username: 'admin',
      password: '',
      streamPath: '',
      resolution: '1920x1080',
      fps: 25,
      enabled: true,
    });
  };

  const handleDeleteCamera = (id: string) => {
    setCameras(cameras.filter(c => c.id !== id));
  };

  const handleTestConnection = (id: string) => {
    setCameras(cameras.map(c =>
      c.id === id ? { ...c, status: 'testing' as const } : c
    ));
    setTimeout(() => {
      setCameras(cameras.map(c =>
        c.id === id ? { ...c, status: Math.random() > 0.3 ? 'online' as const : 'error' as const } : c
      ));
    }, 2000);
  };

  const handleScanNetwork = () => {
    setScanning(true);
    setDiscoveredDevices([]);
    
    // Simulation de scan réseau
    const mockDevices: NetworkDevice[] = [
      { ip: '192.168.1.105', mac: 'AA:BB:CC:DD:EE:05', brand: 'Hikvision', model: 'DS-2CD2347G2-LU', type: 'ip_camera', status: 'found' },
      { ip: '192.168.1.106', mac: 'AA:BB:CC:DD:EE:06', brand: 'Dahua', model: 'IPC-HDW3641T-ZAS', type: 'ip_camera', status: 'found' },
      { ip: '192.168.1.220', mac: 'AA:BB:CC:DD:EE:07', brand: 'Hikvision', model: 'DS-7608NI-K2/8P', type: 'nvr', status: 'found' },
    ];
    
    setTimeout(() => {
      setDiscoveredDevices(mockDevices);
      setScanning(false);
    }, 3000);
  };

  const handleAddDiscoveredDevice = (device: NetworkDevice) => {
    const preset = BRAND_PRESETS[device.brand] || BRAND_PRESETS['Autre'];
    const cam: CameraConfig = {
      id: `${device.type.toUpperCase().substring(0, 3)}-${String(cameras.length + 1).padStart(3, '0')}`,
      name: `${device.brand} ${device.model}`,
      siteId: 'S001',
      location: '',
      type: device.type as any,
      brand: device.brand,
      model: device.model,
      protocol: preset.onvifSupport ? 'onvif' : 'rtsp',
      ipAddress: device.ip,
      port: preset.defaultPort,
      username: 'admin',
      password: '',
      streamPath: preset.defaultStreamPath,
      status: 'testing',
      resolution: '1920x1080',
      fps: 25,
      enabled: true,
      lastSeen: new Date().toISOString(),
      macAddress: device.mac,
    };
    setCameras([...cameras, cam]);
    setDiscoveredDevices(discoveredDevices.map(d =>
      d.ip === device.ip ? { ...d, status: 'added' as const } : d
    ));
  };

  const togglePassword = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const generateStreamUrl = (cam: CameraConfig) => {
    const preset = BRAND_PRESETS[cam.brand];
    if (!preset) return '';
    const format = preset.rtspFormats[0];
    return format
      .replace('{user}', cam.username)
      .replace('{pass}', '********')
      .replace('{ip}', cam.ipAddress)
      .replace('{port}', cam.port.toString());
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ip_camera: 'Caméra IP',
      dvr: 'DVR',
      nvr: 'NVR',
      access_control: 'Contrôle d\'accès',
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip_camera': return <Camera size={16} />;
      case 'dvr': return <HardDrive size={16} />;
      case 'nvr': return <Server size={16} />;
      case 'access_control': return <Shield size={16} />;
      default: return <Camera size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Network size={28} />
            Connexion caméras & équipements
          </h1>
          <p className="text-slate-500 text-sm">
            IP Cameras, DVR, NVR, ONVIF, Contrôle d'accès — Toutes marques
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleScanNetwork}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium disabled:opacity-50"
          >
            <Radio size={16} className={scanning ? 'animate-spin' : ''} />
            {scanning ? 'Scan en cours...' : 'Scanner réseau'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <Plus size={16} />
            Ajouter manuellement
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard icon={<Monitor size={16} />} label="Total" value={stats.total} color="blue" />
        <StatCard icon={<Wifi size={16} />} label="En ligne" value={stats.online} color="green" />
        <StatCard icon={<WifiOff size={16} />} label="Hors ligne" value={stats.offline} color="red" />
        <StatCard icon={<AlertCircle size={16} />} label="Erreur" value={stats.error} color="orange" />
        <StatCard icon={<Camera size={16} />} label="Caméras IP" value={stats.ipCameras} color="purple" />
        <StatCard icon={<HardDrive size={16} />} label="DVR" value={stats.dvr} color="cyan" />
        <StatCard icon={<Server size={16} />} label="NVR" value={stats.nvr} color="indigo" />
        <StatCard icon={<Shield size={16} />} label="Contrôle accès" value={stats.accessControl} color="pink" />
      </div>

      {/* Network Scan Results */}
      {discoveredDevices.length > 0 && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-5">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <Radio size={16} />
            Appareils découverts sur le réseau
          </h3>
          <div className="space-y-2">
            {discoveredDevices.map(device => (
              <div key={device.ip} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    {device.type === 'ip_camera' ? <Camera size={18} className="text-green-600" /> :
                     device.type === 'dvr' ? <HardDrive size={18} className="text-green-600" /> :
                     device.type === 'nvr' ? <Server size={18} className="text-green-600" /> :
                     <Shield size={18} className="text-green-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{device.brand} {device.model}</p>
                    <p className="text-xs text-slate-500">IP: {device.ip} • MAC: {device.mac}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    device.status === 'added' ? 'bg-green-100 text-green-700' :
                    device.status === 'verified' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {device.status === 'added' ? 'Ajouté' : device.status === 'verified' ? 'Vérifié' : 'Trouvé'}
                  </span>
                  {device.status === 'found' && (
                    <button
                      onClick={() => handleAddDiscoveredDevice(device)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                    >
                      Ajouter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, IP, modèle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tous">Tous les types</option>
            <option value="ip_camera">Caméras IP</option>
            <option value="dvr">DVR</option>
            <option value="nvr">NVR</option>
            <option value="access_control">Contrôle d'accès</option>
          </select>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="toutes">Toutes les marques</option>
            {Object.keys(BRAND_PRESETS).map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tous">Tous les statuts</option>
            <option value="online">En ligne</option>
            <option value="offline">Hors ligne</option>
            <option value="error">Erreur</option>
          </select>
        </div>
      </div>

      {/* Add Camera Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              Nouvel appareil
            </h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type d'appareil *</label>
              <select
                value={newCamera.type}
                onChange={(e) => setNewCamera({ ...newCamera, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ip_camera">Caméra IP</option>
                <option value="dvr">DVR</option>
                <option value="nvr">NVR</option>
                <option value="access_control">Contrôle d'accès</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nom *</label>
              <input
                type="text"
                value={newCamera.name}
                onChange={(e) => setNewCamera({ ...newCamera, name: e.target.value })}
                placeholder="Ex: Entrée principale"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Site *</label>
              <select
                value={newCamera.siteId}
                onChange={(e) => setNewCamera({ ...newCamera, siteId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Marque *</label>
              <select
                value={newCamera.brand}
                onChange={(e) => {
                  const brand = e.target.value;
                  setNewCamera({
                    ...newCamera,
                    brand,
                    port: BRAND_PRESETS[brand].defaultPort,
                    streamPath: BRAND_PRESETS[brand].defaultStreamPath,
                    protocol: BRAND_PRESETS[brand].onvifSupport ? 'onvif' : 'rtsp',
                  });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(BRAND_PRESETS).map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Modèle</label>
              <input
                type="text"
                value={newCamera.model}
                onChange={(e) => setNewCamera({ ...newCamera, model: e.target.value })}
                placeholder="Ex: DS-2CD2143G2-I"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Protocole *</label>
              <select
                value={newCamera.protocol}
                onChange={(e) => setNewCamera({ ...newCamera, protocol: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="onvif">ONVIF</option>
                <option value="rtsp">RTSP</option>
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="proprietary">Propriétaire</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Adresse IP *</label>
              <input
                type="text"
                value={newCamera.ipAddress}
                onChange={(e) => setNewCamera({ ...newCamera, ipAddress: e.target.value })}
                placeholder="192.168.1.100"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Port *</label>
              <input
                type="number"
                value={newCamera.port}
                onChange={(e) => setNewCamera({ ...newCamera, port: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Utilisateur *</label>
              <input
                type="text"
                value={newCamera.username}
                onChange={(e) => setNewCamera({ ...newCamera, username: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Mot de passe *</label>
              <input
                type="password"
                value={newCamera.password}
                onChange={(e) => setNewCamera({ ...newCamera, password: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {newCamera.type !== 'access_control' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Résolution</label>
                  <input
                    type="text"
                    value={newCamera.resolution}
                    onChange={(e) => setNewCamera({ ...newCamera, resolution: e.target.value })}
                    placeholder="1920x1080"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">FPS</label>
                  <input
                    type="number"
                    value={newCamera.fps}
                    onChange={(e) => setNewCamera({ ...newCamera, fps: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Chemin du flux</label>
              <input
                type="text"
                value={newCamera.streamPath}
                onChange={(e) => setNewCamera({ ...newCamera, streamPath: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Auto-rempli selon la marque. Modifiable si nécessaire.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleAddCamera}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              <Save size={16} />
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Devices List */}
      <div className="space-y-3">
        {filteredCameras.map(cam => {
          const site = sites.find(s => s.id === cam.siteId);
          const streamUrl = generateStreamUrl(cam);

          return (
            <div key={cam.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Status Icon */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  cam.status === 'online' ? 'bg-green-100' :
                  cam.status === 'offline' ? 'bg-red-100' :
                  cam.status === 'error' ? 'bg-orange-100' :
                  'bg-blue-100'
                }`}>
                  {cam.status === 'testing' ? (
                    <RefreshCw size={20} className="text-blue-600 animate-spin" />
                  ) : (
                    <div className="text-slate-700">
                      {getTypeIcon(cam.type)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{cam.name}</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                      {getTypeLabel(cam.type)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      cam.status === 'online' ? 'bg-green-100 text-green-700' :
                      cam.status === 'offline' ? 'bg-red-100 text-red-700' :
                      cam.status === 'error' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {cam.status === 'online' ? 'En ligne' :
                       cam.status === 'offline' ? 'Hors ligne' :
                       cam.status === 'error' ? 'Erreur' : 'Test...'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 mb-3">
                    <div>
                      <span className="text-slate-400">Marque</span>
                      <p className="font-medium">{cam.brand}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Modèle</span>
                      <p className="font-medium">{cam.model || '—'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">IP</span>
                      <p className="font-mono">{cam.ipAddress}:{cam.port}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Protocole</span>
                      <p className="font-medium uppercase">{cam.protocol}</p>
                    </div>
                  </div>

                  {/* Stream URL */}
                  {cam.type !== 'access_control' && (
                    <div className="bg-slate-50 rounded-lg p-2 mb-2">
                      <p className="text-xs text-slate-400 mb-1">URL du flux RTSP</p>
                      <p className="text-xs font-mono text-slate-700 break-all">{streamUrl}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {cam.resolution && (
                      <>
                        <span className="flex items-center gap-1">
                          <Monitor size={12} /> {cam.resolution}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    {cam.fps > 0 && (
                      <>
                        <span>{cam.fps} FPS</span>
                        <span>•</span>
                      </>
                    )}
                    {cam.channels && (
                      <>
                        <span>{cam.channels} canaux</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{site?.nom}</span>
                    {cam.macAddress && (
                      <>
                        <span>•</span>
                        <span>MAC: {cam.macAddress}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestConnection(cam.id)}
                    disabled={cam.status === 'testing'}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                    title="Tester la connexion"
                  >
                    <RefreshCw size={16} className={`text-blue-600 ${cam.status === 'testing' ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => togglePassword(cam.id)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                    title={showPassword[cam.id] ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword[cam.id] ? <EyeOff size={16} className="text-slate-600" /> : <Eye size={16} className="text-slate-600" />}
                  </button>
                  <button
                    onClick={() => handleDeleteCamera(cam.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Protocol Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Globe size={16} />
            Protocoles supportés
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>✓ ONVIF Profile S, G, T</li>
            <li>✓ RTSP (Real Time Streaming Protocol)</li>
            <li>✓ HTTP/HTTPS (MJPEG, snapshots)</li>
            <li>✓ Protocoles propriétaires (SDK)</li>
            <li>✓ CGI (Common Gateway Interface)</li>
          </ul>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-5">
          <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
            <Server size={16} />
            Types d'appareils
          </h3>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>✓ Caméras IP (fixes, PTZ, dôme)</li>
            <li>✓ DVR (Digital Video Recorder)</li>
            <li>✓ NVR (Network Video Recorder)</li>
            <li>✓ Contrôle d'accès (badges, biométrie)</li>
            <li>✓ Encodeurs vidéo</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    pink: 'bg-pink-50 text-pink-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
};
