// App.tsx
'use client';

import React, { useState } from 'react';
import IsometricMap from '../components/isometric/IsometricMap';
import EnhancedIsometricMap from '../components/isometric/EnhancedIsometricMap';
import '../styles/globals.css';

type MapType = 'basic' | 'enhanced';

const App: React.FC = () => {
  const [currentMap, setCurrentMap] = useState<MapType>('basic');

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Isometric Map Editor</h1>
        <div className="map-selector">
          <button 
            onClick={() => setCurrentMap('basic')}
            className={currentMap === 'basic' ? 'active' : ''}
          >
            Basic Map
          </button>
          <button 
            onClick={() => setCurrentMap('enhanced')}
            className={currentMap === 'enhanced' ? 'active' : ''}
          >
            Enhanced Map
          </button>
        </div>
      </header>
      
      <main>
        {currentMap === 'basic' ? <IsometricMap /> : <EnhancedIsometricMap />}
      </main>
    </div>
  );
};

export default App;
