export interface Site {
  id: string;
  nom: string;
  adresse: string;
  zone: string;
  type: string;
  surface: number;
  criticite: string;
  capteurs: number;
  scoreRisque: number;
  lat: number;
  lng: number;
}

export interface Agent {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  qualifications: string[];
  siteId: string;
  statut: string;
  cartePro: string;
  carteProExpiry: string;
  telephone: string;
  heurePriseService?: string | null;
}

export interface Evenement {
  id: string;
  type: string;
  categorie: string;
  siteId: string;
  zone: string;
  gravite: string;
  statut: string;
  horodatage: string;
  creePar: string;
  description: string;
  assigneA?: string | null;
  clotureA?: string | null;
}

export interface Ronde {
  id: string;
  circuit: string;
  siteId: string;
  agentId: string;
  type: string;
  datePrevue: string;
  heurePrevue: string;
  heureReelle?: string | null;
  statut: string;
  pointsControle: number;
  pointsScannes: number;
  anomalies: number;
}

export interface Alarme {
  id: string;
  siteId: string;
  zone: string;
  categorie: string;
  type: string;
  priorite: string;
  statut: string;
  horodatage: string;
  leveeDoute: boolean;
  cameraAssociee?: string | null;
  traiteeA?: string | null;
}

export interface Camera {
  id: string;
  nom: string;
  siteId: string;
  zone: string;
  statut: string;
  fabricant: string;
  modele: string;
  emplacement: string;
  protocole: string;
  ip: string;
  port: number;
  utilisateur: string;
  aMotDePasse: boolean;
  cheminFlux: string;
  resolution: string;
  fps: number;
  actif: boolean;
  firmware?: string | null;
  derniereAlerte?: string | null;
  derniereConnexion?: string | null;
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

export interface AppState {
  sites: Site[];
  agents: Agent[];
  evenements: Evenement[];
  rondes: Ronde[];
  alarmes: Alarme[];
  cameras: Camera[];
  indicateurs: IndicateurDI[];
}

export type ResourceName = 'sites' | 'agents' | 'evenements' | 'rondes' | 'alarmes' | 'cameras' | 'indicateurs';
