import React, { useState } from 'react';
import { AlertTriangle, Bell, Shield, Clock, CheckCircle, X, Eye } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'access' | 'system' | 'compliance';
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  source: string;
}

export const Alerts: React.FC = () => {
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | Alert['severity']>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | Alert['status']>('all');

  const alerts: Alert[] = [
    {
      id: '1',
      title: 'Unusual Access Pattern Detected',
      description: 'User john.doe@company.com accessed 47 different systems within 2 hours',
      severity: 'high',
      category: 'security',
      timestamp: '2024-01-15T14:30:00Z',
      status: 'active',
      source: 'AI Analysis Engine'
    },
    {
      id: '2',
      title: 'Failed Login Attempts',
      description: 'Multiple failed login attempts detected from IP 192.168.1.100',
      severity: 'critical',
      category: 'security',
      timestamp: '2024-01-15T13:45:00Z',
      status: 'active',
      source: 'Access Monitor'
    },
    {
      id: '3',
      title: 'Privilege Escalation Detected',
      description: 'User permissions were elevated without proper authorization',
      severity: 'critical',
      category: 'access',
      timestamp: '2024-01-15T12:20:00Z',
      status: 'acknowledged',
      source: 'Permission Tracker'
    },
    {
      id: '4',
      title: 'System Performance Degradation',
      description: 'Analysis processing time increased by 40% in the last hour',
      severity: 'medium',
      category: 'system',
      timestamp: '2024-01-15T11:15:00Z',
      status: 'resolved',
      source: 'System Monitor'
    },
    {
      id: '5',
      title: 'Compliance Violation',
      description: 'Data retention policy violation detected in archived files',
      severity: 'high',
      category: 'compliance',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'active',
      source: 'Compliance Engine'
    }
  ];

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'low':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
    }
  };

  const getStatusIcon = (status: Alert['status']) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'acknowledged':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    }
  };

  const getCategoryIcon = (category: Alert['category']) => {
    switch (category) {
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'access':
        return <Eye className="h-4 w-4" />;
      case 'system':
        return <AlertTriangle className="h-4 w-4" />;
      case 'compliance':
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || alert.status === selectedStatus;
    return matchesSeverity && matchesStatus;
  });

  const activeAlertsCount = alerts.filter(alert => alert.status === 'active').length;
  const criticalAlertsCount = alerts.filter(alert => alert.severity === 'critical' && alert.status === 'active').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Security Alerts</h1>
        <p className="text-slate-600 dark:text-slate-300">Monitor and manage security alerts and notifications</p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Alerts', value: activeAlertsCount.toString(), icon: Bell, color: 'red' },
          { label: 'Critical', value: criticalAlertsCount.toString(), icon: AlertTriangle, color: 'red' },
          { label: 'Acknowledged', value: '3', icon: Clock, color: 'orange' },
          { label: 'Resolved Today', value: '12', icon: CheckCircle, color: 'green' }
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value as any)}
          className="px-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="all">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>

        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Mark All as Read
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border-l-4 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 ${getSeverityColor(alert.severity)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(alert.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{alert.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-300 mb-3">{alert.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(alert.category)}
                      <span className="capitalize">{alert.category}</span>
                    </div>
                    <span>•</span>
                    <span>{alert.source}</span>
                    <span>•</span>
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {alert.status === 'active' && (
                  <>
                    <button className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors">
                      Acknowledge
                    </button>
                    <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors">
                      Resolve
                    </button>
                  </>
                )}
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};