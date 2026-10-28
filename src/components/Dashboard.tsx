import React from 'react';
import {
  AlertTriangle,
  Camera,
  Users,
  ShieldAlert,
  Clock,
  CheckCircle,
  TrendingUp,
  Activity,
  MapPin,
  Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useData } from '../data/DataContext';
import { Spinner, ErrorBanner, EmptyState } from './Shared';
import { buildIncidentsSeries, buildRondesSeries, delaiMoyenAlarmes, formatDelai, safePct } from '../lib/metrics';

export const Dashboard: React.FC = () => {
  const { state, loading, error } = useData();
  const { sites, agents, alarmes, cameras, evenements, rondes } = state;

  const alarmesActives = alarmes.filter(a => a.statut === 'active' || a.statut === 'en_traitement');
  const incidentsCritiques = evenements.filter(e => e.gravite === 'critique' && e.statut !== 'cloture');
  const incidentsOuverts = evenements.filter(e => e.statut !== 'cloture');
  const camerasOffline = cameras.filter(c => c.statut === 'offline');
  const agentsEnService = agents.filter(a => a.statut === 'en_service');
  const topSitesRisque = [...sites].sort((a, b) => b.scoreRisque - a.scoreRisque).slice(0, 5);

  const delaiMoyen = delaiMoyenAlarmes(alarmes);
  const tauxConformite = safePct(rondes.filter(r => r.statut === 'terminee').length, rondes.length);

  const donneesIncidents = buildIncidentsSeries(evenements, alarmes);
  const donneesRondes = buildRondesSeries(rondes);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  if (sites.length === 0) return <EmptyState label="Aucun site en base — ajoutez vos sites pour démarrer." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tour de contrôle sécurité</h1>
          <p className="text-slate-500 text-sm">Supervision multi-sites — données en direct</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Temps réel
          </span>
          <span className="text-sm text-slate-500">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Alertes critiques */}
      {(alarmesActives.length > 0 || incidentsCritiques.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600" />
            <h3 className="font-semibold text-red-800">Alertes actives</h3>
          </div>
          <div className="space-y-2">
            {alarmesActives.map(alarme => (
              <div key={alarme.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    alarme.priorite === 'critique' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {alarme.priorite.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{alarme.type}</span>
                  <span className="text-xs text-slate-500">— {sites.find(s => s.id === alarme.siteId)?.nom}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(alarme.horodatage).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard
          icon={<Users size={20} />}
          label="Agents en service"
          value={`${agentsEnService.length}/${agents.length}`}
          color="blue"
        />
        <KPICard
          icon={<AlertTriangle size={20} />}
          label="Alarmes actives"
          value={alarmesActives.length.toString()}
          color="red"
        />
        <KPICard
          icon={<ShieldAlert size={20} />}
          label="Incidents ouverts"
          value={incidentsOuverts.length.toString()}
          color="orange"
        />
        <KPICard
          icon={<Camera size={20} />}
          label="Caméras offline"
          value={camerasOffline.length.toString()}
          color="yellow"
        />
        <KPICard
          icon={<Clock size={20} />}
          label="Délai alarme"
          value={delaiMoyen !== null ? formatDelai(delaiMoyen) : '—'}
          color="green"
        />
        <KPICard
          icon={<CheckCircle size={20} />}
          label="Conformité"
          value={`${tauxConformite}%`}
          color="emerald"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents 7 jours */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Incidents & Alarmes — 7 jours</h3>
            <Activity size={16} className="text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={donneesIncidents}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="jour" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="alarmes" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rondes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Rondes réalisées / jour</h3>
            <TrendingUp size={16} className="text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={donneesRondes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="jour" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="rondes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top sites à risque */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Sites à risque élevé</h3>
            <MapPin size={16} className="text-slate-400" />
          </div>
          <div className="space-y-3">
            {topSitesRisque.map(site => (
              <div key={site.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{site.nom}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      site.scoreRisque >= 70 ? 'bg-red-100 text-red-700' :
                      site.scoreRisque >= 50 ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {site.scoreRisque}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        site.scoreRisque >= 70 ? 'bg-red-500' :
                        site.scoreRisque >= 50 ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${site.scoreRisque}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Derniers événements */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Derniers événements</h3>
            <Eye size={16} className="text-slate-400" />
          </div>
          <div className="space-y-2">
            {evenements.slice(0, 5).map(event => (
              <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50">
                <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                  event.gravite === 'critique' ? 'bg-red-500' :
                  event.gravite === 'haute' ? 'bg-orange-500' :
                  event.gravite === 'moyenne' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{event.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">
                      {sites.find(s => s.id === event.siteId)?.nom}
                    </span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs text-slate-400">
                      {new Date(event.horodatage).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  event.statut === 'ouvert' ? 'bg-red-50 text-red-600' :
                  event.statut === 'en_cours' ? 'bg-blue-50 text-blue-600' :
                  'bg-green-50 text-green-600'
                }`}>
                  {event.statut === 'ouvert' ? 'Ouvert' : event.statut === 'en_cours' ? 'En cours' : 'Clôturé'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ icon, label, value, color }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
};
