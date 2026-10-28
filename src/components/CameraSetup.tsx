import React, { useState } from 'react';
import {
  Camera, Plus, Wifi, WifiOff, Settings, Trash2, Eye, EyeOff,
  RefreshCw, AlertCircle, Globe, Lock, Monitor, Server, Search, Edit2, Save, Loader2
} from 'lucide-react';
import { useData } from '../data/DataContext';
import { Modal, FormField, inputClass, Spinner, ErrorBanner } from './Shared';
import type { Camera as CameraType } from '../types';

interface BrandPreset {
  brand: string;
  defaultPort: number;
  defaultStreamPath: string;
  rtspFormats: string[];
  onvifSupport: boolean;
}

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

const PROTOCOLES: Array<CameraType['protocole']> = ['onvif', 'rtsp', 'http', 'https'];

interface FormState {
  nom: string;
  siteId: string;
  zone: string;
  emplacement: string;
  fabricant: string;
  modele: string;
  protocole: CameraType['protocole'];
  ip: string;
  port: number;
  utilisateur: string;
  motDePasse: string;
  cheminFlux: string;
  resolution: string;
  fps: number;
  actif: boolean;
}

const emptyForm = (siteId: string): FormState => ({
  nom: '',
  siteId,
  zone: '',
  emplacement: '',
  fabricant: 'Hikvision',
  modele: '',
  protocole: 'onvif',
  ip: '',
  port: 80,
  utilisateur: 'admin',
  motDePasse: '',
  cheminFlux: '/Streaming/Channels/101',
  resolution: '1920x1080',
  fps: 25,
  actif: true,
});

export const CameraSetup: React.FC = () => {
  const { state, loading, error, create, update, remove, testCamera } = useData();
  const { cameras, sites } = state;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCamera, setEditingCamera] = useState<CameraType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState<string>('toutes');
  const [filterStatus, setFilterStatus] = useState<string>('tous');
  const [showPasswordForm, setShowPasswordForm] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string }>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(sites[0]?.id ?? ''));

  const filteredCameras = cameras.filter(cam => {
    const matchesSearch = searchTerm === '' ||
      cam.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cam.ip.includes(searchTerm) ||
      cam.modele.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filterBrand === 'toutes' || cam.fabricant === filterBrand;
    const matchesStatus = filterStatus === 'tous' || cam.statut === filterStatus;
    return matchesSearch && matchesBrand && matchesStatus;
  });

  const stats = {
    total: cameras.length,
    online: cameras.filter(c => c.statut === 'online').length,
    offline: cameras.filter(c => c.statut === 'offline').length,
    maintenance: cameras.filter(c => c.statut === 'maintenance').length,
  };

  const openAddForm = () => {
    setForm(emptyForm(sites[0]?.id ?? ''));
    setFormError(null);
    setShowAddForm(true);
  };

  const openEditForm = (cam: CameraType) => {
    setForm({
      nom: cam.nom,
      siteId: cam.siteId,
      zone: cam.zone,
      emplacement: cam.emplacement,
      fabricant: cam.fabricant || 'Autre',
      modele: cam.modele,
      protocole: cam.protocole as CameraType['protocole'],
      ip: cam.ip,
      port: cam.port,
      utilisateur: cam.utilisateur,
      motDePasse: '',
      cheminFlux: cam.cheminFlux,
      resolution: cam.resolution,
      fps: cam.fps,
      actif: cam.actif,
    });
    setFormError(null);
    setEditingCamera(cam);
  };

  const handleBrandChange = (brand: string) => {
    const preset = BRAND_PRESETS[brand];
    setForm({
      ...form,
      fabricant: brand,
      port: preset ? preset.defaultPort : form.port,
      cheminFlux: preset ? preset.defaultStreamPath : form.cheminFlux,
      protocole: preset && preset.onvifSupport ? 'onvif' : 'rtsp',
    });
  };

  const handleSubmit = async () => {
    if (!form.nom.trim()) {
      setFormError('Le nom de la caméra est obligatoire');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editingCamera) {
        const patch: Record<string, unknown> = { ...form };
        if (!form.motDePasse) delete patch.motDePasse;
        await update('cameras', editingCamera.id, patch);
        setEditingCamera(null);
      } else {
        await create('cameras', { ...form, statut: 'offline' });
        setShowAddForm(false);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCamera = async (id: string) => {
    setBusyId(id);
    try {
      await remove('cameras', id);
    } catch {
    } finally {
      setBusyId(null);
    }
  };

  const handleTestConnection = async (id: string) => {
    setBusyId(id);
    try {
      const result = await testCamera(id);
      setTestResults(prev => ({ ...prev, [id]: { ok: result.ok, message: result.message } }));
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [id]: { ok: false, message: err instanceof Error ? err.message : 'Test impossible' },
      }));
    } finally {
      setBusyId(null);
    }
  };

  const togglePasswordForm = (id: string) => {
    setShowPasswordForm(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const generateStreamUrl = (cam: CameraType) => {
    const preset = BRAND_PRESETS[cam.fabricant];
    if (!preset) return '';
    const format = preset.rtspFormats[0];
    return format
      .replace('{user}', cam.utilisateur)
      .replace('{pass}', '********')
      .replace('{ip}', cam.ip)
      .replace('{port}', cam.port.toString());
  };

  const renderFormFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField label="Nom" required>
        <input
          type="text"
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          placeholder="Ex : Entrée principale"
          className={inputClass}
        />
      </FormField>
      <FormField label="Site">
        <select
          value={form.siteId}
          onChange={(e) => setForm({ ...form, siteId: e.target.value })}
          className={inputClass}
        >
          {sites.map(site => (
            <option key={site.id} value={site.id}>{site.nom}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Zone">
        <input
          type="text"
          value={form.zone}
          onChange={(e) => setForm({ ...form, zone: e.target.value })}
          placeholder="Ex : Entrée"
          className={inputClass}
        />
      </FormField>
      <FormField label="Emplacement">
        <input
          type="text"
          value={form.emplacement}
          onChange={(e) => setForm({ ...form, emplacement: e.target.value })}
          placeholder="Ex : Hall entrée"
          className={inputClass}
        />
      </FormField>
      <FormField label="Marque">
        <select
          value={form.fabricant}
          onChange={(e) => handleBrandChange(e.target.value)}
          className={inputClass}
        >
          {Object.keys(BRAND_PRESETS).map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Modèle">
        <input
          type="text"
          value={form.modele}
          onChange={(e) => setForm({ ...form, modele: e.target.value })}
          placeholder="Ex : DS-2CD2143G2-I"
          className={inputClass}
        />
      </FormField>
      <FormField label="Protocole">
        <select
          value={form.protocole}
          onChange={(e) => setForm({ ...form, protocole: e.target.value as CameraType['protocole'] })}
          className={inputClass}
        >
          {PROTOCOLES.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
        </select>
      </FormField>
      <FormField label="Adresse IP">
        <input
          type="text"
          value={form.ip}
          onChange={(e) => setForm({ ...form, ip: e.target.value })}
          placeholder="192.168.1.100"
          className={inputClass}
        />
      </FormField>
      <FormField label="Port">
        <input
          type="number"
          value={form.port}
          onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) || 554 })}
          className={inputClass}
        />
      </FormField>
      <FormField label="Utilisateur">
        <input
          type="text"
          value={form.utilisateur}
          onChange={(e) => setForm({ ...form, utilisateur: e.target.value })}
          className={inputClass}
        />
      </FormField>
      <FormField label={editingCamera ? 'Mot de passe (vide = inchangé)' : 'Mot de passe'}>
        <div className="relative">
          <input
            type={showPasswordForm[editingCamera?.id ?? 'new'] ? 'text' : 'password'}
            value={form.motDePasse}
            onChange={(e) => setForm({ ...form, motDePasse: e.target.value })}
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => togglePasswordForm(editingCamera?.id ?? 'new')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPasswordForm[editingCamera?.id ?? 'new'] ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </FormField>
      <FormField label="Résolution">
        <input
          type="text"
          value={form.resolution}
          onChange={(e) => setForm({ ...form, resolution: e.target.value })}
          placeholder="1920x1080"
          className={inputClass}
        />
      </FormField>
      <FormField label="FPS">
        <input
          type="number"
          value={form.fps}
          onChange={(e) => setForm({ ...form, fps: parseInt(e.target.value) || 25 })}
          className={inputClass}
        />
      </FormField>
      <FormField label="Caméra active">
        <button
          type="button"
          onClick={() => setForm({ ...form, actif: !form.actif })}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
            form.actif ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {form.actif ? 'Activée' : 'Désactivée'}
        </button>
      </FormField>
      <FormField label="Chemin du flux" full>
        <input
          type="text"
          value={form.cheminFlux}
          onChange={(e) => setForm({ ...form, cheminFlux: e.target.value })}
          className={`${inputClass} font-mono`}
        />
        <p className="text-xs text-slate-400 mt-1">
          Auto-rempli selon la marque. Modifiable si nécessaire.
        </p>
      </FormField>
    </div>
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

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
          onClick={openAddForm}
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
        <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings size={18} className="text-yellow-600" />
            <span className="text-xs text-yellow-600 font-medium">Maintenance</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{stats.maintenance}</p>
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
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Cameras List */}
      {filteredCameras.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <p className="text-slate-400 text-sm">Aucune caméra enregistrée — ajoutez la première.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCameras.map(cam => {
            const site = sites.find(s => s.id === cam.siteId);
            const streamUrl = generateStreamUrl(cam);
            const test = testResults[cam.id];

            return (
              <div key={cam.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Status Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    cam.statut === 'online' ? 'bg-green-100' :
                    cam.statut === 'offline' ? 'bg-red-100' :
                    'bg-yellow-100'
                  }`}>
                    {busyId === cam.id ? (
                      <Loader2 size={20} className="text-blue-600 animate-spin" />
                    ) : cam.statut === 'online' ? (
                      <Wifi size={20} className="text-green-600" />
                    ) : cam.statut === 'offline' ? (
                      <WifiOff size={20} className="text-red-600" />
                    ) : (
                      <AlertCircle size={20} className="text-yellow-600" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800">{cam.nom}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        cam.statut === 'online' ? 'bg-green-100 text-green-700' :
                        cam.statut === 'offline' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {cam.statut === 'online' ? 'En ligne' :
                          cam.statut === 'offline' ? 'Hors ligne' : 'Maintenance'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 mb-3">
                      <div>
                        <span className="text-slate-400">Marque</span>
                        <p className="font-medium">{cam.fabricant}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Modèle</span>
                        <p className="font-medium">{cam.modele || '—'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">IP</span>
                        <p className="font-mono">{cam.ip}:{cam.port}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Protocole</span>
                        <p className="font-medium uppercase">{cam.protocole}</p>
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
                      {cam.derniereConnexion && (
                        <>
                          <span>•</span>
                          <span>Dernière connexion : {new Date(cam.derniereConnexion).toLocaleString('fr-FR', {
                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                          })}</span>
                        </>
                      )}
                    </div>

                    {test && (
                      <p className={`text-xs mt-2 ${test.ok ? 'text-green-600' : 'text-red-500'}`}>
                        Sonde : {test.message} (caméra marquée « {test.ok ? 'en ligne' : 'hors ligne'} »)
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTestConnection(cam.id)}
                      disabled={busyId === cam.id}
                      className="p-2 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
                      title="Tester la connexion"
                    >
                      <RefreshCw size={16} className={`text-blue-600 ${busyId === cam.id ? 'animate-spin' : ''}`} />
                    </button>
                    <span
                      className="p-2"
                      title={cam.aMotDePasse ? 'Mot de passe enregistré' : 'Aucun mot de passe'}
                    >
                      {cam.aMotDePasse ? <Lock size={16} className="text-green-600" /> : <Eye size={16} className="text-slate-400" />}
                    </span>
                    <button
                      onClick={() => openEditForm(cam)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit2 size={16} className="text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteCamera(cam.id)}
                      disabled={busyId === cam.id}
                      className="p-2 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
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
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingCamera) && (
        <Modal
          title={editingCamera ? `Modifier — ${editingCamera.nom}` : 'Nouvelle caméra'}
          onClose={() => { setShowAddForm(false); setEditingCamera(null); }}
        >
          {renderFormFields()}
          {formError && <p className="text-xs text-red-600 mt-3">{formError}</p>}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => { setShowAddForm(false); setEditingCamera(null); }}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Enregistrer
            </button>
          </div>
        </Modal>
      )}

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
              <li>✓ Hanwha (Wisenet)</li>
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
