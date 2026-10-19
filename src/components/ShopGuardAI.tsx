import React, { useState, useEffect, useRef } from 'react';
import {
  Brain, Activity, Cpu, MemoryStick, Zap, AlertTriangle,
  Eye, Camera, Shield, TrendingUp, Clock, CheckCircle2,
  XCircle, Wifi, Settings, Play, Pause, BarChart3, Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { sites } from '../data/mockData';

// ─── Types ────────────────────────────────────────────
interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
  track_id: number | null;
}

interface GuardDecision {
  alert: boolean;
  level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reason: string;
  recommended_action: string;
}

interface FrameResult {
  camera_id: string;
  location: string;
  detections: Detection[];
  tracks: Detection[];
  pose_count: number;
  decision: GuardDecision;
  latency_ms: number;
  memory_mb: number;
  fps: number;
  timestamp: string;
}

interface AlertEvent {
  id: string;
  camera_id: string;
  location: string;
  level: string;
  reason: string;
  action: string;
  timestamp: string;
  detections_count: number;
  confidence: number;
}

// ─── Simulation data ──────────────────────────────────
const CAMERA_IDS = ['entrance', 'rayon_electro', 'rayon_cosmetique', 'caisse_1', 'reserve_acces', 'parking_p2'];
const LOCATIONS: Record<string, string> = {
  entrance: 'Entrée principale — Paris Châtelet',
  rayon_electro: 'Rayon Électronique — Paris Opéra',
  rayon_cosmetique: 'Rayon Cosmétique — La Défense',
  caisse_1: 'Caisse 1 — Velizy 2',
  reserve_acces: 'Accès Réserve — Rosny 2',
  parking_p2: 'Parking P2 — Paris Bastille',
};

const CLASSES = ['person', 'backpack', 'handbag', 'bottle', 'cell phone', 'shopping cart'];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateDetections(): Detection[] {
  const count = Math.floor(randomBetween(1, 6));
  return Array.from({ length: count }, (_, i) => ({
    class: CLASSES[Math.floor(Math.random() * CLASSES.length)],
    confidence: parseFloat(randomBetween(0.42, 0.98).toFixed(3)),
    bbox: [
      parseFloat(randomBetween(50, 400).toFixed(1)),
      parseFloat(randomBetween(50, 300).toFixed(1)),
      parseFloat(randomBetween(450, 640).toFixed(1)),
      parseFloat(randomBetween(350, 480).toFixed(1)),
    ] as [number, number, number, number],
    track_id: Math.random() > 0.3 ? Math.floor(randomBetween(1, 50)) : null,
  }));
}

function generateDecision(detections: Detection[]): GuardDecision {
  const persons = detections.filter(d => d.class === 'person').length;
  const hasBags = detections.some(d => ['backpack', 'handbag'].includes(d.class));
  const avgConf = detections.reduce((s, d) => s + d.confidence, 0) / detections.length;

  // Simulate LLM Guard logic
  const rand = Math.random();
  if (persons >= 3 && hasBags && rand > 0.85) {
    return {
      alert: true,
      level: 'high',
      confidence: parseFloat(randomBetween(0.72, 0.91).toFixed(2)),
      reason: 'Groupe avec sacs en zone sensible — comportement suspect détecté',
      recommended_action: 'staff_check',
    };
  }
  if (persons >= 2 && hasBags && rand > 0.92) {
    return {
      alert: true,
      level: 'critical',
      confidence: parseFloat(randomBetween(0.85, 0.96).toFixed(2)),
      reason: 'Dissimulation probable + loitering > 25s — intervention requise',
      recommended_action: 'immediate_intervention',
    };
  }
  if (hasBags && rand > 0.75) {
    return {
      alert: true,
      level: 'low',
      confidence: parseFloat(randomBetween(0.45, 0.65).toFixed(2)),
      reason: 'Présence sac — surveillance recommandée',
      recommended_action: 'observe',
    };
  }
  return {
    alert: false,
    level: 'none',
    confidence: parseFloat(randomBetween(0.1, 0.4).toFixed(2)),
    reason: 'Aucun signal fort — situation normale',
    recommended_action: 'none',
  };
}

// ─── Component ────────────────────────────────────────
export const ShopGuardAI: React.FC = () => {
  const [engineRunning, setEngineRunning] = useState(true);
  const [results, setResults] = useState<Record<string, FrameResult>>({});
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [metrics, setMetrics] = useState<{ time: string; latency: number; fps: number; memory: number }[]>([]);
  const [totalFrames, setTotalFrames] = useState(0);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState<string>('entrance');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate engine processing
  useEffect(() => {
    if (!engineRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      // Process 1-2 cameras per tick
      const camsToProcess = CAMERA_IDS.filter(() => Math.random() > 0.3);

      camsToProcess.forEach(camId => {
        const detections = generateDetections();
        const decision = generateDecision(detections);
        const latency = parseFloat(randomBetween(18, 85).toFixed(1));
        const fps = parseFloat(randomBetween(22, 45).toFixed(1));
        const memory = parseFloat(randomBetween(2800, 4200).toFixed(0));

        const result: FrameResult = {
          camera_id: camId,
          location: LOCATIONS[camId],
          detections,
          tracks: detections.filter(d => d.track_id !== null),
          pose_count: Math.floor(randomBetween(0, detections.filter(d => d.class === 'person').length + 1)),
          decision,
          latency_ms: latency,
          memory_mb: memory,
          fps,
          timestamp: new Date().toLocaleTimeString('fr-FR'),
        };

        setResults(prev => ({ ...prev, [camId]: result }));
        setTotalFrames(prev => prev + 1);

        // Add alert if needed
        if (decision.alert && (decision.level === 'high' || decision.level === 'critical')) {
          const alert: AlertEvent = {
            id: `AL-${Date.now()}-${camId}`,
            camera_id: camId,
            location: LOCATIONS[camId],
            level: decision.level,
            reason: decision.reason,
            action: decision.recommended_action,
            timestamp: result.timestamp,
            detections_count: detections.length,
            confidence: decision.confidence,
          };
          setAlerts(prev => [alert, ...prev].slice(0, 50));
          setTotalAlerts(prev => prev + 1);
        }
      });

      // Update metrics
      setMetrics(prev => {
        const latest = Object.values(results)[0];
        const newMetric = {
          time: new Date().toLocaleTimeString('fr-FR', { minute: '2-digit', second: '2-digit' }),
          latency: latest?.latency_ms || randomBetween(20, 70),
          fps: latest?.fps || randomBetween(25, 40),
          memory: latest?.memory_mb || randomBetween(3000, 4000),
        };
        return [...prev, newMetric].slice(-30);
      });
    }, 800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [engineRunning]);

  const currentResult = results[selectedCamera];
  const activeAlerts = alerts.filter(a => a.level === 'critical' || a.level === 'high').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="text-purple-600" size={28} />
            ShopGuard Ultimate Engine
          </h1>
          <p className="text-slate-500 text-sm">
            Multi-Camera + YOLO26 + Pose + TensorRT + LLM Guard + Memory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            engineRunning ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${engineRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            {engineRunning ? 'Engine actif' : 'Engine stoppé'}
          </span>
          <button
            onClick={() => setEngineRunning(!engineRunning)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
              engineRunning
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {engineRunning ? <Pause size={14} /> : <Play size={14} />}
            {engineRunning ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>

      {/* Architecture Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-blue-900 rounded-xl p-5 text-white">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur font-medium">YOLO26s</span>
          <span className="text-purple-300">→</span>
          <span className="px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur font-medium">BoT-SORT Tracker</span>
          <span className="text-purple-300">→</span>
          <span className="px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur font-medium">YOLO26n-Pose</span>
          <span className="text-purple-300">→</span>
          <span className="px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur font-medium">LLM Guard</span>
          <span className="text-purple-300">→</span>
          <span className="px-2.5 py-1 bg-white/10 rounded-lg backdrop-blur font-medium">Memory Guard</span>
          <span className="text-purple-300">→</span>
          <span className="px-2.5 py-1 bg-green-500/30 rounded-lg backdrop-blur font-medium border border-green-400/30">Decision</span>
        </div>
        <p className="text-xs text-slate-300 mt-3">
          Pipeline complet : détection → tracking → pose → corrélation historique → décision LLM → action
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MiniKPI icon={<Camera size={16} />} label="Caméras" value={CAMERA_IDS.length.toString()} color="blue" />
        <MiniKPI icon={<Activity size={16} />} label="FPS moyen" value={currentResult?.fps.toFixed(0) || '—'} color="green" />
        <MiniKPI icon={<Zap size={16} />} label="Latence" value={`${currentResult?.latency_ms.toFixed(0) || '—'}ms`} color="purple" />
        <MiniKPI icon={<MemoryStick size={16} />} label="Mémoire" value={`${((currentResult?.memory_mb || 0) / 1024).toFixed(1)}GB`} color="orange" />
        <MiniKPI icon={<Target size={16} />} label="Frames" value={totalFrames.toString()} color="cyan" />
        <MiniKPI icon={<AlertTriangle size={16} />} label="Alertes" value={totalAlerts.toString()} color="red" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Camera Feed + Detections */}
        <div className="lg:col-span-2 space-y-4">
          {/* Camera Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Camera size={16} /> Flux caméra — {selectedCamera}
              </h3>
              <span className="text-xs text-slate-400">{currentResult?.location}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {CAMERA_IDS.map(cam => (
                <button
                  key={cam}
                  onClick={() => setSelectedCamera(cam)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedCamera === cam
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cam}
                </button>
              ))}
            </div>

            {/* Simulated Video Feed */}
            <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
              {engineRunning ? (
                <>
                  {/* Simulated detection overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 border-2 border-green-400/50 rounded-full animate-pulse mx-auto mb-2 flex items-center justify-center">
                        <Eye size={24} className="text-green-400" />
                      </div>
                      <p className="text-green-400 text-xs font-mono">ANALYSIS ACTIVE</p>
                      <p className="text-slate-500 text-xs mt-1">{currentResult?.timestamp}</p>
                    </div>
                  </div>

                  {/* Detection boxes overlay */}
                  {currentResult?.detections.map((det, idx) => (
                    <div
                      key={idx}
                      className={`absolute border-2 rounded-sm ${
                        det.class === 'person' ? 'border-green-400' :
                        ['backpack', 'handbag'].includes(det.class) ? 'border-yellow-400' :
                        'border-blue-400'
                      }`}
                      style={{
                        left: `${(det.bbox[0] / 640) * 100}%`,
                        top: `${(det.bbox[1] / 480) * 100}%`,
                        width: `${((det.bbox[2] - det.bbox[0]) / 640) * 100}%`,
                        height: `${((det.bbox[3] - det.bbox[1]) / 480) * 100}%`,
                      }}
                    >
                      <span className={`absolute -top-5 left-0 text-[10px] px-1 rounded font-mono ${
                        det.class === 'person' ? 'bg-green-500 text-white' :
                        ['backpack', 'handbag'].includes(det.class) ? 'bg-yellow-500 text-black' :
                        'bg-blue-500 text-white'
                      }`}>
                        {det.class} {(det.confidence * 100).toFixed(0)}%
                        {det.track_id && ` #${det.track_id}`}
                      </span>
                    </div>
                  ))}

                  {/* Status bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-3 py-1.5 flex items-center justify-between text-xs font-mono">
                    <span className="text-green-400">
                      {currentResult?.detections.length || 0} detections • {currentResult?.tracks.length || 0} tracks • {currentResult?.pose_count || 0} poses
                    </span>
                    <span className="text-slate-400">
                      {currentResult?.fps || 0} FPS | {currentResult?.latency_ms || 0}ms
                    </span>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Pause size={32} className="text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Engine en pause</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LLM Guard Decision */}
          {currentResult && (
            <div className={`rounded-xl border p-5 ${
              currentResult.decision.alert
                ? currentResult.decision.level === 'critical' ? 'bg-red-50 border-red-200' :
                  currentResult.decision.level === 'high' ? 'bg-orange-50 border-orange-200' :
                  'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Brain size={16} className="text-purple-600" />
                  LLM Guard — Décision
                </h3>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  currentResult.decision.level === 'critical' ? 'bg-red-600 text-white' :
                  currentResult.decision.level === 'high' ? 'bg-orange-500 text-white' :
                  currentResult.decision.level === 'medium' ? 'bg-yellow-500 text-black' :
                  currentResult.decision.level === 'low' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {currentResult.decision.level.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Alerte</p>
                  <p className="text-sm font-bold flex items-center gap-1">
                    {currentResult.decision.alert ? (
                      <><XCircle size={14} className="text-red-500" /> OUI</>
                    ) : (
                      <><CheckCircle2 size={14} className="text-green-500" /> NON</>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Confiance</p>
                  <p className="text-sm font-bold">{(currentResult.decision.confidence * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Action recommandée</p>
                  <p className="text-sm font-medium">
                    {currentResult.decision.recommended_action === 'none' && '— Aucune'}
                    {currentResult.decision.recommended_action === 'observe' && '👁️ Observer'}
                    {currentResult.decision.recommended_action === 'staff_check' && '👤 Vérification personnel'}
                    {currentResult.decision.recommended_action === 'immediate_intervention' && '🚨 Intervention immédiate'}
                  </p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-white/60 rounded-lg">
                <p className="text-sm text-slate-700 italic">"{currentResult.decision.reason}"</p>
              </div>
            </div>
          )}

          {/* Metrics Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={16} /> Métriques temps réel
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="latency" stroke="#8b5cf6" fill="#8b5cf680" name="Latence (ms)" />
                <Area type="monotone" dataKey="fps" stroke="#22c55e" fill="#22c55e40" name="FPS" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right — Alerts + Config */}
        <div className="space-y-4">
          {/* Active Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              Alertes récentes
              {activeAlerts > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                  {activeAlerts}
                </span>
              )}
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Aucune alerte</p>
              ) : (
                alerts.slice(0, 10).map(alert => (
                  <div key={alert.id} className={`p-2.5 rounded-lg border text-xs ${
                    alert.level === 'critical' ? 'bg-red-50 border-red-200' :
                    alert.level === 'high' ? 'bg-orange-50 border-orange-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold">{alert.camera_id}</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        alert.level === 'critical' ? 'bg-red-600 text-white' :
                        alert.level === 'high' ? 'bg-orange-500 text-white' :
                        'bg-yellow-500 text-black'
                      }`}>
                        {alert.level}
                      </span>
                    </div>
                    <p className="text-slate-600">{alert.reason}</p>
                    <div className="flex items-center justify-between mt-1 text-slate-400">
                      <span>{alert.timestamp}</span>
                      <span>Conf: {(alert.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Engine Config */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Settings size={16} /> Configuration Engine
            </h3>
            <div className="space-y-2 text-xs">
              <ConfigRow label="Détecteur" value="YOLO26s" />
              <ConfigRow label="Pose" value="YOLO26n-Pose" />
              <ConfigRow label="Tracker" value="BoT-SORT" />
              <ConfigRow label="TensorRT" value="Désactivé" />
              <ConfigRow label="Device" value="CUDA" />
              <ConfigRow label="Workers" value="2" />
              <ConfigRow label="Queue size" value="64" />
              <ConfigRow label="Confidence" value="0.40" />
              <ConfigRow label="Max Memory" value="6 GB" />
              <ConfigRow label="Img Size" value="640×640" />
            </div>
          </div>

          {/* LLM Guard Prompt Preview */}
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Brain size={14} className="text-purple-400" />
              LLM Guard — Prompt
            </h3>
            <pre className="text-[10px] text-slate-300 font-mono leading-relaxed overflow-x-auto">
              {`Tu es un systeme de securite
magasin ultra-strict.

### Regles absolues
1. Une simple presence n'est
   JAMAIS une alerte.
2. Alerte UNIQUEMENT si 2+
   signaux forts coincident.
3. En cas de doute = pas
   d'alerte.
4. Privilegie la precision.

### Format: JSON
{
  "alert": bool,
  "level": "none|low|...",
  "confidence": 0.0-1.0,
  "reason": "...",
  "action": "none|observe|..."
}`}
            </pre>
          </div>

          {/* Memory Guard */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Cpu size={16} /> Memory Guard
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">RAM utilisée</span>
                  <span className="font-medium">{((currentResult?.memory_mb || 3500) / 6144 * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      (currentResult?.memory_mb || 3500) > 5500 ? 'bg-red-500' :
                      (currentResult?.memory_mb || 3500) > 4500 ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${((currentResult?.memory_mb || 3500) / 6144) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {(currentResult?.memory_mb || 3500).toFixed(0)} MB / 6144 MB max
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Wifi size={12} className="text-green-500" />
                <span className="text-slate-600">CUDA cache : actif</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 size={12} className="text-green-500" />
                <span className="text-slate-600">GC : dernier cleanup il y a 12s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RGPD Notice */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
        <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
          <Shield size={16} />
          Cadre légal & éthique
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-700">
          <div className="flex items-start gap-2">
            <XCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <span>Aucune reconnaissance faciale activée</span>
          </div>
          <div className="flex items-start gap-2">
            <XCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <span>Pas de profilage biométrique individuel</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>Détections anonymisées (track IDs temporaires)</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>LLM Guard : pas de faux positifs par principe</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>Données non persistées au-delà de 30 jours</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>Conforme CNIL — DPIA réalisée</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────
interface MiniKPIProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const MiniKPI: React.FC<MiniKPIProps> = ({ icon, label, value, color }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    red: 'bg-red-50 text-red-600',
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

const ConfigRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-800 font-mono">{value}</span>
  </div>
);
