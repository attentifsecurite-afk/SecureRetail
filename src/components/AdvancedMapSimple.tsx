import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MapPin, AlertTriangle, Camera, Users, Shield, Layers, TrendingUp, Activity, Eye, Navigation } from 'lucide-react';
import { useData } from '../data/DataContext';
import { Spinner, ErrorBanner } from './Shared';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

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
  const { state, loading, error } = useData();
  const { sites, alarmes, agents, cameras } = state;

  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [filterZone, setFilterZone] = useState<string>('toutes');
  const [filterCriticite, setFilterCriticite] = useState<string>('toutes');
  const [showCircles, setShowCircles] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const zones = useMemo(() => [...new Set(sites.map(s => s.zone))], [sites]);

  const filteredSites = useMemo(() => {
    return sites.filter(s => {
      const matchesZone = filterZone === 'toutes' || s.zone === filterZone;
      const matchesCriticite = filterCriticite === 'toutes' || s.criticite === filterCriticite;
      return matchesZone && matchesCriticite;
    });
  }, [sites, filterZone, filterCriticite]);

  // Charger Google Maps
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setLoadError('Clé API Google Maps non configurée');
      return;
    }

    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google?.maps) {
        setMapLoaded(true);
      } else {
        setLoadError('Google Maps n\'a pas pu être chargé correctement');
      }
    };

    script.onerror = () => {
      setLoadError('Erreur lors du chargement de Google Maps');
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialiser la carte
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstance) return;

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: 48.8566, lng: 2.3522 },
      zoom: 10,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    setMapInstance(newMap);

    // Ajuster les bounds
    const bounds = new window.google.maps.LatLngBounds();
    filteredSites.forEach(site => {
      bounds.extend({ lat: site.lat, lng: site.lng });
    });
    newMap.fitBounds(bounds);

  }, [mapLoaded, mapInstance]);

  // Mettre à jour les markers
  useEffect(() => {
    if (!mapInstance || !window.google?.maps) return;

    // Supprimer les anciens markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const newInfoWindow = new window.google.maps.InfoWindow();
    setInfoWindow(newInfoWindow);

    filteredSites.forEach(site => {
      const siteAlarmes = alarmes.filter(a => a.siteId === site.id && (a.statut === 'active' || a.statut === 'en_traitement'));
      const hasActiveAlarm = siteAlarmes.length > 0;

      const marker = new window.google.maps.Marker({
        position: { lat: site.lat, lng: site.lng },
        map: mapInstance,
        title: site.nom,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: hasActiveAlarm ? 16 : 12,
          fillColor: getMarkerColor(site.scoreRisque),
          fillOpacity: 1,
          strokeColor: hasActiveAlarm ? '#dc2626' : '#ffffff',
          strokeWeight: hasActiveAlarm ? 4 : 2,
        },
      });

      marker.addListener('click', () => {
        setSelectedSite(site.id);
        
        const criticite = getCriticiteLabel(site.criticite);
        const siteAgents = agents.filter(a => a.siteId === site.id && a.statut === 'en_service');
        
        const content = `
          <div style="padding: 8px; min-width: 250px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <strong>${site.nom}</strong>
              <span style="padding: 2px 6px; border-radius: 4px; font-size: 11px; background: ${criticite.color.includes('red') ? '#fee2e2' : criticite.color.includes('orange') ? '#fed7aa' : criticite.color.includes('yellow') ? '#fef3c7' : '#dcfce7'}; color: ${criticite.color.includes('red') ? '#b91c1c' : criticite.color.includes('orange') ? '#c2410c' : criticite.color.includes('yellow') ? '#a16207' : '#15803d'};">
                ${criticite.label}
              </span>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">${site.adresse}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
              <div style="background: #f8fafc; padding: 8px; border-radius: 4px;">
                <div style="font-size: 11px; color: #94a3b8;">Caméras</div>
                <div style="font-weight: bold;">${cameras.filter(c => c.siteId === site.id && c.statut === 'online').length}/${cameras.filter(c => c.siteId === site.id).length}</div>
              </div>
              <div style="background: #f8fafc; padding: 8px; border-radius: 4px;">
                <div style="font-size: 11px; color: #94a3b8;">Agents</div>
                <div style="font-weight: bold;">${siteAgents.length}</div>
              </div>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 11px; color: #64748b;">Score de risque</span>
                <span style="font-weight: bold; color: ${site.scoreRisque >= 70 ? '#dc2626' : site.scoreRisque >= 50 ? '#ea580c' : site.scoreRisque >= 30 ? '#ca8a04' : '#16a34a'};">
                  ${site.scoreRisque}/100
                </span>
              </div>
              <div style="width: 100%; background: #e2e8f0; border-radius: 4px; height: 6px;">
                <div style="height: 6px; border-radius: 4px; background: ${getMarkerColor(site.scoreRisque)}; width: ${site.scoreRisque}%;"></div>
              </div>
            </div>
            ${siteAlarmes.length > 0 ? `
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 8px; margin-top: 8px;">
                <div style="font-size: 11px; font-weight: 600; color: #b91c1c;">
                  ⚠️ ${siteAlarmes.length} alarme(s) active(s)
                </div>
              </div>
            ` : ''}
          </div>
        `;
        
        newInfoWindow.setContent(content);
        newInfoWindow.open(mapInstance, marker);
      });

      newMarkers.push(marker);

      // Cercle de couverture
      if (showCircles) {
        new window.google.maps.Circle({
          strokeColor: getMarkerColor(site.scoreRisque),
          strokeOpacity: 0.3,
          strokeWeight: 1,
          fillColor: getMarkerColor(site.scoreRisque),
          fillOpacity: 0.1,
          map: mapInstance,
          center: { lat: site.lat, lng: site.lng },
          radius: Math.sqrt(site.surface) * 10,
        });
      }

      // Cercle d'alerte
      if (hasActiveAlarm) {
        new window.google.maps.Circle({
          strokeColor: '#ef4444',
          strokeOpacity: 0.5,
          strokeWeight: 2,
          fillColor: '#ef4444',
          fillOpacity: 0.15,
          map: mapInstance,
          center: { lat: site.lat, lng: site.lng },
          radius: 800,
        });
      }
    });

    setMarkers(newMarkers);

    // Routes
    if (showRoutes && filteredSites.length > 1) {
      const path = filteredSites.map(s => ({ lat: s.lat, lng: s.lng }));
      new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.6,
        strokeWeight: 2,
        map: mapInstance,
      });
    }

  }, [mapInstance, filteredSites, alarmes, agents, showCircles, showRoutes]);

  const handleSiteClick = (siteId: string) => {
    setSelectedSite(siteId);
    const site = sites.find(s => s.id === siteId);
    if (site && mapInstance) {
      mapInstance.panTo({ lat: site.lat, lng: site.lng });
      mapInstance.setZoom(14);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cartographie avancée</h1>
          <p className="text-slate-500 text-sm">Vue interactive multi-sites avec analytics</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">Erreur de chargement</p>
          <p className="text-red-500 text-sm mt-1">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Couches</label>
            <button
              onClick={() => setShowCircles(!showCircles)}
              className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition ${
                showCircles ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Layers size={14} className="inline mr-1" />
              Zones de couverture
            </button>
          </div>

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
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm" style={{ height: '700px' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
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
                onClick={() => handleSiteClick(site.id)}
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
          <p className="text-3xl font-bold">{filteredSites.reduce((sum, s) => sum + cameras.filter(c => c.siteId === s.id).length, 0)}</p>
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
