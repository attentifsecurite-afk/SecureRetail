import React, { useState } from 'react';
import { Users, Shield, Award, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { agents, sites } from '../data/mockData';

export const Agents: React.FC = () => {
  const [filter, setFilter] = useState<string>('tous');
  const [selectedSite, setSelectedSite] = useState<string>('tous');

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

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'en_service': return { color: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} />, label: 'En service' };
      case 'pause': return { color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} />, label: 'Pause' };
      case 'absent': return { color: 'bg-red-100 text-red-700', icon: <XCircle size={12} />, label: 'Absent' };
      case 'repos': return { color: 'bg-slate-100 text-slate-600', icon: <Clock size={12} />, label: 'Repos' };
      default: return { color: 'bg-slate-100 text-slate-600', icon: null, label: statut };
    }
  };

  const isCarteProExpired = (expiry: string) => {
    return new Date(expiry) < new Date('2026-01-15');
  };

  const isCarteProExpiringSoon = (expiry: string) => {
    const diff = new Date(expiry).getTime() - new Date('2026-01-15').getTime();
    return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000; // 90 days
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des agents</h1>
          <p className="text-slate-500 text-sm">Personnel APS / ADS / SSIAP — planning & qualifications</p>
        </div>
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
            {Math.round((stats.enService / stats.total) * 100)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${(stats.enService / stats.total) * 100}%` }} />
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
          const expired = isCarteProExpired(agent.carteProExpiry);
          const expiringSoon = isCarteProExpiringSoon(agent.carteProExpiry);

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
                      {expired ? 'EXPIRÉE' : expiringSoon ? 'Expire bientôt' : `Valide jusqu'au ${new Date(agent.carteProExpiry).toLocaleDateString('fr-FR')}`}
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
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${badge.color}`}>
                    {badge.icon}
                    {badge.label}
                  </span>
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
          {agents.filter(a => isCarteProExpired(a.carteProExpiry) || isCarteProExpiringSoon(a.carteProExpiry)).map(a => (
            <div key={a.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-orange-100">
              <span className="text-sm text-slate-700">{a.prenom} {a.nom} — {a.role}</span>
              <span className={`text-xs font-medium ${isCarteProExpired(a.carteProExpiry) ? 'text-red-600' : 'text-orange-600'}`}>
                Carte pro : {new Date(a.carteProExpiry).toLocaleDateString('fr-FR')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
