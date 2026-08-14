import { useRef, useState } from 'react';
import { FiDownload, FiPlus, FiX, FiEdit2 } from 'react-icons/fi';

export const HotspotEditor = () => {
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [selectedHotspotId, setSelectedHotspotId] = useState(null);
  const [editMode, setEditMode] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setHotspots([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current || !image) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newHotspot = {
      id: `hotspot-${Date.now()}`,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      name: 'New Creature',
      type: 'creature',
      creatureId: '',
    };

    setHotspots([...hotspots, newHotspot]);
    setSelectedHotspotId(newHotspot.id);
    setEditMode(newHotspot.id);
  };

  const updateHotspot = (id, updates) => {
    setHotspots(
      hotspots.map(h => h.id === id ? { ...h, ...updates } : h)
    );
  };

  const deleteHotspot = (id) => {
    setHotspots(hotspots.filter(h => h.id !== id));
    setSelectedHotspotId(null);
    setEditMode(null);
  };

  const exportConfig = () => {
    const config = {
      version: '1.0.0',
      mural: {
        name: 'Marine Life Mural',
        location: 'Beachfront Restaurant',
      },
      hotspots: hotspots.map(h => ({
        id: h.id,
        x: parseFloat(h.x.toFixed(2)),
        y: parseFloat(h.y.toFixed(2)),
        name: h.name,
        type: h.type,
        creatureId: h.creatureId || '',
        actionUrl: h.actionUrl || '',
      })),
      creatures: [
        {
          id: 'sea-turtle',
          name: 'Sea Turtle',
          scientificName: 'Chelonia mydas',
          description: 'Graceful marine reptiles that migrate thousands of miles across ocean basins.',
          facts: [
            'Can hold their breath for up to 7 hours',
            'Travel over 10,000 miles in their lifetime',
            'Temperature of sand determines sex of hatchlings',
          ],
          links: [
            {
              label: 'Sea Turtle Rescue',
              url: 'https://seaturtle.org',
            },
          ],
        },
      ],
      weather: {
        enabled: true,
        updateInterval: 300000,
      },
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mural-config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedHotspot = hotspots.find(h => h.id === selectedHotspotId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mural Hotspot Editor</h1>
          <p className="text-gray-600">Upload your mural photo and click to place interactive hotspots</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Canvas area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {!image ? (
                <div
                  className="w-full h-96 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <FiPlus className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Click to upload mural photo</p>
                    <p className="text-sm text-gray-500">or drag and drop</p>
                  </div>
                </div>
              ) : (
                <div className="relative inline-block w-full">
                  <img
                    ref={canvasRef}
                    src={image}
                    alt="Mural"
                    className="w-full cursor-crosshair"
                    onClick={handleCanvasClick}
                  />
                  {/* Hotspot markers */}
                  {hotspots.map(hotspot => (
                    <button
                      key={hotspot.id}
                      className={`absolute w-10 h-10 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs font-bold transition ${
                        selectedHotspotId === hotspot.id
                          ? 'bg-blue-500 border-blue-700 text-white'
                          : 'bg-green-400 border-green-600 text-white hover:bg-green-500'
                      }`}
                      style={{
                        left: `${hotspot.x}%`,
                        top: `${hotspot.y}%`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHotspotId(hotspot.id);
                        setEditMode(null);
                      }}
                    >
                      {hotspots.indexOf(hotspot) + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {image && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Change Photo
                </button>
                <button
                  onClick={exportConfig}
                  disabled={hotspots.length === 0}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FiDownload /> Export JSON
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Edit panel */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {hotspots.length > 0 ? `Hotspots (${hotspots.length})` : 'No hotspots yet'}
            </h2>

            {selectedHotspot ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedHotspot.name}
                    onChange={(e) => updateHotspot(selectedHotspot.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Creature ID
                  </label>
                  <input
                    type="text"
                    value={selectedHotspot.creatureId}
                    onChange={(e) => updateHotspot(selectedHotspot.id, { creatureId: e.target.value })}
                    placeholder="e.g., sea-turtle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={selectedHotspot.x.toFixed(1)}
                      onChange={(e) => updateHotspot(selectedHotspot.id, { x: parseFloat(e.target.value) })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="X %"
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={selectedHotspot.y.toFixed(1)}
                      onChange={(e) => updateHotspot(selectedHotspot.id, { y: parseFloat(e.target.value) })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Y %"
                    />
                  </div>
                </div>

                <button
                  onClick={() => deleteHotspot(selectedHotspot.id)}
                  className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center justify-center gap-2"
                >
                  <FiX /> Delete
                </button>
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                {hotspots.length === 0
                  ? 'Click on the image to add hotspots'
                  : 'Select a hotspot to edit'}
              </div>
            )}

            {/* List of hotspots */}
            {hotspots.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">All Hotspots</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {hotspots.map((hotspot, idx) => (
                    <button
                      key={hotspot.id}
                      onClick={() => setSelectedHotspotId(hotspot.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                        selectedHotspotId === hotspot.id
                          ? 'bg-indigo-100 border border-indigo-300'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium text-gray-800">#{idx + 1} {hotspot.name}</div>
                      <div className="text-xs text-gray-500">
                        {hotspot.x.toFixed(1)}%, {hotspot.y.toFixed(1)}%
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotspotEditor;
