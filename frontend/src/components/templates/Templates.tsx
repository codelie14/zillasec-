import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { Template } from '../../types/template';
import { TemplateForm } from './TemplateForm';

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Template['category']>('all');
  const [selectedType, setSelectedType] = useState<'all' | Template['type']>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/templates/');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        const response = await fetch(`http://localhost:8000/templates/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete template');
        }
        fetchTemplates(); // Refresh the list
      } catch (err) {
        alert(err instanceof Error ? err.message : String(err));
      }
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleSave = async (templateData: Omit<Template, 'id' | 'createdAt' | 'lastUsed' | 'usageCount'>) => {
    const url = editingTemplate
      ? `http://localhost:8000/templates/${editingTemplate.id}`
      : 'http://localhost:8000/templates/';
    const method = editingTemplate ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });
      if (!response.ok) {
        throw new Error(`Failed to save template`);
      }
      fetchTemplates();
      setIsFormOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const getCategoryColor = (category: Template['category']) => {
    switch (category) {
      case 'analysis':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'report':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
      case 'alert':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'custom':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
    }
  };

  const getTypeIcon = (type: Template['type']) => {
    switch (type) {
      case 'prompt':
        return '💬';
      case 'report':
        return '📊';
      case 'dashboard':
        return '📈';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesType = selectedType === 'all' || template.type === selectedType;
    return matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Templates</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage analysis prompts, reports, and dashboard templates</p>
        </div>
        <button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors">
          <Plus className="h-5 w-5" />
          <span>Create Template</span>
        </button>
      </div>

      {/* Template Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { category: 'analysis', label: 'Analysis', count: templates.filter(t => t.category === 'analysis').length, icon: '🔍' },
          { category: 'report', label: 'Reports', count: templates.filter(t => t.category === 'report').length, icon: '📊' },
          { category: 'alert', label: 'Alerts', count: templates.filter(t => t.category === 'alert').length, icon: '🚨' },
          { category: 'custom', label: 'Custom', count: templates.filter(t => t.category === 'custom').length, icon: '⚙️' }
        ].map((cat) => (
          <div key={cat.category} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-2xl">{cat.icon}</span>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{cat.label}</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{cat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          aria-label="Filter by category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="px-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="all">All Categories</option>
          <option value="analysis">Analysis</option>
          <option value="report">Reports</option>
          <option value="alert">Alerts</option>
          <option value="custom">Custom</option>
        </select>

        <select
          aria-label="Filter by type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="px-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="all">All Types</option>
          <option value="prompt">Prompts</option>
          <option value="report">Reports</option>
          <option value="dashboard">Dashboards</option>
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Templates Grid */}
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getTypeIcon(template.type)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{template.name}</h3>
                        {template.isDefault && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{template.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                    {template.category.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <span>Used {template.usageCount} times</span>
                  <span>Last used: {template.lastUsed ? new Date(template.lastUsed).toLocaleDateString() : 'Never'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button aria-label="Preview template" className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button aria-label="Copy template" className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleEdit(template)} aria-label="Edit template" className="p-2 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      aria-label="Delete template"
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {isFormOpen && (
        <TemplateForm
          template={editingTemplate}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};