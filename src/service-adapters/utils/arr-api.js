// src/adapters/utils/arr-api.js
// Utility for Sonarr/Radarr family API normalization

export async function fetchArrQueue(endpoint, apiKey) {
  const res = await fetch(`${endpoint}/api/v3/queue`, {
    headers: { 'X-Api-Key': apiKey }
  });
  
  if (!res.ok) throw new Error('Failed to fetch *arr queue');
  const data = await res.json();  
  
  // Normalize data for MediaCard archetype
  return data.records.map(item => ({
    title: item.title,
    subtitle: item.status,
    progress: (item.sizeleft / item.size) * 100 || 0,
    // Lidarr uses 'artist', Sonarr 'series', Radarr 'movie'. 
    // Extract the best available image
    image: item.movie?.images?.[0]?.url || item.series?.images?.[0]?.url || ''
  }));
}
