// Default configuration template for the AR mural experience
// Copy this file and customize with your creature data, hotspot positions, and URLs

export const defaultConfig = {
  version: '1.0.0',
  app: {
    title: 'Padre Island Marine Life AR',
    description: 'Interactive AR experience featuring the marine life mural of Padre Island',
  },
  mural: {
    name: 'Padre Island Marine Life Mural',
    location: 'Beachfront Restaurant',
    imageName: 'mural.jpg',
  },
  hotspots: [
    {
      id: 'kemp-ridley',
      x: 18,
      y: 28,
      name: "Kemp's Ridley Sea Turtle",
      type: 'creature',
      creatureId: 'kemp-ridley',
    },
    {
      id: 'green-sea-turtle',
      x: 34,
      y: 24,
      name: 'Green Sea Turtle',
      type: 'creature',
      creatureId: 'green-sea-turtle',
    },
    {
      id: 'loggerhead',
      x: 48,
      y: 38,
      name: 'Loggerhead Sea Turtle',
      type: 'creature',
      creatureId: 'loggerhead',
    },
    {
      id: 'cannonball-jelly',
      x: 58,
      y: 62,
      name: 'Cannonball Jelly',
      type: 'creature',
      creatureId: 'cannonball-jelly',
    },
    {
      id: 'southern-stingray',
      x: 70,
      y: 52,
      name: 'Southern Stingray',
      type: 'creature',
      creatureId: 'southern-stingray',
    },
    {
      id: 'damselfish',
      x: 26,
      y: 70,
      name: 'Damselfish',
      type: 'creature',
      creatureId: 'damselfish',
    },
    {
      id: 'blue-tang',
      x: 38,
      y: 78,
      name: 'Blue Tang',
      type: 'creature',
      creatureId: 'blue-tang',
    },
    {
      id: 'atlantic-spadefish',
      x: 52,
      y: 74,
      name: 'Atlantic Spadefish',
      type: 'creature',
      creatureId: 'atlantic-spadefish',
    },
    {
      id: 'burrfish',
      x: 68,
      y: 78,
      name: 'Striped Burrfish',
      type: 'creature',
      creatureId: 'burrfish',
    },
    {
      id: 'cleaner-shrimp',
      x: 82,
      y: 68,
      name: 'Pederson Cleaner Shrimp',
      type: 'creature',
      creatureId: 'cleaner-shrimp',
    },
    {
      id: 'anchor-menu',
      x: 50,
      y: 88,
      name: 'Restaurant Menu',
      type: 'anchor',
      actionUrl: 'https://example.com/menu',
    },
  ],
  creatures: [
    {
      id: 'kemp-ridley',
      name: "Kemp's Ridley Sea Turtle",
      scientificName: 'Lepidochelys kempii',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70b5?w=300&h=200&fit=crop',
      description:
        "This is the world's most endangered sea turtle, and Padre Island National Seashore is its single most important nesting beach in the United States. Unlike almost all other sea turtles that nest silently under the cover of darkness, Kemp's Ridleys are daytime party animals. They synchronize their nesting into massive, single-day group events called arribadas, right on the Texas sand.",
      facts: [
        'They nest in massive daytime arribadas on the Texas coast',
        'Padre Island is the most important nesting beach in the U.S.',
        'They are the most endangered sea turtle species in the world',
        'Their nesting is synchronized to sudden, enormous group events',
      ],
      links: [
        {
          label: '🌊 Sea Turtle Conservancy',
          url: 'https://www.conserveturtles.org',
        },
        {
          label: '📍 Padre Island National Seashore',
          url: 'https://www.nps.gov/pais/index.htm',
        },
      ],
    },
    {
      id: 'green-sea-turtle',
      name: 'Green Sea Turtle',
      scientificName: 'Chelonia mydas',
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop',
      description:
        'They are actually named after the color of their internal fat, not their shells. This bright green fat is a direct result of their vegetarian diet. Along the Texas coast, the juvenile greens love to hang out around jetty rocks, eating the abundant algae off the granite blocks.',
      facts: [
        'Their fat is green because of their plant-based diet',
        'Juveniles often gather around jetties and rocks',
        'They graze on algae growing on hard surfaces',
        'They can live for decades in coastal waters',
      ],
      links: [
        {
          label: '🐢 Sea Turtle Inc.',
          url: 'https://www.seaturtleinc.org',
        },
        {
          label: '🌊 NOAA Sea Turtles',
          url: 'https://www.fisheries.noaa.gov/topic/sea-turtles',
        },
      ],
    },
    {
      id: 'loggerhead',
      name: 'Loggerhead Sea Turtle',
      scientificName: 'Caretta caretta',
      imageUrl: 'https://images.unsplash.com/photo-1570829054074-3fe2e9f6f8b2?w=300&h=200&fit=crop',
      description:
        'These massive turtles are built like tanks and have giant, muscular heads designed to crush heavy-shelled prey. When they wander into the shallow bays near Padre Island, their favorite local delicacy is the Texas blue crab.',
      facts: [
        'Their powerful jaws are built to crush shellfish',
        'They commonly feed on blue crabs in shallow bay waters',
        'They are among the largest hard-shelled sea turtles',
        'Their heads are adapted for powerful crushing bites',
      ],
      links: [
        {
          label: '🦀 Coastal Ecology',
          url: 'https://www.marinebio.org',
        },
      ],
    },
    {
      id: 'cannonball-jelly',
      name: 'Cannonball Jelly',
      scientificName: 'Stomolophus meleagris',
      imageUrl: 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=300&h=200&fit=crop',
      description:
        "One of the most common jellies you will see washing up on Padre Island is the Cannonball Jelly. Unlike the painful Portuguese Man o' War, these round jellies rarely sting humans. Instead, they secrete a special mucus that drives away predators. Even cooler? Juvenile longnose spider crabs actually hitch a ride inside the bells of these jellies, traveling safely across the Gulf like passengers on an underwater bus!",
      facts: [
        'They are commonly found washing ashore on Texas beaches',
        'They rarely sting humans compared with other jelly species',
        'They produce a protective mucus that deters predators',
        'Young spider crabs sometimes ride inside their bells',
      ],
      links: [
        {
          label: '🪼 Jelly Research',
          url: 'https://www.marinebio.org',
        },
      ],
    },
    {
      id: 'southern-stingray',
      name: 'Southern Stingray',
      scientificName: 'Hypanus americanus',
      imageUrl: 'https://images.unsplash.com/photo-1535402800656-5d4c4348b13c?w=300&h=200&fit=crop',
      description:
        'These stealthy predators use spiracles, the small openings right behind their eyes, to breathe. This allows them to completely bury themselves under the Texas coastal sand to hide from hammerhead sharks while still pumping oxygenated water over their gills. If you walk through the shallows of South Padre Island, doing the famous Stingray Shuffle, sliding your feet along the sand, warns them you are coming so you do not accidentally step on one.',
      facts: [
        'They breathe through spiracles behind the eyes',
        'They can bury themselves in sand while still breathing',
        'The Stingray Shuffle helps avoid accidental encounters',
        'They are masters of camouflage in shallow coastal water',
      ],
      links: [
        {
          label: '🪸 Texas Parks & Wildlife',
          url: 'https://tpwd.texas.gov',
        },
      ],
    },
    {
      id: 'damselfish',
      name: 'Damselfish',
      scientificName: 'Pomacentridae',
      imageUrl: 'https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=300&h=200&fit=crop',
      description:
        'While true clownfish are native to the Indo-Pacific, the Gulf has its own fiercely territorial, colorful matches. The Damselfish, which are in the same genetic family as clownfish, live all over Gulf oil platforms and jetties. Just like Nemo, they aggressively guard their home turf from creatures ten times their size.',
      facts: [
        'They are close relatives of clownfish',
        'They fiercely defend their home territory',
        'They live around jetties and oil platforms',
        'They can be highly aggressive toward intruders',
      ],
      links: [
        {
          label: '🐠 Reef Fish Guide',
          url: 'https://www.floridamuseum.ufl.edu',
        },
      ],
    },
    {
      id: 'blue-tang',
      name: 'Blue Tang',
      scientificName: 'Acanthurus coeruleus',
      imageUrl: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?w=300&h=200&fit=crop',
      description:
        "The Gulf is home to her close cousin, the Blue Tang. When they are babies floating around the Gulf, they are actually bright neon yellow. They don't turn into Dory's iconic pastel blue color until they mature into adults.",
      facts: [
        'Juveniles are neon yellow before turning blue',
        'They are relatives of the iconic Dory fish',
        'They often cruise in warm Gulf waters',
        'Adults develop the familiar blue color pattern',
      ],
      links: [
        {
          label: '🐟 FishBase',
          url: 'https://www.fishbase.se',
        },
      ],
    },
    {
      id: 'atlantic-spadefish',
      name: 'Atlantic Spadefish',
      scientificName: 'Chaetodipterus faber',
      imageUrl: 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=300&h=200&fit=crop',
      description:
        "Gill's perfect local stand-in is the Atlantic Spadefish, which schools in the thousands around Texas Artificial Reef Program sites. They share Gill's striking vertical black-and-white stripes and bold personality.",
      facts: [
        'They school in large numbers around reef sites',
        'Their stripes are a striking black-and-white pattern',
        'They are common around Texas artificial reefs',
        'They are active and highly social fish',
      ],
      links: [
        {
          label: '🐡 Texas Artificial Reefs',
          url: 'https://www.gulfreefss.com',
        },
      ],
    },
    {
      id: 'burrfish',
      name: 'Striped Burrfish',
      scientificName: 'Chilomycterus schoepfii',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70b5?w=300&h=200&fit=crop',
      description:
        'The Striped Burrfish lives right in the seagrass beds of the Laguna Madre next to Padre Island. When threatened, they swallow water to swell into a spiky, unswallowable ball.',
      facts: [
        'They inflate with water when threatened',
        'They live in seagrass beds near Padre Island',
        'Their spines help deter predators',
        'They are masters of defense in shallow grass flats',
      ],
      links: [
        {
          label: '🦐 Seagrass Habitat',
          url: 'https://www.nature.org',
        },
      ],
    },
    {
      id: 'cleaner-shrimp',
      name: 'Pederson Cleaner Shrimp',
      scientificName: 'Ancylomenes pedersoni',
      imageUrl: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=300&h=200&fit=crop',
      description:
        'The Gulf features the Pederson Cleaner Shrimp. To get the attention of passing Gulf fish, these tiny shrimp perform a literal dance, rocking back and forth and waving their long white antennae to announce that their cleaning station is open for business.',
      facts: [
        'They perform a dance to attract fish customers',
        'They are important reef and seagrass cleaners',
        'They wave antennae to invite fish to visit',
        'They help keep fish healthy by removing parasites',
      ],
      links: [
        {
          label: '🦐 Cleaner Shrimp Info',
          url: 'https://www.marinebio.org',
        },
      ],
    },
    {
      id: 'texas-coral-reefs',
      name: 'Texas Coral Reefs',
      scientificName: 'Deep-water coral assemblages',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70b5?w=300&h=200&fit=crop',
      description:
        'Texas does not have shallow, tropical coral reefs right off the beach because of muddy river runoff. However, about 100 miles off the coast sits the Flower Garden Banks National Marine Sanctuary. Because these reefs sit atop deep underwater salt domes, they are far away from coastal pollution. Thriving against the odds, while coral reefs around the globe are struggling with rising ocean temperatures, the deep-water corals of the Texas Gulf are currently among the healthiest, most resilient coral reef systems in the entire world.',
      facts: [
        'The Flower Garden Banks are about 100 miles offshore',
        'They sit atop deep underwater salt domes',
        'They are far from coastal pollution and runoff',
        'These reefs are among the healthiest deep-water reef systems in the world',
      ],
      links: [
        {
          label: '🪸 Flower Garden Banks',
          url: 'https://flowergarden.noaa.gov',
        },
      ],
    },
  ],
  anchorHotspot: {
    id: 'anchor-menu',
    x: 50,
    y: 88,
    name: 'Restaurant Menu',
    type: 'anchor',
    actionUrl: 'https://example.com/menu',
  },
  weather: {
    enabled: true,
    updateInterval: 300000,
    latitude: 27.7172,
    longitude: -82.6505,
  },
  xr: {
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
