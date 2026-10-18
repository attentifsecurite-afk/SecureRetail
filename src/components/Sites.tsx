import React, { useState } from 'react';
import { MapPin, Camera, Users, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { sites } from '../data/mockData';

export const Sites: React.FC = () => {
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sites & magasins</h1>
          <p className="text-slate-500 text-sm">Référentiel multi-sites — Paris & Grande Couronne</p>
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
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-900">{sites.length}</p>
          <p className="text-xs text-slate-500">Sites total</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-900">{sites.reduce((sum, s) => sum + s.cameras, 0)}</p>
          <p className="text-xs text-slate-500">Caméras total</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-900">{sites.reduce((sum, s) => sum + s.agents, 0)}</p>
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
                  <span className="text-xs text-slate-600">{site.camerasOnline}/{site.cameras} cam.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-600">{site.agents} agents</span>
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
              {sites.map(site => (
                <tr key={site.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-800">{site.nom}</p>
                    <p className="text-xs text-slate-400">{site.adresse}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{site.zone}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{site.type}</td>
                  <td className="px-4 py-3 text-center text-xs text-slate-600">
                    <span className={site.camerasOnline < site.cameras ? 'text-red-600 font-medium' : ''}>
                      {site.camerasOnline}/{site.cameras}
                    </span>
                    {site.camerasOnline < site.cameras && <AlertTriangle size={12} className="inline ml-1 text-red-500" />}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-600">{site.agents}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
