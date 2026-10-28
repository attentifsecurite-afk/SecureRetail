CREATE TABLE "agents" (
	"id" text PRIMARY KEY,
	"nom" text NOT NULL,
	"prenom" text NOT NULL,
	"role" text DEFAULT 'Agent ADS' NOT NULL,
	"qualifications" jsonb DEFAULT '[]' NOT NULL,
	"site_id" text NOT NULL,
	"statut" text DEFAULT 'repos' NOT NULL,
	"carte_pro" text DEFAULT '' NOT NULL,
	"carte_pro_expiry" text DEFAULT '' NOT NULL,
	"telephone" text DEFAULT '' NOT NULL,
	"heure_prise_service" text
);
--> statement-breakpoint
CREATE TABLE "alarmes" (
	"id" text PRIMARY KEY,
	"site_id" text NOT NULL,
	"zone" text DEFAULT '' NOT NULL,
	"categorie" text DEFAULT 'Technique' NOT NULL,
	"type" text NOT NULL,
	"priorite" text DEFAULT 'moyenne' NOT NULL,
	"statut" text DEFAULT 'active' NOT NULL,
	"horodatage" timestamp DEFAULT now() NOT NULL,
	"levee_doute" boolean DEFAULT false NOT NULL,
	"camera_associee" text,
	"traitee_a" timestamp
);
--> statement-breakpoint
CREATE TABLE "cameras" (
	"id" text PRIMARY KEY,
	"nom" text NOT NULL,
	"site_id" text NOT NULL,
	"zone" text DEFAULT '' NOT NULL,
	"statut" text DEFAULT 'offline' NOT NULL,
	"fabricant" text DEFAULT '' NOT NULL,
	"modele" text DEFAULT '' NOT NULL,
	"emplacement" text DEFAULT '' NOT NULL,
	"protocole" text DEFAULT 'onvif' NOT NULL,
	"ip" text DEFAULT '' NOT NULL,
	"port" integer DEFAULT 554 NOT NULL,
	"utilisateur" text DEFAULT '' NOT NULL,
	"mot_de_passe" text DEFAULT '' NOT NULL,
	"chemin_flux" text DEFAULT '' NOT NULL,
	"resolution" text DEFAULT '1920x1080' NOT NULL,
	"fps" integer DEFAULT 25 NOT NULL,
	"actif" boolean DEFAULT true NOT NULL,
	"firmware" text,
	"derniere_alerte" timestamp,
	"derniere_connexion" timestamp
);
--> statement-breakpoint
CREATE TABLE "evenements" (
	"id" text PRIMARY KEY,
	"type" text NOT NULL,
	"categorie" text DEFAULT 'Opérationnel' NOT NULL,
	"site_id" text NOT NULL,
	"zone" text DEFAULT '' NOT NULL,
	"gravite" text DEFAULT 'info' NOT NULL,
	"statut" text DEFAULT 'ouvert' NOT NULL,
	"horodatage" timestamp DEFAULT now() NOT NULL,
	"cree_par" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"assigne_a" text,
	"cloture_a" timestamp
);
--> statement-breakpoint
CREATE TABLE "indicateurs_di" (
	"id" text PRIMARY KEY,
	"site_id" text NOT NULL,
	"famille_produit" text DEFAULT '' NOT NULL,
	"ecart" integer DEFAULT 0 NOT NULL,
	"valeur" integer DEFAULT 0 NOT NULL,
	"periode" text NOT NULL,
	"source" text DEFAULT 'Inventaire' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rondes" (
	"id" text PRIMARY KEY,
	"circuit" text NOT NULL,
	"site_id" text NOT NULL,
	"agent_id" text NOT NULL,
	"type" text DEFAULT 'perimetrique' NOT NULL,
	"date_prevue" text NOT NULL,
	"heure_prevue" text DEFAULT '00:00' NOT NULL,
	"heure_reelle" text,
	"statut" text DEFAULT 'planifiee' NOT NULL,
	"points_controle" integer DEFAULT 0 NOT NULL,
	"points_scannes" integer DEFAULT 0 NOT NULL,
	"anomalies" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" text PRIMARY KEY,
	"nom" text NOT NULL,
	"adresse" text DEFAULT '' NOT NULL,
	"zone" text DEFAULT '' NOT NULL,
	"type" text DEFAULT 'Standard' NOT NULL,
	"surface" integer DEFAULT 0 NOT NULL,
	"criticite" text DEFAULT 'moyenne' NOT NULL,
	"capteurs" integer DEFAULT 0 NOT NULL,
	"score_risque" integer DEFAULT 0 NOT NULL,
	"lat" double precision DEFAULT 0 NOT NULL,
	"lng" double precision DEFAULT 0 NOT NULL
);
