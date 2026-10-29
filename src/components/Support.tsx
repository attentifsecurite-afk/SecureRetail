import React, { useState } from 'react';
import {
  MessageSquare, Plus, Search, Filter, Clock, CheckCircle, AlertCircle,
  User, Mail, Phone, Building2, Calendar, MessageCircle, Paperclip,
  Send, ThumbsUp, ThumbsDown, Star
} from 'lucide-react';

interface Ticket {
  id: string;
  numero: string;
  sujet: string;
  client: string;
  email: string;
  priorite: 'basse' | 'moyenne' | 'haute' | 'critique';
  statut: 'ouvert' | 'en_cours' | 'en_attente' | 'resolu' | 'ferme';
  categorie: 'technique' | 'facturation' | 'general' | 'bug' | 'feature';
  dateCreation: string;
  dateMiseAJour: string;
  assigneA: string;
  messages: number;
  satisfaction?: number;
}

const mockTickets: Ticket[] = [
  {
    id: 'TK001',
    numero: 'TK-2026-001',
    sujet: 'Caméra offline depuis ce matin',
    client: 'Retail Group Paris',
    email: 'support@retailgroup.fr',
    priorite: 'haute',
    statut: 'en_cours',
    categorie: 'technique',
    dateCreation: '2026-01-15T09:30:00',
    dateMiseAJour: '2026-01-15T14:20:00',
    assigneA: 'Tech-001',
    messages: 5,
    satisfaction: 5,
  },
  {
    id: 'TK002',
    numero: 'TK-2026-002',
    sujet: 'Question sur la facturation',
    client: 'Luxury Brand',
    email: 'compta@luxurybrand.fr',
    priorite: 'moyenne',
    statut: 'en_attente',
    categorie: 'facturation',
    dateCreation: '2026-01-14T16:45:00',
    dateMiseAJour: '2026-01-15T10:00:00',
    assigneA: 'Support-002',
    messages: 3,
  },
  {
    id: 'TK003',
    numero: 'TK-2026-003',
    sujet: 'Demande de formation',
    client: 'SecurTech Solutions',
    email: 'formation@securtech.fr',
    priorite: 'basse',
    statut: 'ouvert',
    categorie: 'general',
    dateCreation: '2026-01-15T11:00:00',
    dateMiseAJour: '2026-01-15T11:00:00',
    assigneA: 'Non assigné',
    messages: 1,
  },
  {
    id: 'TK004',
    numero: 'TK-2026-004',
    sujet: 'Bug dans le module CRM',
    client: 'Fashion Store',
    email: 'it@fashionstore.fr',
    priorite: 'critique',
    statut: 'en_cours',
    categorie: 'bug',
    dateCreation: '2026-01-15T08:15:00',
    dateMiseAJour: '2026-01-15T15:30:00',
    assigneA: 'Dev-001',
    messages: 8,
  },
];

export const Support: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [filterPriorite, setFilterPriorite] = useState<string>('tous');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchTerm === '' ||
      ticket.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === 'tous' || ticket.statut === filterStatut;
    const matchesPriorite = filterPriorite === 'tous' || ticket.priorite === filterPriorite;
    return matchesSearch && matchesStatut && matchesPriorite;
  });

  const stats = {
    total: tickets.length,
    ouverts: tickets.filter(t => t.statut === 'ouvert').length,
    enCours: tickets.filter(t => t.statut === 'en_cours').length,
    resolus: tickets.filter(t => t.statut === 'resolu').length,
    satisfactionMoyenne: tickets.filter(t => t.satisfaction).reduce((sum, t) => sum + (t.satisfaction || 0), 0) / tickets.filter(t => t.satisfaction).length || 0,
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'ouvert': return { color: 'bg-blue-100 text-blue-700', icon: MessageSquare, label: 'Ouvert' };
      case 'en_cours': return { color: 'bg-orange-100 text-orange-700', icon: Clock, label: 'En cours' };
      case 'en_attente': return { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'En attente' };
      case 'resolu': return { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Résolu' };
      case 'ferme': return { color: 'bg-slate-100 text-slate-700', icon: CheckCircle, label: 'Fermé' };
      default: return { color: 'bg-slate-100 text-slate-700', icon: MessageSquare, label: statut };
    }
  };

  const getPrioriteBadge = (priorite: string) => {
    switch (priorite) {
      case 'critique': return { color: 'bg-red-100 text-red-700', label: 'Critique' };
      case 'haute': return { color: 'bg-orange-100 text-orange-700', label: 'Haute' };
      case 'moyenne': return { color: 'bg-yellow-100 text-yellow-700', label: 'Moyenne' };
      case 'basse': return { color: 'bg-slate-100 text-slate-700', label: 'Basse' };
      default: return { color: 'bg-slate-100 text-slate-700', label: priorite };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare size={28} className="text-blue-600" />
            Support Client
          </h1>
          <p className="text-slate-500 text-sm">
            Gestion des tickets et assistance client
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
          <Plus size={16} />
          Nouveau ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={18} className="text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500">Tickets</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={18} className="text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Ouverts</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.ouverts}</p>
          <p className="text-xs text-blue-600">À traiter</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">En cours</span>
          </div>
          <p className="text-2xl font-bold text-orange-700">{stats.enCours}</p>
          <p className="text-xs text-orange-600">En traitement</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-600" />
            <span className="text-xs text-green-600 font-medium">Résolus</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.resolus}</p>
          <p className="text-xs text-green-600">Ce mois</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star size={18} className="text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">Satisfaction</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">{stats.satisfactionMoyenne.toFixed(1)}/5</p>
          <p className="text-xs text-purple-600">Moyenne</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tous">Tous les statuts</option>
            <option value="ouvert">Ouvert</option>
            <option value="en_cours">En cours</option>
            <option value="en_attente">En attente</option>
            <option value="resolu">Résolu</option>
          </select>
          <select
            value={filterPriorite}
            onChange={(e) => setFilterPriorite(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tous">Toutes les priorités</option>
            <option value="critique">Critique</option>
            <option value="haute">Haute</option>
            <option value="moyenne">Moyenne</option>
            <option value="basse">Basse</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets */}
        <div className="lg:col-span-2 space-y-3">
          {filteredTickets.map(ticket => {
            const statut = getStatutBadge(ticket.statut);
            const priorite = getPrioriteBadge(ticket.priorite);
            const StatutIcon = statut.icon;
            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket.id)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition hover:shadow-md ${
                  selectedTicket === ticket.id ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-500">{ticket.numero}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorite.color}`}>
                        {priorite.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900">{ticket.sujet}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statut.color}`}>
                    <StatutIcon size={12} />
                    {statut.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {ticket.client}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} />
                      {ticket.messages} messages
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(ticket.dateCreation).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-1">
          {selectedTicket ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6">
              {(() => {
                const ticket = tickets.find(t => t.id === selectedTicket);
                if (!ticket) return null;
                const statut = getStatutBadge(ticket.statut);
                const priorite = getPrioriteBadge(ticket.priorite);
                const StatutIcon = statut.icon;

                return (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-slate-500">{ticket.numero}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorite.color}`}>
                          {priorite.label}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 mb-2">{ticket.sujet}</h2>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statut.color}`}>
                        <StatutIcon size={12} />
                        {statut.label}
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={16} className="text-slate-400" />
                        <span className="text-slate-600">{ticket.client}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={16} className="text-slate-400" />
                        <span className="text-slate-600">{ticket.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-slate-400" />
                        <span className="text-slate-600">
                          Créé le {new Date(ticket.dateCreation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User size={16} className="text-slate-400" />
                        <span className="text-slate-600">Assigné à : {ticket.assigneA}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4 mb-4">
                      <h3 className="font-semibold text-slate-900 mb-3">Conversation</h3>
                      <div className="space-y-3 mb-4">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-slate-700">{ticket.client}</span>
                            <span className="text-xs text-slate-400">
                              {new Date(ticket.dateCreation).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            Bonjour, j'ai un problème avec...
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-blue-700">{ticket.assigneA}</span>
                            <span className="text-xs text-slate-400">
                              {new Date(ticket.dateMiseAJour).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            Merci pour votre message. Je vais regarder ça...
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Répondre..."
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                          <Send size={16} />
                        </button>
                      </div>
                    </div>

                    {ticket.satisfaction && (
                      <div className="border-t border-slate-200 pt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-600">Satisfaction :</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < ticket.satisfaction! ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <MessageSquare size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Sélectionnez un ticket</h3>
              <p className="text-sm text-slate-400">
                Cliquez sur un ticket pour voir les détails
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
