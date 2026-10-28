import { pgTable, text, integer, doublePrecision, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const sites = pgTable("sites", {
  id: text().primaryKey(),
  nom: text().notNull(),
  adresse: text().notNull().default(""),
  zone: text().notNull().default(""),
  type: text().notNull().default("Standard"),
  surface: integer().notNull().default(0),
  criticite: text().notNull().default("moyenne"),
  capteurs: integer().notNull().default(0),
  scoreRisque: integer("score_risque").notNull().default(0),
  lat: doublePrecision().notNull().default(0),
  lng: doublePrecision().notNull().default(0),
});

export const agents = pgTable("agents", {
  id: text().primaryKey(),
  nom: text().notNull(),
  prenom: text().notNull(),
  role: text().notNull().default("Agent ADS"),
  qualifications: jsonb().$type<string[]>().notNull().default([]),
  siteId: text("site_id").notNull(),
  statut: text().notNull().default("repos"),
  cartePro: text("carte_pro").notNull().default(""),
  carteProExpiry: text("carte_pro_expiry").notNull().default(""),
  telephone: text().notNull().default(""),
  heurePriseService: text("heure_prise_service"),
});

export const evenements = pgTable("evenements", {
  id: text().primaryKey(),
  type: text().notNull(),
  categorie: text().notNull().default("Opérationnel"),
  siteId: text("site_id").notNull(),
  zone: text().notNull().default(""),
  gravite: text().notNull().default("info"),
  statut: text().notNull().default("ouvert"),
  horodatage: timestamp("horodatage").notNull().defaultNow(),
  creePar: text("cree_par").notNull().default(""),
  description: text().notNull().default(""),
  assigneA: text("assigne_a"),
  clotureA: timestamp("cloture_a"),
});

export const rondes = pgTable("rondes", {
  id: text().primaryKey(),
  circuit: text().notNull(),
  siteId: text("site_id").notNull(),
  agentId: text("agent_id").notNull(),
  type: text().notNull().default("perimetrique"),
  datePrevue: text("date_prevue").notNull(),
  heurePrevue: text("heure_prevue").notNull().default("00:00"),
  heureReelle: text("heure_reelle"),
  statut: text().notNull().default("planifiee"),
  pointsControle: integer("points_controle").notNull().default(0),
  pointsScannes: integer("points_scannes").notNull().default(0),
  anomalies: integer().notNull().default(0),
});

export const alarmes = pgTable("alarmes", {
  id: text().primaryKey(),
  siteId: text("site_id").notNull(),
  zone: text().notNull().default(""),
  categorie: text().notNull().default("Technique"),
  type: text().notNull(),
  priorite: text().notNull().default("moyenne"),
  statut: text().notNull().default("active"),
  horodatage: timestamp("horodatage").notNull().defaultNow(),
  leveeDoute: boolean("levee_doute").notNull().default(false),
  cameraAssociee: text("camera_associee"),
  traiteeA: timestamp("traitee_a"),
});

export const cameras = pgTable("cameras", {
  id: text().primaryKey(),
  nom: text().notNull(),
  siteId: text("site_id").notNull(),
  zone: text().notNull().default(""),
  statut: text().notNull().default("offline"),
  fabricant: text().notNull().default(""),
  modele: text().notNull().default(""),
  emplacement: text().notNull().default(""),
  protocole: text().notNull().default("onvif"),
  ip: text().notNull().default(""),
  port: integer().notNull().default(554),
  utilisateur: text().notNull().default(""),
  motDePasse: text("mot_de_passe").notNull().default(""),
  cheminFlux: text("chemin_flux").notNull().default(""),
  resolution: text().notNull().default("1920x1080"),
  fps: integer().notNull().default(25),
  actif: boolean().notNull().default(true),
  firmware: text(),
  derniereAlerte: timestamp("derniere_alerte"),
  derniereConnexion: timestamp("derniere_connexion"),
});

export const indicateursDI = pgTable("indicateurs_di", {
  id: text().primaryKey(),
  siteId: text("site_id").notNull(),
  familleProduit: text("famille_produit").notNull().default(""),
  ecart: integer().notNull().default(0),
  valeur: integer().notNull().default(0),
  periode: text().notNull(),
  source: text().notNull().default("Inventaire"),
});
