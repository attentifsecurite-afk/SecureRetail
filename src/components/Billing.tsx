import React, { useState } from 'react';
import {
  FileText, Download, Plus, Search, Filter, Eye, Edit2, Trash2,
  CheckCircle, Clock, AlertCircle, DollarSign, Calendar, Building2,
  Mail, Phone, User, Hash, TrendingUp
} from 'lucide-react';
import { sites } from '../data/mockData';

interface Invoice {
  id: string;
  numero: string;
  client: string;
  siteId: string;
  date: string;
  echeance: string;
  montant: number;
  statut: 'brouillon' | 'envoyee' | 'payee' | 'en_retard' | 'annulee';
  type: 'facture' | 'devis' | 'avoir';
}

const mockInvoices: Invoice[] = [
  {
    id: 'INV001',
    numero: 'FAC-2026-001',
    client: 'Retail Group Paris',
    siteId: 'S001',
    date: '2026-01-01',
    echeance: '2026-01-31',
    montant: 24000,
    statut: 'payee',
    type: 'facture',
  },
  {
    id: 'INV002',
    numero: 'FAC-2026-002',
    client: 'Luxury Brand',
    siteId: 'S002',
    date: '2026-01-05',
    echeance: '2026-02-05',
    montant: 12000,
    statut: 'envoyee',
    type: 'facture',
  },
  {
    id: 'INV003',
    numero: 'DEV-2026-003',
    client: 'SecurTech Solutions',
    siteId: 'S004',
    date: '2026-01-10',
    echeance: '2026-02-10',
    montant: 48000,
    statut: 'envoyee',
    type: 'devis',
  },
  {
    id: 'INV004',
    numero: 'FAC-2025-045',
    client: 'Fashion Store',
    siteId: 'S003',
    date: '2025-12-15',
    echeance: '2026-01-15',
    montant: 8500,
    statut: 'en_retard',
    type: 'facture',
  },
];

export const Billing: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [filterType, setFilterType] = useState<string>('tous');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = searchTerm === '' ||
      inv.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === 'tous' || inv.statut === filterStatut;
    const matchesType = filterType === 'tous' || inv.type === filterType;
    return matchesSearch && matchesStatut && matchesType;
  });

  const stats = {
    total: invoices.length,
    payee: invoices.filter(i => i.statut === 'payee').reduce((sum, i) => sum + i.montant, 0),
    enAttente: invoices.filter(i => i.statut === 'envoyee').reduce((sum, i) => sum + i.montant, 0),
    enRetard: invoices.filter(i => i.statut === 'en_retard').reduce((sum, i) => sum + i.montant, 0),
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'payee': return { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Payée' };
      case 'envoyee': return { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Envoyée' };
      case 'en_retard': return { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'En retard' };
      case 'brouillon': return { color: 'bg-slate-100 text-slate-700', icon: Edit2, label: 'Brouillon' };
      case 'annulee': return { color: 'bg-slate-100 text-slate-500', icon: Trash2, label: 'Annulée' };
      default: return { color: 'bg-slate-100 text-slate-700', icon: FileText, label: statut };
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'facture': return { color: 'bg-blue-100 text-blue-700', label: 'Facture' };
      case 'devis': return { color: 'bg-purple-100 text-purple-700', label: 'Devis' };
      case 'avoir': return { color: 'bg-orange-100 text-orange-700', label: 'Avoir' };
      default: return { color: 'bg-slate-100 text-slate-700', label: type };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText size={28} className="text-blue-600" />
            Facturation & Devis
          </h1>
          <p className="text-slate-500 text-sm">
            Gérez vos factures, devis et avoirs
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Nouvelle facture
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} className="text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="text-xs text-slate-500">Documents</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-600" />
            <span className="text-xs text-green-600 font-medium">Payé</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{(stats.payee / 1000).toFixed(1)}k€</p>
          <p className="text-xs text-green-600">Encaissé</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">En attente</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{(stats.enAttente / 1000).toFixed(1)}k€</p>
          <p className="text-xs text-blue-600">À encaisser</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-red-600" />
            <span className="text-xs text-red-600 font-medium">En retard</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{(stats.enRetard / 1000).toFixed(1)}k€</p>
          <p className="text-xs text-red-600">À relancer</p>
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
            <option value="payee">Payée</option>
            <option value="envoyee">Envoyée</option>
            <option value="en_retard">En retard</option>
            <option value="brouillon">Brouillon</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tous">Tous les types</option>
            <option value="facture">Factures</option>
            <option value="devis">Devis</option>
            <option value="avoir">Avoirs</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Numéro</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Échéance</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Montant</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Statut</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map(invoice => {
                const statut = getStatutBadge(invoice.statut);
                const type = getTypeBadge(invoice.type);
                const StatutIcon = statut.icon;
                return (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono font-medium text-slate-900">{invoice.numero}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">{invoice.client}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${type.color}`}>
                        {type.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">
                        {new Date(invoice.date).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-600">
                        {new Date(invoice.echeance).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-slate-900">
                        {invoice.montant.toLocaleString('fr-FR')} €
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statut.color}`}>
                        <StatutIcon size={12} />
                        {statut.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 hover:bg-slate-100 rounded transition" title="Voir">
                          <Eye size={14} className="text-slate-600" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded transition" title="Télécharger">
                          <Download size={14} className="text-slate-600" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded transition" title="Modifier">
                          <Edit2 size={14} className="text-slate-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Nouvelle facture</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option>Retail Group Paris</option>
                    <option>Luxury Brand</option>
                    <option>SecurTech Solutions</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Site</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    {sites.map(site => (
                      <option key={site.id} value={site.id}>{site.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Échéance</label>
                  <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Description du service..."></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Montant HT</label>
                  <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">TVA</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                    <option>20%</option>
                    <option>10%</option>
                    <option>5.5%</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                Annuler
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                Créer la facture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
