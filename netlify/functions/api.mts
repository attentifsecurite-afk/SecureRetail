import type { Config, Context } from "@netlify/functions";
import { eq, desc, asc } from "drizzle-orm";
import { db } from "../../db/index.js";
import { sites, agents, evenements, rondes, alarmes, cameras, indicateursDI } from "../../db/schema.js";
import { ensureSeed } from "../../db/seed.js";

type Body = Record<string, unknown>;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v.trim() : fallback);
const num = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const bool = (v: unknown, fallback = false) => (typeof v === "boolean" ? v : fallback);
const toList = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.length > 0) : [];
const toDate = (v: unknown): Date | null => {
  if (v == null || v === "") return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
};
const clampInt = (v: unknown, min: number, max: number, fallback: number) =>
  Math.max(min, Math.min(max, Math.round(num(v, fallback))));

const genId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

const CRITICITES = ["faible", "moyenne", "élevée", "critique"];
const AGENT_STATUTS = ["en_service", "pause", "absent", "repos"];
const GRAVITES = ["info", "basse", "moyenne", "haute", "critique"];
const EVENT_STATUTS = ["ouvert", "en_cours", "cloture"];
const RONDE_STATUTS = ["planifiee", "en_cours", "terminee", "manquee", "incomplete"];
const ALARME_PRIORITES = ["basse", "moyenne", "haute", "critique"];
const ALARME_STATUTS = ["active", "en_traitement", "levee", "fausse"];
const CAMERA_STATUTS = ["online", "offline", "maintenance"];
const PROTOCOLES = ["onvif", "rtsp", "http", "https"];

const pick = (v: unknown, allowed: string[], fallback: string) =>
  typeof v === "string" && allowed.includes(v) ? v : fallback;

function sanitizeCamera(row: typeof cameras.$inferSelect) {
  const { motDePasse, ...rest } = row;
  return { ...rest, aMotDePasse: motDePasse.length > 0 };
}

async function getState() {
  const [s, a, e, r, al, c, di] = await Promise.all([
    db.select().from(sites).orderBy(asc(sites.id)),
    db.select().from(agents).orderBy(asc(agents.id)),
    db.select().from(evenements).orderBy(desc(evenements.horodatage)),
    db.select().from(rondes).orderBy(desc(rondes.datePrevue), desc(rondes.heurePrevue)),
    db.select().from(alarmes).orderBy(desc(alarmes.horodatage)),
    db.select().from(cameras).orderBy(asc(cameras.id)),
    db.select().from(indicateursDI).orderBy(desc(indicateursDI.periode), asc(indicateursDI.id)),
  ]);
  return {
    sites: s,
    agents: a,
    evenements: e,
    rondes: r,
    alarmes: al,
    cameras: c.map(sanitizeCamera),
    indicateurs: di,
  };
}

async function listResource(resource: string): Promise<Response> {
  switch (resource) {
    case "sites":
      return json(await db.select().from(sites).orderBy(asc(sites.id)));
    case "agents":
      return json(await db.select().from(agents).orderBy(asc(agents.id)));
    case "evenements":
      return json(await db.select().from(evenements).orderBy(desc(evenements.horodatage)));
    case "rondes":
      return json(await db.select().from(rondes).orderBy(desc(rondes.datePrevue), desc(rondes.heurePrevue)));
    case "alarmes":
      return json(await db.select().from(alarmes).orderBy(desc(alarmes.horodatage)));
    case "cameras": {
      const rows = await db.select().from(cameras).orderBy(asc(cameras.id));
      return json(rows.map(sanitizeCamera));
    }
    case "indicateurs":
      return json(await db.select().from(indicateursDI).orderBy(desc(indicateursDI.periode), asc(indicateursDI.id)));
    default:
      return json({ error: "Ressource inconnue" }, 404);
  }
}

function createResource(resource: string, body: Body): Response | Promise<Response> {
  switch (resource) {
    case "sites": {
      const nom = str(body.nom);
      if (!nom) return json({ error: "Le nom du site est obligatoire" }, 400);
      const values = {
        id: genId("SITE"),
        nom,
        adresse: str(body.adresse),
        zone: str(body.zone, "Paris"),
        type: str(body.type, "Standard"),
        surface: clampInt(body.surface, 0, 1_000_000, 0),
        criticite: pick(body.criticite, CRITICITES, "moyenne"),
        capteurs: clampInt(body.capteurs, 0, 10_000, 0),
        scoreRisque: clampInt(body.scoreRisque, 0, 100, 0),
        lat: num(body.lat, 48.8566),
        lng: num(body.lng, 2.3522),
      };
      return db.insert(sites).values(values).returning().then((rows) => json(rows[0], 201));
    }
    case "agents": {
      const nom = str(body.nom);
      const prenom = str(body.prenom);
      if (!nom || !prenom) return json({ error: "Nom et prénom sont obligatoires" }, 400);
      const values = {
        id: genId("AG"),
        nom,
        prenom,
        role: str(body.role, "Agent ADS"),
        qualifications: toList(body.qualifications),
        siteId: str(body.siteId),
        statut: pick(body.statut, AGENT_STATUTS, "repos"),
        cartePro: str(body.cartePro),
        carteProExpiry: str(body.carteProExpiry),
        telephone: str(body.telephone),
        heurePriseService: body.heurePriseService ? str(body.heurePriseService) : null,
      };
      return db.insert(agents).values(values).returning().then((rows) => json(rows[0], 201));
    }
    case "evenements": {
      const description = str(body.description);
      if (!description) return json({ error: "La description est obligatoire" }, 400);
      const statut = pick(body.statut, EVENT_STATUTS, "ouvert");
      const values = {
        id: genId("EV"),
        type: str(body.type, "evenement_manuel"),
        categorie: str(body.categorie, "Opérationnel"),
        siteId: str(body.siteId),
        zone: str(body.zone),
        gravite: pick(body.gravite, GRAVITES, "info"),
        statut,
        horodatage: toDate(body.horodatage) ?? new Date(),
        creePar: str(body.creePar, "Opérateur PC Sûreté"),
        description,
        assigneA: body.assigneA ? str(body.assigneA) : null,
        clotureA: toDate(body.clotureA) ?? (statut === "cloture" ? new Date() : null),
      };
      return db.insert(evenements).values(values).returning().then((rows) => json(rows[0], 201));
    }
    case "rondes": {
      const circuit = str(body.circuit);
      if (!circuit) return json({ error: "Le circuit est obligatoire" }, 400);
      const values = {
        id: genId("RO"),
        circuit,
        siteId: str(body.siteId),
        agentId: str(body.agentId),
        type: str(body.type, "perimetrique"),
        datePrevue: str(body.datePrevue) || new Date().toISOString().slice(0, 10),
        heurePrevue: str(body.heurePrevue, "00:00"),
        heureReelle: body.heureReelle ? str(body.heureReelle) : null,
        statut: pick(body.statut, RONDE_STATUTS, "planifiee"),
        pointsControle: clampInt(body.pointsControle, 0, 500, 0),
        pointsScannes: clampInt(body.pointsScannes, 0, 500, 0),
        anomalies: clampInt(body.anomalies, 0, 500, 0),
      };
      return db.insert(rondes).values(values).returning().then((rows) => json(rows[0], 201));
    }
    case "alarmes": {
      const type = str(body.type);
      if (!type) return json({ error: "Le type d'alarme est obligatoire" }, 400);
      const statut = pick(body.statut, ALARME_STATUTS, "active");
      const horodatage = toDate(body.horodatage) ?? new Date();
      const values = {
        id: genId("AL"),
        siteId: str(body.siteId),
        zone: str(body.zone),
        categorie: str(body.categorie, "Technique"),
        type,
        priorite: pick(body.priorite, ALARME_PRIORITES, "moyenne"),
        statut,
        horodatage,
        leveeDoute: bool(body.leveeDoute, false),
        cameraAssociee: body.cameraAssociee ? str(body.cameraAssociee) : null,
        traiteeA: toDate(body.traiteeA) ?? (statut === "levee" || statut === "fausse" ? new Date() : null),
      };
      return db.insert(alarmes).values(values).returning().then((rows) => json(rows[0], 201));
    }
    case "cameras": {
      const nom = str(body.nom);
      if (!nom) return json({ error: "Le nom de la caméra est obligatoire" }, 400);
      const values = {
        id: genId("CAM"),
        nom,
        siteId: str(body.siteId),
        zone: str(body.zone),
        statut: pick(body.statut, CAMERA_STATUTS, "offline"),
        fabricant: str(body.fabricant, "Autre"),
        modele: str(body.modele),
        emplacement: str(body.emplacement),
        protocole: pick(body.protocole, PROTOCOLES, "onvif"),
        ip: str(body.ip),
        port: clampInt(body.port, 1, 65535, 554),
        utilisateur: str(body.utilisateur, "admin"),
        motDePasse: str(body.motDePasse),
        cheminFlux: str(body.cheminFlux),
        resolution: str(body.resolution, "1920x1080"),
        fps: clampInt(body.fps, 1, 120, 25),
        actif: bool(body.actif, true),
        firmware: body.firmware ? str(body.firmware) : null,
        derniereConnexion: body.statut === "online" ? new Date() : null,
      };
      return db
        .insert(cameras)
        .values(values)
        .returning()
        .then((rows) => json(sanitizeCamera(rows[0]), 201));
    }
    case "indicateurs": {
      const periode = str(body.periode);
      if (!/^\d{4}-\d{2}$/.test(periode)) return json({ error: "Période attendue au format AAAA-MM" }, 400);
      const values = {
        id: genId("DI"),
        siteId: str(body.siteId),
        familleProduit: str(body.familleProduit),
        ecart: clampInt(body.ecart, -1_000_000_000, 0, 0),
        valeur: clampInt(body.valeur, 0, 1_000_000_000, 0),
        periode,
        source: str(body.source, "Inventaire"),
      };
      return db.insert(indicateursDI).values(values).returning().then((rows) => json(rows[0], 201));
    }
    default:
      return json({ error: "Ressource inconnue" }, 404);
  }
}

async function updateResource(resource: string, id: string, body: Body): Promise<Response> {
  switch (resource) {
    case "sites": {
      const patch: Partial<typeof sites.$inferInsert> = {};
      if ("nom" in body) patch.nom = str(body.nom);
      if ("adresse" in body) patch.adresse = str(body.adresse);
      if ("zone" in body) patch.zone = str(body.zone);
      if ("type" in body) patch.type = str(body.type);
      if ("surface" in body) patch.surface = clampInt(body.surface, 0, 1_000_000, 0);
      if ("criticite" in body) patch.criticite = pick(body.criticite, CRITICITES, "moyenne");
      if ("capteurs" in body) patch.capteurs = clampInt(body.capteurs, 0, 10_000, 0);
      if ("scoreRisque" in body) patch.scoreRisque = clampInt(body.scoreRisque, 0, 100, 0);
      if ("lat" in body) patch.lat = num(body.lat, 0);
      if ("lng" in body) patch.lng = num(body.lng, 0);
      if (Object.keys(patch).length === 0) return json({ error: "Aucun champ à mettre à jour" }, 400);
      const rows = await db.update(sites).set(patch).where(eq(sites.id, id)).returning();
      return rows.length ? json(rows[0]) : json({ error: "Site introuvable" }, 404);
    }
    case "agents": {
      const patch: Partial<typeof agents.$inferInsert> = {};
      if ("nom" in body) patch.nom = str(body.nom);
      if ("prenom" in body) patch.prenom = str(body.prenom);
      if ("role" in body) patch.role = str(body.role);
      if ("qualifications" in body) patch.qualifications = toList(body.qualifications);
      if ("siteId" in body) patch.siteId = str(body.siteId);
      if ("statut" in body) patch.statut = pick(body.statut, AGENT_STATUTS, "repos");
      if ("cartePro" in body) patch.cartePro = str(body.cartePro);
      if ("carteProExpiry" in body) patch.carteProExpiry = str(body.carteProExpiry);
      if ("telephone" in body) patch.telephone = str(body.telephone);
      if ("heurePriseService" in body) patch.heurePriseService = body.heurePriseService ? str(body.heurePriseService) : null;
      if (Object.keys(patch).length === 0) return json({ error: "Aucun champ à mettre à jour" }, 400);
      const rows = await db.update(agents).set(patch).where(eq(agents.id, id)).returning();
      return rows.length ? json(rows[0]) : json({ error: "Agent introuvable" }, 404);
    }
    case "evenements": {
      const patch: Partial<typeof evenements.$inferInsert> = {};
      if ("type" in body) patch.type = str(body.type);
      if ("categorie" in body) patch.categorie = str(body.categorie);
      if ("siteId" in body) patch.siteId = str(body.siteId);
      if ("zone" in body) patch.zone = str(body.zone);
      if ("gravite" in body) patch.gravite = pick(body.gravite, GRAVITES, "info");
      if ("statut" in body) {
        patch.statut = pick(body.statut, EVENT_STATUTS, "ouvert");
        patch.clotureA = patch.statut === "cloture" ? (toDate(body.clotureA) ?? new Date()) : null;
      } else if ("clotureA" in body) {
        patch.clotureA = toDate(body.clotureA);
      }
      if ("horodatage" in body) patch.horodatage = toDate(body.horodatage) ?? new Date();
      if ("description" in body) patch.description = str(body.description);
      if ("assigneA" in body) patch.assigneA = body.assigneA ? str(body.assigneA) : null;
      if (Object.keys(patch).length === 0) return json({ error: "Aucun champ à mettre à jour" }, 400);
      const rows = await db.update(evenements).set(patch).where(eq(evenements.id, id)).returning();
      return rows.length ? json(rows[0]) : json({ error: "Événement introuvable" }, 404);
    }
    case "rondes": {
      const patch: Partial<typeof rondes.$inferInsert> = {};
      if ("circuit" in body) patch.circuit = str(body.circuit);
      if ("siteId" in body) patch.siteId = str(body.siteId);
      if ("agentId" in body) patch.agentId = str(body.agentId);
      if ("type" in body) patch.type = str(body.type);
      if ("datePrevue" in body) patch.datePrevue = str(body.datePrevue);
      if ("heurePrevue" in body) patch.heurePrevue = str(body.heurePrevue);
      if ("heureReelle" in body) patch.heureReelle = body.heureReelle ? str(body.heureReelle) : null;
      if ("statut" in body) patch.statut = pick(body.statut, RONDE_STATUTS, "planifiee");
      if ("pointsControle" in body) patch.pointsControle = clampInt(body.pointsControle, 0, 500, 0);
      if ("pointsScannes" in body) patch.pointsScannes = clampInt(body.pointsScannes, 0, 500, 0);
      if ("anomalies" in body) patch.anomalies = clampInt(body.anomalies, 0, 500, 0);
      if (Object.keys(patch).length === 0) return json({ error: "Aucun champ à mettre à jour" }, 400);
      const rows = await db.update(rondes).set(patch).where(eq(rondes.id, id)).returning();
      return rows.length ? json(rows[0]) : json({ error: "Ronde introuvable" }, 404);
    }
    case "alarmes": {
      const patch: Partial<typeof alarmes.$inferInsert> = {};
      if ("siteId" in body) patch.siteId = str(body.siteId);
      if ("zone" in body) patch.zone = str(body.zone);
      if ("categorie" in body) patch.categorie = str(body.categorie);
      if ("type" in body) patch.type = str(body.type);
      if ("priorite" in body) patch.priorite = pick(body.priorite, ALARME_PRIORITES, "moyenne");
      if ("statut" in body) {
        patch.statut = pick(body.statut, ALARME_STATUTS, "active");
        patch.traiteeA =
          patch.statut === "levee" || patch.statut === "fausse" ? (toDate(body.traiteeA) ?? new Date()) : null;
      } else if ("traiteeA" in body) {
        patch.traiteeA = toDate(body.traiteeA);
      }
      if ("horodatage" in body) patch.horodatage = toDate(body.horodatage) ?? new Date();
      if ("leveeDoute" in body) patch.leveeDoute = bool(body.leveeDoute, false);
      if ("cameraAssociee" in body) patch.cameraAssociee = body.cameraAssociee ? str(body.cameraAssociee) : null;
      if (Object.keys(patch).length === 0) return json({ error: "Aucun champ à mettre à jour" }, 400);
      const rows = await db.update(alarmes).set(patch).where(eq(alarmes.id, id)).returning();
      return rows.length ? json(rows[0]) : json({ error: "Alarme introuvable" }, 404);
    }
    case "cameras": {
      const patch: Partial<typeof cameras.$inferInsert> = {};
      if ("nom" in body) patch.nom = str(body.nom);
      if ("siteId" in body) patch.siteId = str(body.siteId);
      if ("zone" in body) patch.zone = str(body.zone);
      if ("statut" in body) patch.statut = pick(body.statut, CAMERA_STATUTS, "offline");
      if ("fabricant" in body) patch.fabricant = str(body.fabricant);
      if ("modele" in body) patch.modele = str(body.modele);
      if ("emplacement" in body) patch.emplacement = str(body.emplacement);
      if ("protocole" in body) patch.protocole = pick(body.protocole, PROTOCOLES, "onvif");
      if ("ip" in body) patch.ip = str(body.ip);
      if ("port" in body) patch.port = clampInt(body.port, 1, 65535, 554);
      if ("utilisateur" in body) patch.utilisateur = str(body.utilisateur);
      if (typeof body.motDePasse === "string" && body.motDePasse.length > 0) patch.motDePasse = body.motDePasse;
      if ("cheminFlux" in body) patch.cheminFlux = str(body.cheminFlux);
      if ("resolution" in body) patch.resolution = str(body.resolution);
      if ("fps" in body) patch.fps = clampInt(body.fps, 1, 120, 25);
      if ("actif" in body) patch.actif = bool(body.actif, true);
      if ("firmware" in body) patch.firmware = body.firmware ? str(body.firmware) : null;
      if (Object.keys(patch).length === 0) return json({ error: "Aucun champ à mettre à jour" }, 400);
      const rows = await db.update(cameras).set(patch).where(eq(cameras.id, id)).returning();
      return rows.length ? json(sanitizeCamera(rows[0])) : json({ error: "Caméra introuvable" }, 404);
    }
    case "indicateurs": {
      const patch: Partial<typeof indicateursDI.$inferInsert> = {};
      if ("siteId" in body) patch.siteId = str(body.siteId);
      if ("familleProduit" in body) patch.familleProduit = str(body.familleProduit);
      if ("ecart" in body) patch.ecart = clampInt(body.ecart, -1_000_000_000, 0, 0);
      if ("valeur" in body) patch.valeur = clampInt(body.valeur, 0, 1_000_000_000, 0);
      if ("periode" in body && /^\d{4}-\d{2}$/.test(str(body.periode))) patch.periode = str(body.periode);
      if ("source" in body) patch.source = str(body.source);
      if (Object.keys(patch).length === 0) return json({ error: "Aucun champ à mettre à jour" }, 400);
      const rows = await db.update(indicateursDI).set(patch).where(eq(indicateursDI.id, id)).returning();
      return rows.length ? json(rows[0]) : json({ error: "Indicateur introuvable" }, 404);
    }
    default:
      return json({ error: "Ressource inconnue" }, 404);
  }
}

async function deleteResource(resource: string, id: string): Promise<Response> {
  switch (resource) {
    case "sites": {
      const rows = await db.delete(sites).where(eq(sites.id, id)).returning();
      return rows.length ? json({ ok: true }) : json({ error: "Site introuvable" }, 404);
    }
    case "agents": {
      const rows = await db.delete(agents).where(eq(agents.id, id)).returning();
      return rows.length ? json({ ok: true }) : json({ error: "Agent introuvable" }, 404);
    }
    case "evenements": {
      const rows = await db.delete(evenements).where(eq(evenements.id, id)).returning();
      return rows.length ? json({ ok: true }) : json({ error: "Événement introuvable" }, 404);
    }
    case "rondes": {
      const rows = await db.delete(rondes).where(eq(rondes.id, id)).returning();
      return rows.length ? json({ ok: true }) : json({ error: "Ronde introuvable" }, 404);
    }
    case "alarmes": {
      const rows = await db.delete(alarmes).where(eq(alarmes.id, id)).returning();
      return rows.length ? json({ ok: true }) : json({ error: "Alarme introuvable" }, 404);
    }
    case "cameras": {
      const rows = await db.delete(cameras).where(eq(cameras.id, id)).returning();
      return rows.length ? json({ ok: true }) : json({ error: "Caméra introuvable" }, 404);
    }
    case "indicateurs": {
      const rows = await db.delete(indicateursDI).where(eq(indicateursDI.id, id)).returning();
      return rows.length ? json({ ok: true }) : json({ error: "Indicateur introuvable" }, 404);
    }
    default:
      return json({ error: "Ressource inconnue" }, 404);
  }
}

async function testCamera(id: string): Promise<Response> {
  const rows = await db.select().from(cameras).where(eq(cameras.id, id));
  const cam = rows[0];
  if (!cam) return json({ error: "Caméra introuvable" }, 404);
  if (!cam.ip) return json({ error: "Adresse IP non configurée" }, 400);

  const scheme = cam.protocole === "https" ? "https" : "http";
  const url = `${scheme}://${cam.ip}:${cam.port}`;
  const started = Date.now();
  let ok = false;
  let message = "";
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    ok = true;
    message = `Hôte joignable — réponse HTTP ${res.status}`;
  } catch (err) {
    message = err instanceof Error && err.name === "TimeoutError"
      ? "Délai dépassé — hôte injoignable depuis le cloud"
      : "Connexion impossible — hôte injoignable depuis le cloud";
  }
  const ms = Date.now() - started;

  await db
    .update(cameras)
    .set({ statut: ok ? "online" : "offline", derniereConnexion: ok ? new Date() : cam.derniereConnexion })
    .where(eq(cameras.id, id));

  return json({ ok, message, ms, statut: ok ? "online" : "offline" });
}

const RESOURCE_PATTERN = /^\/api\/([a-z]+)$/;
const ITEM_PATTERN = /^\/api\/([a-z]+)\/([A-Za-z0-9_-]+)$/;
const TEST_PATTERN = /^\/api\/cameras\/([A-Za-z0-9_-]+)\/test$/;

export default async (req: Request, context: Context) => {
  const { pathname } = new URL(req.url);
  const method = req.method.toUpperCase();

  try {
    if (method === "GET") {
      await ensureSeed();
      if (pathname === "/api/state") return json(await getState());
      const m = RESOURCE_PATTERN.exec(pathname);
      if (m) return await listResource(m[1]);
      return json({ error: "Route inconnue" }, 404);
    }

    const testMatch = TEST_PATTERN.exec(pathname);
    if (testMatch && method === "POST") return await testCamera(testMatch[1]);

    const itemMatch = ITEM_PATTERN.exec(pathname);
    if (itemMatch) {
      const [, resource, id] = itemMatch;
      if (method === "PATCH" || method === "PUT") {
        return await updateResource(resource, id, (await req.json().catch(() => ({}))) as Body);
      }
      if (method === "DELETE") return await deleteResource(resource, id);
      return json({ error: "Méthode non autorisée" }, 405);
    }

    const resourceMatch = RESOURCE_PATTERN.exec(pathname);
    if (resourceMatch) {
      if (method !== "POST") return json({ error: "Méthode non autorisée" }, 405);
      const body = (await req.json().catch(() => ({}))) as Body;
      return await createResource(resourceMatch[1], body);
    }

    return json({ error: "Route inconnue" }, 404);
  } catch (err) {
    console.error("API error:", err);
    return json({ error: "Erreur serveur" }, 500);
  }
};

export const config: Config = {
  path: ["/api/state", "/api/:resource", "/api/:resource/:id", "/api/cameras/:id/test"],
};
