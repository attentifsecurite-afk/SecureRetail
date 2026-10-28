import React, { useState } from 'react';
import { Video, Wifi, WifiOff, Wrench, Eye, MapPin } from 'lucide-react';
import { useData } from '../data/DataContext';
import { Spinner, ErrorBanner, EmptyState } from './Shared';
import { safePct } from '../lib/metrics';

export const Cameras: React.FC = () => {
  const { state, loading, error } = useData();
  const { cameras, sites } = state;
  const [filter, setFilter] = useState<string>('tous');
  const [selectedSite, setSelectedSite] = useState<string>('tous');

  const filteredCameras = cameras.filter(c => {
    const matchesFilter = filter === 'tous' || c.statut === filter;
    const matchesSite = selectedSite === 'tous' || c.siteId === selectedSite;
    return matchesFilter && matchesSite;
  });

  const stats = {
    total: cameras.length,
    online: cameras.filter(c => c.statut === 'online').length,
    offline: cameras.filter(c => c.statut === 'offline').length,
    maintenance: cameras.filter(c => c.statut === 'maintenance').length,
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vidéosurveillance</h1>
          <p className="text-slate-500 text-sm">Statut des caméras — conformité RGPD respectée</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
            {stats.total} caméras • {stats.online} en ligne
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl border border-green-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wifi size={18} className="text-green-600" />
            <span className="text-xs text-green-600 font-medium">En ligne</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.online}</p>
          <p className="text-xs text-green-500">{safePct(stats.online, stats.total)}% disponibilité</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <WifiOff size={18} className="text-red-600" />
            <span className="text-xs text-red-600 font-medium">Offline</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.offline}</p>
          <p className="text-xs text-red-500">Intervention requise</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={18} className="text-yellow-600" />
            <span className="text-xs text-yellow-600 font-medium">Maintenance</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700">{stats.maintenance}</p>
          <p className="text-xs text-yellow-500">Planifiée</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={18} className="text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Parc total</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
          <p className="text-xs text-blue-500">Caméras inventoriées</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {['tous', 'online', 'offline', 'maintenance'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === f
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'tous' ? 'Toutes' : f.charAt(0).toUpperCase() + f.slice(1)}
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

      {/* Camera Grid */}
      {filteredCameras.length === 0 ? (
        <EmptyState label="Aucune caméra — ajoutez-les depuis « Installation caméras »." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCameras.map(camera => {
            const site = sites.find(s => s.id === camera.siteId);
            return (
              <div key={camera.id} className={`bg-white rounded-xl border p-4 transition hover:shadow-md ${
                camera.statut === 'online' ? 'border-green-200' :
                camera.statut === 'offline' ? 'border-red-200' :
                'border-yellow-200'
              }`}>
                {/* Camera Preview Placeholder */}
                <div className={`w-full h-32 rounded-lg mb-3 flex items-center justify-center ${
                  camera.statut === 'online' ? 'bg-slate-800' :
                  camera.statut === 'offline' ? 'bg-slate-200' :
                  'bg-yellow-100'
                }`}>
                  {camera.statut === 'online' ? (
                    <div className="text-center">
                      <Video size={24} className="text-green-400 mx-auto mb-1" />
                      <span className="text-xs text-slate-400">Flux actif</span>
                    </div>
                  ) : camera.statut === 'offline' ? (
                    <div className="text-center">
                      <WifiOff size={24} className="text-red-400 mx-auto mb-1" />
                      <span className="text-xs text-red-400">Hors ligne</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Wrench size={24} className="text-yellow-600 mx-auto mb-1" />
                      <span className="text-xs text-yellow-600">Maintenance</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-800">{camera.nom}</h4>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      camera.statut === 'online' ? 'bg-green-500' :
                      camera.statut === 'offline' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} />
                    <span>{site?.nom} — {camera.zone}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{camera.fabricant} {camera.modele && `— ${camera.modele}`}</span>
                    <span className="text-slate-400">ID: {camera.id}</span>
                  </div>
                  {camera.derniereConnexion && (
                    <p className="text-xs text-slate-400">
                      Dernière connexion : {new Date(camera.derniereConnexion).toLocaleString('fr-FR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RGPD Notice */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
        <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
          <Eye size={16} />
          Conformité RGPD / CNIL
        </h3>
        <ul className="text-xs text-amber-700 space-y-1">
          <li>• Toutes les consultations vidéo sont journalisées et auditées</li>
          <li>• Durée de rétention : 30 jours maximum (configurable par site)</li>
          <li>• Accès restreint aux utilisateurs habilités uniquement</li>
          <li>• Aucune reconnaissance faciale ou biométrie activée</li>
          <li>• Signalétique vidéo conforme sur tous les sites</li>
        </ul>
      </div>
    </div>
  );
};
