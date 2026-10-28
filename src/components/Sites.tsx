import React, { useState } from 'react';
import { MapPin, Camera, Users, Shield, AlertTriangle, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { useData } from '../data/DataContext';
import { Modal, FormField, inputClass, Spinner, ErrorBanner } from './Shared';

const CRITICITES = ['faible', 'moyenne', 'élevée', 'critique'];
const TYPES_SITE = ['Flagship', 'Premium', 'Standard'];

interface FormState {
  nom: string;
  adresse: string;
  zone: string;
  type: string;
  surface: number;
  criticite: string;
  capteurs: number;
  scoreRisque: number;
  lat: number;
  lng: number;
}

const emptyForm = (): FormState => ({
  nom: '',
  adresse: '',
  zone: '',
  type: 'Standard',
  surface: 1000,
  criticite: 'moyenne',
  capteurs: 10,
  scoreRisque: 30,
  lat: 48.8566,
  lng: 2.3522,
});

export const Sites: React.FC = () => {
  const { state, loading, error, create, remove } = useData();
  const { sites, cameras, agents } = state;
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());

  const cameraCount = (siteId: string) => cameras.filter(c => c.siteId === siteId).length;
  const cameraOnline = (siteId: string) => cameras.filter(c => c.siteId === siteId && c.statut === 'online').length;
  const agentCount = (siteId: string) => agents.filter(a => a.siteId === siteId).length;

  const handleSubmit = async () => {
    if (!form.nom.trim()) {
      setFormError('Le nom du site est obligatoire');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await create('sites', form);
      setShowForm(false);
      setForm(emptyForm());
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove('sites', id);
      setSelectedSite(null);
    } catch {
      setSelectedSite(null);
    }
  };

  const getCriticiteColor = (criticite: string) => {
    switch (criticite) {
      case 'critique': return 'bg-red-100 text-red-700 border-red-200';
      case 'élevée': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'moyenne': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const zones = [...new Set(sites.map(s => s.zone))];

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sites & magasins</h1>
          <p className="text-slate-500 text-sm">Référentiel multi-sites — données en base</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
          >
            Grille
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
          >
            Liste
          </button>
          <button
            onClick={() => { setForm(emptyForm()); setFormError(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            <Plus size={16} />
            Nouveau site
          </button>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-900">{sites.length}</p>
          <p className="text-xs text-slate-500">Sites total</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-900">{cameras.length}</p>
          <p className="text-xs text-slate-500">Caméras inventoriées</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-900">{agents.length}</p>
          <p className="text-xs text-slate-500">Agents affectés</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-900">{sites.reduce((sum, s) => sum + s.surface, 0).toLocaleString()} m²</p>
          <p className="text-xs text-slate-500">Surface couverte</p>
        </div>
      </div>

      {/* Zone filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500 font-medium">Zones :</span>
        {zones.map(zone => (
          <span key={zone} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
            {zone}
          </span>
        ))}
      </div>

      {/* Sites Grid or List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map(site => (
            <div
              key={site.id}
              className={`bg-white rounded-xl border p-5 cursor-pointer transition hover:shadow-lg ${
                selectedSite === site.id ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
              }`}
              onClick={() => setSelectedSite(selectedSite === site.id ? null : site.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">{site.nom}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{site.adresse}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getCriticiteColor(site.criticite)}`}>
                  {site.criticite}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Camera size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-600">{cameraOnline(site.id)}/{cameraCount(site.id)} cam.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-600">{agentCount(site.id)} agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-600">{site.capteurs} capteurs</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-600">{site.surface} m²</span>
                </div>
              </div>

              {/* Risk Score */}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <TrendingUp size={12} /> Score de risque
                  </span>
                  <span className={`text-sm font-bold ${getScoreColor(site.scoreRisque)}`}>
                    {site.scoreRisque}/100
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      site.scoreRisque >= 70 ? 'bg-red-500' :
                      site.scoreRisque >= 50 ? 'bg-orange-500' :
                      site.scoreRisque >= 30 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${site.scoreRisque}%` }}
                  />
                </div>
              </div>

              {/* Type badge */}
              <div className="mt-3">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                  {site.type} — {site.zone}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Site</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Zone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Type</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Caméras</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Agents</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Criticité</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sites.map(site => {
                const total = cameraCount(site.id);
                const online = cameraOnline(site.id);
                return (
                  <tr key={site.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">{site.nom}</p>
                      <p className="text-xs text-slate-400">{site.adresse}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{site.zone}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{site.type}</td>
                    <td className="px-4 py-3 text-center text-xs text-slate-600">
                      <span className={online < total ? 'text-red-600 font-medium' : ''}>
                        {online}/{total}
                      </span>
                      {online < total && <AlertTriangle size={12} className="inline ml-1 text-red-500" />}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-600">{agentCount(site.id)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getCriticiteColor(site.criticite)}`}>
                        {site.criticite}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${getScoreColor(site.scoreRisque)}`}>
                        {site.scoreRisque}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulaire nouveau site */}
      {showForm && (
        <Modal title="Nouveau site" onClose={() => setShowForm(false)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nom" required>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Ex : Paris Châtelet"
                className={inputClass}
              />
            </FormField>
            <FormField label="Adresse">
              <input
                type="text"
                value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Zone">
              <input
                type="text"
                value={form.zone}
                onChange={(e) => setForm({ ...form, zone: e.target.value })}
                placeholder="Ex : Paris Centre"
                className={inputClass}
              />
            </FormField>
            <FormField label="Type">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputClass}
              >
                {TYPES_SITE.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Criticité">
              <select
                value={form.criticite}
                onChange={(e) => setForm({ ...form, criticite: e.target.value })}
                className={inputClass}
              >
                {CRITICITES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Surface (m²)">
              <input
                type="number"
                value={form.surface}
                onChange={(e) => setForm({ ...form, surface: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Capteurs">
              <input
                type="number"
                value={form.capteurs}
                onChange={(e) => setForm({ ...form, capteurs: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Score de risque (0-100)">
              <input
                type="number"
                min={0}
                max={100}
                value={form.scoreRisque}
                onChange={(e) => setForm({ ...form, scoreRisque: parseInt(e.target.value) || 0 })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Latitude">
              <input
                type="number"
                step="any"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Longitude">
              <input
                type="number"
                step="any"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })}
                className={inputClass}
              />
            </FormField>
          </div>
          {formError && <p className="text-xs text-red-600 mt-3">{formError}</p>}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Enregistrer
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
