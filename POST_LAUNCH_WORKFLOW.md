# 📋 Post-Launch Workflow: After Your Mural is Painted

Follow these steps once the mural is complete. **Estimated time: 30 minutes total**

## Step 1: Capture the Mural (5 minutes)

- 📸 Take a **high-quality photo** of the entire mural
  - Use landscape orientation
  - Good lighting (overcast or indoor with good light)
  - Minimum 1000x1000px resolution
  - Save as `mural.jpg`

## Step 2: Set Up Hotspots (15 minutes)

### Using the Hotspot Editor (Recommended - 15 min)

1. **Start dev server** (if working locally):
   ```bash
   npm run dev
   ```

2. **Open hotspot editor**:
   - Local: http://localhost:5173/?editor=true
   - Production: https://your-vercel-url.com/?editor=true

3. **Upload your mural photo**:
   - Drag-and-drop or click to select
   - Shows up in the canvas area

4. **Place hotspots** (click each creature position):
   - Click on each creature's location in the photo
   - A numbered marker appears
   - Right panel shows all hotspots

5. **Configure each hotspot**:
   - **Name**: "Sea Turtle", "Manta Ray", etc.
   - **Creature ID**: Must match creature in config (e.g., "sea-turtle")
   - **Position**: Auto-calculated from click location, but you can fine-tune X/Y %

6. **Export the JSON**:
   - Click "Export JSON" button
   - Downloads as `mural-config.json`
   - Contains all hotspot coordinates

### Optional: Manual Coordinates

If you prefer, edit `public/config.json` directly:

```json
{
  "hotspots": [
    {
      "id": "hotspot-1",
      "x": 25.3,        // Left-to-right percentage
      "y": 42.1,        // Top-to-bottom percentage
      "name": "Sea Turtle",
      "type": "creature",
      "creatureId": "sea-turtle"
    }
  ]
}
```

## Step 3: Update Creature Information (3 minutes)

Edit `public/config.json` or use the default template. For each creature:

```json
{
  "id": "sea-turtle",
  "name": "Sea Turtle",
  "scientificName": "Chelonia mydas",
  "description": "Green sea turtles are graceful marine reptiles...",
  "facts": [
    "Can hold their breath for up to 7 hours",
    "Travel over 10,000 miles in their lifetime"
  ],
  "links": [
    {
      "label": "🐢 Sea Turtle Inc.",
      "url": "https://www.seaturtleinc.org"
    }
  ]
}
```

## Step 4: Set Restaurant Menu Link (1 minute)

In `public/config.json`:

```json
{
  "anchorHotspot": {
    "x": 50,
    "y": 85,
    "actionUrl": "https://restaurant.com/menu"  // Your menu URL
  }
}
```

## Step 5: Deploy (1 minute)

### If using GitHub + Vercel (recommended):

```bash
# In your project directory
git add public/config.json
git commit -m "Add mural hotspots and creature data"
git push

# Vercel auto-deploys! 🚀
# Check your Vercel dashboard for deployment status
```

### If using Vercel's web editor:

1. Go to https://vercel.com → Your Project
2. Click "Files" in the settings
3. Navigate to `public/config.json`
4. Edit and save
5. Auto-triggers redeployment

## Step 6: Register Mural with 8thwall (5 minutes)

This step is crucial for stable AR tracking!

1. Go to https://www.8thwall.com/console
2. Select your project
3. Navigate to **Image Targets**
4. Click **"Add Image Target"**
5. Upload your mural photo (1000x1000px or larger)
6. 8thwall processes it (~5 minutes)
7. Status changes to **"Ready"** when complete

**Why this matters**: 8thwall uses this reference image to improve tracking accuracy and stability. Without it, tracking will be generic and less reliable.

## Step 7: Test in AR (5 minutes)

1. **Open your deployed AR app** on a phone:
   - https://your-vercel-url.com
   
2. **Allow camera access** when prompted

3. **Point phone at the mural** and move around:
   - Hotspots should stay locked to their positions
   - Try different angles and distances
   - Should be smooth at 60fps on mid-range phones

4. **Test interactions**:
   - Tap each creature hotspot → Should show popup
   - Verify creature info loads correctly
   - Check links work
   - Test anchor hotspot → Should open menu

5. **Troubleshoot if needed**:
   - If tracking is poor: Check image is registered in 8thwall Console
   - If hotspots are off: Adjust X/Y coordinates in editor
   - If weather overlay missing: Check geolocation permissions

## Step 8: Customize & Refine (Optional, ongoing)

### Easy updates (no redeployment):

These updates go live immediately after editing and refreshing:

- **Creature descriptions** and facts
- **URLs** for links and menu
- **Weather location** (latitude/longitude)

### Updates requiring redeployment:

- **Hotspot positions** (X/Y coordinates)
- **Adding new creatures**
- **Removing hotspots**

To redeploy:
```bash
git add public/config.json
git commit -m "Updated hotspot positions"
git push
```

---

## Quick Reference: File Locations

| File | Purpose | Edit When |
|------|---------|-----------|
| `public/config.json` | Hotspots, creatures, links | After placing hotspots; before deploying |
| `src/config/defaultConfig.js` | Config template | First-time setup |
| `.env.local` | 8thwall license (local dev only) | Initial setup |
| Vercel env vars | 8thwall license (production) | Initial deployment |

## Checklista Before Launch

- ✅ Mural photo captured and uploaded
- ✅ All hotspots placed in editor
- ✅ Creature data filled in (names, descriptions, facts)
- ✅ All links tested and working
- ✅ Restaurant menu URL added
- ✅ Location coordinates (latitude/longitude) updated
- ✅ Config exported/updated
- ✅ Deployed to Vercel
- ✅ Mural image registered in 8thwall Console
- ✅ Tested AR tracking on actual phone
- ✅ All hotspots tested
- ✅ Weather overlay working (if geolocation enabled)

## Need Help?

- **Hotspot coordinates wrong?** → Use editor again to adjust
- **Creature info outdated?** → Edit `public/config.json` directly
- **Links broken?** → Update URLs in config
- **AR tracking poor?** → Ensure mural is registered in 8thwall Console
- **Weather not showing?** → Check phone allows geolocation permission

---

**Total time from mural photo to live app: ~30 minutes** ⏱️
