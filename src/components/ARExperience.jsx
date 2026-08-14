import { useEffect, useState } from 'react';
import ARTracker from './ARTracker';
import CreaturePopup from './CreaturePopup';
import { fetchWeatherData } from '../services/noaaService';

export const ARExperience = ({ config }) => {
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize AR experience
    const initializeExperience = async () => {
      // Fetch geolocation for weather
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const weather = await fetchWeatherData(latitude, longitude);
            setWeatherData(weather);
          },
          (error) => {
            console.warn('Geolocation error:', error);
            // Continue without weather data
          }
        );
      }
      setLoading(false);
    };

    initializeExperience();
  }, []);

  const handleHotspotClick = (hotspotId) => {
    const hotspot = config.hotspots.find(h => h.id === hotspotId);
    if (hotspot && hotspot.type === 'creature') {
      const creatureData = config.creatures.find(c => c.id === hotspot.creatureId);
      setSelectedCreature(creatureData);
    } else if (hotspot && hotspot.type === 'anchor') {
      // Open restaurant menu
      if (hotspot.actionUrl) {
        window.open(hotspot.actionUrl, '_blank');
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white text-lg">Initializing AR Experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden">
      <ARTracker
        hotspots={config.hotspots}
        config={config}
        onHotspotClick={handleHotspotClick}
        weatherOverlay={weatherData}
      />
      <CreaturePopup
        creature={selectedCreature}
        onClose={() => setSelectedCreature(null)}
      />
    </div>
  );
};

export default ARExperience;
