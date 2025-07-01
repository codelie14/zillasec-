import React, { useState, useEffect } from 'react';
import { Template } from '../../types/template';

interface TemplateFormProps {
  template?: Template | null;
  onSave: (template: Omit<Template, 'id' | 'createdAt' | 'lastUsed' | 'usageCount'>) => void;
  onCancel: () => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({ template, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'analysis' | 'report' | 'alert' | 'custom'>('analysis');
  const [type, setType] = useState<'prompt' | 'report' | 'dashboard'>('prompt');
  const [content, setContent] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setCategory(template.category);
      setType(template.type);
      setContent(template.content);
      setIsDefault(template.isDefault);
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, description, category, type, content, isDefault });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{template ? 'Edit' : 'Create'} Template</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="analysis">Analysis</option>
                <option value="report">Report</option>
                <option value="alert">Alert</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="prompt">Prompt</option>
                <option value="report">Report</option>
                <option value="dashboard">Dashboard</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter template content (e.g., prompt text, report structure)"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              id="isDefault"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">Set as default</label>
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};