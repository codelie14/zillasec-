# Prompt IA : 
"Lorsqu'un fichier CSV est uploadé, analyse-le selon ce schéma JSON strict :

{
  "metadata": {
    "fichier": string,
    "date_analyse": date,
    "lignes_analysees": integer
  },
  "statistiques": {
    "total_comptes": integer,
    "comptes_actifs": integer,
    "comptes_desactives": integer,
    "comptes_admin": integer,
    "comptes_filiale": integer,
    "comptes_support": integer
  },
  "verification_bd": {
    "comptes_presents": integer,
    "comptes_absents": integer,
    "incoherences_statut": [
      {
        "nom": string,
        "prenom": string,
        "statut_fichier": string,
        "statut_bd": string
      }
    ]
  },
  "alertes": {
    "admin_desactives": integer,
    "acces_sensibles_desactives": integer,
    "doublons_cuid": [string]
  },
  "details_comptes": [
    {
      "nom": string,
      "prenom": string,
      "id_huawei": string,
      "cuid": string,
      "statut": string,
      "present_en_bd": boolean,
      "statut_bd": string|null
    }
  ]
}

Règles :
1. Un compte est 'admin' si son domaine contient 'Admin', 'Security' ou '5G'
2. Un compte est 'support' si son domaine contient 'Support' ou 'DevOps'
3. Un compte est 'filiale' si son cluster n'est pas 'Paris'
4. Vérifie toujours la cohérence CUID/ID Huawei
5. Formatte les dates en ISO 8601

# Exemple de Réponse JSON :
{
  "metadata": {
    "fichier": "employees_access_list.csv",
    "date_analyse": "2023-11-25T14:30:00Z",
    "lignes_analysees": 20
  },
  "statistiques": {
    "total_comptes": 20,
    "comptes_actifs": 10,
    "comptes_desactives": 10,
    "comptes_admin": 3,
    "comptes_filiale": 17,
    "comptes_support": 5
  },
  "verification_bd": {
    "comptes_presents": 18,
    "comptes_absents": 2,
    "incoherences_statut": [
      {
        "nom": "Roux",
        "prenom": "Michel",
        "statut_fichier": "Actif",
        "statut_bd": "Désactivé"
      }
    ]
  },
  "alertes": {
    "admin_desactives": 1,
    "acces_sensibles_desactives": 3,
    "doublons_cuid": ["CUID45623"]
  },
  "details_comptes": [
    {
      "nom": "Martin",
      "prenom": "Jean",
      "id_huawei": "EMP20345",
      "cuid": "CUID78912",
      "statut": "Actif",
      "present_en_bd": true,
      "statut_bd": "Actif"
    },
    {
      "nom": "Bernard",
      "prenom": "Pierre",
      "id_huawei": "EMP21567",
      "cuid": "CUID12345",
      "statut": "Actif",
      "present_en_bd": false,
      "statut_bd": null
    }
  ]
}