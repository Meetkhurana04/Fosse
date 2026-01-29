// frontend-web/src/App.js
/**
 * Main Application Component
 * 
 * This is the root component that manages:
 * - Authentication state
 * - Current dataset state
 * - Navigation between sections
 * - Layout and styling
 */



import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import Charts from './components/Charts';
import Summary from './components/Summary';
import History from './components/History';
import Login from './components/Login';
import { getLatestDataset, logout, downloadPDF } from './services/api';
import './App.css';

function App() {
  // State for current dataset being displayed
  const [currentDataset, setCurrentDataset] = useState(null);
  
  // Loading state for async operations
  const [loading, setLoading] = useState(false);
  
  // Error message state
  const [error, setError] = useState(null);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // Active tab for navigation
  const [activeTab, setActiveTab] = useState('upload');

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    
    // Load latest dataset on mount
    loadLatestDataset();
  }, []);

  /**
   * Load the most recently uploaded dataset
   */
  const loadLatestDataset = async () => {
    try {
      setLoading(true);
      const data = await getLatestDataset();
      setCurrentDataset(data);
      setError(null);
    } catch (err) {
      // No dataset found is not an error
      if (err.response?.status !== 404) {
        console.error('Error loading dataset:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle successful file upload
   */
  const handleUploadSuccess = (data) => {
    setCurrentDataset(data.dataset);
    setActiveTab('summary');
    setError(null);
  };

  /**
   * Handle dataset selection from history
   */
  const handleSelectDataset = (dataset) => {
    setCurrentDataset(dataset);
    setActiveTab('summary');
  };

  /**
   * Handle login success
   */
  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  /**
   * Handle PDF download
   */
  const handleDownloadPDF = async () => {
    if (currentDataset) {
      try {
        await downloadPDF(currentDataset.id);
      } catch (err) {
        setError('Failed to download PDF');
      }
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>Chemical Equipment Visualizer</h1>
          <div className="header-actions">
            {isAuthenticated ? (
              <div className="user-info">
                <span>Welcome, {user?.username}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setActiveTab('login')} 
                className="btn-login"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="app-nav">
        <button 
          className={`nav-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 25 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Upload
        </button>
        <button 
          className={`nav-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
          disabled={!currentDataset}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 25 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Summary
        </button>
        <button 
          className={`nav-btn ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
          disabled={!currentDataset}
        >
          <svg width="16" height="16" viewBox="0 0 24 20" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg> Data Table
        </button>
        <button 
          className={`nav-btn ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
          disabled={!currentDataset}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 25 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> Charts
        </button>
        <button 
          className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> History
        </button>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {/* Error Display */}
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'login' && !isAuthenticated && (
            <Login onLoginSuccess={handleLoginSuccess} />
          )}

          {activeTab === 'upload' && (
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          )}

          {activeTab === 'summary' && currentDataset && (
            <div className="summary-section">
              <Summary dataset={currentDataset} />
              <button 
                className="btn-download-pdf"
                onClick={handleDownloadPDF}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Download PDF Report
              </button>
            </div>
          )}

          {activeTab === 'table' && currentDataset && (
            <DataTable data={currentDataset.raw_data_parsed} />
          )}

          {activeTab === 'charts' && currentDataset && (
            <Charts dataset={currentDataset} />
          )}

          {activeTab === 'history' && (
            <History onSelectDataset={handleSelectDataset} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Chemical Equipment Parameter Visualizer © 2024</p>
      </footer>
    </div>
  );
}

export default App;