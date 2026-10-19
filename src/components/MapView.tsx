import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { MapPin, AlertTriangle, Camera, Users, Shield } from 'lucide-react';
import { sites, alarmes } from '../data/mockData';

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

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  mapTypeControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'simplified' }],
    },
  ],
};

const getMarkerColor = (scoreRisque: number) => {
  if (scoreRisque >= 70) return '#ef4444'; // red
  if (scoreRisque >= 50) return '#f59e0b'; // orange
  if (scoreRisque >= 30) return '#eab308'; // yellow
  return '#22c55e'; // green
};

const getCriticiteLabel = (criticite: string) => {
  switch (criticite) {
    case 'critique': return { color: 'bg-red-100 text-red-700', label: 'Critique' };
    case 'élevée': return { color: 'bg-orange-100 text-orange-700', label: 'Élevée' };
    case 'moyenne': return { color: 'bg-yellow-100 text-yellow-700', label: 'Moyenne' };
    default: return { color: 'bg-green-100 text-green-700', label: 'Faible' };
  }
};

export const MapView: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [filterZone, setFilterZone] = useState<string>('toutes');

  const zones = [...new Set(sites.map(s => s.zone))];

  const filteredSites = filterZone === 'toutes'
    ? sites
    : sites.filter(s => s.zone === filterZone);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    // Ajuster les bounds pour inclure tous les sites
    const bounds = new window.google.maps.LatLngBounds();
    sites.forEach(site => {
      bounds.extend({ lat: site.lat, lng: site.lng });
    });
    map.fitBounds(bounds);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cartographie des sites</h1>
          <p className="text-slate-500 text-sm">Vue géographique multi-sites — Paris & Grande Couronne</p>
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
          <h1 className="text-2xl font-bold text-slate-900">Cartographie des sites</h1>
          <p className="text-slate-500 text-sm">Vue géographique multi-sites — Paris & Grande Couronne</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 h-[600px] flex items-center justify-center">
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
          <h1 className="text-2xl font-bold text-slate-900">Cartographie des sites</h1>
          <p className="text-slate-500 text-sm">Vue géographique multi-sites — Paris & Grande Couronne</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="toutes">Toutes les zones</option>
            {zones.map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
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
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm" style={{ height: '600px' }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={10}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={options}
        >
          {filteredSites.map(site => {
            const siteAlarmes = alarmes.filter(a => a.siteId === site.id && (a.statut === 'active' || a.statut === 'en_traitement'));
            const hasActiveAlarm = siteAlarmes.length > 0;

            return (
              <React.Fragment key={site.id}>
                <Marker
                  position={{ lat: site.lat, lng: site.lng }}
                  onClick={() => setSelectedSite(site.id)}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: hasActiveAlarm ? 14 : 10,
                    fillColor: getMarkerColor(site.scoreRisque),
                    fillOpacity: 1,
                    strokeColor: hasActiveAlarm ? '#dc2626' : '#ffffff',
                    strokeWeight: hasActiveAlarm ? 3 : 2,
                  }}
                  title={site.nom}
                />
                {/* Cercle d'alerte pour les sites avec alarmes actives */}
                {hasActiveAlarm && (
                  <Circle
                    center={{ lat: site.lat, lng: site.lng }}
                    radius={500}
                    options={{
                      fillColor: '#ef4444',
                      fillOpacity: 0.1,
                      strokeColor: '#ef4444',
                      strokeOpacity: 0.3,
                      strokeWeight: 1,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Info Window */}
          {selectedSite && (() => {
            const site = sites.find(s => s.id === selectedSite);
            if (!site) return null;
            const criticite = getCriticiteLabel(site.criticite);
            const siteAlarmes = alarmes.filter(a => a.siteId === site.id && (a.statut === 'active' || a.statut === 'en_traitement'));

            return (
              <InfoWindow
                position={{ lat: site.lat, lng: site.lng }}
                onCloseClick={() => setSelectedSite(null)}
                options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
              >
                <div className="p-1 min-w-[240px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-slate-800">{site.nom}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${criticite.color}`}>
                      {criticite.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{site.adresse}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Camera size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-600">
                        {site.camerasOnline}/{site.cameras} cam.
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-600">{site.agents} agents</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-600">{site.capteurs} capteurs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-600">{site.surface} m²</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="border-t border-slate-100 pt-2 mb-2">
                    <div className="flex items-center justify-between">
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
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          site.scoreRisque >= 70 ? 'bg-red-500' :
                          site.scoreRisque >= 50 ? 'bg-orange-500' :
                          site.scoreRisque >= 30 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${site.scoreRisque}%` }}
                      />
                    </div>
                  </div>

                  {/* Active alarms */}
                  {siteAlarmes.length > 0 && (
                    <div className="bg-red-50 rounded p-2 border border-red-100">
                      <div className="flex items-center gap-1">
                        <AlertTriangle size={12} className="text-red-600" />
                        <span className="text-xs font-medium text-red-700">
                          {siteAlarmes.length} alarme(s) active(s)
                        </span>
                      </div>
                      {siteAlarmes.map(a => (
                        <p key={a.id} className="text-xs text-red-600 mt-1">• {a.type} — {a.zone}</p>
                      ))}
                    </div>
                  )}

                  {/* Type & Zone */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{site.type}</span>
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{site.zone}</span>
                  </div>
                </div>
              </InfoWindow>
            );
          })()}
        </GoogleMap>
      </div>

      {/* Sites list below map */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Liste des sites — {filteredSites.length} magasin(s)</h3>
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
                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">
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
    </div>
  );
};
