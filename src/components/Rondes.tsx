import React, { useState } from 'react';
import { Route, CheckCircle, XCircle, Clock, AlertTriangle, MapPin, Plus, Loader2 } from 'lucide-react';
import { useData } from '../data/DataContext';
import { Modal, FormField, inputClass, Spinner, ErrorBanner, EmptyState } from './Shared';
import { parisToday, minutesBetween } from '../lib/metrics';
import type { Ronde } from '../types';

const TYPES_RONDE = ['perimetrique', 'fermeture', 'ouverture', 'exterieur', 'technique', 'ssiap', 'dissuasion'];

const TYPE_LABELS: Record<string, string> = {
  perimetrique: 'Périmétrique',
  fermeture: 'Fermeture',
  ouverture: 'Ouverture',
  exterieur: 'Cour / Extérieurs',
  technique: 'Technique',
  ssiap: 'SSIAP',
  dissuasion: 'Dissuasion DI',
};

interface FormState {
  circuit: string;
  siteId: string;
  agentId: string;
  type: string;
  datePrevue: string;
  heurePrevue: string;
  pointsControle: number;
}

export const Rondes: React.FC = () => {
  const { state, loading, error, create, update } = useData();
  const { rondes, sites, agents } = state;
  const [filter, setFilter] = useState<string>('tous');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    circuit: '',
    siteId: '',
    agentId: '',
    type: 'perimetrique',
    datePrevue: parisToday(),
    heurePrevue: '22:00',
    pointsControle: 10,
  });

  const filteredRondes = rondes.filter(r => {
    return filter === 'tous' || r.statut === filter;
  });

  const stats = {
    total: rondes.length,
    terminees: rondes.filter(r => r.statut === 'terminee').length,
    enCours: rondes.filter(r => r.statut === 'en_cours').length,
    manquees: rondes.filter(r => r.statut === 'manquee').length,
    incompletes: rondes.filter(r => r.statut === 'incomplete').length,
  };

  const openForm = () => {
    setForm({
      circuit: '',
      siteId: sites[0]?.id ?? '',
      agentId: agents[0]?.id ?? '',
      type: 'perimetrique',
      datePrevue: parisToday(),
      heurePrevue: '22:00',
      pointsControle: 10,
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.circuit.trim()) {
      setFormError('Le nom du circuit est obligatoire');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await create('rondes', { ...form, statut: 'planifiee', pointsScannes: 0, anomalies: 0 });
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDemarrer = async (ronde: Ronde) => {
    setBusyId(ronde.id);
    try {
      const now = new Date();
      await update('rondes', ronde.id, {
        statut: 'en_cours',
        heureReelle: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      });
    } catch {
    } finally {
      setBusyId(null);
    }
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'terminee': return { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} /> };
      case 'en_cours': return { color: 'bg-blue-100 text-blue-700', icon: <Clock size={14} /> };
      case 'manquee': return { color: 'bg-red-100 text-red-700', icon: <XCircle size={14} /> };
      case 'incomplete': return { color: 'bg-orange-100 text-orange-700', icon: <AlertTriangle size={14} /> };
      case 'planifiee': return { color: 'bg-slate-100 text-slate-700', icon: <Clock size={14} /> };
      default: return { color: 'bg-slate-100 text-slate-700', icon: <Clock size={14} /> };
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rondes & patrouilles</h1>
          <p className="text-slate-500 text-sm">Suivi des circuits et points de contrôle</p>
        </div>
        <button
          onClick={openForm}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Planifier une ronde
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.terminees}</p>
          <p className="text-xs text-green-600">Terminées</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{stats.enCours}</p>
          <p className="text-xs text-blue-600">En cours</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.manquees}</p>
          <p className="text-xs text-red-600">Manquées</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-100 p-4 text-center">
          <p className="text-2xl font-bold text-orange-700">{stats.incompletes}</p>
          <p className="text-xs text-orange-600">Incomplètes</p>
        </div>
      </div>

      {/* Taux de réalisation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800">Taux de réalisation des rondes</h3>
          <span className="text-sm font-bold text-blue-600">
            {stats.total > 0 ? Math.round((stats.terminees / stats.total) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${stats.total > 0 ? (stats.terminees / stats.total) * 100 : 0}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>Objectif : 95%</span>
          <span>{stats.terminees}/{stats.total} rondes</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['tous', 'planifiee', 'en_cours', 'terminee', 'manquee', 'incomplete'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === f
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'tous' ? 'Toutes' : f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Rondes List */}
      {filteredRondes.length === 0 ? (
        <EmptyState label="Aucune ronde dans cette catégorie." />
      ) : (
        <div className="space-y-3">
          {filteredRondes.map(ronde => {
            const site = sites.find(s => s.id === ronde.siteId);
            const agent = agents.find(a => a.id === ronde.agentId);
            const badge = getStatutBadge(ronde.statut);
            const progress = ronde.pointsControle > 0 ? (ronde.pointsScannes / ronde.pointsControle) * 100 : 0;
            const ponctuelle = ronde.heureReelle ? minutesBetween(ronde.heureReelle, ronde.heurePrevue) <= 10 : null;

            return (
              <div key={ronde.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      ronde.statut === 'terminee' ? 'bg-green-100' :
                      ronde.statut === 'en_cours' ? 'bg-blue-100' :
                      ronde.statut === 'manquee' ? 'bg-red-100' :
                      'bg-orange-100'
                    }`}>
                      <Route size={18} className={
                        ronde.statut === 'terminee' ? 'text-green-600' :
                        ronde.statut === 'en_cours' ? 'text-blue-600' :
                        ronde.statut === 'manquee' ? 'text-red-600' :
                        'text-orange-600'
                      } />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{ronde.circuit}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin size={12} /> {site?.nom}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">{TYPE_LABELS[ronde.type] ?? ronde.type}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">{agent ? `${agent.prenom} ${agent.nom}` : 'Non affectée'}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">
                          {new Date(`${ronde.datePrevue}T12:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Progress */}
                    <div className="hidden sm:block w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Points</span>
                        <span className="font-medium">{ronde.pointsScannes}/{ronde.pointsControle}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            progress === 100 ? 'bg-green-500' :
                            progress >= 50 ? 'bg-blue-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Prévue : {ronde.heurePrevue}</p>
                      {ronde.heureReelle && (
                        <p className={`text-xs ${ponctuelle ? 'text-green-600' : 'text-orange-600'}`}>
                          Réelle : {ronde.heureReelle}
                        </p>
                      )}
                    </div>

                    {/* Badge */}
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${badge.color}`}>
                      {badge.icon}
                      <span className="hidden sm:inline">{ronde.statut === 'terminee' ? 'Terminée' :
                        ronde.statut === 'en_cours' ? 'En cours' :
                        ronde.statut === 'manquee' ? 'Manquée' :
                        ronde.statut === 'incomplete' ? 'Incomplete' : 'Planifiée'}</span>
                    </span>

                    {/* Anomalies */}
                    {ronde.anomalies > 0 && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium">
                        <AlertTriangle size={12} />
                        {ronde.anomalies}
                      </span>
                    )}

                    {busyId === ronde.id ? (
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                    ) : ronde.statut === 'planifiee' ? (
                      <button
                        onClick={() => handleDemarrer(ronde)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
                      >
                        Démarrer
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulaire planification */}
      {showForm && (
        <Modal title="Planifier une ronde" onClose={() => setShowForm(false)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Circuit" required full>
              <input
                type="text"
                value={form.circuit}
                onChange={(e) => setForm({ ...form, circuit: e.target.value })}
                placeholder="Ex : Ronde périmétrique nuit"
                className={inputClass}
              />
            </FormField>
            <FormField label="Type">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputClass}
              >
                {TYPES_RONDE.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
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
            <FormField label="Agent">
              <select
                value={form.agentId}
                onChange={(e) => setForm({ ...form, agentId: e.target.value })}
                className={inputClass}
              >
                {agents.map(a => <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>)}
              </select>
            </FormField>
            <FormField label="Date">
              <input
                type="date"
                value={form.datePrevue}
                onChange={(e) => setForm({ ...form, datePrevue: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Heure prévue">
              <input
                type="time"
                value={form.heurePrevue}
                onChange={(e) => setForm({ ...form, heurePrevue: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Points de contrôle">
              <input
                type="number"
                min={0}
                value={form.pointsControle}
                onChange={(e) => setForm({ ...form, pointsControle: parseInt(e.target.value) || 0 })}
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
