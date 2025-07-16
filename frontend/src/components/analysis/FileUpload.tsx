import React, { useCallback, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, File as FileIcon, X, CheckCircle, AlertCircle, Bot, ChevronDown } from 'lucide-react';
import { AnalysisResponse } from '../../types/analysis';

// Data from GEMINI.md
const filterData = {
  clusters: [
    { id: "ABJ", name: "ABIDJAN (ABJ)" },
    { id: "DKR", name: "DAKAR (DKR)" },
  ],
  affiliates: {
    ABJ: ["OCI", "OCD", "OCM", "OGN", "OSL", "OLB"],
    DKR: ["OCF", "OGB", "OBW", "OSN", "OML", "OMG"],
  },
  domaines: ["IN", "VAS", "PS", "IP", "TRANS", "RAN", "CLOUD", "DIGITAL", "CS"],
  plateformes_par_domaine: {
    "IN": ["ZSMART", "ZMC", "STATTOOL", "DC OSG ElasticNET (supervision)", "WT CEPH(admin)", "PCRF", "COMPTE SUDO SERVEUR DE REBOND"],
    "TRANS": ["NMS 1353", "NMS 1354", "NFM-P", "NCE-TX&IP", "3SR", "netnumen", "NFMT / Liquid", "NCE MW"],
    "RAN": ["NETACT", "U2020 RAN", "PRS", "ORION", "ELASTICNET"],
    "IP": ["AMS", "NCE", "CACTI"],
    "VAS": ["OMA USSD Cellcube", "System USSD (Acces root)", "MMG (Smsc Gateway)", "VMS", "I2000 (Smsc)"],
    "PS": ["U2020", "USN", "DNS WEB", "Firewall SRX", "Bluecat", "PGW"],
    "CS": ["MAE/U2020", "MSC/VLR", "MGW", "SPS", "SBC", "PSX", "EMS", "Ribbon Protect", "iGWB", "SiWF", "PGW HSS", "PGWPSP", "U2020", "Oracle SBC", "NETNUMEN/SDM", "MSC", "MGW", "SPS: USC", "IMS", "IDIH", "SDM (HSS)", "E5MS", "PTS Oracle"],
    "CLOUD": ["OpenStack", "Esight", "Fusion Sphere"],
    "DIGITAL": ["ENM", "OSS-RC"]
  }
};

interface UploadedFile {
  id: string;
  file: File;
  status: 'ready' | 'analyzing' | 'completed' | 'error';
  error?: string;
}

interface FileUploadProps {
  onAnalysisComplete: (result: AnalysisResponse) => void;
}

const DEFAULT_INSTRUCTION = `Analysez ces données d'accès et identifiez: 1) Les anomalies, 2) Les risques potentiels, 3) Les suggestions d'amélioration. Structurez la réponse en JSON.`;

export const FileUpload: React.FC<FileUploadProps> = ({ onAnalysisComplete }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [instruction, setInstruction] = useState(DEFAULT_INSTRUCTION);
  
  // State for filters
  const [selectedCluster, setSelectedCluster] = useState<string>("ABJ");
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>("");
  const [selectedDomaine, setSelectedDomaine] = useState<string>("");
  const [selectedPlateforme, setSelectedPlateforme] = useState<string>("");
  const [availablePlateformes, setAvailablePlateformes] = useState<string[]>([]);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.templateInstruction) {
      setInstruction(location.state.templateInstruction);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedDomaine) {
      setAvailablePlateformes(filterData.plateformes_par_domaine[selectedDomaine as keyof typeof filterData.plateformes_par_domaine] || []);
      setSelectedPlateforme(""); // Reset plateforme on domain change
    } else {
      setAvailablePlateformes([]);
    }
  }, [selectedDomaine]);
  
  useEffect(() => {
    // Reset affiliate when cluster changes
    setSelectedAffiliate("");
  }, [selectedCluster]);


  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  }, []);

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'text/csv'
    );
    const uploadedFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'ready',
    }));
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const startAnalysis = async (id: string) => {
    const fileToAnalyze = files.find(f => f.id === id);
    if (!fileToAnalyze) return;

    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'analyzing' } : f));

    const formData = new FormData();
    formData.append('file', fileToAnalyze.file);
    formData.append('instruction', instruction);
    formData.append('metadata', JSON.stringify({
      cluster: selectedCluster,
      affiliate: selectedAffiliate,
      domaine: selectedDomaine,
      plateforme: selectedPlateforme,
    }));

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const result: AnalysisResponse = await response.json();
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'completed' } : f));
      onAnalysisComplete(result);

    } catch (error: any) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error', error: error.message } : f));
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'analyzing': return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <FileIcon className="h-5 w-5 text-slate-400" />;
    }
  };
  
  const isAnalysisDisabled = !selectedDomaine || !selectedPlateforme;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyse de Fichier</h2>
        <p className="text-slate-600">Importez des fichiers Excel ou CSV pour une analyse de sécurité contextuelle.</p>
      </div>

      {/* Context Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Contexte de l'Analyse</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cluster */}
          <SelectControl label="Cluster" value={selectedCluster} onChange={e => setSelectedCluster(e.target.value)}>
            {filterData.clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectControl>
          
          {/* Affiliate */}
          <SelectControl label="Affiliate" value={selectedAffiliate} onChange={e => setSelectedAffiliate(e.target.value)} disabled={!selectedCluster}>
            <option value="">Sélectionner l'affilié</option>
            {(filterData.affiliates[selectedCluster as keyof typeof filterData.affiliates] || []).map(a => <option key={a} value={a}>{a}</option>)}
          </SelectControl>

          {/* Domaine */}
          <SelectControl label="Domaine" value={selectedDomaine} onChange={e => setSelectedDomaine(e.target.value)}>
            <option value="">Sélectionner le domaine</option>
            {filterData.domaines.map(d => <option key={d} value={d}>{d}</option>)}
          </SelectControl>

          {/* Plateforme */}
          <SelectControl label="Plateforme" value={selectedPlateforme} onChange={e => setSelectedPlateforme(e.target.value)} disabled={!selectedDomaine}>
            <option value="">Sélectionner la plateforme</option>
            {availablePlateformes.map(p => <option key={p} value={p}>{p}</option>)}
          </SelectControl>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-slate-400'
        }`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      >
        <input type="file" multiple accept=".xlsx,.xls,.csv" onChange={handleFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900">Glissez-déposez ou cliquez pour importer</h3>
        <p className="text-slate-600">Fichiers supportés : Excel (.xlsx, .xls) et CSV.</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Fichiers importés</h3>
          <div className="space-y-4">
            {files.map((uploadedFile) => (
              <div key={uploadedFile.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(uploadedFile.status)}
                  <div>
                    <p className="font-medium text-slate-900">{uploadedFile.file.name}</p>
                    <p className="text-sm text-slate-600">{(uploadedFile.file.size / 1024).toFixed(1)} KB</p>
                    {uploadedFile.status === 'error' && <p className="text-xs text-red-500 mt-1">{uploadedFile.error}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {uploadedFile.status === 'ready' && (
                    <button
                      onClick={() => startAnalysis(uploadedFile.id)}
                      disabled={isAnalysisDisabled}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-slate-400 disabled:cursor-not-allowed"
                      title={isAnalysisDisabled ? "Veuillez sélectionner un domaine et une plateforme" : "Lancer l'analyse"}
                    >
                      Analyser
                    </button>
                  )}
                  {uploadedFile.status === 'completed' && <p className="text-sm font-medium text-emerald-600">Terminé</p>}
                  <button onClick={() => removeFile(uploadedFile.id)} className="p-2 text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Instruction Text Area */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
        <label htmlFor="instruction" className="flex items-center text-lg font-semibold text-slate-900 mb-3">
          <Bot className="h-6 w-6 mr-2 text-blue-600" />
          <span>Instruction d'Analyse (Prompt)</span>
        </label>
        <textarea
          id="instruction"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          rows={6}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Saisissez l'instruction pour l'IA..."
        />
        <button onClick={() => setInstruction(DEFAULT_INSTRUCTION)} className="mt-3 text-sm text-slate-600 hover:text-blue-600">
          Réinitialiser
        </button>
      </div>
    </div>
  );
};

// Custom Select Component
const SelectControl: React.FC<{label: string, children: React.ReactNode, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, disabled?: boolean}> = 
({ label, children, value, onChange, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none bg-white border border-slate-300 rounded-md py-2 px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
      >
        {children}
      </select>
      <ChevronDown className="h-5 w-5 text-slate-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);