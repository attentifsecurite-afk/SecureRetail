import React, { useState } from 'react';
import { Users, Shield, Award, Clock, AlertTriangle, CheckCircle, XCircle, Plus, Loader2, Trash2 } from 'lucide-react';
import { useData } from '../data/DataContext';
import { Modal, FormField, inputClass, Spinner, ErrorBanner } from './Shared';
import { carteProStatus } from '../lib/metrics';

const STATUTS = ['en_service', 'pause', 'absent', 'repos'];
const ROLES = ['Agent ADS', 'Agent SSIAP', 'Chef de poste', 'Agent Cynophile'];
const QUALIFICATIONS = ['CQP APS', 'CQP ADS', 'SSIAP 1', 'SSIAP 2', 'SST', 'H0B0', 'PIF'];

interface FormState {
  nom: string;
  prenom: string;
  role: string;
  siteId: string;
  statut: string;
  qualifications: string[];
  cartePro: string;
  carteProExpiry: string;
  telephone: string;
  heurePriseService: string;
}

const emptyForm = (siteId: string): FormState => ({
  nom: '',
  prenom: '',
  role: 'Agent ADS',
  siteId,
  statut: 'repos',
  qualifications: ['CQP ADS'],
  cartePro: '',
  carteProExpiry: '',
  telephone: '',
  heurePriseService: '',
});

export const Agents: React.FC = () => {
  const { state, loading, error, create, update, remove } = useData();
  const { agents, sites } = state;
  const [filter, setFilter] = useState<string>('tous');
  const [selectedSite, setSelectedSite] = useState<string>('tous');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(sites[0]?.id ?? ''));

  const filteredAgents = agents.filter(a => {
    const matchesFilter = filter === 'tous' || a.statut === filter;
    const matchesSite = selectedSite === 'tous' || a.siteId === selectedSite;
    return matchesFilter && matchesSite;
  });

  const stats = {
    total: agents.length,
    enService: agents.filter(a => a.statut === 'en_service').length,
    pause: agents.filter(a => a.statut === 'pause').length,
    absent: agents.filter(a => a.statut === 'absent').length,
    repos: agents.filter(a => a.statut === 'repos').length,
  };

  const openForm = () => {
    setForm(emptyForm(sites[0]?.id ?? ''));
    setFormError(null);
    setShowForm(true);
  };

  const toggleQualification = (q: string) => {
    setForm(prev => ({
      ...prev,
      qualifications: prev.qualifications.includes(q)
        ? prev.qualifications.filter(x => x !== q)
        : [...prev.qualifications, q],
    }));
  };

  const handleSubmit = async () => {
    if (!form.nom.trim() || !form.prenom.trim()) {
      setFormError('Nom et prénom sont obligatoires');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await create('agents', { ...form, heurePriseService: form.heurePriseService || null });
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleStatut = async (id: string, statut: string) => {
    setBusyId(id);
    try {
      await update('agents', id, { statut });
    } catch {
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await remove('agents', id);
    } catch {
    } finally {
      setBusyId(null);
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'en_service': return { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} />, label: 'En service' };
      case 'pause': return { color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} />, label: 'Pause' };
      case 'absent': return { color: 'bg-red-100 text-red-700', icon: <XCircle size={12} />, label: 'Absent' };
      case 'repos': return { color: 'bg-slate-100 text-slate-600', icon: <Clock size={12} />, label: 'Repos' };
      default: return { color: 'bg-slate-100 text-slate-600', icon: null, label: statut };
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des agents</h1>
          <p className="text-slate-500 text-sm">Personnel APS / ADS / SSIAP — planning & qualifications</p>
        </div>
        <button
          onClick={openForm}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Nouvel agent
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500">Total agents</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.enService}</p>
          <p className="text-xs text-green-600">En service</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{stats.pause}</p>
          <p className="text-xs text-yellow-600">En pause</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
          <p className="text-xs text-red-600">Absents</p>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-700">{stats.repos}</p>
          <p className="text-xs text-slate-500">Repos</p>
        </div>
      </div>

      {/* Taux de pourvoi */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800">Taux de pourvoi des postes</h3>
          <span className="text-sm font-bold text-green-600">
            {stats.total > 0 ? Math.round((stats.enService / stats.total) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${stats.total > 0 ? (stats.enService / stats.total) * 100 : 0}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>Objectif : 90%</span>
          <span>{stats.enService}/{stats.total} postes pourvus</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {['tous', 'en_service', 'pause', 'absent', 'repos'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === f
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'tous' ? 'Tous' : f === 'en_service' ? 'En service' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="tous">Tous les sites</option>
          {sites.map(s => (
            <option key={s.id} value={s.id}>{s.nom}</option>
          ))}
        </select>
      </div>

      {/* Agents List */}
      <div className="space-y-3">
        {filteredAgents.map(agent => {
          const site = sites.find(s => s.id === agent.siteId);
          const badge = getStatutBadge(agent.statut);
          const statutCarte = carteProStatus(agent.carteProExpiry);
          const expired = statutCarte === 'expiree';
          const expiringSoon = statutCarte === 'bientot';

          return (
            <div key={agent.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Avatar & Name */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    agent.statut === 'en_service' ? 'bg-green-100 text-green-700' :
                    agent.statut === 'pause' ? 'bg-yellow-100 text-yellow-700' :
                    agent.statut === 'absent' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {agent.prenom[0]}{agent.nom[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{agent.prenom} {agent.nom}</h4>
                    <p className="text-xs text-slate-500">{agent.role} — {site?.nom}</p>
                  </div>
                </div>

                {/* Qualifications */}
                <div className="flex flex-wrap items-center gap-1 flex-1">
                  {agent.qualifications.map(q => (
                    <span key={q} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {q}
                    </span>
                  ))}
                </div>

                {/* Status & Info */}
                <div className="flex items-center gap-3">
                  {/* Carte Pro */}
                  <div className="hidden sm:flex items-center gap-1">
                    <Shield size={12} className="text-slate-400" />
                    <span className={`text-xs ${
                      expired ? 'text-red-600 font-bold' :
                      expiringSoon ? 'text-orange-600 font-medium' :
                      'text-slate-500'
                    }`}>
                      {expired ? 'EXPIRÉE' : expiringSoon ? 'Expire bientôt' : agent.carteProExpiry ? `Valide jusqu'au ${new Date(agent.carteProExpiry).toLocaleDateString('fr-FR')}` : '—'}
                    </span>
                    {expired && <AlertTriangle size={12} className="text-red-500" />}
                  </div>

                  {/* Prise de service */}
                  {agent.heurePriseService && (
                    <span className="text-xs text-slate-400">
                      <Clock size={12} className="inline mr-1" />
                      {agent.heurePriseService}
                    </span>
                  )}

                  {/* Status badge */}
                  {busyId === agent.id ? (
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                  ) : (
                    <select
                      value={agent.statut}
                      onChange={(e) => handleStatut(agent.id, e.target.value)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${badge.color}`}
                    >
                      {STATUTS.map(s => (
                        <option key={s} value={s}>
                          {s === 'en_service' ? 'En service' : s === 'pause' ? 'Pause' : s === 'absent' ? 'Absent' : 'Repos'}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    onClick={() => handleDelete(agent.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertes qualifications */}
      <div className="bg-orange-50 rounded-xl border border-orange-200 p-5">
        <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
          <Award size={16} />
          Alertes qualifications
        </h3>
        <div className="space-y-2">
          {agents.filter(a => carteProStatus(a.carteProExpiry) !== 'valide').map(a => (
            <div key={a.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-orange-100">
              <span className="text-sm text-slate-700">{a.prenom} {a.nom} — {a.role}</span>
              <span className={`text-xs font-medium ${carteProStatus(a.carteProExpiry) === 'expiree' ? 'text-red-600' : 'text-orange-600'}`}>
                Carte pro : {new Date(a.carteProExpiry).toLocaleDateString('fr-FR')}
              </span>
            </div>
          ))}
          {agents.filter(a => carteProStatus(a.carteProExpiry) !== 'valide').length === 0 && (
            <p className="text-xs text-orange-600">Toutes les cartes professionnelles sont valides.</p>
          )}
        </div>
      </div>

      {/* Formulaire nouvel agent */}
      {showForm && (
        <Modal title="Nouvel agent" onClose={() => setShowForm(false)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Prénom" required>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Nom" required>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Rôle">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputClass}
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormField>
            <FormField label="Site">
              <select
                value={form.siteId}
                onChange={(e) => setForm({ ...form, siteId: e.target.value })}
                className={inputClass}
              >
                {sites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </FormField>
            <FormField label="Statut">
              <select
                value={form.statut}
                onChange={(e) => setForm({ ...form, statut: e.target.value })}
                className={inputClass}
              >
                {STATUTS.map(s => (
                  <option key={s} value={s}>
                    {s === 'en_service' ? 'En service' : s === 'pause' ? 'Pause' : s === 'absent' ? 'Absent' : 'Repos'}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Téléphone">
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                placeholder="06 12 34 56 78"
                className={inputClass}
              />
            </FormField>
            <FormField label="N° carte pro">
              <input
                type="text"
                value={form.cartePro}
                onChange={(e) => setForm({ ...form, cartePro: e.target.value })}
                placeholder="Ex : ADS-2026-001"
                className={inputClass}
              />
            </FormField>
            <FormField label="Expiration carte pro">
              <input
                type="date"
                value={form.carteProExpiry}
                onChange={(e) => setForm({ ...form, carteProExpiry: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Heure de prise de service">
              <input
                type="time"
                value={form.heurePriseService}
                onChange={(e) => setForm({ ...form, heurePriseService: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Qualifications" full>
              <div className="flex flex-wrap gap-2">
                {QUALIFICATIONS.map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => toggleQualification(q)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      form.qualifications.includes(q)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-slate-100 text-slate-600 border border-transparent hover:bg-slate-200'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
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
