import React from 'react';
import { BarChart3, TrendingUp, Users, Shield, Clock, CheckCircle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useData } from '../data/DataContext';
import { Spinner, ErrorBanner } from './Shared';
import {
  buildIncidentsSeries,
  buildDITrend,
  buildIncidentsParCategorie,
  delaiMoyenAlarmes,
  formatDelai,
  minutesBetween,
  safePct,
} from '../lib/metrics';

const CATEGORIE_COLORS: Record<string, string> = {
  Intrusion: '#ef4444',
  'EAS': '#f59e0b',
  'Démarque': '#f59e0b',
  'Incendie': '#8b5cf6',
  'SSIAP': '#8b5cf6',
  'Technique': '#3b82f6',
  'Opérationnel': '#10b981',
  'Sûreté': '#10b981',
};

export const Reporting: React.FC = () => {
  const { state, loading, error } = useData();
  const { sites, agents, evenements, alarmes, rondes, indicateurs } = state;

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;

  const agentsEnService = agents.filter(a => a.statut === 'en_service').length;
  const rondesTerminees = rondes.filter(r => r.statut === 'terminee');
  const tauxConformite = safePct(rondesTerminees.length, rondes.length);

  const delaiMoyen = delaiMoyenAlarmes(alarmes);

  const dataConformite = [
    { name: 'Conforme', value: tauxConformite },
    { name: 'Non conforme', value: 100 - tauxConformite },
  ];

  const countsParCategorie = buildIncidentsParCategorie(evenements);
  const dataRepartition = [...countsParCategorie.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({
      name,
      value,
      color: CATEGORIE_COLORS[name] ?? '#64748b',
    }));

  const ponctuelles = rondesTerminees.filter(r => r.heureReelle && minutesBetween(r.heureReelle, r.heurePrevue) <= 10).length;
  const alarmesTraitees = alarmes.filter(a => a.traiteeA);
  const alarmesRapides = alarmesTraitees.filter(a =>
    new Date(a.traiteeA!).getTime() - new Date(a.horodatage).getTime() <= 15 * 60 * 1000
  ).length;
  const cloturees = evenements.filter(e => e.statut === 'cloture' && e.clotureA);
  const clotureRapides = cloturees.filter(e =>
    new Date(e.clotureA!).getTime() - new Date(e.horodatage).getTime() <= 48 * 60 * 60 * 1000
  ).length;
  const ssiapEvents = evenements.filter(e => e.categorie === 'SSIAP');
  const ssiapClotures = ssiapEvents.filter(e => e.statut === 'cloture');

  const dataPerformancePrestataire = [
    { indicateur: 'Taux pourvoi', valeur: safePct(agentsEnService, agents.length), objectif: 90 },
    { indicateur: 'Ponctualité rondes', valeur: safePct(ponctuelles, rondesTerminees.length), objectif: 95 },
    { indicateur: 'Rondes réalisées', valeur: tauxConformite, objectif: 95 },
    { indicateur: 'Alarmes traitées < 15 min', valeur: safePct(alarmesRapides, alarmesTraitees.length), objectif: 90 },
    { indicateur: 'Conformité SSIAP', valeur: safePct(ssiapClotures.length, ssiapEvents.length), objectif: 100 },
    { indicateur: 'Clôture < 48h', valeur: safePct(clotureRapides, cloturees.length), objectif: 85 },
  ];

  const incidents30j = evenements.filter(e => new Date(e.horodatage).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length;
  const alarmes30j = alarmes.filter(a => new Date(a.horodatage).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length;

  const donneesIncidents = buildIncidentsSeries(evenements, alarmes);
  const donneesDecmarque = buildDITrend(indicateurs);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reporting & pilotage</h1>
          <p className="text-slate-500 text-sm">Tableaux de bord direction et exploitation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition text-sm font-medium">
          <Download size={16} />
          Export PDF
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        <MiniKPI label="Sites" value={sites.length.toString()} icon={<Shield size={16} />} color="blue" />
        <MiniKPI label="Agents" value={agents.length.toString()} icon={<Users size={16} />} color="green" />
        <MiniKPI label="Incidents/30j" value={incidents30j.toString()} icon={<BarChart3 size={16} />} color="orange" />
        <MiniKPI label="Alarmes/30j" value={alarmes30j.toString()} icon={<TrendingUp size={16} />} color="red" />
        <MiniKPI label="Délai moy." value={delaiMoyen !== null ? formatDelai(delaiMoyen) : '—'} icon={<Clock size={16} />} color="purple" />
        <MiniKPI label="Conformité" value={`${tauxConformite}%`} icon={<CheckCircle size={16} />} color="emerald" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance prestataire */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Performance exploitation vs objectifs</h3>
          <div className="space-y-4">
            {dataPerformancePrestataire.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">{item.indicateur}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      item.valeur >= item.objectif ? 'text-green-600' :
                      item.valeur >= item.objectif - 10 ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {item.valeur}%
                    </span>
                    <span className="text-xs text-slate-400">/ {item.objectif}%</span>
                  </div>
                </div>
                <div className="relative w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      item.valeur >= item.objectif ? 'bg-green-500' :
                      item.valeur >= item.objectif - 10 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${item.valeur}%` }}
                  />
                  {/* Objectif marker */}
                  <div
                    className="absolute top-0 w-0.5 h-2.5 bg-slate-400"
                    style={{ left: `${item.objectif}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition incidents */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Répartition des incidents</h3>
          {dataRepartition.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Aucun incident enregistré.</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie
                    data={dataRepartition}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {dataRepartition.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {dataRepartition.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-600">{item.name}</span>
                    <span className="text-xs font-bold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendance incidents */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Tendance incidents — 7 jours</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={donneesIncidents}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="jour" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} name="Incidents" />
              <Line type="monotone" dataKey="alarmes" stroke="#f59e0b" strokeWidth={2} name="Alarmes" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tendance démarque */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Tendance démarque inconnue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={donneesDecmarque}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `${v/1000}k€`} />
              <Tooltip formatter={(value: number) => [`${value.toLocaleString()} €`, 'Pertes']} />
              <Bar dataKey="valeur" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score par site */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Score de risque par site</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={sites.map(s => ({ nom: s.nom.replace('Paris ', '').replace('Centre Commercial ', ''), score: s.scoreRisque }))} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis type="category" dataKey="nom" tick={{ fontSize: 11 }} stroke="#94a3b8" width={120} />
            <Tooltip />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {sites.map((site, index) => (
                <Cell key={index} fill={
                  site.scoreRisque >= 70 ? '#ef4444' :
                  site.scoreRisque >= 50 ? '#f59e0b' :
                  site.scoreRisque >= 30 ? '#eab308' :
                  '#22c55e'
                } />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conformité globale */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Conformité & audit</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-700">{tauxConformite}%</p>
            <p className="text-xs text-green-600 mt-1">Rondes réalisées</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-700">{dataConformite[0].value > 0 ? '100%' : '—'}</p>
            <p className="text-xs text-blue-600 mt-1">Journalisation active</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-700">30j</p>
            <p className="text-xs text-purple-600 mt-1">Rétention vidéo</p>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <p className="text-3xl font-bold text-emerald-700">0</p>
            <p className="text-xs text-emerald-600 mt-1">Violation RGPD</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MiniKPIProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const MiniKPI: React.FC<MiniKPIProps> = ({ label, value, icon, color }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
};
