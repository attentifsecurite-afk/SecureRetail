import React, { useState } from 'react';
import {
  Camera, Plus, Wifi, WifiOff, Settings, Trash2, Eye, EyeOff,
  RefreshCw, CheckCircle, XCircle, AlertCircle, Globe, Lock,
  Monitor, Server, Zap, Filter, Search, Edit2, Save, X
} from 'lucide-react';
import { sites } from '../data/mockData';

// ─── Types ────────────────────────────────────────────
interface CameraConfig {
  id: string;
  name: string;
  siteId: string;
  location: string;
  brand: string;
  model: string;
  protocol: 'onvif' | 'rtsp' | 'http' | 'https';
  ipAddress: string;
  port: number;
  username: string;
  password: string;
  streamPath: string;
  status: 'online' | 'offline' | 'error' | 'testing';
  resolution: string;
  fps: number;
  enabled: boolean;
  lastSeen?: string;
  firmware?: string;
}

interface BrandPreset {
  brand: string;
  defaultPort: number;
  defaultStreamPath: string;
  rtspFormats: string[];
  onvifSupport: boolean;
}

// ─── Presets par marque ───────────────────────────────
const BRAND_PRESETS: Record<string, BrandPreset> = {
  'Hikvision': {
    brand: 'Hikvision',
    defaultPort: 554,
    defaultStreamPath: '/Streaming/Channels/101',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/Streaming/Channels/101',
      'rtsp://{user}:{pass}@{ip}:{port}/Streaming/Channels/102',
      'rtsp://{user}:{pass}@{ip}:{port}/ISAPI/Streaming/channels/101',
    ],
    onvifSupport: true,
  },
  'Dahua': {
    brand: 'Dahua',
    defaultPort: 554,
    defaultStreamPath: '/cam/realmonitor?channel=1&subtype=0',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/cam/realmonitor?channel=1&subtype=0',
      'rtsp://{user}:{pass}@{ip}:{port}/cam/realmonitor?channel=1&subtype=1',
      'rtsp://{user}:{pass}@{ip}:{port}/cam/playback?channel=1&starttime=2024_01_01_00_00_00',
    ],
    onvifSupport: true,
  },
  'Axis': {
    brand: 'Axis',
    defaultPort: 554,
    defaultStreamPath: '/axis-media/media.amp',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/axis-media/media.amp',
      'rtsp://{user}:{pass}@{ip}:{port}/axis-media/media.amp?resolution=1920x1080',
      'rtsp://{user}:{pass}@{ip}:{port}/mjpg/1/video.mjpg',
    ],
    onvifSupport: true,
  },
  'Hanwha': {
    brand: 'Hanwha',
    defaultPort: 554,
    defaultStreamPath: '/stream1',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/stream1',
      'rtsp://{user}:{pass}@{ip}:{port}/stream2',
      'rtsp://{user}:{pass}@{ip}:{port}/profile1/media.smp',
    ],
    onvifSupport: true,
  },
  'Bosch': {
    brand: 'Bosch',
    defaultPort: 554,
    defaultStreamPath: '/rtsp_tunnel?h26xPlus=on',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/rtsp_tunnel',
      'rtsp://{user}:{pass}@{ip}:{port}/rtsp_tunnel?h26xPlus=on',
    ],
    onvifSupport: true,
  },
  'Milestone': {
    brand: 'Milestone',
    defaultPort: 554,
    defaultStreamPath: '/stream',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/stream',
    ],
    onvifSupport: true,
  },
  'Autre': {
    brand: 'Autre',
    defaultPort: 554,
    defaultStreamPath: '/stream1',
    rtspFormats: [
      'rtsp://{user}:{pass}@{ip}:{port}/stream1',
      'rtsp://{user}:{pass}@{ip}:{port}/live',
      'rtsp://{user}:{pass}@{ip}:{port}/h264',
    ],
    onvifSupport: false,
  },
};

// ─── Caméras mockées ──────────────────────────────────
const initialCameras: CameraConfig[] = [
  {
    id: 'CAM-001',
    name: 'Entrée principale',
    siteId: 'S001',
    location: 'Hall entrée',
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
  },
  {
    id: 'CAM-002',
    name: 'Rayon électronique',
    siteId: 'S001',
    location: 'Surface de vente',
    brand: 'Dahua',
    model: 'IPC-HFW2431S',
    protocol: 'rtsp',
    ipAddress: '192.168.1.102',
    port: 554,
    username: 'admin',
    password: '••••••••',
    streamPath: '/cam/realmonitor?channel=1&subtype=0',
    status: 'online',
    resolution: '1920x1080',
    fps: 30,
    enabled: true,
    lastSeen: '2026-01-15T14:30:00',
    firmware: '2.800.0',
  },
  {
    id: 'CAM-003',
    name: 'Parking P2',
    siteId: 'S001',
    location: 'Parking sous-sol',
    brand: 'Hikvision',
    model: 'DS-2CD2T87G2-L',
    protocol: 'onvif',
    ipAddress: '192.168.1.103',
    port: 80,
    username: 'admin',
    password: '••••••••',
    streamPath: '/Streaming/Channels/101',
    status: 'offline',
    resolution: '3840x2160',
    fps: 20,
    enabled: false,
    lastSeen: '2026-01-15T08:30:00',
    firmware: 'V5.7.11',
  },
];

// ─── Component ────────────────────────────────────────
export const CameraSetup: React.FC = () => {
  const [cameras, setCameras] = useState<CameraConfig[]>(initialCameras);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCamera, setEditingCamera] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('toutes');
  const [filterStatus, setFilterStatus] = useState<string>('tous');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const [newCamera, setNewCamera] = useState<Partial<CameraConfig>>({
    name: '',
    siteId: 'S001',
    location: '',
    brand: 'Hikvision',
    model: '',
    protocol: 'onvif',
    ipAddress: '',
    port: 554,
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
    const matchesStatus = filterStatus === 'tous' || cam.status === filterStatus;
    return matchesSearch && matchesBrand && matchesStatus;
  });

  const stats = {
    total: cameras.length,
    online: cameras.filter(c => c.status === 'online').length,
    offline: cameras.filter(c => c.status === 'offline').length,
    error: cameras.filter(c => c.status === 'error').length,
  };

  const handleAddCamera = () => {
    const cam: CameraConfig = {
      id: `CAM-${String(cameras.length + 1).padStart(3, '0')}`,
      name: newCamera.name || 'Nouvelle caméra',
      siteId: newCamera.siteId || 'S001',
      location: newCamera.location || '',
      brand: newCamera.brand || 'Hikvision',
      model: newCamera.model || '',
      protocol: newCamera.protocol || 'onvif',
      ipAddress: newCamera.ipAddress || '',
      port: newCamera.port || 554,
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
      brand: 'Hikvision',
      model: '',
      protocol: 'onvif',
      ipAddress: '',
      port: 554,
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
    // Simulate test
    setTimeout(() => {
      setCameras(cameras.map(c =>
        c.id === id ? { ...c, status: Math.random() > 0.3 ? 'online' as const : 'error' as const } : c
      ));
    }, 2000);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Camera size={28} />
            Installation caméras
          </h1>
          <p className="text-slate-500 text-sm">
            Configuration DVR/NVR/ONVIF — Support multi-marques
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Ajouter une caméra
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Monitor size={18} className="text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wifi size={18} className="text-green-600" />
            <span className="text-xs text-green-600 font-medium">En ligne</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.online}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <WifiOff size={18} className="text-red-600" />
            <span className="text-xs text-red-600 font-medium">Hors ligne</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.offline}</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">Erreur</span>
          </div>
          <p className="text-2xl font-bold text-orange-700">{stats.error}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
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
              Nouvelle caméra
            </h3>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Emplacement</label>
              <input
                type="text"
                value={newCamera.location}
                onChange={(e) => setNewCamera({ ...newCamera, location: e.target.value })}
                placeholder="Ex: Hall entrée"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
            <div className="sm:col-span-2">
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

      {/* Cameras List */}
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
                  ) : cam.status === 'online' ? (
                    <Wifi size={20} className="text-green-600" />
                  ) : cam.status === 'offline' ? (
                    <WifiOff size={20} className="text-red-600" />
                  ) : (
                    <AlertCircle size={20} className="text-orange-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{cam.name}</h3>
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
                  <div className="bg-slate-50 rounded-lg p-2 mb-2">
                    <p className="text-xs text-slate-400 mb-1">URL du flux RTSP</p>
                    <p className="text-xs font-mono text-slate-700 break-all">{streamUrl}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Monitor size={12} /> {cam.resolution}
                    </span>
                    <span>•</span>
                    <span>{cam.fps} FPS</span>
                    <span>•</span>
                    <span>{site?.nom}</span>
                    {cam.lastSeen && (
                      <>
                        <span>•</span>
                        <span>Dernière connexion : {new Date(cam.lastSeen).toLocaleString('fr-FR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}</span>
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
                    onClick={() => setEditingCamera(cam.id)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                    title="Modifier"
                  >
                    <Edit2 size={16} className="text-slate-600" />
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

      {/* ONVIF Info */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Globe size={16} />
          Support ONVIF & Multi-marques
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-blue-700">
          <div>
            <p className="font-medium mb-2">Protocoles supportés :</p>
            <ul className="space-y-1">
              <li>✓ ONVIF Profile S (streaming)</li>
              <li>✓ ONVIF Profile G (storage)</li>
              <li>✓ RTSP (Real Time Streaming Protocol)</li>
              <li>✓ HTTP/HTTPS (MJPEG, snapshot)</li>
              <li>✓ Protocoles propriétaires (SDK)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">Marques compatibles :</p>
            <ul className="space-y-1">
              <li>✓ Hikvision (DS-2CD, iDS-2CD)</li>
              <li>✓ Dahua (IPC-HFW, IPC-HDW)</li>
              <li>✓ Axis (P, Q, M series)</li>
              <li>✓ Hanwha ( Wisenet)</li>
              <li>✓ Bosch, Milestone, et autres</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Info */}
      <div className="bg-slate-900 rounded-xl p-5 text-white">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Server size={16} className="text-blue-400" />
          Configuration backend (Python)
        </h3>
        <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
{`# Exemple de configuration ONVIF
from onvif import ONVIFCamera

# Connexion ONVIF
cam = ONVIFCamera('192.168.1.101', 80, 'admin', 'password')

# Récupération des profils médias
media_service = cam.create_media_service()
profiles = media_service.GetProfiles()

# Obtention du flux RTSP
stream_uri = media_service.GetStreamUri({
    'StreamSetup': {
        'Stream': 'RTP-Unicast',
        'Transport': {'Protocol': 'RTSP'}
    },
    'ProfileToken': profiles[0].token
})

print(f"Flux RTSP: {stream_uri.Uri}")`}
        </pre>
      </div>
    </div>
  );
};
