import React from 'react';
import { TrendingDown, AlertTriangle, BarChart3, Target, ShoppingCart, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { indicateursDI, sites, donneesDecmarque, donneesAlarmesParType } from '../data/mockData';

export const Demarque: React.FC = () => {
  const totalEcart = indicateursDI.reduce((sum, d) => sum + d.ecart, 0);
  const totalValeur = indicateursDI.reduce((sum, d) => sum + d.valeur, 0);
  const tauxDI = Math.abs((totalEcart / totalValeur) * 100).toFixed(2);

  const topSitesDI = [...indicateursDI].sort((a, b) => a.ecart - b.ecart);

  const signauxAlerte = [
    { signal: 'Augmentation soudaine des retours', risque: 'Fraude possible', niveau: 'haute' },
    { signal: 'Annulations de ventes répétées', risque: 'Anomalie caisse', niveau: 'moyenne' },
    { signal: 'Alarmes portiques fréquentes', risque: 'Vol à la sortie', niveau: 'haute' },
    { signal: 'Accès répétés en réserve hors flux', risque: 'Risque interne', niveau: 'haute' },
    { signal: 'Absence de ronde zone sensible', risque: 'Faille surveillance', niveau: 'moyenne' },
    { signal: 'Écart inventaire famille produit', risque: 'Perte potentielle', niveau: 'haute' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Démarque inconnue</h1>
          <p className="text-slate-500 text-sm">Analyse des pertes & détection d'anomalies</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium">
            Période : Janvier 2026
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-red-50 rounded-xl border border-red-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={18} className="text-red-600" />
            <span className="text-xs text-red-600 font-medium">Écart total</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{(Math.abs(totalEcart) / 1000).toFixed(1)}k €</p>
          <p className="text-xs text-red-500">Pertes estimées</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">Taux DI</span>
          </div>
          <p className="text-2xl font-bold text-orange-700">{tauxDI}%</p>
          <p className="text-xs text-orange-500">Sur valeur stock</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart size={18} className="text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Valeur stock</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{(totalValeur / 1000).toFixed(0)}k €</p>
          <p className="text-xs text-blue-500">Valeur totale analysée</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">Alertes actives</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">8</p>
          <p className="text-xs text-purple-500">Anomalies détectées</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution DI */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Évolution démarque — 5 mois</h3>
            <ArrowUpRight size={16} className="text-red-500" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={donneesDecmarque}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip formatter={(value: number) => [`${value.toLocaleString()} €`, 'Démarque']} />
              <Line type="monotone" dataKey="valeur" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alarmes par type */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Alarmes liées à la démarque</h3>
            <BarChart3 size={16} className="text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={donneesAlarmesParType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="type" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top sites par écart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Écarts par site et famille produit</h3>
        <div className="space-y-3">
          {topSitesDI.map(di => {
            const site = sites.find(s => s.id === di.siteId);
            const pctEcart = Math.abs((di.ecart / di.valeur) * 100);
            return (
              <div key={di.id} className="flex items-center gap-4">
                <div className="w-40 flex-shrink-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{site?.nom}</p>
                  <p className="text-xs text-slate-400">{di.familleProduit}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">Écart</span>
                    <span className="text-sm font-bold text-red-600">{(di.ecart / 1000).toFixed(1)}k €</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        pctEcart > 20 ? 'bg-red-500' :
                        pctEcart > 10 ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min(pctEcart * 3, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">{pctEcart.toFixed(1)}% de la valeur</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Signaux d'alerte */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-orange-500" />
          Signaux faibles & règles de détection
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {signauxAlerte.map((signal, idx) => (
            <div key={idx} className={`p-3 rounded-lg border ${
              signal.niveau === 'haute' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'
            }`}>
              <p className="text-sm font-medium text-slate-700">{signal.signal}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">{signal.risque}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  signal.niveau === 'haute' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {signal.niveau}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Méthodologie */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
        <h3 className="font-semibold text-blue-800 mb-2">Méthodologie de détection</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• <strong>Niveau 1</strong> — Règles métier : seuils fixes, corrélations événements</p>
          <p>• <strong>Niveau 2</strong> — Score pondéré : combinaison multi-facteurs explicable</p>
          <p>• <strong>Niveau 3</strong> — Détection d'anomalies statistiques (z-score, moyennes mobiles)</p>
          <p>• <strong>Niveau 4</strong> — ML avancé (après collecte suffisante de données qualifiées)</p>
        </div>
      </div>
    </div>
  );
};
