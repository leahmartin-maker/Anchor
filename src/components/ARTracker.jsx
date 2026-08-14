import { useEffect, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';

export const ARTracker = ({ 
  hotspots, 
  config,
  onHotspotClick,
  weatherOverlay,
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    const initCamera = async () => {
      try {
        console.log('Requesting camera access...');
        
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        // Connect stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(err => {
              console.error('Video play error:', err);
            });
            setCameraReady(true);
            console.log('✓ Camera ready - displaying video feed');
          };
        }
      } catch (err) {
        console.error('Camera access denied or unavailable:', err);
        setCameraError(true);
        setCameraReady(false);
      }
    };

    initCamera();

    return () => {
      // Stop all tracks on cleanup
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-screen bg-black relative overflow-hidden">
      {/* Camera video feed - main AR background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          display: cameraReady ? 'block' : 'none',
          WebkitTransform: 'scaleX(-1)',
          transform: 'scaleX(-1)'
        }}
      />
      
      {/* Dark background when camera not ready */}
      {!cameraReady && (
        <div className="absolute inset-0 bg-black" />
      )}
      
      {/* Hotspot overlay layer - appears on top of video */}
      {cameraReady && (
        <div className="absolute inset-0 pointer-events-none">
          {hotspots && hotspots.map((hotspot) => (
            <HotspotMarker
              key={hotspot.id}
              hotspot={hotspot}
              onClick={() => onHotspotClick(hotspot.id)}
            />
          ))}
        </div>
      )}

      {/* Weather overlay - top right */}
      {weatherOverlay && cameraReady && (
        <div className="absolute top-4 right-4 pointer-events-auto z-10">
          <WeatherWidget data={weatherOverlay} />
        </div>
      )}

      {/* Loading state */}
      {!cameraReady && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-lg mb-2">Initializing Camera...</p>
            <p className="text-sm text-gray-400">Requesting camera access</p>
          </div>
        </div>
      )}

      {/* Camera error state */}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90">
          <div className="text-center text-white max-w-xs">
            <p className="text-lg font-semibold mb-2">🎥 Camera Access Required</p>
            <p className="text-sm text-gray-300 mb-4">
              Please allow camera access in your browser settings to use the AR experience.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Steps:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>1. Click the 🔒 lock icon in your address bar</li>
                <li>2. Find "Camera" and select "Allow"</li>
                <li>3. Refresh the page</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const HotspotMarker = ({ hotspot, onClick }) => {
  return (
    <button
      className="absolute w-12 h-12 rounded-full bg-blue-500 bg-opacity-70 hover:bg-opacity-100 flex items-center justify-center text-white text-xl pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 shadow-lg"
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
      }}
      onClick={onClick}
      title={hotspot.name}
    >
      {hotspot.icon}
    </button>
  );
};

const WeatherWidget = ({ data }) => {
  return (
    <div className="bg-white bg-opacity-90 rounded-lg p-3 shadow-lg min-w-max">
      <div className="text-sm font-semibold text-gray-800 mb-2">Ocean Conditions</div>
      <div className="space-y-1 text-xs text-gray-700">
        <div>🌡️ Temp: {data.temperature}°{data.temperatureUnit}</div>
        <div>💨 Wind: {data.windSpeed}</div>
        <div>☀️ UV Index: {data.uvIndex}</div>
      </div>
      <div className="text-xs text-gray-600 mt-2 italic">
        {data.timestamp && new Date(data.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ARTracker;
