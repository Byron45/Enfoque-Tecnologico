import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Eager components for initial paint
import KidLobby from './components/KidLobby';
import CustomCursor from './components/CustomCursor';
import FallbackLoader from './components/FallbackLoader';

// Lazy loaded routes
const HubWithWelcome = lazy(() => import('./components/HubWithWelcome'));
const MisionDiagnostico = lazy(() => import('./components/MisionDiagnostico'));
const MisionVolcan = lazy(() => import('./components/MisionVolcan'));
const MisionInundacion = lazy(() => import('./components/MisionInundacion'));
const MisionSismo = lazy(() => import('./components/MisionSismo'));
const MisionEvacuacion = lazy(() => import('./components/MisionEvacuacion'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const AdminGate = lazy(() => import('./components/AdminGate'));
const MapasPage = lazy(() => import('./components/MapasPage'));
const MapasAdminWithTerritory = lazy(() => import('./components/MapasAdminWithTerritory'));
const TerritorialAdminPage = lazy(() => import('./components/TerritorialAdminPage'));
const VideosPage = lazy(() => import('./components/VideosPage'));

function App() {
  return (
    <Router>
      <div className="kids-theme min-h-screen">
        <CustomCursor />
        <Suspense fallback={<FallbackLoader />}>
          <Routes>
            <Route path="/" element={<KidLobby />} />
            <Route path="/hub" element={<HubWithWelcome />} />

            <Route path="/diagnostico" element={<MisionDiagnostico />} />
            <Route path="/volcan" element={<MisionVolcan />} />
            <Route path="/inundacion" element={<MisionInundacion />} />
            <Route path="/sismo" element={<MisionSismo />} />
            <Route path="/evacuacion" element={<MisionEvacuacion />} />

            <Route path="/mapas" element={<MapasPage />} />
            <Route path="/videos" element={<VideosPage />} />

            <Route path="/admin" element={<AdminGate><AdminPanel /></AdminGate>} />
            <Route path="/admin/mapas" element={<AdminGate><MapasAdminWithTerritory /></AdminGate>} />
            <Route path="/admin/territorio" element={<AdminGate><TerritorialAdminPage /></AdminGate>} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
