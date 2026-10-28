import React, { useState } from 'react';
import { Search, Filter, Plus, Clock, AlertCircle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { useData } from '../data/DataContext';
import { Modal, FormField, inputClass, Spinner, ErrorBanner, EmptyState } from './Shared';
import type { Evenement } from '../types';

const CATEGORIES = ['Intrusion', 'Sûreté', 'Technique', 'Démarque', 'SSIAP', 'Opérationnel'];
const GRAVITES = ['info', 'basse', 'moyenne', 'haute', 'critique'];

interface FormState {
  description: string;
  type: string;
  categorie: string;
  siteId: string;
  zone: string;
  gravite: string;
  assigneA: string;
  creePar: string;
}

const emptyForm = (siteId: string): FormState => ({
  description: '',
  type: 'evenement_manuel',
  categorie: 'Opérationnel',
  siteId,
  zone: '',
  gravite: 'moyenne',
  assigneA: '',
  creePar: 'Opérateur PC Sûreté',
});

export const MainCourante: React.FC = () => {
  const { state, loading, error, create, update } = useData();
  const { evenements, sites, agents } = state;
  const [filter, setFilter] = useState<string>('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(sites[0]?.id ?? ''));

  const filteredEvents = evenements.filter(e => {
    const matchesFilter = filter === 'tous' || e.statut === filter;
    const matchesSearch = searchTerm === '' ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.categorie.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openForm = () => {
    setForm(emptyForm(sites[0]?.id ?? ''));
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.description.trim()) {
      setFormError('La description est obligatoire');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      await create('evenements', {
        ...form,
        assigneA: form.assigneA || null,
      });
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleCloturer = async (event: Evenement) => {
    setActionError(null);
    try {
      await update('evenements', event.id, { statut: 'cloture' });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la clôture');
    }
  };

  const getGraviteColor = (gravite: string) => {
    switch (gravite) {
      case 'critique': return 'bg-red-100 text-red-700 border-red-200';
      case 'haute': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'moyenne': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'basse': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'ouvert': return <AlertCircle size={14} className="text-red-500" />;
      case 'en_cours': return <Clock size={14} className="text-blue-500" />;
      case 'cloture': return <CheckCircle2 size={14} className="text-green-500" />;
      default: return null;
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Main courante électronique</h1>
          <p className="text-slate-500 text-sm">Journal des événements sûreté — tous sites</p>
        </div>
        <button
          onClick={openForm}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Nouvel événement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            {['tous', 'ouvert', 'en_cours', 'cloture'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'tous' ? 'Tous' : f === 'ouvert' ? 'Ouverts' : f === 'en_cours' ? 'En cours' : 'Clôturés'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
          <p className="text-2xl font-bold text-red-700">{evenements.filter(e => e.statut === 'ouvert').length}</p>
          <p className="text-xs text-red-600">Événements ouverts</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">{evenements.filter(e => e.statut === 'en_cours').length}</p>
          <p className="text-xs text-blue-600">En traitement</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
          <p className="text-2xl font-bold text-green-700">{evenements.filter(e => e.statut === 'cloture').length}</p>
          <p className="text-xs text-green-600">Clôturés</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
          <p className="text-2xl font-bold text-purple-700">{evenements.filter(e => e.gravite === 'critique').length}</p>
          <p className="text-xs text-purple-600">Critiques</p>
        </div>
      </div>

      {actionError && <ErrorBanner message={actionError} />}

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <EmptyState label="Aucun événement correspondant." />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredEvents.map(event => {
              const site = sites.find(s => s.id === event.siteId);
              const agent = agents.find(a => a.id === event.assigneA);
              return (
                <div key={event.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getStatutIcon(event.statut)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getGraviteColor(event.gravite)}`}>
                          {event.gravite}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {event.categorie}
                        </span>
                        <span className="text-xs text-slate-500">
                          {site?.nom} — {event.zone}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mb-1">{event.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(event.horodatage).toLocaleString('fr-FR', {
                            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        <span>Créé par : {event.creePar}</span>
                        {agent && <span>Assigné : {agent.prenom} {agent.nom}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {event.statut !== 'cloture' && (
                        <button
                          onClick={() => handleCloturer(event)}
                          className="px-2.5 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Clôturer
                        </button>
                      )}
                      <button className="p-1.5 hover:bg-slate-200 rounded" title="Voir détails">
                        <FileText size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Formulaire nouvel événement */}
      {showForm && (
        <Modal title="Nouvel événement" onClose={() => setShowForm(false)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Description" required full>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Décrivez l'événement..."
                className={inputClass}
              />
            </FormField>
            <FormField label="Catégorie">
              <select
                value={form.categorie}
                onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                className={inputClass}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
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
            <FormField label="Zone">
              <input
                type="text"
                value={form.zone}
                onChange={(e) => setForm({ ...form, zone: e.target.value })}
                placeholder="Ex : Réserve"
                className={inputClass}
              />
            </FormField>
            <FormField label="Gravité">
              <select
                value={form.gravite}
                onChange={(e) => setForm({ ...form, gravite: e.target.value })}
                className={inputClass}
              >
                {GRAVITES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </FormField>
            <FormField label="Assigné à">
              <select
                value={form.assigneA}
                onChange={(e) => setForm({ ...form, assigneA: e.target.value })}
                className={inputClass}
              >
                <option value="">—</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>)}
              </select>
            </FormField>
            <FormField label="Créé par">
              <input
                type="text"
                value={form.creePar}
                onChange={(e) => setForm({ ...form, creePar: e.target.value })}
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
