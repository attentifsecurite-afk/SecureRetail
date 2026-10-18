// Mock data for SecureRetail Ops - SaaS de pilotage sécurité retail

export interface Site {
  id: string;
  nom: string;
  adresse: string;
  zone: string;
  type: string;
  surface: number;
  criticite: 'faible' | 'moyenne' | 'élevée' | 'critique';
  cameras: number;
  camerasOnline: number;
  capteurs: number;
  agents: number;
  scoreRisque: number;
}

export interface Agent {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  qualifications: string[];
  siteId: string;
  statut: 'en_service' | 'pause' | 'absent' | 'repos';
  cartePro: string;
  carteProExpiry: string;
  telephone: string;
  heurePriseService?: string;
}

export interface Evenement {
  id: string;
  type: string;
  categorie: string;
  siteId: string;
  zone: string;
  gravite: 'info' | 'basse' | 'moyenne' | 'haute' | 'critique';
  statut: 'ouvert' | 'en_cours' | 'cloture';
  horodatage: string;
  creePar: string;
  description: string;
  assigneA?: string;
}

export interface Ronde {
  id: string;
  circuit: string;
  siteId: string;
  agentId: string;
  type: string;
  heurePrevue: string;
  heureReelle?: string;
  statut: 'planifiee' | 'en_cours' | 'terminee' | 'manquee' | 'incomplete';
  pointsControle: number;
  pointsScannes: number;
  anomalies: number;
}

export interface Alarme {
  id: string;
  siteId: string;
  zone: string;
  type: string;
  priorite: 'basse' | 'moyenne' | 'haute' | 'critique';
  statut: 'active' | 'en_traitement' | 'levee' | 'fausse';
  horodatage: string;
  leveeDoute: boolean;
  cameraAssociee?: string;
}

export interface Camera {
  id: string;
  nom: string;
  siteId: string;
  zone: string;
  statut: 'online' | 'offline' | 'maintenance';
  fabricant: string;
  modele: string;
  derniereAlerte?: string;
}

export interface IndicateurDI {
  id: string;
  siteId: string;
  familleProduit: string;
  ecart: number;
  valeur: number;
  periode: string;
  source: string;
}

// Sites Paris + Grande Couronne
export const sites: Site[] = [
  { id: 'S001', nom: 'Paris Châtelet', adresse: '12 Rue de Rivoli, 75001', zone: 'Paris Centre', type: 'Flagship', surface: 3200, criticite: 'critique', cameras: 48, camerasOnline: 46, capteurs: 32, agents: 6, scoreRisque: 78 },
  { id: 'S002', nom: 'Paris Opéra', adresse: '45 Bd des Capucines, 75002', zone: 'Paris Centre', type: 'Premium', surface: 2800, criticite: 'élevée', cameras: 36, camerasOnline: 36, capteurs: 24, agents: 5, scoreRisque: 62 },
  { id: 'S003', nom: 'Paris Montparnasse', adresse: '89 Bd du Montparnasse, 75006', zone: 'Paris Sud', type: 'Standard', surface: 1800, criticite: 'moyenne', cameras: 24, camerasOnline: 23, capteurs: 16, agents: 4, scoreRisque: 45 },
  { id: 'S004', nom: 'La Défense Westfield', adresse: '1 Parvis de la Défense, 92800', zone: 'Ouest', type: 'Premium', surface: 4500, criticite: 'élevée', cameras: 64, camerasOnline: 60, capteurs: 42, agents: 8, scoreRisque: 71 },
  { id: 'S005', nom: 'Créteil Soleil', adresse: 'Centre Commercial Créteil Soleil, 94000', zone: 'Sud-Est', type: 'Standard', surface: 2200, criticite: 'moyenne', cameras: 28, camerasOnline: 28, capteurs: 18, agents: 4, scoreRisque: 38 },
  { id: 'S006', nom: 'Rosny 2', adresse: 'Centre Commercial Rosny 2, 93110', zone: 'Nord-Est', type: 'Standard', surface: 2600, criticite: 'élevée', cameras: 32, camerasOnline: 30, capteurs: 22, agents: 5, scoreRisque: 58 },
  { id: 'S007', nom: 'Velizy 2', adresse: 'Centre Commercial Vélizy 2, 78170', zone: 'Ouest', type: 'Premium', surface: 3800, criticite: 'élevée', cameras: 52, camerasOnline: 52, capteurs: 36, agents: 6, scoreRisque: 52 },
  { id: 'S008', nom: 'Saint-Quentin en Yvelines', adresse: 'Centre Commercial SQY, 78180', zone: 'Ouest', type: 'Standard', surface: 1600, criticite: 'faible', cameras: 20, camerasOnline: 20, capteurs: 14, agents: 3, scoreRisque: 28 },
  { id: 'S009', nom: 'Paris Bastille', adresse: '28 Rue de Lyon, 75012', zone: 'Paris Est', type: 'Flagship', surface: 2400, criticite: 'élevée', cameras: 40, camerasOnline: 38, capteurs: 28, agents: 5, scoreRisque: 67 },
  { id: 'S010', nom: 'Bobigny', adresse: 'Centre Commercial Bobigny, 93000', zone: 'Nord-Est', type: 'Standard', surface: 1900, criticite: 'moyenne', cameras: 22, camerasOnline: 22, capteurs: 16, agents: 3, scoreRisque: 42 },
];

// Agents
export const agents: Agent[] = [
  { id: 'A001', nom: 'Dupont', prenom: 'Marc', role: 'Chef de poste', qualifications: ['CQP APS', 'SSIAP 1', 'SST'], siteId: 'S001', statut: 'en_service', cartePro: 'APS-2024-001', carteProExpiry: '2026-03-15', telephone: '06 12 34 56 01', heurePriseService: '06:00' },
  { id: 'A002', nom: 'Martin', prenom: 'Sophie', role: 'Agent ADS', qualifications: ['CQP ADS', 'SST'], siteId: 'S001', statut: 'en_service', cartePro: 'ADS-2024-002', carteProExpiry: '2025-11-20', telephone: '06 12 34 56 02', heurePriseService: '06:00' },
  { id: 'A003', nom: 'Bernard', prenom: 'Lucas', role: 'Agent SSIAP', qualifications: ['SSIAP 1', 'SST', 'H0B0'], siteId: 'S001', statut: 'pause', cartePro: 'SSIAP-2024-003', carteProExpiry: '2027-01-10', telephone: '06 12 34 56 03', heurePriseService: '06:00' },
  { id: 'A004', nom: 'Petit', prenom: 'Julie', role: 'Agent ADS', qualifications: ['CQP ADS'], siteId: 'S002', statut: 'en_service', cartePro: 'ADS-2024-004', carteProExpiry: '2025-08-05', telephone: '06 12 34 56 04', heurePriseService: '07:00' },
  { id: 'A005', nom: 'Robert', prenom: 'Thomas', role: 'Chef de poste', qualifications: ['CQP APS', 'SSIAP 2', 'SST'], siteId: 'S002', statut: 'en_service', cartePro: 'APS-2024-005', carteProExpiry: '2026-06-22', telephone: '06 12 34 56 05', heurePriseService: '07:00' },
  { id: 'A006', nom: 'Richard', prenom: 'Ahmed', role: 'Agent ADS', qualifications: ['CQP ADS', 'PIF'], siteId: 'S003', statut: 'en_service', cartePro: 'ADS-2024-006', carteProExpiry: '2025-12-01', telephone: '06 12 34 56 06', heurePriseService: '08:00' },
  { id: 'A007', nom: 'Durand', prenom: 'Claire', role: 'Agent SSIAP', qualifications: ['SSIAP 1', 'SST'], siteId: 'S004', statut: 'en_service', cartePro: 'SSIAP-2024-007', carteProExpiry: '2026-09-18', telephone: '06 12 34 56 07', heurePriseService: '06:00' },
  { id: 'A008', nom: 'Moreau', prenom: 'Pierre', role: 'Chef de poste', qualifications: ['CQP APS', 'SSIAP 1', 'SST', 'H0B0'], siteId: 'S004', statut: 'en_service', cartePro: 'APS-2024-008', carteProExpiry: '2027-02-28', telephone: '06 12 34 56 08', heurePriseService: '06:00' },
  { id: 'A009', nom: 'Lefevre', prenom: 'Nadia', role: 'Agent ADS', qualifications: ['CQP ADS'], siteId: 'S005', statut: 'absent', cartePro: 'ADS-2024-009', carteProExpiry: '2025-07-14', telephone: '06 12 34 56 09' },
  { id: 'A010', nom: 'Simon', prenom: 'Karim', role: 'Agent ADS', qualifications: ['CQP ADS', 'SST'], siteId: 'S006', statut: 'en_service', cartePro: 'ADS-2024-010', carteProExpiry: '2026-04-30', telephone: '06 12 34 56 10', heurePriseService: '07:00' },
  { id: 'A011', nom: 'Michel', prenom: 'Fatima', role: 'Agent SSIAP', qualifications: ['SSIAP 2', 'SST'], siteId: 'S007', statut: 'en_service', cartePro: 'SSIAP-2024-011', carteProExpiry: '2026-11-05', telephone: '06 12 34 56 11', heurePriseService: '06:00' },
  { id: 'A012', nom: 'Lambert', prenom: 'David', role: 'Agent ADS', qualifications: ['CQP ADS'], siteId: 'S009', statut: 'repos', cartePro: 'ADS-2024-012', carteProExpiry: '2025-10-20', telephone: '06 12 34 56 12' },
];

// Événements main courante
export const evenements: Evenement[] = [
  { id: 'E001', type: 'alarme_intrusion', categorie: 'Intrusion', siteId: 'S001', zone: 'Réserve', gravite: 'critique', statut: 'en_cours', horodatage: '2026-01-15T02:34:00', creePar: 'Système alarme', description: 'Déclenchement capteur mouvement zone réserve - nocturne', assigneA: 'A001' },
  { id: 'E002', type: 'levée_doute', categorie: 'Intrusion', siteId: 'S001', zone: 'Réserve', gravite: 'haute', statut: 'en_cours', horodatage: '2026-01-15T02:36:00', creePar: 'A001', description: 'Levée de doute en cours - vérification caméra C-12', assigneA: 'A001' },
  { id: 'E003', type: 'incident_client', categorie: 'Sûreté', siteId: 'S002', zone: 'Surface de vente', gravite: 'moyenne', statut: 'cloture', horodatage: '2026-01-15T14:22:00', creePar: 'A004', description: 'Client agressif rayon cosmétique - intervention agent - calme rétabli' },
  { id: 'E004', type: 'anomalie_technique', categorie: 'Technique', siteId: 'S004', zone: 'Quai livraison', gravite: 'haute', statut: 'ouvert', horodatage: '2026-01-15T09:15:00', creePar: 'A007', description: 'Porte quai livraison bloquée en position ouverte - risque intrusion' },
  { id: 'E005', type: 'camera_hs', categorie: 'Technique', siteId: 'S001', zone: 'Parking', gravite: 'haute', statut: 'ouvert', horodatage: '2026-01-15T08:30:00', creePar: 'Système', description: 'Caméra C-45 offline depuis 45 minutes - parking sous-sol' },
  { id: 'E006', type: 'declenchement_eas', categorie: 'Démarque', siteId: 'S006', zone: 'Sortie caisse', gravite: 'moyenne', statut: 'cloture', horodatage: '2026-01-15T16:45:00', creePar: 'A010', description: 'Déclenchement antivol - contrôle client - badge désactivé trouvé sur article' },
  { id: 'E007', type: 'exercice_incendie', categorie: 'SSIAP', siteId: 'S007', zone: 'Ensemble site', gravite: 'info', statut: 'cloture', horodatage: '2026-01-15T10:00:00', creePar: 'A011', description: 'Exercice d\'évacuation trimestriel réalisé - durée 4min32 - conforme' },
  { id: 'E008', type: 'tentative_vol', categorie: 'Démarque', siteId: 'S009', zone: 'Surface de vente', gravite: 'haute', statut: 'en_cours', horodatage: '2026-01-15T15:30:00', creePar: 'A004', description: 'Tentative de vol rayon électronique - individu interpelé - police appelée', assigneA: 'A004' },
  { id: 'E009', type: 'issue_secours', categorie: 'SSIAP', siteId: 'S003', zone: 'Sortie secours B', gravite: 'haute', statut: 'ouvert', horodatage: '2026-01-15T11:20:00', creePar: 'A006', description: 'Issue de secours obstruée par cartons - évacuation immédiate demandée' },
  { id: 'E010', type: 'acces_non_autorise', categorie: 'Intrusion', siteId: 'S004', zone: 'Local technique', gravite: 'moyenne', statut: 'cloture', horodatage: '2026-01-15T07:45:00', creePar: 'Système contrôle accès', description: 'Badge inconnu utilisé sur porte local technique - investigation lancée' },
  { id: 'E011', type: 'alarme_incendie', categorie: 'SSIAP', siteId: 'S002', zone: 'Réserve zone 3', gravite: 'critique', statut: 'cloture', horodatage: '2026-01-14T23:12:00', creePar: 'Système SSI', description: 'Déclenchement détecteur fumée réserve - levée de doute SSIAP - faux positif (travaux)' },
  { id: 'E012', type: 'ronde_manquee', categorie: 'Opérationnel', siteId: 'S005', zone: 'Périmètre extérieur', gravite: 'moyenne', statut: 'ouvert', horodatage: '2026-01-15T22:30:00', creePar: 'Système', description: 'Ronde périmétrique de 22h00 non effectuée - agent absent' },
];

// Rondes
export const rondes: Ronde[] = [
  { id: 'R001', circuit: 'Ronde périmétrique nuit', siteId: 'S001', agentId: 'A001', type: 'perimetrique', heurePrevue: '22:00', heureReelle: '22:05', statut: 'terminee', pointsControle: 12, pointsScannes: 12, anomalies: 0 },
  { id: 'R002', circuit: 'Ronde fermeture', siteId: 'S001', agentId: 'A002', type: 'fermeture', heurePrevue: '21:30', heureReelle: '21:32', statut: 'terminee', pointsControle: 8, pointsScannes: 8, anomalies: 1 },
  { id: 'R003', circuit: 'Ronde ouverture', siteId: 'S002', agentId: 'A004', type: 'ouverture', heurePrevue: '08:30', heureReelle: '08:35', statut: 'terminee', pointsControle: 6, pointsScannes: 6, anomalies: 0 },
  { id: 'R004', circuit: 'Ronde dissuasion DI', siteId: 'S004', agentId: 'A007', type: 'dissuasion', heurePrevue: '14:00', heureReelle: '14:10', statut: 'terminee', pointsControle: 10, pointsScannes: 9, anomalies: 2 },
  { id: 'R005', circuit: 'Ronde technique SSIAP', siteId: 'S007', agentId: 'A011', type: 'ssiap', heurePrevue: '06:00', heureReelle: '06:02', statut: 'terminee', pointsControle: 15, pointsScannes: 15, anomalies: 0 },
  { id: 'R006', circuit: 'Ronde périmétrique nuit', siteId: 'S005', agentId: 'A009', type: 'perimetrique', heurePrevue: '22:00', statut: 'manquee', pointsControle: 12, pointsScannes: 0, anomalies: 0 },
  { id: 'R007', circuit: 'Ronde cour / extérieurs', siteId: 'S006', agentId: 'A010', type: 'exterieur', heurePrevue: '20:00', heureReelle: '20:15', statut: 'incomplete', pointsControle: 8, pointsScannes: 5, anomalies: 1 },
  { id: 'R008', circuit: 'Ronde dissuasion DI', siteId: 'S009', agentId: 'A004', type: 'dissuasion', heurePrevue: '16:00', statut: 'en_cours', pointsControle: 10, pointsScannes: 6, anomalies: 0 },
];

// Alarmes
export const alarmes: Alarme[] = [
  { id: 'AL001', siteId: 'S001', zone: 'Réserve', type: 'Mouvement nocturne', priorite: 'critique', statut: 'active', horodatage: '2026-01-15T02:34:00', leveeDoute: false, cameraAssociee: 'C-12' },
  { id: 'AL002', siteId: 'S004', zone: 'Quai livraison', type: 'Porte ouverte hors horaires', priorite: 'haute', statut: 'en_traitement', horodatage: '2026-01-15T09:15:00', leveeDoute: false, cameraAssociee: 'C-28' },
  { id: 'AL003', siteId: 'S006', zone: 'Sortie caisse 3', type: 'Déclenchement EAS', priorite: 'moyenne', statut: 'levee', horodatage: '2026-01-15T16:45:00', leveeDoute: true, cameraAssociee: 'C-15' },
  { id: 'AL004', siteId: 'S002', zone: 'Réserve zone 3', type: 'Détecteur fumée', priorite: 'critique', statut: 'levee', horodatage: '2026-01-14T23:12:00', leveeDoute: true, cameraAssociee: 'C-08' },
  { id: 'AL005', siteId: 'S009', zone: 'Surface vente', type: 'Bris de glace détecté', priorite: 'haute', statut: 'en_traitement', horodatage: '2026-01-15T15:28:00', leveeDoute: false, cameraAssociee: 'C-33' },
  { id: 'AL006', siteId: 'S003', zone: 'Parking', type: 'Mouvement zone interdite', priorite: 'moyenne', statut: 'fausse', horodatage: '2026-01-15T03:45:00', leveeDoute: true, cameraAssociee: 'C-05' },
  { id: 'AL007', siteId: 'S007', zone: 'Accès personnel', type: 'Badge non autorisé', priorite: 'moyenne', statut: 'levee', horodatage: '2026-01-15T07:20:00', leveeDoute: true },
  { id: 'AL008', siteId: 'S001', zone: 'Parking sous-sol', type: 'Caméra offline - zone sensible', priorite: 'haute', statut: 'active', horodatage: '2026-01-15T08:30:00', leveeDoute: false },
];

// Caméras
export const cameras: Camera[] = [
  { id: 'C-01', nom: 'Hall entrée principal', siteId: 'S001', zone: 'Entrée', statut: 'online', fabricant: 'Hikvision', modele: 'DS-2CD2143G2-I' },
  { id: 'C-05', nom: 'Parking extérieur', siteId: 'S003', zone: 'Parking', statut: 'online', fabricant: 'Dahua', modele: 'IPC-HFW2431S' },
  { id: 'C-08', nom: 'Réserve zone 3', siteId: 'S002', zone: 'Réserve', statut: 'online', fabricant: 'Hikvision', modele: 'DS-2CD2347G2-LU' },
  { id: 'C-12', nom: 'Réserve accès quai', siteId: 'S001', zone: 'Réserve', statut: 'online', fabricant: 'Axis', modele: 'P3245-LV' },
  { id: 'C-15', nom: 'Sortie caisse 3', siteId: 'S006', zone: 'Caisse', statut: 'online', fabricant: 'Milestone', modele: 'LNB5005' },
  { id: 'C-28', nom: 'Quai livraison porte', siteId: 'S004', zone: 'Quai', statut: 'online', fabricant: 'Hikvision', modele: 'DS-2CD2T87G2-L' },
  { id: 'C-33', nom: 'Vitrine façade', siteId: 'S009', zone: 'Façade', statut: 'online', fabricant: 'Axis', modele: 'P1448-LE' },
  { id: 'C-45', nom: 'Parking sous-sol P2', siteId: 'S001', zone: 'Parking', statut: 'offline', fabricant: 'Dahua', modele: 'IPC-HDBW2431E-S', derniereAlerte: '2026-01-15T08:30:00' },
  { id: 'C-46', nom: 'Réserve zone 1', siteId: 'S004', zone: 'Réserve', statut: 'maintenance', fabricant: 'Hikvision', modele: 'DS-2CD2143G2-I', derniereAlerte: '2026-01-14T16:00:00' },
  { id: 'C-50', nom: 'Cour extérieure', siteId: 'S006', zone: 'Cour', statut: 'offline', fabricant: 'Dahua', modele: 'IPC-HFW5442T', derniereAlerte: '2026-01-15T07:00:00' },
];

// Indicateurs Démarque Inconnue
export const indicateursDI: IndicateurDI[] = [
  { id: 'DI001', siteId: 'S001', familleProduit: 'Électronique', ecart: -12500, valeur: 45000, periode: 'Janvier 2026', source: 'Inventaire' },
  { id: 'DI002', siteId: 'S001', familleProduit: 'Cosmétique', ecart: -3200, valeur: 28000, periode: 'Janvier 2026', source: 'Inventaire' },
  { id: 'DI003', siteId: 'S002', familleProduit: 'Électronique', ecart: -8700, valeur: 38000, periode: 'Janvier 2026', source: 'Inventaire' },
  { id: 'DI004', siteId: 'S004', familleProduit: 'Accessoires', ecart: -5400, valeur: 22000, periode: 'Janvier 2026', source: 'Inventaire' },
  { id: 'DI005', siteId: 'S006', familleProduit: 'Électronique', ecart: -15800, valeur: 52000, periode: 'Janvier 2026', source: 'Inventaire' },
  { id: 'DI006', siteId: 'S009', familleProduit: 'Textile', ecart: -4100, valeur: 18000, periode: 'Janvier 2026', source: 'Inventaire' },
];

// KPIs globaux
export const kpiGlobaux = {
  totalSites: 10,
  totalAgents: 49,
  agentsEnService: 38,
  alarmesActives: 2,
  incidentsOuverts: 5,
  camerasOffline: 3,
  rondesJour: 24,
  rondesRealisees: 21,
  rondesManquees: 3,
  scoreRisqueMoyen: 54,
  tauxConformite: 87,
  delaiMoyenAlarme: '4min 32s',
  faussesAlarmes: 12,
  incidentsCritiques: 3,
};

// Données pour graphiques
export const donneesIncidents7jours = [
  { jour: 'Lun', incidents: 8, alarmes: 3, rondes: 24 },
  { jour: 'Mar', incidents: 5, alarmes: 2, rondes: 24 },
  { jour: 'Mer', incidents: 12, alarmes: 5, rondes: 24 },
  { jour: 'Jeu', incidents: 7, alarmes: 4, rondes: 24 },
  { jour: 'Ven', incidents: 15, alarmes: 6, rondes: 24 },
  { jour: 'Sam', incidents: 18, alarmes: 4, rondes: 24 },
  { jour: 'Dim', incidents: 6, alarmes: 2, rondes: 24 },
];

export const donneesDecmarque = [
  { mois: 'Sep', valeur: 42000 },
  { mois: 'Oct', valeur: 38000 },
  { mois: 'Nov', valeur: 51000 },
  { mois: 'Déc', valeur: 67000 },
  { mois: 'Jan', valeur: 49700 },
];

export const donneesAlarmesParType = [
  { type: 'Intrusion', count: 23 },
  { type: 'EAS/Antivol', count: 45 },
  { type: 'Incendie', count: 8 },
  { type: 'Accès', count: 15 },
  { type: 'Technique', count: 31 },
];
