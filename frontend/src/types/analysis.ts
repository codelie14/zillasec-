// Corresponds to the Pydantic models in the backend

export interface FileAnalysisMetrics {
    score_risque: number;
    confiance_analyse: number;
}

export interface FileAnalysisResult {
    synthese: string;
    anomalies: string[];
    risques: string[];
    recommandations: string[];
    metriques: FileAnalysisMetrics;
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
    resultat_analyse: FileAnalysisResult;
}