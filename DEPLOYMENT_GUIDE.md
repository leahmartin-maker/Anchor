# AR Mural Experience - Complete Setup & Deployment Guide

## Project Overview

This is an interactive AR experience for a marine life mural using 8thwall for image tracking and React for the UI. The project includes:

- **AR Tracking**: 8thwall image recognition locks interactive elements to the physical mural
- **Live Weather Overlay**: Real-time NOAA data (temperature, wind, UV index)
- **Creature Hotspots**: Tap interactive creatures to reveal species info
- **Restaurant Integration**: Anchor hotspot links to menu
- **Hotspot Editor Tool**: Simple web UI to mark hotspot positions on mural photo

---

## Tech Stack Decisions

### Why 8thwall Over AR.js

| Aspect | 8thwall | AR.js |
|--------|---------|-------|
| **Image Tracking** | ✅ Production-grade, trained on millions of images | ⚠️ Requires markers or QR codes |
| **Accuracy** | ✅ Works from any angle/distance | ⚠️ Limited to defined marker orientations |
| **Performance** | ✅ 60fps on mid-range phones | ⚠️ More CPU intensive |
| **Setup** | ✅ SDK handles everything | ⚠️ Need Three.js/Babylon.js integration |
| **Cost** | ⚠️ $0.002/session (~$60/month at 30k uses) | ✅ Free (open source) |
| **Use Case Fit** | ✅ **Perfect for real-world photo tracking** | ❌ Not designed for uncontrolled scenes |

**Recommendation**: 8thwall is ideal for this project because:
- Your mural is a real-world image (not a QR code)
- Customers need stable tracking from any angle/distance
- Performance on older phones is critical
- You already have an 8thwall license

---

## Local Setup & Development

### 1. Prerequisites

- Node.js 16+ (download from https://nodejs.org)
- npm 8+
- 8thwall account (https://www.8thwall.com - FREE tier available)

### 2. Project Installation

```bash
cd c:\Projects\Anchor
npm install
```

### 3. Environment Configuration

```bash
# Copy the example env file
copy .env.example .env.local

# Edit .env.local and add your 8thwall license key
# Get your key from: https://www.8thwall.com/app/license
```

### 4. Create Your Mural Config

#### Option A: Use Hotspot Editor Tool (Recommended)

```bash
# Start dev server
npm run dev

# In your browser, go to: http://localhost:5173/?editor=true

# Upload your mural photo
# Click to place hotspot markers
# Edit names and creature IDs in the right panel
# Export JSON - it downloads as mural-config.json
```

#### Option B: Manually Edit Config

Edit `public/config.json` with your hotspot positions and URLs:

```json
{
  "hotspots": [
    {
      "id": "hotspot-1",
      "x": 25,           // percentage from left
      "y": 35,           // percentage from top
      "name": "Sea Turtle",
      "type": "creature",
      "creatureId": "sea-turtle"
    }
  ],
  "creatures": [
    {
      "id": "sea-turtle",
      "name": "Sea Turtle",
      "scientificName": "Chelonia mydas",
      "description": "2-3 sentences about the creature",
      "facts": ["Fact 1", "Fact 2"],
      "links": [
        {
          "label": "Learn More",
          "url": "https://example.com"
        }
      ]
    }
  ],
  "anchorHotspot": {
    "x": 50,
    "y": 80,
    "actionUrl": "https://restaurant.com/menu"
  },
  "weather": {
    "latitude": 27.7172,  // Your location
    "longitude": -82.6505
  }
}
```

### 5. Customize Creature Data

In `src/config/defaultConfig.js`, add your creature information:

```javascript
{
  id: 'sea-turtle',
  name: 'Sea Turtle',
  scientificName: 'Chelonia mydas',
  imageUrl: 'https://your-image-url.jpg',
  description: 'Your 2-3 sentence description',
  facts: ['Fact 1', 'Fact 2', 'Fact 3'],
  links: [
    { label: 'Conservation Site', url: 'https://example.com' },
    { label: 'Donate', url: 'https://donate.example.com' }
  ]
}
```

### 6. Development Server

```bash
npm run dev
```

Access at http://localhost:5173

- **Main AR Experience**: `/`
- **Hotspot Editor**: `/?editor=true`

---

## Deployment to Vercel

### 1. Prepare Repository

```bash
cd c:\Projects\Anchor

# Initialize git if not already done
git init
git add .
git commit -m "Initial AR mural experience setup"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Create repository named `anchor-ar-mural`
3. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/anchor-ar-mural.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

#### Option A: Connect GitHub (Recommended)

1. Go to https://vercel.com and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add environment variables in Vercel dashboard (optional):
   - `VITE_CONFIG_URL`: `/config.json` (optional, defaults to /config.json)
   - No 8thwall license needed! (Now open source)

6. Deploy! Vercel auto-deploys on git push

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd c:\Projects\Anchor
vercel

# Follow prompts to link to your Vercel account
```

### 4. Update Your Mural Config on Production

After deploying to Vercel:

1. **Use Hotspot Editor**: `https://your-vercel-url.com/?editor=true`
2. Export the JSON
3. Replace contents of `public/config.json` in your repo
4. Commit and push to auto-trigger Vercel redeploy

Or directly edit `public/config.json` in your Vercel Project Settings (if Vercel's dashboard allows file editing).

---

## 8thwall Setup (Open Source - No License Needed!)

### Great News! 🎉

8thwall is now **completely open-source** and **FREE**. No login, no API key, no monthly fees.

**What changed:**
- ✅ 8thwall.org is the new home for open-source XR tools
- ✅ The hosted platform was sunset (Feb 28, 2026)
- ✅ Engine & tools continue as MIT-licensed open source
- ✅ No license key needed for web AR

### Environment Variables

You **don't need to set any 8thwall API key** anymore:

```bash
# .env.local - Only needs config URL (8thwall key no longer required)
VITE_CONFIG_URL=/config.json
```

### Optional: Enhance Tracking

For **optimal image recognition**, you can pre-process your mural image:

1. Go to https://8thwall.org
2. Download **8th Wall Desktop** (optional, for visual editor)
3. Or use the **Image Target Processor** CLI tool from GitHub:
   - https://github.com/8thwall/8thwall/tree/main/apps/image-target-cli
   - Pre-processes images for better tracking accuracy

**Note:** Your app works without this step — image tracking is built in. Pre-processing just improves accuracy for your specific mural.

### Resources

- **8thwall.org** - New home for open-source XR
- **GitHub** - https://github.com/8thwall/8thwall (source code, examples, tools)
- **Docs** - https://8thwall.org/docs
- **Discord Community** - https://8th.io/discord

---

## Configuration Reference

### `config.json` Structure

```json
{
  "version": "1.0.0",
  "app": {
    "title": "Marine Mural AR",
    "description": "Interactive AR experience"
  },
  "mural": {
    "name": "Marine Life Mural",
    "location": "Your Location",
    "imageName": "mural.jpg"
  },
  "hotspots": [
    {
      "id": "unique-id",
      "x": 0-100,           // Left to right percentage
      "y": 0-100,           // Top to bottom percentage
      "name": "Display Name",
      "type": "creature",   // or "anchor"
      "creatureId": "creature-id"
    }
  ],
  "creatures": [
    {
      "id": "unique-id",
      "name": "Animal Name",
      "scientificName": "Latin Name",
      "imageUrl": "https://image-url.jpg",
      "description": "2-3 sentence description",
      "facts": ["Array", "of", "facts"],
      "links": [
        {
          "label": "Link Text",
          "url": "https://url.com"
        }
      ]
    }
  ],
  "anchorHotspot": {
    "id": "anchor-menu",
    "x": 50,
    "y": 50,
    "name": "Restaurant Menu",
    "type": "anchor",
    "actionUrl": "https://restaurant.com/menu"
  },
  "weather": {
    "enabled": true,
    "updateInterval": 300000,  // 5 minutes
    "latitude": 27.7172,
    "longitude": -82.6505
  }
}
```

---

## Workflow: After Mural is Painted

### Step 1: Capture Mural Photo (5 min)
- Take clear, well-lit photo of entire mural
- Landscape orientation preferred
- 1000x1000px minimum

### Step 2: Create Hotspots (10 min)
- Visit `https://your-vercel-url.com/?editor=true`
- Upload mural photo
- Click each creature to add hotspot
- Edit name and creature ID
- Export JSON

### Step 3: Update Config (2 min)
- Open `public/config.json` in your editor
- Paste hotspots from exported JSON
- Update creature data with your URLs
- Update restaurant menu URL
- Update coordinates if using manual approach

### Step 4: Deploy (1 min)
```bash
git add public/config.json
git commit -m "Add hotspot positions for new mural"
git push
# Vercel auto-deploys!
```

### Step 5: Test in AR! (5 min)
- Open your deployed app on a phone
- Allow camera access
- Point at your mural
- Tap hotspots to test
- Share with your team!

**Total time: ~20 minutes**

---

## Troubleshooting

### Hotspots not appearing
- Check `public/config.json` syntax (use JSON validator)
- Verify x/y coordinates are 0-100
- Check browser console for errors

### AR tracking not working
- Check camera permissions in browser
- Ensure image is well-lit and has good contrast
- Try different lighting/angles and distances
- Check browser console (F12) for errors
- Make sure hotspot coordinates in config.json are correct (0-100)

### Weather overlay not showing
- Check if browser allows geolocation
- Verify NOAA API is accessible (no CORS issues on Vercel)
- Check browser console for API errors

### Performance issues
- Reduce hotspot count if possible
- Use optimized image sizes
- Test on actual device (not just desktop)
- Disable weather overlay if needed

---

## API References

### NOAA Weather API
- **Free**: Yes, no authentication required
- **Rate limit**: Reasonable (no official limit)
- **Docs**: https://www.weather.gov/documentation/services-web-api

### 8thwall
- **Pricing**: FREE tier available ($0 for up to 10k sessions/month)
- **Docs**: https://www.8thwall.com/ページ-docs

### OpenUV (Optional)
- **Free tier**: Yes (limited requests)
- **Sign up**: https://www.openuv.io
- **For**: More accurate UV index data

---

## File Structure

```
Anchor/
├── public/
│   └── config.json          # Your hotspot and creature config
├── src/
│   ├── components/
│   │   ├── ARExperience.jsx     # Main AR wrapper
│   │   ├── ARTracker.jsx        # 8thwall integration
│   │   ├── CreaturePopup.jsx    # Popup for creature details
│   │   └── HotspotEditor.jsx    # Hotspot editing tool
│   ├── services/
│   │   └── noaaService.js       # NOAA API calls
│   ├── config/
│   │   └── defaultConfig.js     # Config template
│   ├── App.jsx
│   ├── index.css                # Tailwind + base styles
│   └── main.jsx
├── .env.example
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## Next Steps

1. **Finish Painting**: Complete the mural
2. **Capture Photo**: Take a high-quality photo
3. **Create Hotspots**: Use the editor tool
4. **Test AR**: Verify tracking on actual phone
5. **Gather Resources**: Collect URLs for creature links
6. **Go Live**: Deploy and share with customers!

---

## Support & Questions

- 8thwall Issues: https://www.8thwall.com/support
- React Docs: https://react.dev
- Vercel Docs: https://vercel.com/docs
- NOAA API: https://www.weather.gov/documentation/services-web-api

Good luck! 🌊🐢
