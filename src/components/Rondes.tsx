import React, { useState } from 'react';
import { Route, CheckCircle, XCircle, Clock, AlertTriangle, MapPin } from 'lucide-react';
import { rondes, sites, agents } from '../data/mockData';

export const Rondes: React.FC = () => {
  const [filter, setFilter] = useState<string>('tous');

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

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      perimetrique: 'Périmétrique',
      fermeture: 'Fermeture',
      ouverture: 'Ouverture',
      exterieur: 'Cour / Extérieurs',
      technique: 'Technique',
      ssiap: 'SSIAP',
      dissuasion: 'Dissuasion DI',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rondes & patrouilles</h1>
          <p className="text-slate-500 text-sm">Suivi des circuits et points de contrôle</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500">Total jour</p>
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
            {Math.round((stats.terminees / stats.total) * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${(stats.terminees / stats.total) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>Objectif : 95%</span>
          <span>{stats.terminees}/{stats.total} rondes</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['tous', 'terminee', 'en_cours', 'manquee', 'incomplete', 'planifiee'].map(f => (
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
      <div className="space-y-3">
        {filteredRondes.map(ronde => {
          const site = sites.find(s => s.id === ronde.siteId);
          const agent = agents.find(a => a.id === ronde.agentId);
          const badge = getStatutBadge(ronde.statut);
          const progress = ronde.pointsControle > 0 ? (ronde.pointsScannes / ronde.pointsControle) * 100 : 0;

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
                      <span className="text-xs text-slate-500">{getTypeLabel(ronde.type)}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{agent?.prenom} {agent?.nom}</span>
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
                      <p className="text-xs text-green-600">Réelle : {ronde.heureReelle}</p>
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
