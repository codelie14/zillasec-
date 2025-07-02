import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Search, Edit, Trash2, Shield, Mail, Calendar, Eye } from 'lucide-react';

interface FileData {
  id: number;
  nom: string;
  prenom: string;
  id_huawei: string;
  cuid: string;
  mail_huawei: string;
  mail_orange: string;
  numero_telephone: string;
  domaine: string;
  cluster: string;
  statut: string;
  created_at: string;
  analysis_id: number;
}

const API_URL = 'http://localhost:8000';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<FileData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FileData | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/filedata/`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: FileData) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDelete = (user: FileData) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };
  
  const handleView = (user: FileData) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        const response = await fetch(`${API_URL}/filedata/${selectedUser.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete user');
        }
        setUsers(users.filter(u => u.id !== selectedUser.id));
        setDeleteModalOpen(false);
        setSelectedUser(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
  };

  const confirmEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedUser) {
        try {
            const response = await fetch(`${API_URL}/filedata/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedUser),
            });
            if (!response.ok) {
                throw new Error('Failed to update user');
            }
            const updatedUser = await response.json();
            setUsers(users.map(u => (u.id === updatedUser.id ? updatedUser : u)));
            setEditModalOpen(false);
            setSelectedUser(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    }
};


  const filteredUsers = users.filter(user =>
    (user.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.prenom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.cuid?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.mail_huawei?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">User Data Management</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage user data from uploaded files.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, CUID, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Nom & Prénom</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">CUID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Domaine</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Cluster</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{user.nom} {user.prenom}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">{user.mail_huawei}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.cuid}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.statut === 'Actif' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700/30 text-slate-800 dark:text-slate-300'}`}>
                      {user.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.domaine}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.cluster}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => handleView(user)} className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleEdit(user)} className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(user)} className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">View User Details</h2>
            <div className="space-y-2 text-slate-700 dark:text-slate-300">
              <p><strong>Nom:</strong> {selectedUser.nom}</p>
              <p><strong>Prénom:</strong> {selectedUser.prenom}</p>
              <p><strong>ID Huawei:</strong> {selectedUser.id_huawei}</p>
              <p><strong>CUID:</strong> {selectedUser.cuid}</p>
              <p><strong>Mail Huawei:</strong> {selectedUser.mail_huawei}</p>
              <p><strong>Mail Orange:</strong> {selectedUser.mail_orange}</p>
              <p><strong>Téléphone:</strong> {selectedUser.numero_telephone}</p>
              <p><strong>Domaine:</strong> {selectedUser.domaine}</p>
              <p><strong>Cluster:</strong> {selectedUser.cluster}</p>
              <p><strong>Statut:</strong> {selectedUser.statut}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
                  <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Edit User</h2>
                  <form onSubmit={confirmEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(selectedUser).map(key => {
                          if (key === 'id' || key === 'created_at' || key === 'analysis_id') return null;
                          return (
                              <div key={key}>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 capitalize">{key.replace('_', ' ')}</label>
                                  <input
                                      type="text"
                                      value={selectedUser[key as keyof FileData] as string || ''}
                                      onChange={(e) => setSelectedUser({ ...selectedUser, [key]: e.target.value })}
                                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  />
                              </div>
                          );
                      })}
                      <div className="col-span-1 md:col-span-2 mt-6 flex justify-end space-x-4">
                          <button type="button" onClick={() => setEditModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-lg">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
                      </div>
                  </form>
              </div>
          </div>
      )}


      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Confirm Deletion</h2>
            <p className="text-slate-600 dark:text-slate-300">Are you sure you want to delete user {selectedUser.prenom} {selectedUser.nom}? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};