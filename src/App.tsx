import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KidLobby from './components/KidLobby';
import HubWithWelcome from './components/HubWithWelcome';
import MisionDiagnostico from './components/MisionDiagnostico';
import MisionVolcan from './components/MisionVolcan';
import MisionInundacion from './components/MisionInundacion';
import MisionSismo from './components/MisionSismo';
import MisionEvacuacion from './components/MisionEvacuacion';
import AdminPanel from './components/AdminPanel';
import AdminGate from './components/AdminGate';
import CustomCursor from './components/CustomCursor';
import MapasPage from './components/MapasPage';
import MapasAdminWithTerritory from './components/MapasAdminWithTerritory';
import TerritorialAdminPage from './components/TerritorialAdminPage';
import VideosPage from './components/VideosPage';

function App() {
  return (
    <Router>
      <div className="kids-theme min-h-screen">
        <CustomCursor />
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
      </div>
    </Router>
  );
}

export default App;
