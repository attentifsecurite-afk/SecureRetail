import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export const Spinner: React.FC<{ label?: string }> = ({ label = 'Chargement des données...' }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-10 flex items-center justify-center">
    <div className="text-center">
      <Loader2 size={28} className="text-blue-600 animate-spin mx-auto mb-3" />
      <p className="text-slate-500 text-sm">{label}</p>
    </div>
  </div>
);

export const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
    <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-sm font-medium text-red-800">Erreur de connexion à la base de données</p>
      <p className="text-xs text-red-600 mt-0.5">{message}</p>
    </div>
  </div>
);

export const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
    <p className="text-slate-400 text-sm">{label}</p>
  </div>
);

export const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({
  title,
  onClose,
  children,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-xl">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
          ×
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

export const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  full?: boolean;
}> = ({ label, required, children, full }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <label className="block text-xs font-medium text-slate-600 mb-1">
      {label}
      {required ? ' *' : ''}
    </label>
    {children}
  </div>
);

export const inputClass =
  'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
