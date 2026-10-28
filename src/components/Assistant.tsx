import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, User, Sparkles, AlertTriangle, ShieldAlert, Camera, Loader2 } from 'lucide-react';
import { useData } from '../data/DataContext';
import { ErrorBanner } from './Shared';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
}

const SUGGESTIONS = [
  'Fais le résumé de la situation actuelle',
  'Quelles alarmes dois-je traiter en priorité ?',
  'Analyse les sites à risque et leurs faiblesses',
  'Quelles actions recommandes-tu pour la journée ?',
  'Y a-t-il des anomalies de démarque à investiguer ?',
];

export const Assistant: React.FC = () => {
  const { state, error } = useData();
  const { alarmes, evenements, cameras } = state;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const activeAlarmes = alarmes.filter(a => a.statut === 'active' || a.statut === 'en_traitement').length;
  const incidentsOuverts = evenements.filter(e => e.statut !== 'cloture').length;
  const camerasOffline = cameras.filter(c => c.statut === 'offline').length;

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || sending) return;
    setSendError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setInput('');
    setSending(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.slice(-12).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const body = await res.json().catch(() => null) as { reply?: string; provider?: string; error?: string } | null;
      if (!res.ok) throw new Error(body?.error ?? `Erreur ${res.status}`);
      setMessages(prev => [...prev, { role: 'assistant', content: body?.reply ?? '', provider: body?.provider }]);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Erreur de communication avec l\'assistant');
    } finally {
      setSending(false);
    }
  };

  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bot size={28} className="text-purple-600" />
            Assistant IA — pilotage du système
          </h1>
          <p className="text-slate-500 text-sm">
            Analyse en direct des données opérationnelles et recommandations d'actions
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full font-medium">
            {activeAlarmes} alarme(s)
          </span>
          <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full font-medium">
            {incidentsOuverts} incident(s)
          </span>
          <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full font-medium flex items-center gap-1">
            <Camera size={12} /> {camerasOffline} offline
          </span>
        </div>
      </div>

      {/* Chat */}
      <div className="bg-white rounded-xl border border-slate-200 flex flex-col" style={{ height: '600px' }}>
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles size={24} className="text-purple-600" />
              </div>
              <p className="font-medium text-slate-800">Posez votre question au système</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                L'assistant dispose de l'état réel de la plateforme : sites, agents, alarmes, incidents,
                rondes, caméras et démarque.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
              </div>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.role === 'assistant' && msg.provider && (
                  <p className="text-[10px] text-slate-400 mt-2">source : {msg.provider}</p>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                <Bot size={15} />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl rounded-tl-sm px-4 py-3">
                <Loader2 size={16} className="animate-spin text-purple-600" />
              </div>
            </div>
          )}
        </div>

        {sendError && (
          <div className="mx-4 mb-2 flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg p-3">
            <AlertTriangle size={14} className="text-red-600 mt-0.5" />
            <p className="text-xs text-red-700">{sendError}</p>
          </div>
        )}

        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-purple-50 hover:text-purple-700 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
              placeholder="Ex : que dois-je traiter en priorité sur Paris Châtelet ?"
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={() => send(input)}
              disabled={sending || !input.trim()}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <ShieldAlert size={10} />
            L'assistant recommande, l'opérateur décide : aucune action n'est exécutée automatiquement.
          </p>
        </div>
      </div>
    </div>
  );
};
