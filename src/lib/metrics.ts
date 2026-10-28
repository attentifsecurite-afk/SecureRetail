import type { Alarme, Evenement, IndicateurDI, Ronde } from '../types';

const PARIS_TZ = 'Europe/Paris';

export function dayKey(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('fr-CA', { timeZone: PARIS_TZ });
}

export function parisToday(): string {
  return dayKey(new Date());
}

export function last7Days(): string[] {
  const days: string[] = [];
  const now = Date.now();
  for (let i = 6; i >= 0; i--) {
    days.push(dayKey(new Date(now - i * 24 * 60 * 60 * 1000)));
  }
  return days;
}

export function dayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  const s = d.toLocaleDateString('fr-FR', { weekday: 'short' });
  return s.charAt(0).toUpperCase() + s.replace('.', '').slice(1, 3);
}

export function monthLabel(periode: string): string {
  const d = new Date(`${periode}-15T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return periode;
  const s = d.toLocaleDateString('fr-FR', { month: 'short' });
  return s.charAt(0).toUpperCase() + s.replace('.', '').slice(1, 3);
}

export function buildIncidentsSeries(evenements: Evenement[], alarmes: Alarme[]) {
  return last7Days().map((d) => ({
    jour: dayLabel(d),
    incidents: evenements.filter((e) => dayKey(e.horodatage) === d).length,
    alarmes: alarmes.filter((a) => dayKey(a.horodatage) === d).length,
  }));
}

export function buildRondesSeries(rondes: Ronde[]) {
  return last7Days().map((d) => ({
    jour: dayLabel(d),
    rondes: rondes.filter((r) => r.datePrevue === d).length,
  }));
}

export function buildDITrend(indicateurs: IndicateurDI[]) {
  const parPeriode = new Map<string, number>();
  indicateurs.forEach((i) => {
    parPeriode.set(i.periode, (parPeriode.get(i.periode) ?? 0) + Math.abs(i.ecart));
  });
  return [...parPeriode.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([periode, valeur]) => ({ mois: monthLabel(periode), valeur }));
}

export function buildAlarmesParCategorie(alarmes: Alarme[]) {
  const catLabels: Record<string, string> = {
    Intrusion: 'Intrusion',
    EAS: 'EAS/Antivol',
    Incendie: 'Incendie',
    Accès: 'Accès',
    Technique: 'Technique',
  };
  const counts = new Map<string, number>();
  alarmes.forEach((a) => {
    const label = catLabels[a.categorie] ?? a.categorie;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export function buildIncidentsParCategorie(evenements: Evenement[]) {
  const counts = new Map<string, number>();
  evenements.forEach((e) => {
    counts.set(e.categorie, (counts.get(e.categorie) ?? 0) + 1);
  });
  return counts;
}

export function formatDelai(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}min ${sec}s`;
}

export function delaiMoyenAlarmes(alarmes: Alarme[]): number | null {
  const traitees = alarmes.filter((a) => a.traiteeA);
  if (traitees.length === 0) return null;
  const total = traitees.reduce((sum, a) => sum + (new Date(a.traiteeA!).getTime() - new Date(a.horodatage).getTime()), 0);
  return total / traitees.length;
}

export function safePct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export function carteProStatus(expiry: string): 'expiree' | 'bientot' | 'valide' {
  if (!expiry) return 'valide';
  const diff = new Date(expiry).getTime() - Date.now();
  if (diff < 0) return 'expiree';
  if (diff < 90 * 24 * 60 * 60 * 1000) return 'bientot';
  return 'valide';
}

export function minutesBetween(hhmmA: string, hhmmB: string): number {
  const [ha, ma] = hhmmA.split(':').map(Number);
  const [hb, mb] = hhmmB.split(':').map(Number);
  return ha * 60 + ma - (hb * 60 + mb);
}
