export interface Template {
  id: number;
  name: string;
  description: string;
  category: 'analysis' | 'report' | 'alert' | 'custom';
  type: 'prompt' | 'report' | 'dashboard';
  createdAt: string;
  lastUsed: string | null;
  usageCount: number;
  isDefault: boolean;
  content: string;
}