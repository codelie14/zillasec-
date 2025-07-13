Cluster = ["ABIDJAN(ABJ)", "DAKAR(DKR)"]

affiliates (ABJ) = ["OCI", "OCD", "OCM", "OGN", "OSL", "OLB"]

affiliates (DKR) = ["OCF", "OGB", "OBW", "OSN", "OML", "OMG"]

Domaines = ["IN", "VAS", "PS", "IP", "TRANS", "RAN", "CLOUD", " DIGITAL"]

    
### **Architecture des Plateformes par Domaine**  
*(Basé sur PLATEFORME_DOMAINES.xlsx)*  

```python
plateformes_par_domaine = {

    "IN": [
        "ZSMART", "ZMC", "STATTOOL", 
        "DC OSG ElasticNET (supervision)",
        "WT CEPH(admin)", "PCRF",
        "COMPTE SUDO SERVEUR DE REBOND"
    ],
    "TRANS": [
        "NMS 1353", "NMS 1354", "NFM-P",
        "NCE-TX&IP", "3SR", "netnumen",
        "NFMT / Liquid", "NCE MW"
    ],
    "RAN": [
        "NETACT", "U2020 RAN", "PRS",
        "ORION", "ELASTICNET"
    ],
    "IP": [
        "AMS", "NCE", "CACTI"
    ],
    "VAS": [
        "OMA USSD Cellcube", "System USSD (Acces root)",
        "MMG (Smsc Gateway)", "VMS", "I2000 (Smsc)"
    ],
    "PS": [
        "U2020", "USN", "DNS WEB",
        "Firewall SRX", "Bluecat", "PGW"
    ],
    "CLOUD": [
        "OpenStack", "Esight", "Fusion Sphere"
    ],
    "DIGITAL": [
        "ENM", "OSS-RC"
    ]
}
```

---

### **Mapping Complet des Filtres**  
```javascript
// Configuration des filtres hiérarchiques
const filterHierarchy = {
  clusters: [
    { 
      id: "ABJ", 
      name: "ABIDJAN(ABJ)",
      affiliates: ["OCI", "OCD", "OCM", "OGN", "OSL", "OLB"],
      domaines: ["IN", "TRANS", "RAN", "IP", "VAS", "PS", "CLOUD", "DIGITAL"]
    },
    {
      id: "DKR",
      name: "DAKAR(DKR)", 
      affiliates: ["OCF", "OGB", "OBW", "OSN", "OML", "OMG"],
      domaines: ["IN", "TRANS", "RAN", "IP", "VAS", "PS", "CLOUD", "DIGITAL"]
    }
  ]
}
```

---

### **Workflow d'Intégration**  
1. **Chargement initial** :  
   ```sql
   SELECT DISTINCT domaine FROM plateformes 
   WHERE cluster = ? ORDER BY domaine;
   ```

2. **Filtrage dynamique** :  
   ```javascript
   // Exemple React
   const [plateformes, setPlateformes] = useState([]);
   
   useEffect(() => {
     if (domaine) {
       setPlateformes(plateformes_par_domaine[domaine] || []);
     }
   }, [domaine]);
   ```

3. **Validation backend** :  
   ```python
   # API endpoint
   @app.get("/api/plateformes")
   def get_plateformes(domaine: str):
       return plateformes_par_domaine.get(domaine, [])
   ```

---

### **Bonnes Pratiques**  
1. **Normalisation** :  
   - Uniformiser les noms (ex: `"ELASTICNET"` → `"ElasticNet"`)  
   - Supprimer les doublons (ex: `PRS` présent 2x dans `RAN`)  

2. **Documentation** :  
   ```markdown
   | Domaine | Plateformes Critiques          |
   |---------|-------------------------------|
   | IN      | ZSMART, WT CEPH(admin)        |
   | TRANS   | NFM-P, NCE-TX&IP              |
   ```

3. **Sécurité** :  
   - Taguer les accès admin (`"(admin)"` dans le nom → `is_admin: true`)  

---

### **Exemple de Sortie UI**  
```json
{
  "selectedCluster": "ABJ",
  "selectedAffiliate": "OCI",
  "selectedDomaine": "IN",
  "availablePlateformes": [
    "ZSMART", 
    "ZMC",
    "STATTOOL"
  ]
}
```
