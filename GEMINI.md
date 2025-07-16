"Lorsqu'un fichier CSV ou XLSX est uploadé, analyse-le selon ce schéma JSON strict :

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
3. Un compte est 'filiale' s'il n'est pas 'dans la base de données'
4. Vérifie toujours la cohérence CUID/ID Huawei
5. Formatte les dates en ISO 8601