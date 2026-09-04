import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Dashboard from './pages/Dashboard';
import WhatIfAnalysis from './pages/WhatIfAnalysis';
import CropComparison from './pages/CropComparison';
import ModelPerformance from './pages/ModelPerformance';
import About from './pages/About';

export default function App() {
  // Sync initial tab with URL hash if present (e.g. #dashboard -> 'dashboard')
  const getTabFromHash = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const validTabs = ['home', 'calculator', 'dashboard', 'what-if', 'crop-comparison', 'model-performance', 'about'];
    return validTabs.includes(hash) ? hash : 'home';
  };

  const [activeTab, setActiveTabState] = useState(getTabFromHash);
  const [whatIfData, setWhatIfData] = useState(null);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    window.location.hash = `#${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync back/forward browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      setActiveTabState(getTabFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home setActiveTab={setActiveTab} />;
      case 'calculator':
        return <Calculator setActiveTab={setActiveTab} setWhatIfData={setWhatIfData} />;
      case 'dashboard':
        return (
          <ErrorBoundary onGoHome={() => setActiveTab('home')}>
            <Dashboard />
          </ErrorBoundary>
        );
      case 'what-if':
        return (
          <ErrorBoundary onGoHome={() => setActiveTab('home')}>
            <WhatIfAnalysis initialData={whatIfData} />
          </ErrorBoundary>
        );
      case 'crop-comparison':
        return (
          <ErrorBoundary onGoHome={() => setActiveTab('home')}>
            <CropComparison />
          </ErrorBoundary>
        );
      case 'model-performance':
        return (
          <ErrorBoundary onGoHome={() => setActiveTab('home')}>
            <ModelPerformance />
          </ErrorBoundary>
        );
      case 'about':
        return <About setActiveTab={setActiveTab} />;
      default:
        return <Home setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
