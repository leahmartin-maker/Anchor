import { FiX, FiExternalLink } from 'react-icons/fi';

export const CreaturePopup = ({ creature, onClose }) => {
  if (!creature) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-sm w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{creature.name}</h2>
            <p className="text-sm text-blue-100 italic">{creature.scientificName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-1 rounded transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {creature.imageUrl && (
            <img
              src={creature.imageUrl}
              alt={creature.name}
              className="w-full h-40 object-cover rounded mb-3"
            />
          )}
          
          <p className="text-gray-700 text-sm mb-4 leading-relaxed">
            {creature.description}
          </p>

          {/* Quick facts */}
          {creature.facts && (
            <div className="bg-gray-50 rounded p-3 mb-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-2">Fun Facts</h3>
              <ul className="text-xs text-gray-700 space-y-1">
                {creature.facts.map((fact, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action links */}
          {creature.links && creature.links.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-800">Learn & Help</h3>
              {creature.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition font-medium"
                >
                  <span>{link.label}</span>
                  <FiExternalLink size={14} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-700 font-medium hover:bg-gray-100 rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreaturePopup;
