import React, { useState, useEffect } from 'react';
import { Table, Loader2, Trash2, AlertTriangle } from 'lucide-react';

const DatabasePage: React.FC = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[] | null>(null);
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setError(null);
        setLoadingTables(true);
        const response = await fetch('http://127.0.0.1:8000/database/tables/');
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to fetch tables: ${response.status} ${errorData}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("Invalid format for tables list received from server.");
        }
        setTables(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoadingTables(false);
      }
    };
    fetchTables();
  }, []);

  useEffect(() => {
    if (!selectedTable) {
      setTableData(null);
      return;
    }

    const fetchTableData = async () => {
      try {
        setError(null);
        setLoadingData(true);
        const response = await fetch(`http://127.0.0.1:8000/database/tables/${selectedTable}`);
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to fetch data for table ${selectedTable}: ${response.status} ${errorData}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("Invalid format for table data received from server.");
        }
        setTableData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoadingData(false);
      }
    };

    fetchTableData();
  }, [selectedTable]);

  const handleClearTable = async () => {
    if (!selectedTable) return;

    if (window.confirm(`Are you sure you want to clear all data from the "${selectedTable}" table? This action cannot be undone.`)) {
      try {
        setLoadingData(true);
        setError(null);
        const response = await fetch(`http://127.0.0.1:8000/database/tables/${selectedTable}/clear`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to clear table ${selectedTable}: ${response.status} ${errorData}`);
        }
        // Refresh table data
        setTableData([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoadingData(false);
      }
    }
  };

  const handleDeleteRow = async (row: any) => {
    if (!selectedTable) return;

    if (window.confirm(`Are you sure you want to delete this row?`)) {
      try {
        setLoadingData(true);
        setError(null);
        const response = await fetch(`http://127.0.0.1:8000/database/tables/${selectedTable}/rows`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(row),
        });
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to delete row: ${response.status} ${errorData}`);
        }
        // Refresh table data by filtering out the deleted row
        setTableData(prevData => prevData ? prevData.filter(r => r !== row) : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoadingData(false);
      }
    }
  };

  const renderTable = () => {
    if (loadingData) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (!selectedTable) {
      return <div className="text-slate-500 text-center p-4">Select a table to view its content.</div>;
    }
    
    if (error) {
      return <div className="text-red-500 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</div>;
    }

    if (!tableData) {
        return null;
    }

    if (tableData.length === 0) {
      return <div className="text-slate-500 text-center p-4">No data in this table.</div>;
    }

    const headers = Object.keys(tableData[0] || {});

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700">
              {headers.map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  {header}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                {headers.map((header) => (
                  <td key={`${rowIndex}-${header}`} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    {String(row[header])}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                  <button onClick={() => handleDeleteRow(row)} className="text-red-600 hover:text-red-800" aria-label="Delete row">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Database Management</h1>
        <button
          onClick={handleClearTable}
          disabled={!selectedTable || loadingData}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-5 w-5" />
          <span>Clear Table</span>
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <Table className="h-5 w-5 mr-2" />
              Tables
            </h2>
            {loadingTables ? (
              <div className="flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : error && tables.length === 0 ? (
                <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</div>
            ) : (
              <ul className="space-y-2">
                {tables.map((table) => (
                  <li key={table}>
                    <button
                      onClick={() => setSelectedTable(table)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedTable === table
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {table}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg min-h-[10rem] overflow-hidden">
            {renderTable()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabasePage;