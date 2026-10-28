import type { Config, Context } from "@netlify/functions";
import OpenAI from "openai";
import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { sites, agents, alarmes, evenements, rondes, cameras, indicateursDI } from "../../db/schema.js";
import { ensureSeed } from "../../db/seed.js";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

const fmt = (d: Date | string) =>
  new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });

async function buildContext(): Promise<string> {
  await ensureSeed();
  const [siteRows, agentRows, alarmeRows, eventRows, rondeRows, cameraRows, diRows] = await Promise.all([
    db.select().from(sites).orderBy(desc(sites.scoreRisque)),
    db.select().from(agents),
    db.select().from(alarmes).orderBy(desc(alarmes.horodatage)),
    db.select().from(evenements).orderBy(desc(evenements.horodatage)),
    db.select().from(rondes).orderBy(desc(rondes.datePrevue)),
    db.select().from(cameras),
    db.select().from(indicateursDI).orderBy(desc(indicateursDI.periode)),
  ]);

  const today = new Date().toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
  const activeAlarmes = alarmeRows.filter((a) => a.statut === "active" || a.statut === "en_traitement");
  const openEvents = eventRows.filter((e) => e.statut !== "cloture");
  const offlineCameras = cameraRows.filter((c) => c.statut === "offline");
  const todayRondes = rondeRows.filter((r) => r.datePrevue === today);
  const latestPeriode = diRows[0]?.periode;
  const diPeriode = diRows.filter((d) => d.periode === latestPeriode);

  const lines: string[] = [];
  lines.push(`Date du jour : ${today}`);
  lines.push(`Sites : ${siteRows.length} | Agents : ${agentRows.length} (en service : ${agentRows.filter((a) => a.statut === "en_service").length})`);
  lines.push(`Alarmes actives : ${activeAlarmes.length} | Incidents ouverts : ${openEvents.length} | Caméras offline : ${offlineCameras.length}`);
  lines.push(
    `Rondes du jour : ${todayRondes.length} (terminées ${todayRondes.filter((r) => r.statut === "terminee").length}, en cours ${todayRondes.filter((r) => r.statut === "en_cours").length}, manquées ${todayRondes.filter((r) => r.statut === "manquee").length})`,
  );

  if (activeAlarmes.length > 0) {
    lines.push("Alarmes en cours :");
    activeAlarmes.slice(0, 8).forEach((a) => {
      const site = siteRows.find((s) => s.id === a.siteId);
      lines.push(`- [${a.priorite}] ${a.type} — ${site?.nom ?? a.siteId} / ${a.zone} — ${fmt(a.horodatage)} — statut ${a.statut}`);
    });
  }

  if (openEvents.length > 0) {
    lines.push("Incidents ouverts (10 plus récents) :");
    openEvents.slice(0, 10).forEach((e) => {
      const site = siteRows.find((s) => s.id === e.siteId);
      lines.push(`- [${e.gravite}] ${e.categorie} — ${site?.nom ?? e.siteId} / ${e.zone} — ${fmt(e.horodatage)} — ${e.description.slice(0, 120)}`);
    });
  }

  if (offlineCameras.length > 0) {
    lines.push("Caméras hors ligne :");
    offlineCameras.slice(0, 8).forEach((c) => {
      const site = siteRows.find((s) => s.id === c.siteId);
      lines.push(`- ${c.nom} (${c.id}) — ${site?.nom ?? c.siteId} / ${c.zone}`);
    });
  }

  const topRisque = siteRows.slice(0, 5);
  lines.push(`Sites à plus fort risque : ${topRisque.map((s) => `${s.nom} (${s.scoreRisque}/100)`).join(", ")}`);

  if (diPeriode.length > 0) {
    const totalEcart = diPeriode.reduce((sum, d) => sum + d.ecart, 0);
    const totalValeur = diPeriode.reduce((sum, d) => sum + d.valeur, 0);
    lines.push(
      `Démarque inconnue (${latestPeriode}) : écart total ${Math.abs(totalEcart)} € sur ${totalValeur} € de valeur analysée`,
    );
    diPeriode
      .slice()
      .sort((a, b) => a.ecart - b.ecart)
      .slice(0, 3)
      .forEach((d) => {
        const site = siteRows.find((s) => s.id === d.siteId);
        lines.push(`- ${site?.nom ?? d.siteId} / ${d.familleProduit} : ${d.ecart} €`);
      });
  }

  return lines.join("\n");
}

const SYSTEM_PROMPT = `Tu es l'assistant IA de Secutor, la plateforme de pilotage sûreté d'un réseau de magasins retail (Paris et grande couronne).
Ton rôle : aider la direction sûreté et les exploitants à piloter le système en temps réel.
À partir des données système fournies ci-dessous, tu analyses la situation, tu priorises, tu recommandes des actions concrètes (levées de doute, affectations d'agents, rondes, vérifications caméras, escalades).
Règles : réponds toujours en français ; sois concis et opérationnel ; structure ta réponse avec des puces courtes ; cite les sites, zones et horaires exacts des données ; n'invente jamais de données absentes ; signale les risques critiques en premier.
Tu n'as pas la capacité d'exécuter des actions directement : tes recommandations seront appliquées par un opérateur humain.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function callNim(history: ChatMessage[], systemPrompt: string): Promise<string> {
  const base = (Netlify.env.get("NIM_BASE_URL") ?? "").replace(/\/$/, "");
  if (!base) throw new Error("NIM non configuré");
  const model = Netlify.env.get("NIM_MODEL") || "meta/llama-3.2-11b-vision-instruct";
  const apiKey = Netlify.env.get("NIM_API_KEY") || "";
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...history],
      max_tokens: 800,
      temperature: 0.3,
    }),
    signal: AbortSignal.timeout(50_000),
  });
  if (!res.ok) {
    throw new Error(`NIM a répondu ${res.status}`);
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const reply = data.choices?.[0]?.message?.content ?? "";
  if (!reply) throw new Error("Réponse NIM vide");
  return reply;
}

async function callGateway(history: ChatMessage[], systemPrompt: string): Promise<string> {
  const openai = new OpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-5.4-mini",
    max_completion_tokens: 800,
    messages: [{ role: "system", content: systemPrompt }, ...history],
  });
  const reply = completion.choices[0]?.message?.content ?? "";
  if (!reply) throw new Error("Réponse vide du modèle");
  return reply;
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return json({ error: "Méthode non autorisée" }, 405);
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = (await req.json()) as { messages?: ChatMessage[] };
  } catch {
    return json({ error: "Corps de requête invalide" }, 400);
  }

  const history = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.length > 0)
    .slice(-12)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 4000) }));

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return json({ error: "Au moins un message utilisateur est requis" }, 400);
  }

  try {
    let context: string;
    try {
      context = await buildContext();
    } catch (dbError) {
      console.error("Contexte indisponible:", dbError instanceof Error ? dbError.message : dbError);
      context = "État du système momentanément indisponible (erreur d'accès à la base). Réponds sans données chiffrées et recommande de réessayer.";
    }
    const systemPrompt = `${SYSTEM_PROMPT}\n\n### État actuel du système (données réelles de la base)\n${context}`;

    let reply: string;
    let provider: string;
    try {
      reply = await callNim(history, systemPrompt);
      provider = "NIM local";
    } catch (nimError) {
      console.log("NIM indisponible, bascule AI Gateway:", nimError instanceof Error ? nimError.message : nimError);
      reply = await callGateway(history, systemPrompt);
      provider = "AI Gateway";
    }

    return json({ reply, provider });
  } catch (err) {
    console.error("AI error:", err);
    return json({ error: "L'assistant IA est momentanément indisponible" }, 502);
  }
};

export const config: Config = {
  path: "/api/ai",
};
