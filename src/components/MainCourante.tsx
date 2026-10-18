import React, { useState } from 'react';
import { Search, Filter, Plus, Clock, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { evenements, sites, agents } from '../data/mockData';

export const MainCourante: React.FC = () => {
  const [filter, setFilter] = useState<string>('tous');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = evenements.filter(e => {
    const matchesFilter = filter === 'tous' || e.statut === filter;
    const matchesSearch = searchTerm === '' ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.categorie.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getGraviteColor = (gravite: string) => {
    switch (gravite) {
      case 'critique': return 'bg-red-100 text-red-700 border-red-200';
      case 'haute': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'moyenne': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'basse': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'ouvert': return <AlertCircle size={14} className="text-red-500" />;
      case 'en_cours': return <Clock size={14} className="text-blue-500" />;
      case 'cloture': return <CheckCircle2 size={14} className="text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Main courante électronique</h1>
          <p className="text-slate-500 text-sm">Journal des événements sûreté — tous sites</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
          <Plus size={16} />
          Nouvel événement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            {['tous', 'ouvert', 'en_cours', 'cloture'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'tous' ? 'Tous' : f === 'ouvert' ? 'Ouverts' : f === 'en_cours' ? 'En cours' : 'Clôturés'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
          <p className="text-2xl font-bold text-red-700">{evenements.filter(e => e.statut === 'ouvert').length}</p>
          <p className="text-xs text-red-600">Événements ouverts</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <p className="text-2xl font-bold text-blue-700">{evenements.filter(e => e.statut === 'en_cours').length}</p>
          <p className="text-xs text-blue-600">En traitement</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-100">
          <p className="text-2xl font-bold text-green-700">{evenements.filter(e => e.statut === 'cloture').length}</p>
          <p className="text-xs text-green-600">Clôturés aujourd'hui</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
          <p className="text-2xl font-bold text-purple-700">{evenements.filter(e => e.gravite === 'critique').length}</p>
          <p className="text-xs text-purple-600">Critiques</p>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredEvents.map(event => {
            const site = sites.find(s => s.id === event.siteId);
            const agent = agents.find(a => a.id === event.assigneA);
            return (
              <div key={event.id} className="p-4 hover:bg-slate-50 transition">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getStatutIcon(event.statut)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getGraviteColor(event.gravite)}`}>
                        {event.gravite}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {event.categorie}
                      </span>
                      <span className="text-xs text-slate-500">
                        {site?.nom} — {event.zone}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-1">{event.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(event.horodatage).toLocaleString('fr-FR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      <span>Créé par : {event.creePar}</span>
                      {agent && <span>Assigné : {agent.prenom} {agent.nom}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-slate-200 rounded" title="Voir détails">
                      <FileText size={14} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
