// Default configuration template for the AR mural experience
// Copy this file and customize with your creature data, hotspot positions, and URLs

export const defaultConfig = {
  version: '1.0.0',
  app: {
    title: 'Marine Mural AR',
    description: 'Interactive AR experience for the beachfront restaurant mural',
  },
  mural: {
    name: 'Marine Life Mural',
    location: 'Beachfront Restaurant',
    imageName: 'mural.jpg', // Image used for tracking
  },
  // These coordinates come from the hotspot editor tool
  hotspots: [
    // Template - replace with actual positions from editor
    // {
    //   id: 'hotspot-1',
    //   x: 25,
    //   y: 35,
    //   name: 'Sea Turtle',
    //   type: 'creature',
    //   creatureId: 'sea-turtle',
    // },
  ],
  // Creature definitions
  creatures: [
    {
      id: 'sea-turtle',
      name: 'Sea Turtle',
      scientificName: 'Chelonia mydas',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop',
      description:
        'Green sea turtles are graceful marine reptiles that migrate thousands of miles across ocean basins. These ancient mariners can live over 100 years and are vital to maintaining healthy seagrass beds and coral reefs.',
      facts: [
        'Can hold their breath for up to 7 hours underwater',
        'Travel over 10,000 miles during their lifetime migrations',
        'The temperature of the sand determines the sex of hatchlings',
        'Have been on Earth for over 100 million years',
      ],
      links: [
        {
          label: '🐢 Sea Turtle Inc.',
          url: 'https://www.seaturtleinc.org',
        },
        {
          label: '🌊 Ocean Conservancy',
          url: 'https://oceanconservancy.org',
        },
        {
          label: '💚 Adopt a Turtle',
          url: 'https://www.worldwildlife.org/adopt/adopt-a-sea-turtle',
        },
      ],
    },
    {
      id: 'manta-ray',
      name: 'Manta Ray',
      scientificName: 'Manta birostris',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop',
      description:
        'Manta rays are the largest rays in the world and are known for their intelligence and grace. These gentle giants filter-feed on plankton and can leap high out of the water.',
      facts: [
        'Can weigh up to 5,000 pounds',
        'Have the largest brain of any fish relative to body size',
        'Can jump up to 10 feet out of the water',
        'Live in tropical and subtropical waters worldwide',
      ],
      links: [
        {
          label: '🌀 Manta Trust',
          url: 'https://www.mantatrust.org',
        },
        {
          label: '🌊 Marine Conservation',
          url: 'https://marinebio.org',
        },
      ],
    },
    {
      id: 'octopus',
      name: 'Octopus',
      scientificName: 'Octopoda',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop',
      description:
        'Octopuses are highly intelligent cephalopods with the ability to change color and texture instantly. They are masters of camouflage and use their eight arms to explore and hunt.',
      facts: [
        'Have three hearts and blue blood',
        'Can squeeze through any hole larger than their beak',
        'Highly intelligent with complex problem-solving abilities',
        'Can taste with their suckers',
      ],
      links: [
        {
          label: '🧠 Cephalopod Research',
          url: 'https://www.marinebio.org/creatures/cephalopods',
        },
      ],
    },
  ],
  // Special anchor hotspot for restaurant menu
  anchorHotspot: {
    id: 'anchor-menu',
    x: 50,
    y: 50,
    name: 'Restaurant Menu',
    type: 'anchor',
    actionUrl: 'https://example.com/menu', // Replace with actual menu URL
  },
  // Real-time weather data settings
  weather: {
    enabled: true,
    updateInterval: 300000, // 5 minutes in milliseconds
    latitude: 27.7172, // Example: Clearwater, FL - replace with actual location
    longitude: -82.6505,
  },
  // 8thwall settings (now open source, no API key needed)
  xr: {
    // 8thwall is now open source at https://8thwall.org
    // Image tracking features are built-in - no configuration needed
    enableLocationTracking: true,
    enableLightEstimation: true,
  },
};

// Function to fetch config from JSON file or use default
export const loadConfig = async (configUrl) => {
  try {
    const response = await fetch(configUrl);
    return await response.json();
  } catch (error) {
    console.warn('Failed to load config, using default:', error);
    return defaultConfig;
  }
};

export default defaultConfig;
