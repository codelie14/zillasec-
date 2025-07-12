import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users as UsersIcon, Search, Eye, Upload, Download, ChevronLeft, ChevronRight, Edit, Trash2, AlertTriangle } from 'lucide-react';

// Interface User
interface User {
  id: number;
  nom: string;
  prenom: string;
  cuid: string;
  statut: string;
  domaine: string;
  cluster: string;
  affiliate: string;
  mail_huawei?: string;
  mail_orange?: string;
  numero_telephone?: string;
  plateforme?: string;
  perimeter?: string;
  id_huawei?: string;
}

const API_URL = 'http://localhost:8000';

// Hook pour le debouncing
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// Options pour les filtres
const FILTER_OPTIONS = {
    domain: ['IN', 'VAS', 'Security', 'Cloud', 'Digital'],
    cluster: ['ABJ', 'DKR', 'OCD', 'OCI', 'OCF'],
    status: ['Actif', 'Désactivé'],
    perPage: [10, 30, 50, 100, 200]
};

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filters, setFilters] = useState({
    domain: '',
    cluster: '',
    status: ''
  });
  const [usersPerPage, setUsersPerPage] = useState(10);

  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isClearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [clearAllConfirmationText, setClearAllConfirmationText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Réinitialise la page quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [filters, usersPerPage]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('skip', ((page - 1) * usersPerPage).toString());
    params.append('limit', usersPerPage.toString());
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (filters.domain) params.append('domain', filters.domain);
    if (filters.cluster) params.append('cluster', filters.cluster);
    if (filters.status) params.append('status', filters.status);

    try {
      const response = await fetch(`${API_URL}/api/users?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
      // Idéalement, l'API devrait renvoyer le nombre total de résultats
      setTotalUsers(data.length < usersPerPage ? (page - 1) * usersPerPage + data.length : page * usersPerPage + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, usersPerPage, debouncedSearchTerm, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(users.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleView = (user: User) => { setSelectedUser(user); setViewModalOpen(true); };
  const handleEdit = (user: User) => { setSelectedUser(user); setEditModalOpen(true); };
  const handleDelete = (user: User) => { setSelectedUser(user); setDeleteModalOpen(true); };

  const confirmDelete = async () => {
    const idsToDelete = selectedUser ? [selectedUser.id] : selectedIds;
    if (idsToDelete.length === 0) return;
    try {
      const response = await fetch(`${API_URL}/api/gnocdata/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete }),
      });
      if (!response.ok) throw new Error('Failed to delete user(s)');
      setUsers(users.filter(u => !idsToDelete.includes(u.id)));
      setDeleteModalOpen(false);
      setSelectedUser(null);
      setSelectedIds([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const confirmClearAll = async () => {
    if (clearAllConfirmationText !== 'SUPPRIMER') {
        alert('Confirmation text does not match. Action cancelled.');
        return;
    }
    try {
        const response = await fetch(`${API_URL}/api/gnocdata/clear`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to clear the database');
        setUsers([]);
        setTotalUsers(0);
        setClearAllModalOpen(false);
    } catch (err) {
        alert(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const confirmEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const response = await fetch(`${API_URL}/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUser),
      });
      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = await response.json();
      setUsers(users.map(u => (u.id === updatedUser.id ? updatedUser : u)));
      setEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/import`, { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to import file');
      }
      alert('File imported successfully!');
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred during import');
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
        setLoading(false);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();
  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => e.target.files && handleFileUpload(e.target.files[0]);
  const handleExportClick = async () => {
    try {
        const response = await fetch(`${API_URL}/api/users/export`);
        if (!response.ok) throw new Error('Failed to export users');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (err) {
        alert(err instanceof Error ? err.message : 'An unknown error occurred during export');
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const FilterDropdown = ({ name, label, options, value, onChange }: any) => (
    <select name={name} value={value} onChange={onChange} className="w-full pl-3 pr-8 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
        <option value="">All {label}</option>
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">User Data Management</h1>
          <p className="text-slate-600 dark:text-slate-300">Search, filter, import, and export user data from GNOCDATA.</p>
        </div>
        <div className="flex space-x-2">
            <input type="file" ref={fileInputRef} onChange={handleManualFileSelect} accept=".csv,.xlsx" style={{ display: 'none' }} />
            <button onClick={handleImportClick} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                <Upload className="h-4 w-4" /> Importer
            </button>
            <button onClick={handleExportClick} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" /> Exporter
            </button>
            <button onClick={() => setClearAllModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <AlertTriangle className="h-4 w-4" /> Tout Effacer
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input type="text" placeholder="Search by name, CUID, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" />
            </div>
        </div>
        <FilterDropdown name="domain" label="Domains" options={FILTER_OPTIONS.domain} value={filters.domain} onChange={handleFilterChange} />
        <FilterDropdown name="cluster" label="Clusters" options={FILTER_OPTIONS.cluster} value={filters.cluster} onChange={handleFilterChange} />
        <FilterDropdown name="status" label="Status" options={FILTER_OPTIONS.status} value={filters.status} onChange={handleFilterChange} />
      </div>

      <div className={`relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 shadow-lg overflow-hidden transition-all duration-300 ${isDragging ? 'border-blue-500 ring-4 ring-blue-500/20' : ''}`} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
        {isDragging && (<div className="absolute inset-0 bg-blue-500/10 flex flex-col items-center justify-center z-20 pointer-events-none"><Upload className="h-16 w-16 text-blue-500 animate-bounce" /><p className="mt-4 text-lg font-semibold text-blue-600">Drop file to import</p></div>)}
        <div className={`transition-opacity ${isDragging ? 'opacity-30' : 'opacity-100'}`}>
            {selectedIds.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between">
                    <p className="font-medium text-blue-800 dark:text-blue-200">{selectedIds.length} user(s) selected</p>
                    <button onClick={() => setDeleteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                        <Trash2 className="h-4 w-4" /> Supprimer la sélection
                    </button>
                </div>
            )}
            <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                    <th className="px-6 py-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === users.length && users.length > 0} className="rounded border-slate-400" /></th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Nom & Prénom</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">CUID</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Domaine</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Cluster</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Affiliate</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (<tr><td colSpan={8} className="text-center py-10">Loading...</td></tr>) : error ? (<tr><td colSpan={8} className="text-center py-10 text-red-500">Error: {error}</td></tr>) : (
                    users.map((user) => (
                    <tr key={user.id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${selectedIds.includes(user.id) ? 'bg-blue-100 dark:bg-blue-900/30' : (user.statut && user.statut.toLowerCase().includes('désactivé') ? 'bg-red-50/50 dark:bg-red-900/10' : '')}`}>
                        <td className="px-6 py-4"><input type="checkbox" onChange={() => handleSelectRow(user.id)} checked={selectedIds.includes(user.id)} className="rounded border-slate-400" /></td>
                        <td className="px-6 py-4"><div className="font-medium text-slate-900 dark:text-white">{user.nom} {user.prenom}</div></td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.cuid}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${user.statut && user.statut.toLowerCase().includes('actif') ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700/30 text-slate-800 dark:text-slate-300'}`}>{user.statut}</span></td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.domaine}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.cluster}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.affiliate}</td>
                        <td className="px-6 py-4 text-right"><div className="flex items-center justify-end space-x-2"><button onClick={() => handleView(user)} className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Eye className="h-4 w-4" /></button><button onClick={() => handleEdit(user)} className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Edit className="h-4 w-4" /></button><button onClick={() => handleDelete(user)} className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button></div></td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>
            <div className="flex items-center justify-between px-6 py-3 bg-slate-50 dark:bg-slate-700/50">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Showing <span className="font-medium">{Math.min((page - 1) * usersPerPage + 1, totalUsers)}</span> to <span className="font-medium">{Math.min(page * usersPerPage, totalUsers)}</span> of <span className="font-medium">{totalUsers}</span> results
                    </p>
                    <select value={usersPerPage} onChange={e => setUsersPerPage(Number(e.target.value))} className="py-1 pl-2 pr-7 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                        {FILTER_OPTIONS.perPage.map(num => <option key={num} value={num}>{num} per page</option>)}
                    </select>
                </div>
                <div className="flex items-center space-x-2"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600"><ChevronLeft className="h-5 w-5" /></button><span className="text-sm font-medium">{page}</span><button onClick={() => setPage(p => p + 1)} disabled={users.length < usersPerPage} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600"><ChevronRight className="h-5 w-5" /></button></div>
            </div>
        </div>
      </div>

      {/* Modals */}
      {isViewModalOpen && selectedUser && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-md"><h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">View User Details</h2><div className="space-y-2 text-slate-700 dark:text-slate-300"><p><strong>Nom:</strong> {selectedUser.nom}</p><p><strong>Prénom:</strong> {selectedUser.prenom}</p><p><strong>CUID:</strong> {selectedUser.cuid}</p><p><strong>Mail Huawei:</strong> {selectedUser.mail_huawei || 'N/A'}</p><p><strong>Mail Orange:</strong> {selectedUser.mail_orange || 'N/A'}</p><p><strong>Téléphone:</strong> {selectedUser.numero_telephone || 'N/A'}</p><p><strong>Domaine:</strong> {selectedUser.domaine}</p><p><strong>Cluster:</strong> {selectedUser.cluster}</p><p><strong>Statut:</strong> {selectedUser.statut}</p></div><div className="mt-6 flex justify-end"><button onClick={() => setViewModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg">Close</button></div></div></div>)}
      {isEditModalOpen && selectedUser && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-lg"><h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Edit User</h2><form onSubmit={confirmEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">{Object.keys(selectedUser).filter(k => !['id', 'created_at', 'analysis_id'].includes(k)).map(key => (<div key={key}><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 capitalize">{key.replace('_', ' ')}</label><input type="text" value={(selectedUser as any)[key] || ''} onChange={(e) => setSelectedUser({ ...selectedUser, [key]: e.target.value })} className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"/></div>))}<div className="col-span-1 md:col-span-2 mt-6 flex justify-end space-x-4"><button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button></div></form></div></div>)}
      {isDeleteModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-md"><h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Confirm Deletion</h2><p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete {selectedUser ? 1 : selectedIds.length} user(s)? This action cannot be undone.</p><div className="mt-6 flex justify-end space-x-4"><button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg">Cancel</button><button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button></div></div></div>)}
      {isClearAllModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-md"><h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Clear All Data</h2><p className="text-slate-600 dark:text-slate-300 mb-4">This is an irreversible action. To confirm, please type <strong>SUPPRIMER</strong> in the box below.</p><input type="text" value={clearAllConfirmationText} onChange={(e) => setClearAllConfirmationText(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500" placeholder="SUPPRIMER" /><div className="mt-6 flex justify-end space-x-4"><button onClick={() => setClearAllModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg">Cancel</button><button onClick={confirmClearAll} disabled={clearAllConfirmationText !== 'SUPPRIMER'} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">Confirm</button></div></div></div>)}
    </div>
  );
};

