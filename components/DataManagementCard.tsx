import React, { useState, useEffect } from 'react';
import { useLearningSystem } from '../hooks/useLearningSystem';

interface DataManagementCardProps {
  className?: string;
}

const DataManagementCard: React.FC<DataManagementCardProps> = ({ className = '' }) => {
  const { exportData, importData, getDataStats, isInitialized, loadDataFromFile, hasStoredData } = useLearningSystem();
  const [stats, setStats] = useState<{ samples: number; lastBackup: Date | null; dbSize: number; sessionItems: number } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized) {
      loadStats();
    }
  }, [isInitialized]);

  const loadStats = async () => {
    try {
      const dataStats = await getDataStats();
      setStats(dataStats);
    } catch (error) {
      console.error('Failed to load data stats:', error);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);
    
    try {
      await exportData();
      setMessage('✅ Data exported successfully! Check your downloads folder.');
      setTimeout(() => setMessage(null), 5000);
      await loadStats(); // Refresh stats
    } catch (error) {
      setMessage('❌ Export failed. Please try again.');
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setMessage('❌ Please select a valid JSON backup file.');
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setIsImporting(true);
    setMessage(null);

    importData(file)
      .then(() => {
        setMessage('✅ Data imported successfully! Your learning data has been restored.');
        setTimeout(() => setMessage(null), 5000);
        loadStats(); // Refresh stats
      })
      .catch((error) => {
        console.error('Import failed:', error);
        setMessage('❌ Import failed. The backup file may be corrupted or invalid.');
        setTimeout(() => setMessage(null), 5000);
      })
      .finally(() => {
        setIsImporting(false);
        // Reset file input
        event.target.value = '';
      });
  };

  const handleManualLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setMessage('❌ Please select a valid JSON backup file.');
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setIsImporting(true);
    setMessage(null);

    loadDataFromFile(file)
      .then(() => {
        setMessage('✅ Data loaded successfully! Your machine learning data has been restored.');
        setTimeout(() => setMessage(null), 5000);
        loadStats(); // Refresh stats
        // Reload the page to refresh all components
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch((error) => {
        console.error('Manual load failed:', error);
        setMessage('❌ Load failed. The backup file may be corrupted or invalid.');
        setTimeout(() => setMessage(null), 5000);
      })
      .finally(() => {
        setIsImporting(false);
        // Reset file input
        event.target.value = '';
      });
  };

  if (!isInitialized) {
    return (
      <div className={`bg-surface border border-surface-border rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-on-surface-muted">Loading data...</span>
        </div>
      </div>
    );
  }

  const hasData = hasStoredData();

  return (
    <div className={`bg-surface border border-surface-border rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-on-surface">Data Management</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${hasData ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div className="text-sm text-on-surface-muted">
            {hasData ? 'Data Available' : 'No Data'}
            {stats && ` • ${stats.samples} samples`}
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {/* Export Section */}
        <div className="border border-surface-border rounded-md p-4">
          <h4 className="font-medium text-on-surface mb-2">Export Learning Data</h4>
          <p className="text-sm text-on-surface-muted mb-3">
            Create a backup of all your learned preferences and training data.
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-primary text-on-primary px-4 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? 'Exporting...' : '📥 Export Data'}
          </button>
        </div>

        {/* Import Section */}
        <div className="border border-surface-border rounded-md p-4">
          <h4 className="font-medium text-on-surface mb-2">Import Learning Data</h4>
          <p className="text-sm text-on-surface-muted mb-3">
            Restore your learning data from a previous backup file.
          </p>
          <div className="space-y-2">
            <label className="w-full bg-secondary text-on-secondary px-4 py-2 rounded-md hover:bg-secondary-dark cursor-pointer transition-colors inline-block text-center">
              {isImporting ? 'Importing...' : '📤 Import from Backup'}
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
            </label>
            <label className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer transition-colors inline-block text-center">
              🔄 Load Data Manually
              <input
                type="file"
                accept=".json"
                onChange={handleManualLoad}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Data Stats */}
        {stats && (
          <div className="border border-surface-border rounded-md p-4 bg-surface-muted">
            <h4 className="font-medium text-on-surface mb-2">Data Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-on-surface-muted">Training Samples:</span>
                <span className="ml-2 font-medium text-on-surface">{stats.samples}</span>
              </div>
              <div>
                <span className="text-on-surface-muted">Session Items:</span>
                <span className="ml-2 font-medium text-on-surface">{stats.sessionItems}</span>
              </div>
              <div>
                <span className="text-on-surface-muted">Last Backup:</span>
                <span className="ml-2 font-medium text-on-surface">
                  {stats.lastBackup 
                    ? new Date(stats.lastBackup).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
              <div>
                <span className="text-on-surface-muted">Data Size:</span>
                <span className="ml-2 font-medium text-on-surface">{Math.round(stats.dbSize / 1024)} KB</span>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex items-start">
            <div className="text-yellow-600 mr-2">⚠️</div>
            <div className="text-sm text-yellow-800">
              <strong>Important:</strong> Your learning data is now stored in a local database that persists between browser sessions. 
              However, it can still be lost if you clear browser data or use incognito mode. 
              Make regular backups to avoid losing your training data.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagementCard;

