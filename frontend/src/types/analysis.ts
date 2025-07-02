// Corresponds to the Pydantic models in the backend

export interface Metadata {
  fichier: string;
  date_analyse: string;
  lignes_analysees: number;
}

export interface Statistiques {
  total_comptes: number;
  comptes_actifs: number;
  comptes_desactives: number;
  comptes_admin: number;
  comptes_filiale: number;
  comptes_support: number;
}

export interface IncoherenceStatut {
  nom: string;
  prenom: string;
  statut_fichier: string;
  statut_bd: string;
}

export interface VerificationBD {
  comptes_presents: number;
  comptes_absents: number;
  incoherences_statut: IncoherenceStatut[];
}

export interface Alertes {
  admin_desactives: number;
  acces_sensibles_desactives: number;
  doublons_cuid: string[];
}

export interface DetailCompte {
  nom: string;
  prenom: string;
  id_huawei: string;
  cuid: string;
  statut: string;
  present_en_bd: boolean;
  statut_bd: string | null;
}

export interface CustomAnalysisResult {
  metadata: Metadata;
  statistiques: Statistiques;
  verification_bd: VerificationBD;
  alertes: Alertes;
  details_comptes: DetailCompte[];
}

export interface FileDetails {
  nom: string;
  type: string;
  taille: number;
  colonnes: string[];
  lignes: number;
}

export interface AnalysisResponse {
  id: number;
  fichier_details: FileDetails;
  resultat_analyse: CustomAnalysisResult;
}