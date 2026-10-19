import React, { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle, HeatmapLayer, Polyline } from '@react-google-maps/api';
import { MapPin, AlertTriangle, Camera, Users, Shield, Filter, Layers, TrendingUp, Activity, Eye, Navigation } from 'lucide-react';
import { sites, alarmes, evenements, agents } from '../data/mockData';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px',
};

const center = {
  lat: 48.8566,
  lng: 2.3522,
};

const getMarkerColor = (scoreRisque: number) => {
  if (scoreRisque >= 70) return '#ef4444';
  if (scoreRisque >= 50) return '#f59e0b';
  if (scoreRisque >= 30) return '#eab308';
  return '#22c55e';
};

const getCriticiteLabel = (criticite: string) => {
  switch (criticite) {
    case 'critique': return { color: 'bg-red-100 text-red-700', label: 'Critique' };
    case 'élevée': return { color: 'bg-orange-100 text-orange-700', label: 'Élevée' };
    case 'moyenne': return { color: 'bg-yellow-100 text-yellow-700', label: 'Moyenne' };
    default: return { color: 'bg-green-100 text-green-700', label: 'Faible' };
  }
};

export const AdvancedMap: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'visualization'],
  });

  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showCircles, setShowCircles] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);
  const [filterZone, setFilterZone] = useState<string>('toutes');
  const [filterCriticite, setFilterCriticite] = useState<string>('toutes');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');

  const zones = [...new Set(sites.map(s => s.zone))];

  const filteredSites = useMemo(() => {
    return sites.filter(s => {
      const matchesZone = filterZone === 'toutes' || s.zone === filterZone;
      const matchesCriticite = filterCriticite === 'toutes' || s.criticite === filterCriticite;
      return matchesZone && matchesCriticite;
    });
  }, [filterZone, filterCriticite]);

  // Données heatmap (incidents par localisation)
  const heatmapData = useMemo(() => {
    if (!isLoaded) return [];
    return evenements.map(e => {
      const site = sites.find(s => s.id === e.siteId);
      if (!site) return null;
      const weight = e.gravite === 'critique' ? 3 : e.gravite === 'haute' ? 2 : 1;
      return {
        location: new window.google.maps.LatLng(site.lat, site.lng),
        weight: weight,
      };
    }).filter(Boolean) as any[];
  }, [isLoaded]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    const bounds = new window.google.maps.LatLngBounds();
    filteredSites.forEach(site => {
      bounds.extend({ lat: site.lat, lng: site.lng });
    });
    map.fitBounds(bounds);
  }, [filteredSites]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cartographie avancée</h1>
          <p className="text-slate-500 text-sm">Vue interactive multi-sites avec analytics</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Erreur de chargement Google Maps</p>
          <p className="text-red-500 text-sm mt-1">Vérifiez votre clé API et votre connexion réseau</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cartographie avancée</h1>
          <p className="text-slate-500 text-sm">Vue interactive multi-sites avec analytics</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 h-[700px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Chargement de la carte...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Navigation size={28} className="text-blue-600" />
            Cartographie avancée
          </h1>
          <p className="text-slate-500 text-sm">Vue interactive avec heatmap, clustering et analytics temps réel</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            {filteredSites.length} site(s) affiché(s)
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Zone Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Zone géographique</label>
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="toutes">Toutes les zones</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>

          {/* Criticité Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Criticité</label>
            <select
              value={filterCriticite}
              onChange={(e) => setFilterCriticite(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="toutes">Toutes</option>
              <option value="critique">Critique</option>
              <option value="élevée">Élevée</option>
              <option value="moyenne">Moyenne</option>
              <option value="faible">Faible</option>
            </select>
          </div>

          {/* Map Type */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Type de carte</label>
            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="roadmap">Plan</option>
              <option value="satellite">Satellite</option>
              <option value="hybrid">Hybride</option>
            </select>
          </div>

          {/* Layers */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Couches</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  showHeatmap ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <TrendingUp size={14} className="inline mr-1" />
                Heatmap
              </button>
              <button
                onClick={() => setShowCircles(!showCircles)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition ${
                  showCircles ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Layers size={14} className="inline mr-1" />
                Zones
              </button>
            </div>
          </div>

          {/* Routes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Itinéraires</label>
            <button
              onClick={() => setShowRoutes(!showRoutes)}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition ${
                showRoutes ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Navigation size={14} className="inline mr-1" />
              {showRoutes ? 'Masquer' : 'Afficher'} trajets
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl border border-slate-200 p-3">
        <span className="text-xs font-medium text-slate-500">Score de risque :</span>
        <span className="flex items-center gap-1.5 text-xs">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          Critique (≥70)
        </span>
        <span className="flex items-center gap-1.5 text-xs">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          Élevé (50-69)
        </span>
        <span className="flex items-center gap-1.5 text-xs">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          Moyen (30-49)
        </span>
        <span className="flex items-center gap-1.5 text-xs">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          Faible (&lt;30)
        </span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1.5 text-xs">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
          Alerte active
        </span>
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm" style={{ height: '700px' }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            mapTypeControl: true,
            mapTypeId: mapType,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
          {/* Heatmap Layer */}
          {showHeatmap && heatmapData.length > 0 && (
            <HeatmapLayer
              data={heatmapData}
              options={{
                radius: 50,
                opacity: 0.6,
                gradient: [
                  'rgba(0, 255, 255, 0)',
                  'rgba(0, 255, 255, 1)',
                  'rgba(255, 255, 0, 1)',
                  'rgba(255, 0, 0, 1)',
                ],
              }}
            />
          )}

          {/* Site Markers */}
          {filteredSites.map(site => {
            const siteAlarmes = alarmes.filter(a => a.siteId === site.id && (a.statut === 'active' || a.statut === 'en_traitement'));
            const hasActiveAlarm = siteAlarmes.length > 0;
            const siteAgents = agents.filter(a => a.siteId === site.id && a.statut === 'en_service');

            return (
              <React.Fragment key={site.id}>
                <Marker
                  position={{ lat: site.lat, lng: site.lng }}
                  onClick={() => setSelectedSite(site.id)}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: hasActiveAlarm ? 16 : 12,
                    fillColor: getMarkerColor(site.scoreRisque),
                    fillOpacity: 1,
                    strokeColor: hasActiveAlarm ? '#dc2626' : '#ffffff',
                    strokeWeight: hasActiveAlarm ? 4 : 2,
                  }}
                  title={site.nom}
                />

                {/* Coverage Circle */}
                {showCircles && (
                  <Circle
                    center={{ lat: site.lat, lng: site.lng }}
                    radius={Math.sqrt(site.surface) * 10}
                    options={{
                      fillColor: getMarkerColor(site.scoreRisque),
                      fillOpacity: 0.1,
                      strokeColor: getMarkerColor(site.scoreRisque),
                      strokeOpacity: 0.3,
                      strokeWeight: 1,
                    }}
                  />
                )}

                {/* Alert Circle */}
                {hasActiveAlarm && (
                  <Circle
                    center={{ lat: site.lat, lng: site.lng }}
                    radius={800}
                    options={{
                      fillColor: '#ef4444',
                      fillOpacity: 0.15,
                      strokeColor: '#ef4444',
                      strokeOpacity: 0.5,
                      strokeWeight: 2,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Routes between sites */}
          {showRoutes && filteredSites.length > 1 && (
            <Polyline
              path={filteredSites.map(s => ({ lat: s.lat, lng: s.lng }))}
              options={{
                strokeColor: '#3b82f6',
                strokeOpacity: 0.6,
                strokeWeight: 2,
                geodesic: true,
              }}
            />
          )}

          {/* Info Window */}
          {selectedSite && (() => {
            const site = sites.find(s => s.id === selectedSite);
            if (!site) return null;
            const criticite = getCriticiteLabel(site.criticite);
            const siteAlarmes = alarmes.filter(a => a.siteId === site.id && (a.statut === 'active' || a.statut === 'en_traitement'));
            const siteEvenements = evenements.filter(e => e.siteId === site.id && e.statut !== 'cloture').slice(0, 3);
            const siteAgents = agents.filter(a => a.siteId === site.id && a.statut === 'en_service');

            return (
              <InfoWindow
                position={{ lat: site.lat, lng: site.lng }}
                onCloseClick={() => setSelectedSite(null)}
                options={{ pixelOffset: new window.google.maps.Size(0, -40), maxWidth: 320 }}
              >
                <div className="p-2 min-w-[280px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-slate-800">{site.nom}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${criticite.color}`}>
                      {criticite.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{site.adresse}</p>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-50 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Camera size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-500">Caméras</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        {site.camerasOnline}/{site.cameras}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Users size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-500">Agents</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{siteAgents.length}</p>
                    </div>
                    <div className="bg-slate-50 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Shield size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-500">Capteurs</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{site.capteurs}</p>
                    </div>
                    <div className="bg-slate-50 rounded p-2">
                      <div className="flex items-center gap-1 mb-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-500">Surface</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{site.surface} m²</p>
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className="border-t border-slate-100 pt-2 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Score de risque</span>
                      <span className={`text-sm font-bold ${
                        site.scoreRisque >= 70 ? 'text-red-600' :
                        site.scoreRisque >= 50 ? 'text-orange-600' :
                        site.scoreRisque >= 30 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
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

                  {/* Active Alarms */}
                  {siteAlarmes.length > 0 && (
                    <div className="bg-red-50 rounded p-2 border border-red-100 mb-2">
                      <div className="flex items-center gap-1 mb-1">
                        <AlertTriangle size={12} className="text-red-600" />
                        <span className="text-xs font-medium text-red-700">
                          {siteAlarmes.length} alarme(s) active(s)
                        </span>
                      </div>
                      {siteAlarmes.slice(0, 2).map(a => (
                        <p key={a.id} className="text-xs text-red-600">• {a.type}</p>
                      ))}
                    </div>
                  )}

                  {/* Recent Events */}
                  {siteEvenements.length > 0 && (
                    <div className="bg-blue-50 rounded p-2 border border-blue-100 mb-2">
                      <div className="flex items-center gap-1 mb-1">
                        <Activity size={12} className="text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">Événements récents</span>
                      </div>
                      {siteEvenements.map(e => (
                        <p key={e.id} className="text-xs text-blue-600 truncate">• {e.description}</p>
                      ))}
                    </div>
                  )}

                  {/* Type & Zone */}
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{site.type}</span>
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{site.zone}</span>
                  </div>
                </div>
              </InfoWindow>
            );
          })()}
        </GoogleMap>
      </div>

      {/* Sites List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Eye size={16} />
          Liste des sites — {filteredSites.length} magasin(s)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSites.map(site => {
            const siteAlarmes = alarmes.filter(a => a.siteId === site.id && (a.statut === 'active' || a.statut === 'en_traitement'));
            return (
              <button
                key={site.id}
                onClick={() => {
                  setSelectedSite(site.id);
                  if (map) {
                    map.panTo({ lat: site.lat, lng: site.lng });
                    map.setZoom(14);
                  }
                }}
                className={`text-left p-3 rounded-lg border transition hover:shadow-md ${
                  selectedSite === site.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full`} style={{ backgroundColor: getMarkerColor(site.scoreRisque) }} />
                    <span className="text-sm font-medium text-slate-800">{site.nom}</span>
                  </div>
                  {siteAlarmes.length > 0 && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold animate-pulse">
                      <AlertTriangle size={10} />
                      {siteAlarmes.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{site.adresse}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span>{site.type}</span>
                  <span>•</span>
                  <span>{site.zone}</span>
                  <span>•</span>
                  <span className={`font-medium ${
                    site.scoreRisque >= 70 ? 'text-red-600' :
                    site.scoreRisque >= 50 ? 'text-orange-600' :
                    site.scoreRisque >= 30 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    Risque: {site.scoreRisque}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
          <p className="text-xs opacity-90 mb-1">Sites critiques</p>
          <p className="text-3xl font-bold">{filteredSites.filter(s => s.scoreRisque >= 70).length}</p>
          <p className="text-xs opacity-75 mt-1">Score ≥ 70</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <p className="text-xs opacity-90 mb-1">Alarmes actives</p>
          <p className="text-3xl font-bold">{alarmes.filter(a => a.statut === 'active' || a.statut === 'en_traitement').length}</p>
          <p className="text-xs opacity-75 mt-1">En temps réel</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-xs opacity-90 mb-1">Caméras totales</p>
          <p className="text-3xl font-bold">{filteredSites.reduce((sum, s) => sum + s.cameras, 0)}</p>
          <p className="text-xs opacity-75 mt-1">Sur {filteredSites.length} sites</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <p className="text-xs opacity-90 mb-1">Agents en service</p>
          <p className="text-3xl font-bold">{agents.filter(a => a.statut === 'en_service').length}</p>
          <p className="text-xs opacity-75 mt-1">Sur le terrain</p>
        </div>
      </div>
    </div>
  );
};
