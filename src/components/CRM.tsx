import React, { useState } from 'react';
import {
  Building2, Users, Phone, Mail, Calendar, FileText, Camera,
  CheckCircle, Clock, AlertCircle, TrendingUp, DollarSign,
  MapPin, Edit2, Trash2, Plus, Search, Filter, Download,
  Video, Shield, HardDrive, Server, Eye, MessageSquare,
  FileCheck, UserCheck, Briefcase, Target, Award
} from 'lucide-react';
import { sites } from '../data/mockData';

// Types
interface Contact {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  email: string;
  telephone: string;
  isPrimary: boolean;
}

interface Installation {
  id: string;
  date: string;
  type: 'camera' | 'dvr' | 'nvr' | 'alarm' | 'access';
  marque: string;
  modele: string;
  quantite: number;
  statut: 'planifie' | 'en_cours' | 'termine' | 'maintenance';
  technicien: string;
  notes: string;
}

interface Intervention {
  id: string;
  date: string;
  type: 'maintenance' | 'panne' | 'upgrade' | 'support';
  description: string;
  statut: 'ouvert' | 'en_cours' | 'resolu';
  priorite: 'basse' | 'moyenne' | 'haute' | 'critique';
  technicien: string;
  duree: number; // heures
}

interface Contrat {
  id: string;
  numero: string;
  type: 'maintenance' | 'supervision' | 'complet';
  dateDebut: string;
  dateFin: string;
  montant: number;
  statut: 'actif' | 'expire' | 'renouvellement';
}

interface SiteCRM {
  siteId: string;
  contacts: Contact[];
  installations: Installation[];
  interventions: Intervention[];
  contrats: Contrat[];
  notes: string[];
  score: number;
  lastContact: string;
  nextIntervention?: string;
}

// Données mockées CRM
const crmData: Record<string, SiteCRM> = {
  'S001': {
    siteId: 'S001',
    contacts: [
      { id: 'C001', nom: 'Dupont', prenom: 'Jean', role: 'Directeur Magasin', email: 'j.dupont@retail.fr', telephone: '01 23 45 67 89', isPrimary: true },
      { id: 'C002', nom: 'Martin', prenom: 'Sophie', role: 'Responsable Sécurité', email: 's.martin@retail.fr', telephone: '06 12 34 56 78', isPrimary: false },
    ],
    installations: [
      { id: 'I001', date: '2025-03-15', type: 'camera', marque: 'Hikvision', modele: 'DS-2CD2143G2-I', quantite: 12, statut: 'termine', technicien: 'Tech-001', notes: 'Installation caméras hall et caisses' },
      { id: 'I002', date: '2025-06-20', type: 'nvr', marque: 'Hikvision', modele: 'DS-7608NI-K2/8P', quantite: 1, statut: 'termine', technicien: 'Tech-001', notes: 'NVR principal 8 canaux' },
      { id: 'I003', date: '2026-02-10', type: 'camera', marque: 'Dahua', modele: 'IPC-HDW3641T-ZAS', quantite: 4, statut: 'planifie', technicien: 'Tech-002', notes: 'Extension zone parking' },
    ],
    interventions: [
      { id: 'INT001', date: '2026-01-10', type: 'maintenance', description: 'Maintenance trimestrielle NVR', statut: 'resolu', priorite: 'moyenne', technicien: 'Tech-001', duree: 2 },
      { id: 'INT002', date: '2026-01-14', type: 'panne', description: 'Caméra C-45 offline', statut: 'en_cours', priorite: 'haute', technicien: 'Tech-003', duree: 1.5 },
    ],
    contrats: [
      { id: 'CT001', numero: 'CTR-2025-001', type: 'complet', dateDebut: '2025-01-01', dateFin: '2026-12-31', montant: 24000, statut: 'actif' },
    ],
    notes: ['Client satisfait du service', 'Demande extension parking en cours'],
    score: 92,
    lastContact: '2026-01-14',
    nextIntervention: '2026-02-10',
  },
  'S002': {
    siteId: 'S002',
    contacts: [
      { id: 'C003', nom: 'Bernard', prenom: 'Pierre', role: 'Directeur Magasin', email: 'p.bernard@retail.fr', telephone: '01 34 56 78 90', isPrimary: true },
    ],
    installations: [
      { id: 'I004', date: '2024-11-10', type: 'camera', marque: 'Axis', modele: 'P3245-LV', quantite: 8, statut: 'termine', technicien: 'Tech-002', notes: 'Caméras haut de gamme' },
    ],
    interventions: [
      { id: 'INT003', date: '2026-01-05', type: 'support', description: 'Configuration nouvelle caméra', statut: 'resolu', priorite: 'basse', technicien: 'Tech-002', duree: 1 },
    ],
    contrats: [
      { id: 'CT002', numero: 'CTR-2024-015', type: 'maintenance', dateDebut: '2024-11-01', dateFin: '2025-10-31', montant: 12000, statut: 'renouvellement' },
    ],
    notes: ['Contrat à renouveler rapidement'],
    score: 78,
    lastContact: '2026-01-05',
  },
  'S004': {
    siteId: 'S004',
    contacts: [
      { id: 'C004', nom: 'Lefebvre', prenom: 'Marie', role: 'Responsable Sûreté', email: 'm.lefebvre@retail.fr', telephone: '01 45 67 89 01', isPrimary: true },
      { id: 'C005', nom: 'Moreau', prenom: 'Luc', role: 'Directeur Technique', email: 'l.moreau@retail.fr', telephone: '06 98 76 54 32', isPrimary: false },
    ],
    installations: [
      { id: 'I005', date: '2025-09-01', type: 'camera', marque: 'Hikvision', modele: 'DS-2CD2T87G2-L', quantite: 20, statut: 'termine', technicien: 'Tech-001', notes: 'Site premium - 20 caméras 4K' },
      { id: 'I006', date: '2025-09-15', type: 'access', marque: 'Hikvision', modele: 'DS-K1T671MWX', quantite: 3, statut: 'termine', technicien: 'Tech-003', notes: 'Contrôle accès 3 portes' },
    ],
    interventions: [],
    contrats: [
      { id: 'CT003', numero: 'CTR-2025-008', type: 'complet', dateDebut: '2025-09-01', dateFin: '2027-08-31', montant: 48000, statut: 'actif' },
    ],
    notes: ['Site stratégique - VIP', 'Très satisfait du service'],
    score: 95,
    lastContact: '2026-01-12',
  },
};

// Initialize other sites with basic data
sites.forEach(site => {
  if (!crmData[site.id]) {
    crmData[site.id] = {
      siteId: site.id,
      contacts: [],
      installations: [],
      interventions: [],
      contrats: [],
      notes: [],
      score: 70,
      lastContact: '2025-12-01',
    };
  }
});

export const CRM: React.FC = () => {
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'installations' | 'interventions' | 'contrats'>('overview');

  const filteredSites = sites.filter(site => {
    const matchesSearch = searchTerm === '' || 
      site.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.adresse.toLowerCase().includes(searchTerm.toLowerCase());
    const crm = crmData[site.id];
    const matchesStatut = filterStatut === 'tous' || 
      (filterStatut === 'actif' && crm.contrats.some(c => c.statut === 'actif')) ||
      (filterStatut === 'renouvellement' && crm.contrats.some(c => c.statut === 'renouvellement')) ||
      (filterStatut === 'expire' && crm.contrats.some(c => c.statut === 'expire'));
    return matchesSearch && matchesStatut;
  });

  const selectedCRM = selectedSite ? crmData[selectedSite] : null;
  const selectedSiteData = selectedSite ? sites.find(s => s.id === selectedSite) : null;

  // KPIs
  const totalSites = sites.length;
  const sitesActifs = Object.values(crmData).filter(c => c.contrats.some(ct => ct.statut === 'actif')).length;
  const sitesRenouvellement = Object.values(crmData).filter(c => c.contrats.some(ct => ct.statut === 'renouvellement')).length;
  const interventionsOuvertes = Object.values(crmData).reduce((sum, c) => sum + c.interventions.filter(i => i.statut !== 'resolu').length, 0);
  const caTotal = Object.values(crmData).reduce((sum, c) => sum + c.contrats.reduce((s, ct) => s + (ct.statut === 'actif' ? ct.montant : 0), 0), 0);
  const scoreMoyen = Object.values(crmData).reduce((sum, c) => sum + c.score, 0) / Object.keys(crmData).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'camera': return <Camera size={16} />;
      case 'dvr': return <HardDrive size={16} />;
      case 'nvr': return <Server size={16} />;
      case 'alarm': return <Shield size={16} />;
      case 'access': return <UserCheck size={16} />;
      default: return <Video size={16} />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      camera: 'Caméra',
      dvr: 'DVR',
      nvr: 'NVR',
      alarm: 'Alarme',
      access: 'Contrôle accès',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase size={28} className="text-blue-600" />
            CRM - Gestion des Sites
          </h1>
          <p className="text-slate-500 text-sm">
            Gestion de la relation client, installations et interventions
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
          <Download size={16} />
          Exporter rapport
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard icon={<Building2 size={16} />} label="Sites total" value={totalSites} color="blue" />
        <KPICard icon={<CheckCircle size={16} />} label="Contrats actifs" value={sitesActifs} color="green" />
        <KPICard icon={<Clock size={16} />} label="À renouveler" value={sitesRenouvellement} color="orange" />
        <KPICard icon={<AlertCircle size={16} />} label="Interventions" value={interventionsOuvertes} color="red" />
        <KPICard icon={<DollarSign size={16} />} label="CA annuel" value={`${(caTotal / 1000).toFixed(0)}k€`} color="purple" />
        <KPICard icon={<Award size={16} />} label="Score moyen" value={scoreMoyen.toFixed(0)} color="emerald" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un site..."
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
            <option value="actif">Contrat actif</option>
            <option value="renouvellement">À renouveler</option>
            <option value="expire">Expiré</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sites List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Building2 size={16} />
                Sites ({filteredSites.length})
              </h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredSites.map(site => {
                const crm = crmData[site.id];
                const hasActiveContract = crm.contrats.some(c => c.statut === 'actif');
                const hasRenewal = crm.contrats.some(c => c.statut === 'renouvellement');
                const openInterventions = crm.interventions.filter(i => i.statut !== 'resolu').length;

                return (
                  <button
                    key={site.id}
                    onClick={() => setSelectedSite(site.id)}
                    className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition ${
                      selectedSite === site.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 text-sm">{site.nom}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{site.adresse}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                        crm.score >= 90 ? 'bg-green-100 text-green-700' :
                        crm.score >= 70 ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {crm.score}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {hasActiveContract && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                          Contrat actif
                        </span>
                      )}
                      {hasRenewal && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                          À renouveler
                        </span>
                      )}
                      {openInterventions > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded flex items-center gap-1">
                          <AlertCircle size={10} />
                          {openInterventions}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Site Details */}
        <div className="lg:col-span-2">
          {selectedCRM && selectedSiteData ? (
            <div className="space-y-4">
              {/* Site Header */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedSiteData.nom}</h2>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin size={14} />
                      {selectedSiteData.adresse}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                        {selectedSiteData.type}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                        {selectedSiteData.zone}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${
                      selectedCRM.score >= 90 ? 'bg-green-100 text-green-700' :
                      selectedCRM.score >= 70 ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      <Award size={16} />
                      Score: {selectedCRM.score}/100
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{selectedCRM.contacts.length}</p>
                    <p className="text-xs text-slate-500">Contacts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{selectedCRM.installations.length}</p>
                    <p className="text-xs text-slate-500">Installations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{selectedCRM.interventions.filter(i => i.statut !== 'resolu').length}</p>
                    <p className="text-xs text-slate-500">Interventions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{selectedCRM.contrats.filter(c => c.statut === 'actif').length}</p>
                    <p className="text-xs text-slate-500">Contrats actifs</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200">
                  <div className="flex overflow-x-auto">
                    {[
                      { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
                      { id: 'contacts', label: 'Contacts', icon: Users },
                      { id: 'installations', label: 'Installations', icon: Camera },
                      { id: 'interventions', label: 'Interventions', icon: ToolIcon },
                      { id: 'contrats', label: 'Contrats', icon: FileCheck },
                    ].map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Icon size={16} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-3">Dernière activité</h3>
                        <div className="bg-slate-50 rounded-lg p-4">
                          <p className="text-sm text-slate-600">
                            Dernier contact: <span className="font-medium">{new Date(selectedCRM.lastContact).toLocaleDateString('fr-FR')}</span>
                          </p>
                          {selectedCRM.nextIntervention && (
                            <p className="text-sm text-slate-600 mt-2">
                              Prochaine intervention: <span className="font-medium">{new Date(selectedCRM.nextIntervention).toLocaleDateString('fr-FR')}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-800 mb-3">Notes</h3>
                        <div className="space-y-2">
                          {selectedCRM.notes.length > 0 ? (
                            selectedCRM.notes.map((note, idx) => (
                              <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                                <p className="text-sm text-slate-700">{note}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400 italic">Aucune note</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contacts Tab */}
                  {activeTab === 'contacts' && (
                    <div className="space-y-3">
                      {selectedCRM.contacts.length > 0 ? (
                        selectedCRM.contacts.map(contact => (
                          <div key={contact.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                              {contact.prenom[0]}{contact.nom[0]}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-800">
                                  {contact.prenom} {contact.nom}
                                </h4>
                                {contact.isPrimary && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                    Principal
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600">{contact.role}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Mail size={12} />
                                  {contact.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone size={12} />
                                  {contact.telephone}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 italic text-center py-8">Aucun contact</p>
                      )}
                    </div>
                  )}

                  {/* Installations Tab */}
                  {activeTab === 'installations' && (
                    <div className="space-y-3">
                      {selectedCRM.installations.length > 0 ? (
                        selectedCRM.installations.map(inst => (
                          <div key={inst.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700">
                                  {getTypeIcon(inst.type)}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-slate-800">
                                    {getTypeLabel(inst.type)} - {inst.marque} {inst.modele}
                                  </h4>
                                  <p className="text-xs text-slate-500">
                                    {inst.quantite} unité{inst.quantite > 1 ? 's' : ''} • Installé le {new Date(inst.date).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                inst.statut === 'termine' ? 'bg-green-100 text-green-700' :
                                inst.statut === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                                inst.statut === 'planifie' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {inst.statut === 'termine' ? 'Terminé' :
                                 inst.statut === 'en_cours' ? 'En cours' :
                                 inst.statut === 'planifie' ? 'Planifié' : 'Maintenance'}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">{inst.notes}</p>
                            <p className="text-xs text-slate-400 mt-2">Technicien: {inst.technicien}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 italic text-center py-8">Aucune installation</p>
                      )}
                    </div>
                  )}

                  {/* Interventions Tab */}
                  {activeTab === 'interventions' && (
                    <div className="space-y-3">
                      {selectedCRM.interventions.length > 0 ? (
                        selectedCRM.interventions.map(interv => (
                          <div key={interv.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-slate-800">{interv.description}</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                  {new Date(interv.date).toLocaleDateString('fr-FR')} • {interv.duree}h • {interv.technicien}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  interv.priorite === 'critique' ? 'bg-red-100 text-red-700' :
                                  interv.priorite === 'haute' ? 'bg-orange-100 text-orange-700' :
                                  interv.priorite === 'moyenne' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {interv.priorite}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  interv.statut === 'resolu' ? 'bg-green-100 text-green-700' :
                                  interv.statut === 'en_cours' ? 'bg-blue-100 text-blue-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {interv.statut === 'resolu' ? 'Résolu' :
                                   interv.statut === 'en_cours' ? 'En cours' : 'Ouvert'}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">Type: {interv.type}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 italic text-center py-8">Aucune intervention</p>
                      )}
                    </div>
                  )}

                  {/* Contrats Tab */}
                  {activeTab === 'contrats' && (
                    <div className="space-y-3">
                      {selectedCRM.contrats.length > 0 ? (
                        selectedCRM.contrats.map(contrat => (
                          <div key={contrat.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-slate-800">{contrat.numero}</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                  {contrat.type === 'complet' ? 'Contrat complet' :
                                   contrat.type === 'maintenance' ? 'Maintenance' : 'Supervision'}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                contrat.statut === 'actif' ? 'bg-green-100 text-green-700' :
                                contrat.statut === 'renouvellement' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {contrat.statut === 'actif' ? 'Actif' :
                                 contrat.statut === 'renouvellement' ? 'À renouveler' : 'Expiré'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-slate-500">Date début</p>
                                <p className="font-medium text-slate-700">{new Date(contrat.dateDebut).toLocaleDateString('fr-FR')}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Date fin</p>
                                <p className="font-medium text-slate-700">{new Date(contrat.dateFin).toLocaleDateString('fr-FR')}</p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <p className="text-xs text-slate-500">Montant annuel</p>
                              <p className="text-lg font-bold text-slate-900">{contrat.montant.toLocaleString('fr-FR')} €</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 italic text-center py-8">Aucun contrat</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <Building2 size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Sélectionnez un site</h3>
              <p className="text-sm text-slate-400">
                Cliquez sur un site dans la liste pour voir les détails CRM
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components
interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ icon, label, value, color }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
};

const ToolIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
  </svg>
);
