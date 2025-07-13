import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Download, RefreshCw, SlidersHorizontal, Users, TrendingUp, UserX } from 'lucide-react';
import PptxGenJS from 'pptxgenjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

// --- NEW HIERARCHICAL MOCK DATA from GEMINI.md ---
const filterHierarchy = {
  clusters: [
    { id: "ABJ", name: "ABIDJAN(ABJ)", affiliates: ["OCI", "OCD", "OCM", "OGN", "OSL", "OLB"], domaines: ["IN", "TRANS", "RAN", "IP", "VAS", "PS", "CLOUD", "DIGITAL"] },
    { id: "DKR", name: "DAKAR(DKR)", affiliates: ["OCF", "OGB", "OBW", "OSN", "OML", "OMG"], domaines: ["IN", "TRANS", "RAN", "IP", "VAS", "PS", "CLOUD", "DIGITAL"] }
  ]
};

const plateformes_par_domaine = {
    "IN": ["ZSMART", "ZMC", "STATTOOL", "DC OSG ElasticNET (supervision)", "WT CEPH(admin)", "PCRF", "COMPTE SUDO SERVEUR DE REBOND"],
    "TRANS": ["NMS 1353", "NMS 1354", "NFM-P", "NCE-TX&IP", "3SR", "netnumen", "NFMT / Liquid", "NCE MW"],
    "RAN": ["NETACT", "U2020 RAN", "PRS", "ORION", "ELASTICNET"],
    "IP": ["AMS", "NCE", "CACTI"],
    "VAS": ["OMA USSD Cellcube", "System USSD (Acces root)", "MMG (Smsc Gateway)", "VMS", "I2000 (Smsc)"],
    "PS": ["U2020", "USN", "DNS WEB", "Firewall SRX", "Bluecat", "PGW"],
    "CLOUD": ["OpenStack", "Esight", "Fusion Sphere"],
    "DIGITAL": ["ENM", "OSS-RC"]
};

const generateMockData = () => {
  const data = [];
  const statuses = ['Actif', 'Désactivé'];
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
  const allPlateformes = Object.values(plateformes_par_domaine).flat();

  for (let i = 0; i < 10000; i++) {
    const clusterInfo = filterHierarchy.clusters[Math.floor(Math.random() * filterHierarchy.clusters.length)];
    const affiliate = clusterInfo.affiliates[Math.floor(Math.random() * clusterInfo.affiliates.length)];
    const domaine = clusterInfo.domaines[Math.floor(Math.random() * clusterInfo.domaines.length)];
    const plateformesForDomaine = plateformes_par_domaine[domaine] || allPlateformes;
    const plateforme = plateformesForDomaine[Math.floor(Math.random() * plateformesForDomaine.length)];
    const account_type = ['GNOC', 'Affiliate', 'Admin', 'Support', 'Non Identifié'][Math.floor(Math.random() * 5)];
    const status = Math.random() > 0.2 ? 'Actif' : 'Désactivé';
    const month = months[Math.floor(Math.random() * months.length)];
    
    data.push({ id: i, cluster: clusterInfo.id, affiliate, domaine, plateforme, account_type, status, month });
  }
  return data;
};

const allMockData = generateMockData();
// --- END MOCK DATA ---

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) { return initialValue; }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) { console.error(error); }
  };
  return [storedValue, setValue];
};

const emptyChartData = { labels: [], datasets: [{ data: [], backgroundColor: ['#cccccc'] }] };

export const Analytics: React.FC = () => {
  const [filters, setFilters] = useLocalStorage('analyticsFilters', { cluster: 'all', affiliate: 'all', domaine: 'all', plateforme: 'all' });

  const pieChartRef = useRef<ChartJS<'pie'>>(null);
  const lineChartRef = useRef<ChartJS<'line'>>(null);

  // --- Filter options based on hierarchy ---
  const availableAffiliates = useMemo(() => {
    if (filters.cluster === 'all') return [];
    const selectedCluster = filterHierarchy.clusters.find(c => c.id === filters.cluster);
    return selectedCluster ? selectedCluster.affiliates : [];
  }, [filters.cluster]);

  const availableDomaines = useMemo(() => {
    if (filters.cluster === 'all') return [];
     const selectedCluster = filterHierarchy.clusters.find(c => c.id === filters.cluster);
    return selectedCluster ? selectedCluster.domaines : [];
  }, [filters.cluster]);

  const availablePlateformes = useMemo(() => {
    if (filters.domaine === 'all') return [];
    return plateformes_par_domaine[filters.domaine] || [];
  }, [filters.domaine]);

  // --- Data calculation based on filters ---
  const displayData = useMemo(() => {
    const filtered = allMockData.filter(item =>
      (filters.cluster === 'all' || item.cluster === filters.cluster) &&
      (filters.affiliate === 'all' || item.affiliate === filters.affiliate) &&
      (filters.domaine === 'all' || item.domaine === filters.domaine) &&
      (filters.plateforme === 'all' || item.plateforme === filters.plateforme)
    );

    const total_active = filtered.filter(i => i.status === 'Actif').length;
    const total_disabled = filtered.filter(i => i.status === 'Désactivé').length;

    let pieChartData;
    let pieChartTitle = "Répartition";

    if (filters.plateforme !== 'all') {
        pieChartTitle = `Types de comptes pour ${filters.plateforme}`;
        const accountTypeCounts = filtered.reduce((acc, item) => {
            acc[item.account_type] = (acc[item.account_type] || 0) + 1;
            return acc;
        }, {});
        pieChartData = { labels: Object.keys(accountTypeCounts), datasets: [{ data: Object.values(accountTypeCounts) }] };
    } else if (filters.domaine !== 'all') {
        pieChartTitle = `Répartition pour le domaine ${filters.domaine}`;
        const platformCounts = filtered.reduce((acc, item) => {
            acc[item.plateforme] = (acc[item.plateforme] || 0) + 1;
            return acc;
        }, {});
        pieChartData = { labels: Object.keys(platformCounts), datasets: [{ data: Object.values(platformCounts) }] };
    } else {
        pieChartTitle = `Répartition par Domaine`;
        const domaineCounts = filtered.reduce((acc, item) => {
            acc[item.domaine] = (acc[item.domaine] || 0) + 1;
            return acc;
        }, {});
        pieChartData = { labels: Object.keys(domaineCounts), datasets: [{ data: Object.values(domaineCounts) }] };
    }
     pieChartData.datasets[0].backgroundColor = ['#4A90E2', '#F5A623', '#7ED321', '#BD10E0', '#D0D0D0', '#4E79A7', '#F28E2B', '#A0CBE8', '#FFBE7D', '#8CD17D'];


    const active_accounts_trend = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [{
        label: 'Comptes Actifs',
        data: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'].map(month => filtered.filter(i => i.status === 'Actif' && i.month === month).length),
        borderColor: '#4CAF50',
        fill: true,
        tension: 0.4,
      }],
    };

    const platform_details_table = (filters.domaine === 'all' ? Object.keys(plateformes_par_domaine).flat() : availablePlateformes).map(p => {
      const platformItems = filtered.filter(i => i.plateforme === p);
      const total = platformItems.length;
      if (total === 0) return null;

      return {
        plateforme: p,
        total,
        comptesGNOC: platformItems.filter(i => i.account_type === 'GNOC').length,
        comptesAffiliate: platformItems.filter(i => i.account_type === 'Affiliate').length,
        comptesAdmin: platformItems.filter(i => i.account_type === 'Admin').length,
        comptesSupport: platformItems.filter(i => i.account_type === 'Support').length,
        comptesActif: platformItems.filter(i => i.status === 'Actif').length,
        comptesDesactive: platformItems.filter(i => i.status === 'Désactivé').length,
        comptesNonIdentifie: platformItems.filter(i => i.account_type === 'Non Identifié').length,
      };
    }).filter(Boolean).sort((a, b) => b.total - a.total);

    return { total_active, total_disabled, pieChartData, pieChartTitle, active_accounts_trend, platform_details_table };
  }, [filters]);

  // --- Filter change handlers ---
  useEffect(() => { handleFilterChange('affiliate', 'all'); }, [filters.cluster]);
  useEffect(() => { handleFilterChange('plateforme', 'all'); }, [filters.domaine]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, [filterName]: value };
      if (filterName === 'cluster') { newFilters.affiliate = 'all'; newFilters.domaine = 'all'; newFilters.plateforme = 'all'; }
      if (filterName === 'affiliate') { newFilters.domaine = 'all'; newFilters.plateforme = 'all'; }
      if (filterName === 'domaine') { newFilters.plateforme = 'all'; }
      return newFilters;
    });
  };

  const handleGenerateReport = async () => {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';

    // Slide 1: Title
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: '003366' };
    titleSlide.addText('Rapport Analytics', { x: 0.5, y: 2.0, fontSize: 48, bold: true, color: 'FFFFFF' });
    const filterText = `Filtres: Cluster(${filters.cluster}), Affiliate(${filters.affiliate}), Domaine(${filters.domaine}), Plateforme(${filters.plateforme})`;
    titleSlide.addText(filterText, { x: 0.5, y: 3.0, fontSize: 14, color: 'F0F0F0' });
    titleSlide.addText(`Généré le: ${new Date().toLocaleDateString()}`, { x: 0.5, y: 5.0, fontSize: 12, color: 'CCCCCC' });

    // Slide 2: Key Metrics
    const metricsSlide = pptx.addSlide();
    metricsSlide.addText('Indicateurs Clés', { x: 0.5, y: 0.25, fontSize: 24, bold: true, color: '003366' });
    metricsSlide.addText([
        { text: 'Comptes Actifs Totaux: ', options: { fontSize: 22, bold: true } },
        { text: displayData.total_active.toLocaleString(), options: { fontSize: 22, color: '4CAF50' } }
    ], { x: 1, y: 1.5 });
    metricsSlide.addText([
        { text: 'Comptes Désactivés Totaux: ', options: { fontSize: 22, bold: true } },
        { text: displayData.total_disabled.toLocaleString(), options: { fontSize: 22, color: 'D32F2F' } }
    ], { x: 1, y: 2.5 });

    // Slide 3: Visualizations
    const vizSlide = pptx.addSlide();
    vizSlide.addText('Visualisations des Données', { x: 0.5, y: 0.25, fontSize: 24, bold: true, color: '003366' });
    
    vizSlide.addText(displayData.pieChartTitle, { x: 0.5, y: 0.8, w: 5.5, align: 'center', fontSize: 14, bold: true });
    vizSlide.addText('Évolution des comptes actifs', { x: 6.5, y: 0.8, w: 6.0, align: 'center', fontSize: 14, bold: true });

    const pieChartImg = pieChartRef.current?.toBase64Image();
    if (pieChartImg) vizSlide.addImage({ data: pieChartImg, x: 0.5, y: 1.2, w: 5.5, h: 4.0 });
    const lineChartImg = lineChartRef.current?.toBase64Image();
    if (lineChartImg) vizSlide.addImage({ data: lineChartImg, x: 6.5, y: 1.2, w: 6.0, h: 4.0 });

    // Slide 4: Details Table
    const tableSlide = pptx.addSlide();
    tableSlide.addText('Détails par Plateforme', { x: 0.5, y: 0.25, fontSize: 24, bold: true, color: '003366' });
    const tableHeaders = [['Plateforme', 'Total', 'GNOC', 'Affiliate', 'Admin', 'Support', 'Actif', 'Désactivé', 'Non Identifié']];
    const tableRows = displayData.platform_details_table.map(item => [
        item.plateforme, item.total.toString(), item.comptesGNOC.toString(), item.comptesAffiliate.toString(),
        item.comptesAdmin.toString(), item.comptesSupport.toString(), item.comptesActif.toString(),
        item.comptesDesactive.toString(), item.comptesNonIdentifie.toString()
    ]);
    tableSlide.addTable(tableHeaders.concat(tableRows), { 
        x: 0.5, y: 1.0, w: 12.0, 
        rowH: 0.4, 
        fill: { color: 'F7F7F7' }, 
        border: { type: 'solid', pt: 1, color: 'CCCCCC' }, 
        align: 'center', 
        valign: 'middle', 
        fontSize: 9,
        colW: [2.5, 1, 1, 1, 1, 1, 1, 1, 1.5],
        autoPage: true,
    });

    await pptx.writeFile({ fileName: `Rapport_Analytics_${new Date().toISOString().split('T')[0]}.pptx` });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Dashboard V3</h1>
        <p className="text-slate-600 dark:text-slate-300">Analyse hiérarchique des plateformes par domaine.</p>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
                <SlidersHorizontal className="h-5 w-5 text-slate-500" />
                <h3 className="text-md font-semibold">Filtres:</h3>
                <select value={filters.cluster} onChange={e => handleFilterChange('cluster', e.target.value)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm">
                    <option value="all">Tous les Clusters</option>
                    {filterHierarchy.clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={filters.affiliate} onChange={e => handleFilterChange('affiliate', e.target.value)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm" disabled={filters.cluster === 'all'}>
                    <option value="all">Toutes les Affiliates</option>
                    {availableAffiliates.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select value={filters.domaine} onChange={e => handleFilterChange('domaine', e.target.value)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm" disabled={filters.cluster === 'all'}>
                    <option value="all">Tous les Domaines</option>
                    {availableDomaines.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={filters.plateforme} onChange={e => handleFilterChange('plateforme', e.target.value)} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm" disabled={filters.domaine === 'all'}>
                    <option value="all">Toutes les Plateformes</option>
                    {availablePlateformes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div className="flex items-center space-x-3">
                <button onClick={() => window.location.reload()} className="flex items-center px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600">
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </button>
                <button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                    <Download className="h-4 w-4" /> Générer
                </button>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DetailCard icon={TrendingUp} label="Total Actifs" value={displayData.total_active} className="text-emerald-500" />
        <DetailCard icon={UserX} label="Total Désactivés" value={displayData.total_disabled} className="text-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4">{displayData.pieChartTitle}</h3>
          <div className="h-80 flex items-center justify-center">
            <Pie ref={pieChartRef} data={displayData.pieChartData || emptyChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
          </div>
        </div>
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Évolution des comptes actifs</h3>
          <div className="h-80">
            <Line ref={lineChartRef} data={displayData.active_accounts_trend || emptyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-6"><h3 className="text-lg font-semibold">Détails par Plateforme</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-700 dark:text-slate-300 uppercase">
              <tr>
                <th className="px-4 py-3">Plateforme</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">GNOC</th>
                <th className="px-4 py-3 text-right">Affiliate</th>
                <th className="px-4 py-3 text-right">Admin</th>
                <th className="px-4 py-3 text-right">Support</th>
                <th className="px-4 py-3 text-right">Actif</th>
                <th className="px-4 py-3 text-right">Désactivé</th>
                <th className="px-4 py-3 text-right">Non Identifié</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {displayData.platform_details_table.map(item => (
                <tr key={item.plateforme} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-4 font-bold">{item.plateforme}</td>
                  <td className="px-4 py-4 text-right font-semibold">{item.total.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right">{item.comptesGNOC.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right">{item.comptesAffiliate.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right">{item.comptesAdmin.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right">{item.comptesSupport.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-emerald-600">{item.comptesActif.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-red-600">{item.comptesDesactive.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-amber-600">{item.comptesNonIdentifie.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ icon: Icon, label, value, className = '' }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-4">
        <div className="bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className={`text-xl font-bold text-slate-900 dark:text-white ${className}`}>{value.toLocaleString()}</p>
        </div>
    </div>
);
