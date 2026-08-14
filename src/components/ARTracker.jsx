import { useEffect, useRef, useState } from 'react';
import 'mind-ar/dist/mindar-image-three.prod.js';

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
  const [showMuralFallback, setShowMuralFallback] = useState(true);
  const [targetFound, setTargetFound] = useState(false);

  useEffect(() => {
    let active = true;
    let mindarInstance = null;

    const initFallbackCamera = async () => {
      try {
        console.log('Requesting camera access...');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(console.error);
            setCameraReady(true);
            console.log('✓ Camera ready - displaying video feed');
          };
        }
      } catch (err) {
        console.error('Camera access denied or unavailable:', err);
        if (!active) return;
        setCameraError(true);
        setCameraReady(false);
        setShowMuralFallback(true);
      }
    };

    const initTargetTracking = async () => {
      try {
        const MindAR = window.MINDAR?.IMAGE;
        if (!MindAR) {
          throw new Error('MindAR image tracking is unavailable');
        }

        const compiler = new MindAR.Compiler();
        const muralImage = new Image();
        muralImage.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          muralImage.onload = resolve;
          muralImage.onerror = reject;
          muralImage.src = '/mural.jpg';
        });

        const compiledTargets = await compiler.compileImageTargets([muralImage], () => {});
        const outputBuffer = compiler.exportData();
        const imageTargetUrl = URL.createObjectURL(
          new Blob([outputBuffer], { type: 'application/octet-stream' })
        );

        if (!containerRef.current || !active) return;

        mindarInstance = new MindAR.MindARThree({
          container: containerRef.current,
          imageTargetSrc: imageTargetUrl,
          maxTrack: 1,
          uiLoading: 'no',
          uiScanning: 'no',
          uiError: 'no'
        });

        const anchor = mindarInstance.addAnchor(0);
        anchor.onTargetFound = () => {
          if (active) setTargetFound(true);
        };
        anchor.onTargetLost = () => {
          if (active) setTargetFound(false);
        };

        await mindarInstance.start();
        if (!active) return;

        setCameraReady(true);
        setCameraError(false);
        setShowMuralFallback(false);
        console.log('✓ Real image target initialized with mural');
      } catch (err) {
        console.warn('MindAR failed, using fallback camera overlay:', err);
        if (active) {
          setTargetFound(false);
          initFallbackCamera();
        }
      }
    };

    initTargetTracking();

    return () => {
      active = false;
      if (mindarInstance) {
        mindarInstance.stop();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-screen bg-black relative overflow-hidden">
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

      {!cameraReady && showMuralFallback && (
        <img
          src="/mural.jpg"
          alt="Mural preview"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {!cameraReady && (
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      )}

      <div className="absolute inset-0 pointer-events-none" style={{ opacity: targetFound || !cameraReady ? 1 : 0.15 }}>
        {hotspots && hotspots.map((hotspot) => (
          <HotspotMarker
            key={hotspot.id}
            hotspot={hotspot}
            onClick={() => onHotspotClick(hotspot.id)}
          />
        ))}
      </div>

      {weatherOverlay && (
        <div className="absolute top-4 left-4 pointer-events-auto z-10">
          <WeatherWidget data={weatherOverlay} />
        </div>
      )}

      {cameraReady && targetFound && (
        <div className="absolute top-4 right-4 z-10 pointer-events-none rounded-full bg-green-500 bg-opacity-90 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          Target locked
        </div>
      )}

      {!cameraReady && !cameraError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white bg-black bg-opacity-45 px-6 py-5 rounded-xl">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-lg mb-2">Initializing Camera...</p>
            <p className="text-sm text-gray-300">Preparing mural target tracking</p>
          </div>
        </div>
      )}

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
  const waterDisplay =
    data.waterTemperature !== null && data.waterTemperature !== undefined
      ? `${data.waterTemperature}°${data.waterTemperatureUnit || 'C'}`
      : 'Unavailable';

  return (
    <div className="bg-white bg-opacity-90 rounded-lg p-3 shadow-lg min-w-max">
      <div className="text-sm font-semibold text-gray-800 mb-2">Ocean Conditions</div>
      <div className="space-y-1 text-xs text-gray-700">
        <div>🌡️ Air: {data.temperature}°{data.temperatureUnit}</div>
        <div>🌊 Water: {waterDisplay}</div>
        <div>
          💨 Wind: {data.windSpeed}
          {data.windDirection ? ` from ${data.windDirection}` : ''}
        </div>
        <div>☀️ UV Index: {data.uvIndex ?? '—'}</div>
      </div>
      <div className="text-xs text-gray-600 mt-2 italic">
        {data.timestamp && new Date(data.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ARTracker;
