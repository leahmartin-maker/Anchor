#!/usr/bin/env node

/**
 * AR Mural Config Validator
 * 
 * Validates your config.json for common issues before deployment.
 * Run: node scripts/validate-config.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '../public/config.json');

function validateConfig() {
  let config;
  
  // Load config
  try {
    const data = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(data);
    console.log('✓ Config file is valid JSON\n');
  } catch (error) {
    console.error('✗ Error reading config.json:', error.message);
    process.exit(1);
  }

  let hasErrors = false;

  // Check required fields
  console.log('Checking required fields...');
  if (!config.hotspots || !Array.isArray(config.hotspots)) {
    console.error('✗ Missing or invalid "hotspots" array');
    hasErrors = true;
  } else {
    console.log(`✓ Found ${config.hotspots.length} hotspots`);
  }

  if (!config.creatures || !Array.isArray(config.creatures)) {
    console.error('✗ Missing or invalid "creatures" array');
    hasErrors = true;
  } else {
    console.log(`✓ Found ${config.creatures.length} creatures`);
  }

  // Validate hotspots
  console.log('\nValidating hotspots...');
  if (config.hotspots) {
    config.hotspots.forEach((hotspot, idx) => {
      if (!hotspot.id) console.error(`✗ Hotspot ${idx} missing "id"`);
      if (hotspot.x === undefined || hotspot.x < 0 || hotspot.x > 100) {
        console.error(`✗ Hotspot "${hotspot.name}": x must be 0-100, got ${hotspot.x}`);
        hasErrors = true;
      }
      if (hotspot.y === undefined || hotspot.y < 0 || hotspot.y > 100) {
        console.error(`✗ Hotspot "${hotspot.name}": y must be 0-100, got ${hotspot.y}`);
        hasErrors = true;
      }
      if (hotspot.type === 'creature' && !hotspot.creatureId) {
        console.error(`✗ Hotspot "${hotspot.name}": creature type requires creatureId`);
        hasErrors = true;
      }
    });
    if (!hasErrors && config.hotspots.length > 0) {
      console.log('✓ All hotspots have valid coordinates');
    }
  }

  // Validate creatures exist
  console.log('\nValidating creature references...');
  const creatureIds = new Set(config.creatures?.map(c => c.id) || []);
  config.hotspots?.forEach((hotspot) => {
    if (hotspot.type === 'creature' && !creatureIds.has(hotspot.creatureId)) {
      console.error(`✗ Hotspot "${hotspot.name}" references unknown creature "${hotspot.creatureId}"`);
      hasErrors = true;
    }
  });
  if (!hasErrors && config.hotspots.length > 0) {
    console.log('✓ All creature references are valid');
  }

  // Validate creature data
  console.log('\nValidating creature data...');
  config.creatures?.forEach((creature) => {
    if (!creature.name) console.error(`✗ Creature "${creature.id}" missing "name"`);
    if (!creature.description || creature.description.length < 10) {
      console.error(`✗ Creature "${creature.name}" has no description`);
      hasErrors = true;
    }
    if (!Array.isArray(creature.links)) {
      console.warn(`⚠ Creature "${creature.name}" has no links (optional)`);
    }
  });
  if (!hasErrors && config.creatures.length > 0) {
    console.log('✓ All creatures have valid data');
  }

  // Validate URLs
  console.log('\nValidating URLs...');
  let urlCount = 0;
  config.creatures?.forEach((creature) => {
    creature.links?.forEach((link) => {
      try {
        new URL(link.url);
        urlCount++;
      } catch {
        console.error(`✗ Invalid URL in creature "${creature.name}": "${link.url}"`);
        hasErrors = true;
      }
    });
  });

  if (config.anchorHotspot?.actionUrl) {
    try {
      new URL(config.anchorHotspot.actionUrl);
      urlCount++;
    } catch {
      console.error(`✗ Invalid anchor URL: "${config.anchorHotspot.actionUrl}"`);
      hasErrors = true;
    }
  }
  console.log(`✓ Validated ${urlCount} URLs`);

  // Check weather location
  console.log('\nValidating location...');
  if (config.weather?.enabled) {
    if (!config.weather.latitude || !config.weather.longitude) {
      console.warn('⚠ Weather enabled but no location set');
    } else {
      console.log(`✓ Weather location: ${config.weather.latitude}, ${config.weather.longitude}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.error('\n❌ Config validation FAILED. Fix errors above before deploying.\n');
    process.exit(1);
  } else {
    console.log('\n✅ Config validation PASSED! Ready to deploy.\n');
    process.exit(0);
  }
}

validateConfig();
