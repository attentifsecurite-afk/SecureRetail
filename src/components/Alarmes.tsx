import React, { useState } from 'react';
import { Bell, ShieldAlert, CheckCircle, XCircle, Eye, Clock, Camera, Loader2 } from 'lucide-react';
import { useData } from '../data/DataContext';
import { Spinner, ErrorBanner, EmptyState } from './Shared';
import type { Alarme } from '../types';

export const Alarmes: React.FC = () => {
  const { state, loading, error, update } = useData();
  const { alarmes, sites } = state;
  const [filter, setFilter] = useState<string>('toutes');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredAlarmes = alarmes.filter(a => {
    return filter === 'toutes' || a.statut === filter;
  });

  const handleStatut = async (alarme: Alarme, statut: string, leveeDoute?: boolean) => {
    setBusyId(alarme.id);
    setActionError(null);
    try {
      const patch: Record<string, unknown> = { statut };
      if (leveeDoute !== undefined) patch.leveeDoute = leveeDoute;
      await update('alarmes', alarme.id, patch);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setBusyId(null);
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'critique': return 'border-l-red-500 bg-red-50';
      case 'haute': return 'border-l-orange-500 bg-orange-50';
      case 'moyenne': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-slate-300 bg-slate-50';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'active': return { text: 'ACTIVE', color: 'bg-red-600 text-white animate-pulse' };
      case 'en_traitement': return { text: 'EN TRAITEMENT', color: 'bg-orange-500 text-white' };
      case 'levee': return { text: 'LEVÉE', color: 'bg-green-500 text-white' };
      case 'fausse': return { text: 'FAUSSE ALARME', color: 'bg-slate-400 text-white' };
      default: return { text: statut, color: 'bg-slate-400 text-white' };
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Anti-intrusion & alarmes</h1>
          <p className="text-slate-500 text-sm">Gestion des alarmes et levées de doute</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            {alarmes.filter(a => a.statut === 'active').length} alarme(s) active(s)
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-red-50 rounded-xl border border-red-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={18} className="text-red-600" />
            <span className="text-xs text-red-600 font-medium">Actives</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{alarmes.filter(a => a.statut === 'active').length}</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">En traitement</span>
          </div>
          <p className="text-2xl font-bold text-orange-700">{alarmes.filter(a => a.statut === 'en_traitement').length}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-600" />
            <span className="text-xs text-green-600 font-medium">Levées</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{alarmes.filter(a => a.statut === 'levee').length}</p>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={18} className="text-slate-500" />
            <span className="text-xs text-slate-500 font-medium">Fausses alarmes</span>
          </div>
          <p className="text-2xl font-bold text-slate-700">{alarmes.filter(a => a.statut === 'fausse').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['toutes', 'active', 'en_traitement', 'levee', 'fausse'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === f
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'toutes' ? 'Toutes' : f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {actionError && <ErrorBanner message={actionError} />}

      {/* Alarms List */}
      {filteredAlarmes.length === 0 ? (
        <EmptyState label="Aucune alarme dans cette catégorie." />
      ) : (
        <div className="space-y-3">
          {filteredAlarmes.map(alarme => {
            const site = sites.find(s => s.id === alarme.siteId);
            const statut = getStatutLabel(alarme.statut);
            const busy = busyId === alarme.id;
            return (
              <div key={alarme.id} className={`rounded-xl border-l-4 p-4 ${getPrioriteColor(alarme.priorite)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      alarme.statut === 'active' ? 'bg-red-100' :
                      alarme.statut === 'en_traitement' ? 'bg-orange-100' :
                      'bg-green-100'
                    }`}>
                      <Bell size={18} className={
                        alarme.statut === 'active' ? 'text-red-600' :
                        alarme.statut === 'en_traitement' ? 'text-orange-600' :
                        'text-green-600'
                      } />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-slate-800">{alarme.type}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${statut.color}`}>
                          {statut.text}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{site?.nom} — {alarme.zone}</span>
                        <span>•</span>
                        <span>{new Date(alarme.horodatage).toLocaleString('fr-FR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}</span>
                        {alarme.cameraAssociee && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Camera size={12} /> Caméra {alarme.cameraAssociee}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {alarme.leveeDoute && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        <Eye size={12} /> Levée de doute OK
                      </span>
                    )}
                    {busy ? (
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                    ) : (
                      <>
                        {alarme.statut === 'active' && (
                          <button
                            onClick={() => handleStatut(alarme, 'en_traitement')}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
                          >
                            Traiter
                          </button>
                        )}
                        {(alarme.statut === 'active' || alarme.statut === 'en_traitement') && (
                          <>
                            <button
                              onClick={() => handleStatut(alarme, 'levee', true)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition"
                            >
                              Levée de doute
                            </button>
                            {alarme.statut === 'en_traitement' && (
                              <button
                                onClick={() => handleStatut(alarme, 'fausse')}
                                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 transition"
                              >
                                Fausse alarme
                              </button>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Workflow info */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
        <h3 className="font-semibold text-blue-800 mb-3">Workflow de levée de doute</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-medium">1. Réception alarme</span>
          <span className="text-blue-400">→</span>
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-medium">2. Vérification caméra</span>
          <span className="text-blue-400">→</span>
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-medium">3. Levée de doute</span>
          <span className="text-blue-400">→</span>
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-medium">4. Escalade / Clôture</span>
          <span className="text-blue-400">→</span>
          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-medium">5. Rapport</span>
        </div>
      </div>
    </div>
  );
};
