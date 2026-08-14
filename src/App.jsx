import { useState, useEffect } from 'react';
import ARExperience from './components/ARExperience';
import HotspotEditor from './components/HotspotEditor';
import { loadConfig, defaultConfig } from './config/defaultConfig';
import './index.css';

function App() {
  const [mode, setMode] = useState('ar'); // 'ar' or 'editor'
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      // Try to load config from environment or use default
      const configUrl = import.meta.env.VITE_CONFIG_URL || '/config.json';
      const loadedConfig = await loadConfig(configUrl);
      setConfig(loadedConfig);
      setLoading(false);
    };

    initApp();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white text-lg">Loading AR Experience...</p>
        </div>
      </div>
    );
  }

  // Query param to enable editor mode
  const isEditor = new URLSearchParams(window.location.search).get('editor') === 'true';

  if (isEditor || mode === 'editor') {
    return <HotspotEditor />;
  }

  return <ARExperience config={config} />;
}

export default App;
