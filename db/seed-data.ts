import type { sites, agents, evenements, rondes, alarmes, cameras, indicateursDI } from "./schema.js";

type SiteInsert = typeof sites.$inferInsert;
type AgentInsert = typeof agents.$inferInsert;
type EvenementInsert = typeof evenements.$inferInsert;
type RondeInsert = typeof rondes.$inferInsert;
type AlarmeInsert = typeof alarmes.$inferInsert;
type CameraInsert = typeof cameras.$inferInsert;
type IndicateurDIInsert = typeof indicateursDI.$inferInsert;

const NOW = new Date();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const parisDate = (d: Date) => d.toLocaleDateString("fr-CA", { timeZone: "Europe/Paris" });
const pad = (n: number) => String(n).padStart(2, "0");

export const seedSites: SiteInsert[] = [
  { id: "S001", nom: "Paris Châtelet", adresse: "12 Rue de Rivoli, 75001", zone: "Paris Centre", type: "Flagship", surface: 3200, criticite: "critique", capteurs: 32, scoreRisque: 78, lat: 48.8606, lng: 2.3376 },
  { id: "S002", nom: "Paris Opéra", adresse: "45 Bd des Capucines, 75002", zone: "Paris Centre", type: "Premium", surface: 2800, criticite: "élevée", capteurs: 24, scoreRisque: 62, lat: 48.8712, lng: 2.3289 },
  { id: "S003", nom: "Paris Montparnasse", adresse: "89 Bd du Montparnasse, 75006", zone: "Paris Sud", type: "Standard", surface: 1800, criticite: "moyenne", capteurs: 16, scoreRisque: 45, lat: 48.843, lng: 2.323 },
  { id: "S004", nom: "La Défense Westfield", adresse: "1 Parvis de la Défense, 92800", zone: "Ouest", type: "Premium", surface: 4500, criticite: "élevée", capteurs: 42, scoreRisque: 71, lat: 48.892, lng: 2.237 },
  { id: "S005", nom: "Créteil Soleil", adresse: "Centre Commercial Créteil Soleil, 94000", zone: "Sud-Est", type: "Standard", surface: 2200, criticite: "moyenne", capteurs: 18, scoreRisque: 38, lat: 48.79, lng: 2.464 },
  { id: "S006", nom: "Rosny 2", adresse: "Centre Commercial Rosny 2, 93110", zone: "Nord-Est", type: "Standard", surface: 2600, criticite: "élevée", capteurs: 22, scoreRisque: 58, lat: 48.878, lng: 2.485 },
  { id: "S007", nom: "Velizy 2", adresse: "Centre Commercial Vélizy 2, 78170", zone: "Ouest", type: "Premium", surface: 3800, criticite: "élevée", capteurs: 36, scoreRisque: 52, lat: 48.795, lng: 2.185 },
  { id: "S008", nom: "Saint-Quentin en Yvelines", adresse: "Centre Commercial SQY, 78180", zone: "Ouest", type: "Standard", surface: 1600, criticite: "faible", capteurs: 14, scoreRisque: 28, lat: 48.775, lng: 2.04 },
  { id: "S009", nom: "Paris Bastille", adresse: "28 Rue de Lyon, 75012", zone: "Paris Est", type: "Flagship", surface: 2400, criticite: "élevée", capteurs: 28, scoreRisque: 67, lat: 48.853, lng: 2.369 },
  { id: "S010", nom: "Bobigny", adresse: "Centre Commercial Bobigny, 93000", zone: "Nord-Est", type: "Standard", surface: 1900, criticite: "moyenne", capteurs: 16, scoreRisque: 42, lat: 48.909, lng: 2.438 },
];

export const seedAgents: AgentInsert[] = [
  { id: "A001", nom: "Dupont", prenom: "Marc", role: "Chef de poste", qualifications: ["CQP APS", "SSIAP 1", "SST"], siteId: "S001", statut: "en_service", cartePro: "APS-2024-001", carteProExpiry: "2027-03-15", telephone: "06 12 34 56 01", heurePriseService: "06:00" },
  { id: "A002", nom: "Martin", prenom: "Sophie", role: "Agent ADS", qualifications: ["CQP ADS", "SST"], siteId: "S001", statut: "en_service", cartePro: "ADS-2024-002", carteProExpiry: "2027-11-20", telephone: "06 12 34 56 02", heurePriseService: "06:00" },
  { id: "A003", nom: "Bernard", prenom: "Lucas", role: "Agent SSIAP", qualifications: ["SSIAP 1", "SST", "H0B0"], siteId: "S001", statut: "pause", cartePro: "SSIAP-2024-003", carteProExpiry: "2027-01-10", telephone: "06 12 34 56 03", heurePriseService: "06:00" },
  { id: "A004", nom: "Petit", prenom: "Julie", role: "Agent ADS", qualifications: ["CQP ADS"], siteId: "S002", statut: "en_service", cartePro: "ADS-2024-004", carteProExpiry: "2027-08-05", telephone: "06 12 34 56 04", heurePriseService: "07:00" },
  { id: "A005", nom: "Robert", prenom: "Thomas", role: "Chef de poste", qualifications: ["CQP APS", "SSIAP 2", "SST"], siteId: "S002", statut: "en_service", cartePro: "APS-2024-005", carteProExpiry: "2027-06-22", telephone: "06 12 34 56 05", heurePriseService: "07:00" },
  { id: "A006", nom: "Richard", prenom: "Ahmed", role: "Agent ADS", qualifications: ["CQP ADS", "PIF"], siteId: "S003", statut: "en_service", cartePro: "ADS-2024-006", carteProExpiry: "2027-12-01", telephone: "06 12 34 56 06", heurePriseService: "08:00" },
  { id: "A007", nom: "Durand", prenom: "Claire", role: "Agent SSIAP", qualifications: ["SSIAP 1", "SST"], siteId: "S004", statut: "en_service", cartePro: "SSIAP-2024-007", carteProExpiry: "2027-09-18", telephone: "06 12 34 56 07", heurePriseService: "06:00" },
  { id: "A008", nom: "Moreau", prenom: "Pierre", role: "Chef de poste", qualifications: ["CQP APS", "SSIAP 1", "SST", "H0B0"], siteId: "S004", statut: "en_service", cartePro: "APS-2024-008", carteProExpiry: "2028-02-28", telephone: "06 12 34 56 08", heurePriseService: "06:00" },
  { id: "A009", nom: "Lefevre", prenom: "Nadia", role: "Agent ADS", qualifications: ["CQP ADS"], siteId: "S005", statut: "absent", cartePro: "ADS-2024-009", carteProExpiry: "2026-07-14", telephone: "06 12 34 56 09" },
  { id: "A010", nom: "Simon", prenom: "Karim", role: "Agent ADS", qualifications: ["CQP ADS", "SST"], siteId: "S006", statut: "en_service", cartePro: "ADS-2024-010", carteProExpiry: "2027-04-30", telephone: "06 12 34 56 10", heurePriseService: "07:00" },
  { id: "A011", nom: "Michel", prenom: "Fatima", role: "Agent SSIAP", qualifications: ["SSIAP 2", "SST"], siteId: "S007", statut: "en_service", cartePro: "SSIAP-2024-011", carteProExpiry: "2027-11-05", telephone: "06 12 34 56 11", heurePriseService: "06:00" },
  { id: "A012", nom: "Lambert", prenom: "David", role: "Agent ADS", qualifications: ["CQP ADS"], siteId: "S009", statut: "repos", cartePro: "ADS-2024-012", carteProExpiry: "2026-10-20", telephone: "06 12 34 56 12" },
];

export const seedCameras: CameraInsert[] = [
  { id: "C-01", nom: "Hall entrée principal", siteId: "S001", zone: "Entrée", statut: "online", fabricant: "Hikvision", modele: "DS-2CD2143G2-I", emplacement: "Hall entrée", protocole: "onvif", ip: "192.168.1.101", port: 80, utilisateur: "admin", motDePasse: "", cheminFlux: "/Streaming/Channels/101", resolution: "2688x1520", fps: 25, actif: true, firmware: "V5.7.1", derniereConnexion: new Date(NOW.getTime() - 12 * MINUTE) },
  { id: "C-05", nom: "Parking extérieur", siteId: "S003", zone: "Parking", statut: "online", fabricant: "Dahua", modele: "IPC-HFW2431S", emplacement: "Parking", protocole: "rtsp", ip: "192.168.1.105", port: 554, utilisateur: "admin", motDePasse: "", cheminFlux: "/cam/realmonitor?channel=1&subtype=0", resolution: "1920x1080", fps: 30, actif: true, firmware: "2.800.0", derniereConnexion: new Date(NOW.getTime() - 40 * MINUTE) },
  { id: "C-08", nom: "Réserve zone 3", siteId: "S002", zone: "Réserve", statut: "online", fabricant: "Hikvision", modele: "DS-2CD2347G2-LU", emplacement: "Réserve", protocole: "onvif", ip: "192.168.2.108", port: 80, utilisateur: "admin", motDePasse: "", cheminFlux: "/Streaming/Channels/101", resolution: "2560x1440", fps: 25, actif: true, firmware: "V5.7.5", derniereConnexion: new Date(NOW.getTime() - 5 * MINUTE) },
  { id: "C-12", nom: "Réserve accès quai", siteId: "S001", zone: "Réserve", statut: "online", fabricant: "Axis", modele: "P3245-LV", emplacement: "Réserve quai", protocole: "onvif", ip: "192.168.1.112", port: 80, utilisateur: "root", motDePasse: "", cheminFlux: "/axis-media/media.amp", resolution: "1920x1080", fps: 25, actif: true, firmware: "10.9", derniereConnexion: new Date(NOW.getTime() - 3 * MINUTE) },
  { id: "C-15", nom: "Sortie caisse 3", siteId: "S006", zone: "Caisse", statut: "online", fabricant: "Milestone", modele: "LNB5005", emplacement: "Caisses", protocole: "rtsp", ip: "192.168.3.115", port: 554, utilisateur: "service", motDePasse: "", cheminFlux: "/stream", resolution: "1920x1080", fps: 30, actif: true, derniereConnexion: new Date(NOW.getTime() - 25 * MINUTE) },
  { id: "C-28", nom: "Quai livraison porte", siteId: "S004", zone: "Quai", statut: "online", fabricant: "Hikvision", modele: "DS-2CD2T87G2-L", emplacement: "Quai livraison", protocole: "onvif", ip: "192.168.4.128", port: 80, utilisateur: "admin", motDePasse: "", cheminFlux: "/Streaming/Channels/101", resolution: "3840x2160", fps: 20, actif: true, firmware: "V5.7.11", derniereConnexion: new Date(NOW.getTime() - 8 * MINUTE) },
  { id: "C-33", nom: "Vitrine façade", siteId: "S009", zone: "Façade", statut: "online", fabricant: "Axis", modele: "P1448-LE", emplacement: "Façade", protocole: "onvif", ip: "192.168.5.133", port: 80, utilisateur: "root", motDePasse: "", cheminFlux: "/axis-media/media.amp", resolution: "1920x1080", fps: 25, actif: true, firmware: "10.8", derniereConnexion: new Date(NOW.getTime() - 15 * MINUTE) },
  { id: "C-45", nom: "Parking sous-sol P2", siteId: "S001", zone: "Parking", statut: "offline", fabricant: "Dahua", modele: "IPC-HDBW2431E-S", emplacement: "Parking P2", protocole: "rtsp", ip: "192.168.1.145", port: 554, utilisateur: "admin", motDePasse: "", cheminFlux: "/cam/realmonitor?channel=1&subtype=0", resolution: "2688x1520", fps: 25, actif: false, firmware: "2.620.0", derniereAlerte: new Date(NOW.getTime() - 8 * HOUR), derniereConnexion: new Date(NOW.getTime() - 8 * HOUR) },
  { id: "C-46", nom: "Réserve zone 1", siteId: "S004", zone: "Réserve", statut: "maintenance", fabricant: "Hikvision", modele: "DS-2CD2143G2-I", emplacement: "Réserve", protocole: "onvif", ip: "192.168.4.146", port: 80, utilisateur: "admin", motDePasse: "", cheminFlux: "/Streaming/Channels/101", resolution: "2688x1520", fps: 25, actif: false, firmware: "V5.7.1", derniereConnexion: new Date(NOW.getTime() - 30 * HOUR) },
  { id: "C-50", nom: "Cour extérieure", siteId: "S006", zone: "Cour", statut: "offline", fabricant: "Dahua", modele: "IPC-HFW5442T", emplacement: "Cour", protocole: "rtsp", ip: "192.168.3.150", port: 554, utilisateur: "admin", motDePasse: "", cheminFlux: "/cam/realmonitor?channel=1&subtype=0", resolution: "2688x1520", fps: 25, actif: true, derniereAlerte: new Date(NOW.getTime() - 14 * HOUR), derniereConnexion: new Date(NOW.getTime() - 14 * HOUR) },
];

const ALARME_TEMPLATES: Array<{ siteId: string; zone: string; categorie: string; type: string; priorite: AlarmeInsert["priorite"]; cameraAssociee?: string }> = [
  { siteId: "S001", zone: "Réserve", categorie: "Intrusion", type: "Mouvement nocturne", priorite: "critique", cameraAssociee: "C-12" },
  { siteId: "S004", zone: "Quai livraison", categorie: "Intrusion", type: "Porte ouverte hors horaires", priorite: "haute", cameraAssociee: "C-28" },
  { siteId: "S006", zone: "Sortie caisse 3", categorie: "EAS", type: "Déclenchement EAS", priorite: "moyenne", cameraAssociee: "C-15" },
  { siteId: "S002", zone: "Réserve zone 3", categorie: "Incendie", type: "Détecteur fumée", priorite: "critique", cameraAssociee: "C-08" },
  { siteId: "S009", zone: "Surface vente", categorie: "EAS", type: "Bris de glace détecté", priorite: "haute", cameraAssociee: "C-33" },
  { siteId: "S003", zone: "Parking", categorie: "Intrusion", type: "Mouvement zone interdite", priorite: "moyenne", cameraAssociee: "C-05" },
  { siteId: "S007", zone: "Accès personnel", categorie: "Accès", type: "Badge non autorisé", priorite: "moyenne" },
  { siteId: "S001", zone: "Parking sous-sol", categorie: "Technique", type: "Caméra offline - zone sensible", priorite: "haute" },
  { siteId: "S005", zone: "Entrée", categorie: "EAS", type: "Déclenchement EAS", priorite: "basse", cameraAssociee: "C-15" },
  { siteId: "S010", zone: "Réserve", categorie: "Accès", type: "Badge non autorisé", priorite: "moyenne" },
];

const EVENT_TEMPLATES: Array<{ type: string; categorie: string; gravite: EvenementInsert["gravite"]; zone: string; description: string }> = [
  { type: "alarme_intrusion", categorie: "Intrusion", gravite: "critique", zone: "Réserve", description: "Déclenchement capteur mouvement zone réserve - nocturne" },
  { type: "levée_doute", categorie: "Intrusion", gravite: "haute", zone: "Réserve", description: "Levée de doute effectuée après vérification caméra - aucune anomalie" },
  { type: "incident_client", categorie: "Sûreté", gravite: "moyenne", zone: "Surface de vente", description: "Client agressif en rayon - intervention agent - calme rétabli" },
  { type: "anomalie_technique", categorie: "Technique", gravite: "haute", zone: "Quai livraison", description: "Porte quai livraison bloquée en position ouverte - risque intrusion" },
  { type: "camera_hs", categorie: "Technique", gravite: "haute", zone: "Parking", description: "Caméra offline - parking sous surveillance renforcée" },
  { type: "declenchement_eas", categorie: "Démarque", gravite: "moyenne", zone: "Sortie caisse", description: "Déclenchement antivol - contrôle client - badge désactivé trouvé sur article" },
  { type: "exercice_incendie", categorie: "SSIAP", gravite: "info", zone: "Ensemble site", description: "Exercice d'évacuation réalisé - durée conforme" },
  { type: "tentative_vol", categorie: "Démarque", gravite: "haute", zone: "Surface de vente", description: "Tentative de vol rayon électronique - individu interpelé - police appelée" },
  { type: "issue_secours", categorie: "SSIAP", gravite: "haute", zone: "Sortie secours B", description: "Issue de secours obstruée par cartons - évacuation immédiate demandée" },
  { type: "acces_non_autorise", categorie: "Intrusion", gravite: "moyenne", zone: "Local technique", description: "Badge inconnu utilisé sur porte local technique - investigation lancée" },
  { type: "alarme_incendie", categorie: "SSIAP", gravite: "critique", zone: "Réserve", description: "Déclenchement détecteur fumée - levée de doute SSIAP - faux positif (travaux)" },
  { type: "ronde_manquee", categorie: "Opérationnel", gravite: "moyenne", zone: "Périmètre extérieur", description: "Ronde périmétrique non effectuée - signalée à l'exploitation" },
];

const INCIDENCE_PATTERN = [8, 5, 12, 7, 15, 18, 6];
const ALARME_PATTERN = [3, 2, 5, 4, 6, 4, 2];
const SITES_IDS = seedSites.map((s) => s.id as string);
const AGENTS_IDS = seedAgents.map((a) => a.id as string);
const CREE_PAR = ["Système alarme", "Système contrôle accès", "Système SSI", "A001", "A004", "A007", "A010"];

function buildHistoricalEvenements(): EvenementInsert[] {
  const rows: EvenementInsert[] = [];
  let n = 0;
  for (let d = 6; d >= 0; d--) {
    const count = INCIDENCE_PATTERN[d];
    for (let i = 0; i < count; i++) {
      const t = EVENT_TEMPLATES[n % EVENT_TEMPLATES.length];
      const siteId = SITES_IDS[n % SITES_IDS.length];
      const horodatage = new Date(NOW.getTime() - d * DAY - ((i * 83 + 37) % 660) * MINUTE);
      const isToday = d === 0;
      const statut = isToday ? (n % 3 === 0 ? "ouvert" : n % 3 === 1 ? "en_cours" : "cloture") : "cloture";
      const assigneA = AGENTS_IDS[n % AGENTS_IDS.length];
      rows.push({
        id: `E-SEED-${String(n + 1).padStart(3, "0")}`,
        type: t.type,
        categorie: t.categorie,
        siteId,
        zone: t.zone,
        gravite: t.gravite,
        statut,
        horodatage,
        creePar: CREE_PAR[n % CREE_PAR.length],
        description: t.description,
        assigneA,
        clotureA: statut === "cloture" ? new Date(horodatage.getTime() + (20 + (n % 40)) * MINUTE) : null,
      });
      n++;
    }
  }
  return rows;
}

function buildHistoricalAlarmes(): AlarmeInsert[] {
  const rows: AlarmeInsert[] = [];
  let n = 0;
  for (let d = 6; d >= 0; d--) {
    const count = ALARME_PATTERN[d];
    for (let i = 0; i < count; i++) {
      const t = ALARME_TEMPLATES[n % ALARME_TEMPLATES.length];
      const horodatage = new Date(NOW.getTime() - d * DAY - ((i * 97 + 53) % 540) * MINUTE);
      const isToday = d === 0;
      const statut = isToday && n % 4 === 0 ? "active" : isToday && n % 4 === 1 ? "en_traitement" : n % 7 === 0 ? "fausse" : "levee";
      rows.push({
        id: `AL-SEED-${String(n + 1).padStart(3, "0")}`,
        siteId: t.siteId,
        zone: t.zone,
        categorie: t.categorie,
        type: t.type,
        priorite: t.priorite,
        statut,
        horodatage,
        leveeDoute: statut === "levee" || statut === "fausse",
        cameraAssociee: t.cameraAssociee ?? null,
        traiteeA: statut === "active" || statut === "en_traitement" ? null : new Date(horodatage.getTime() + (4 + (n % 9)) * MINUTE),
      });
      n++;
    }
  }
  return rows;
}

export const seedEvenements: EvenementInsert[] = [
  ...buildHistoricalEvenements(),
  { id: "E001", type: "alarme_intrusion", categorie: "Intrusion", siteId: "S001", zone: "Réserve", gravite: "critique", statut: "en_cours", horodatage: new Date(NOW.getTime() - 3 * HOUR), creePar: "Système alarme", description: "Déclenchement capteur mouvement zone réserve - nocturne", assigneA: "A001", clotureA: null },
  { id: "E002", type: "levée_doute", categorie: "Intrusion", siteId: "S001", zone: "Réserve", gravite: "haute", statut: "en_cours", horodatage: new Date(NOW.getTime() - 3 * HOUR + 2 * MINUTE), creePar: "A001", description: "Levée de doute en cours - vérification caméra C-12", assigneA: "A001", clotureA: null },
  { id: "E004", type: "anomalie_technique", categorie: "Technique", siteId: "S004", zone: "Quai livraison", gravite: "haute", statut: "ouvert", horodatage: new Date(NOW.getTime() - 5 * HOUR), creePar: "A007", description: "Porte quai livraison bloquée en position ouverte - risque intrusion", assigneA: "A007", clotureA: null },
  { id: "E005", type: "camera_hs", categorie: "Technique", siteId: "S001", zone: "Parking", gravite: "haute", statut: "ouvert", horodatage: new Date(NOW.getTime() - 6 * HOUR), creePar: "Système", description: "Caméra C-45 offline depuis 45 minutes - parking sous-sol", assigneA: "A001", clotureA: null },
  { id: "E009", type: "issue_secours", categorie: "SSIAP", siteId: "S003", zone: "Sortie secours B", gravite: "haute", statut: "ouvert", horodatage: new Date(NOW.getTime() - 2 * HOUR), creePar: "A006", description: "Issue de secours obstruée par cartons - évacuation immédiate demandée", assigneA: "A006", clotureA: null },
  { id: "E003", type: "incident_client", categorie: "Sûreté", siteId: "S002", zone: "Surface de vente", gravite: "moyenne", statut: "cloture", horodatage: new Date(NOW.getTime() - 7 * HOUR), creePar: "A004", description: "Client agressif rayon cosmétique - intervention agent - calme rétabli", assigneA: "A004", clotureA: new Date(NOW.getTime() - 6.5 * HOUR) },
  { id: "E008", type: "tentative_vol", categorie: "Démarque", siteId: "S009", zone: "Surface de vente", gravite: "haute", statut: "cloture", horodatage: new Date(NOW.getTime() - 4 * HOUR), creePar: "A012", description: "Tentative de vol rayon électronique - individu interpelé - police appelée", assigneA: "A012", clotureA: new Date(NOW.getTime() - 3 * HOUR) },
];

export const seedAlarmes: AlarmeInsert[] = [
  ...buildHistoricalAlarmes(),
  { id: "AL001", siteId: "S001", zone: "Réserve", categorie: "Intrusion", type: "Mouvement nocturne", priorite: "critique", statut: "active", horodatage: new Date(NOW.getTime() - 3 * HOUR), leveeDoute: false, cameraAssociee: "C-12", traiteeA: null },
  { id: "AL002", siteId: "S004", zone: "Quai livraison", categorie: "Intrusion", type: "Porte ouverte hors horaires", priorite: "haute", statut: "en_traitement", horodatage: new Date(NOW.getTime() - 5 * HOUR), leveeDoute: false, cameraAssociee: "C-28", traiteeA: null },
  { id: "AL005", siteId: "S009", zone: "Surface vente", categorie: "EAS", type: "Bris de glace détecté", priorite: "haute", statut: "en_traitement", horodatage: new Date(NOW.getTime() - 4 * HOUR), leveeDoute: false, cameraAssociee: "C-33", traiteeA: null },
  { id: "AL008", siteId: "S001", zone: "Parking sous-sol", categorie: "Technique", type: "Caméra offline - zone sensible", priorite: "haute", statut: "active", horodatage: new Date(NOW.getTime() - 8 * HOUR), leveeDoute: false, cameraAssociee: "C-45", traiteeA: null },
];

const RONDE_CIRCUITS: Array<{ circuit: string; type: string; heure: string; points: number }> = [
  { circuit: "Ronde périmétrique nuit", type: "perimetrique", heure: "22:00", points: 12 },
  { circuit: "Ronde fermeture", type: "fermeture", heure: "21:30", points: 8 },
  { circuit: "Ronde ouverture", type: "ouverture", heure: "08:30", points: 6 },
  { circuit: "Ronde dissuasion DI", type: "dissuasion", heure: "14:00", points: 10 },
  { circuit: "Ronde technique SSIAP", type: "ssiap", heure: "06:00", points: 15 },
  { circuit: "Ronde cour / extérieurs", type: "exterieur", heure: "20:00", points: 8 },
];

function buildRondesForDate(date: Date, prefix: string, complet: boolean): RondeInsert[] {
  const rows: RondeInsert[] = [];
  for (let i = 0; i < 24; i++) {
    const t = RONDE_CIRCUITS[i % RONDE_CIRCUITS.length];
    const siteId = SITES_IDS[i % SITES_IDS.length];
    const agentId = AGENTS_IDS[i % AGENTS_IDS.length];
    const [h, m] = t.heure.split(":").map(Number);
    const retard = (i % 5) + 1;
    let statut: RondeInsert["statut"];
    let pointsScannes: number;
    let heureReelle: string | null;
    if (complet) {
      statut = "terminee";
      pointsScannes = t.points;
      heureReelle = `${pad(h)}:${pad(m + retard)}`;
    } else if (i < 20) {
      statut = "terminee";
      pointsScannes = t.points;
      heureReelle = `${pad(h)}:${pad(m + retard)}`;
    } else if (i < 22) {
      statut = "en_cours";
      pointsScannes = Math.floor(t.points / 2);
      heureReelle = null;
    } else {
      statut = "manquee";
      pointsScannes = 0;
      heureReelle = null;
    }
    rows.push({
      id: `${prefix}-${String(i + 1).padStart(2, "0")}`,
      circuit: t.circuit,
      siteId,
      agentId,
      type: t.type,
      datePrevue: parisDate(date),
      heurePrevue: t.heure,
      heureReelle,
      statut,
      pointsControle: t.points,
      pointsScannes,
      anomalies: statut === "terminee" && i % 6 === 5 ? 1 : 0,
    });
  }
  return rows;
}

export const seedRondes: RondeInsert[] = [
  ...buildRondesForDate(new Date(NOW.getTime() - DAY), "R-HIER", true),
  ...buildRondesForDate(NOW, "R001", false),
];

function buildIndicateursDI(): IndicateurDIInsert[] {
  const rows: IndicateurDIInsert[] = [];
  const familles: Array<[string, number, number]> = [
    ["Électronique", 8700, 38000],
    ["Cosmétique", 3200, 28000],
    ["Textile", 4100, 18000],
    ["Accessoires", 5400, 22000],
    ["Alimentaire", 2200, 15000],
  ];
  const sources = ["Inventaire", "Inventaire tournant", "Caisse"];
  let n = 0;
  for (let m = 4; m >= 0; m--) {
    const d = new Date(NOW.getFullYear(), NOW.getMonth() - m, 15);
    const periode = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    const facteur = 1 + (4 - m) * 0.15;
    for (let i = 0; i < 3; i++) {
      const [famille, ecartBase, valeur] = familles[(n + m) % familles.length];
      const siteId = SITES_IDS[(n * 3 + m) % SITES_IDS.length];
      const ecart = -Math.round(ecartBase * facteur);
      rows.push({
        id: `DI-SEED-${String(n + 1).padStart(3, "0")}`,
        siteId,
        familleProduit: famille,
        ecart,
        valeur,
        periode,
        source: sources[n % sources.length],
      });
      n++;
    }
  }
  return rows;
}

export const seedIndicateursDI: IndicateurDIInsert[] = [
  ...buildIndicateursDI(),
  { id: "DI001", siteId: "S001", familleProduit: "Électronique", ecart: -12500, valeur: 45000, periode: parisDate(NOW).slice(0, 7), source: "Inventaire" },
  { id: "DI002", siteId: "S001", familleProduit: "Cosmétique", ecart: -3200, valeur: 28000, periode: parisDate(NOW).slice(0, 7), source: "Inventaire" },
];
