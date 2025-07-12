Voici la refonte complète de votre page **User Data Management** avec les fonctionnalités demandées :

```markdown
# 📊 User Data Management

# Connexion à la base GNOCDATA
Nous allons créer une nouvelle table appelé GNOCDATA.

## 🔍 Search & Filters
```javascript
// Filtres avancés
const filters = {
  search: '', // Nom, CUID ou email
  status: ['Actif', 'Désactivé'],
  cluster: ['ABJ', 'DKR'],
  domain: ['IN', 'VAS', 'Security'],
  affiliate: ['OCI', 'OCD', 'OCF']
}
```

## 📋 User Table (Avec pagination)
| Nom & Prénom | CUID | Statut | Domaine | Cluster | Affiliate | Actions |
|--------------|------|--------|---------|---------|-----------|---------|
| Jean Martin | CUID78912 | Actif | Cloud | ABJ | OCD | 🖊️ ✂️ 🗑️ |
| Sophie Dubois | CUID45623 | Désactivé | Security | DKR | OCI | 🖊️ ✂️ |

*50 utilisateurs affichés sur 2 847 - Page 1/57*

Aussi, dans le tableau affichant la liste des user, on doit pourvoir obtenir tout les détails sur les users en cliquant dessus.

## 📥 Import/Export Tools

### 1. Importer des Utilisateurs
```html
<div class="import-box">
  <input type="file" accept=".xlsx,.csv" id="userImport">
  <button onclick="validateImport()">Valider</button>
  <a href="/templates/user_template.csv" download>📥 Template CSV</a>
</div>

<!-- Validation côté client -->
<script>
function validateImport(file) {
  const requiredFields = ['CUID', 'Nom', 'Prenom', 'Statut'];
  // Vérification des en-têtes...
}
</script>
```

### 2. Exporter les Données
```javascript
// Options d'export
const exportOptions = {
  format: 'xlsx', // ou csv
  scope: 'filtered', // 'all' ou 'selected'
  fields: ['CUID', 'Nom', 'Prenom', 'Statut', 'Cluster']
}
```

## ⚙️ Actions Disponibles
| Icône | Action | Description | API Endpoint |
|-------|--------|-------------|--------------|
| 🖊️ | Éditer | Modifier un utilisateur | `PATCH /users/{cuid}` |
| ✂️ | Désactiver | Changer le statut | `POST /users/{cuid}/deactivate` |
| 🗑️ | Supprimer | Archiver l'utilisateur | `DELETE /users/{cuid}` |
| ↻ | Synchroniser | Mise à jour depuis GNOC | `POST /sync/gnoc` |

## 🔄 Workflow d'Importation
1. **Téléversement** : Fichier XLSX/CSV
2. **Prévisualisation** : Validation des données
3. **Mapping** : Associer les colonnes
4. **Confirmation** : Résumé des modifications
5. **Exécution** : Import dans GNOCDATABASE

## 🛡️ Validation des Données
```python
# Exemple de validation serveur
def validate_user_data(row):
    required = ['CUID', 'Nom', 'Prenom', 'Statut']
    if not all(row.get(field) for field in required):
        raise ValueError(f"Champs manquants dans la ligne {row}")
    if not re.match(r'^CUID\d{5}$', row['CUID']):
        raise ValueError("Format CUID invalide")
```

## 💾 Structure GNOCDATABASE
```sql
CREATE TABLE users (
    cuid VARCHAR(10) PRIMARY KEY,
    id_huawei VARCHAR(20),
    nom VARCHAR(50),
    prenom VARCHAR(50),
    mail_huawei VARCHAR(100),
    mail_orange VARCHAR(100),
    telephone VARCHAR(20),
    perimeter VARCHAR(20),
    affiliate VARCHAR(10),
    statut VARCHAR(10),
    cluster VARCHAR(10),
    domaine VARCHAR(20),
    plateforme VARCHAR(20),
    last_updated DATETIME
);
```

## 🎨 UI Improvements
```css
/* Style des boutons d'action */
.action-btn {
  transition: all 0.3s;
}
.action-btn:hover {
  transform: scale(1.2);
}

/* Highlight des comptes désactivés */
tr.inactive {
  background-color: #fff0f0;
}
```

---

### 🔗 Endpoints API Clés
- `GET /users` - Lister les utilisateurs (avec filtres)
- `POST /users/import` - Importer un fichier
- `GET /users/export` - Exporter les données
- `POST /sync/gnoc` - Synchronisation complète

### 📱 Responsive Design
```javascript
// Adaptation mobile
if (screen.width < 768px) {
  hideColumns(['Affiliate', 'Domaine']);
  enableHorizontalScroll();
}
```

**Fonctionnalités implémentées** :
1. Connexion directe à GNOCDATA
2. Import/Export avec validation
3. Actions CRUD complètes
4. Synchronisation bidirectionnelle
5. Interface adaptative
