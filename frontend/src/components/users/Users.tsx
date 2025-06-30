import React, { useState } from 'react';
import { Users as UsersIcon, Plus, Search, Filter, Edit, Trash2, Shield, Mail, Calendar } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

export const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | User['role']>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | User['status']>('all');

  const users: User[] = [
    {
      id: '1',
      name: 'John Administrator',
      email: 'admin@zillasec.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15T14:30:00Z',
      createdAt: '2023-06-15T10:00:00Z',
      permissions: ['full_access', 'user_management', 'system_config']
    },
    {
      id: '2',
      name: 'Sarah Analyst',
      email: 'sarah.analyst@zillasec.com',
      role: 'analyst',
      status: 'active',
      lastLogin: '2024-01-15T13:45:00Z',
      createdAt: '2023-08-20T14:30:00Z',
      permissions: ['file_analysis', 'report_generation', 'view_insights']
    },
    {
      id: '3',
      name: 'Mike Viewer',
      email: 'mike.viewer@zillasec.com',
      role: 'viewer',
      status: 'active',
      lastLogin: '2024-01-15T09:20:00Z',
      createdAt: '2023-11-10T16:45:00Z',
      permissions: ['view_reports', 'view_dashboard']
    },
    {
      id: '4',
      name: 'Lisa Pending',
      email: 'lisa.pending@zillasec.com',
      role: 'analyst',
      status: 'pending',
      lastLogin: 'Never',
      createdAt: '2024-01-14T11:20:00Z',
      permissions: ['file_analysis', 'view_insights']
    },
    {
      id: '5',
      name: 'Tom Inactive',
      email: 'tom.inactive@zillasec.com',
      role: 'viewer',
      status: 'inactive',
      lastLogin: '2023-12-20T08:15:00Z',
      createdAt: '2023-05-05T12:00:00Z',
      permissions: ['view_reports']
    }
  ];

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'analyst':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'viewer':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
      case 'inactive':
        return 'bg-slate-100 dark:bg-slate-700/30 text-slate-800 dark:text-slate-300';
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">User Management</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage users, roles, and permissions</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors">
          <Plus className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length.toString(), icon: UsersIcon, color: 'blue' },
          { label: 'Active', value: users.filter(u => u.status === 'active').length.toString(), icon: Shield, color: 'green' },
          { label: 'Pending', value: users.filter(u => u.status === 'pending').length.toString(), icon: Calendar, color: 'orange' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length.toString(), icon: Shield, color: 'red' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
        
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as any)}
          className="px-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="analyst">Analyst</option>
          <option value="viewer">Viewer</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Last Login</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Created</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {user.lastLogin === 'Never' ? 'Never' : new Date(user.lastLogin).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
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
    </div>
  );
};