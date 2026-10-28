import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MainCourante } from './components/MainCourante';
import { Rondes } from './components/Rondes';
import { Alarmes } from './components/Alarmes';
import { Cameras } from './components/Cameras';
import { Sites } from './components/Sites';
import { Agents } from './components/Agents';
import { Demarque } from './components/Demarque';
import { Reporting } from './components/Reporting';
import { AdvancedMap } from './components/AdvancedMapSimple';
import { ShopGuardAI } from './components/ShopGuardAI';
import { CameraSetup } from './components/CameraSetup';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'map': return <AdvancedMap />;
      case 'shopguard': return <ShopGuardAI />;
      case 'camera-setup': return <CameraSetup />;
      case 'main-courante': return <MainCourante />;
      case 'rondes': return <Rondes />;
      case 'alarmes': return <Alarmes />;
      case 'cameras': return <Cameras />;
      case 'sites': return <Sites />;
      case 'agents': return <Agents />;
      case 'demarque': return <Demarque />;
      case 'reporting': return <Reporting />;
      default: return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <ErrorBoundary>
              {renderView()}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
