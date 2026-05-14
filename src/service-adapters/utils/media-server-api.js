// src/adapters/utils/media-server-api.js
// Utility for Media Server API normalization (Plex, Emby, Jellystat)

export async function fetchPlexStatus(endpoint, token) {
  const res = await fetch(`${endpoint}/status/sessions`, {
    headers: { 'X-Plex-Token': token }
  });
  
  if (!res.ok) throw new Error('Failed to fetch Plex status');
  const data = await res.json();
  
  // Normalize data for StatusCard archetype
  const sessions = data.MediaContainer?.Metadata || [];
  const streams = sessions.length;
  const movies = sessions.filter(s => s.type === 'movie').length;
  const series = sessions.filter(s => s.type === 'episode').length;
  
  return {
    status: streams > 0 ? 'active' : 'idle',
    title: streams > 0 ? `${streams} streams` : 'No active streams',
    subtitle: `${movies} movies, ${series} series`,
    details: {
      streams,
      movies,
      series
    }
  };
}

export async function fetchEmbyStatus(endpoint, apiKey, libraryType, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    // First try to get active sessions for "Now Playing"
    const sessionsRes = await apiCall(`${endpoint}/Sessions`, {
      headers: { 'X-Emby-Token': apiKey }
    });
    
    if (sessionsRes && sessionsRes.length > 0) {
      // Return now playing data for MediaCard
      const nowPlaying = sessionsRes.map(session => ({
        title: session.NowPlayingItem?.Name || 'Unknown',
        subtitle: session.NowPlayingItem?.SeriesName || session.NowPlayingItem?.ProductionYear || '',
        progress: session.PlayState?.PositionTicks ? 
          (session.PlayState.PositionTicks / (session.NowPlayingItem?.RunTimeTicks || 1)) * 100 : 0,
        image: session.NowPlayingItem?.ImageTags?.Primary ? 
          `${endpoint}/Items/${session.NowPlayingItem.Id}/Images/Primary?tag=${session.NowPlayingItem.ImageTags.Primary}` : null,
        type: session.NowPlayingItem?.Type || 'unknown'
      }));
      
      return {
        status: 'active',
        title: `${sessionsRes.length} playing`,
        subtitle: 'Now Playing',
        items: nowPlaying,
        details: { sessions: sessionsRes }
      };
    }
    
    // Fallback to library stats if no active sessions
    const countsRes = await apiCall(`${endpoint}/Users/me/Items/Counts`, {
      headers: { 'X-Emby-Token': apiKey }
    });
    
    let title = '';
    let subtitle = '';
    
    if (libraryType === 'music') {
      title = `${countsRes.SongCount} songs`;
      subtitle = `${countsRes.AlbumCount} albums`;
    } else if (libraryType === 'movies') {
      title = `${countsRes.MovieCount} movies`;
      subtitle = 'Media library';
    } else if (libraryType === 'series') {
      title = `${countsRes.EpisodeCount} episodes`;
      subtitle = `${countsRes.SeriesCount} series`;
    } else {
      title = 'Media Server';
      subtitle = `${countsRes.ItemCount} items`;
    }
    
    return {
      status: 'active',
      title,
      subtitle,
      details: countsRes
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'Emby unavailable',
      details: { error: error.message }
    };
  }
}

export async function fetchJellystatStatus(endpoint, apiKey) {
  const res = await fetch(`${endpoint}/api/v2/sessions`, {
    headers: { 'X-Api-Key': apiKey }
  });
  
  if (!res.ok) throw new Error('Failed to fetch Jellystat status');
  const data = await res.json();
  
  // Normalize data for StatusCard archetype
  const streams = data.filter(s => s.NowPlayingItem).length;
  
  return {
    status: streams > 0 ? 'active' : 'idle',
    title: streams > 0 ? `${streams} streams` : 'No active streams',
    subtitle: 'Jellyfin Media Server',
    details: {
      streams,
      sessions: data
    }
  };
}

export async function fetchImmichStatus(endpoint, apiKey, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const headers = { 'x-api-key': apiKey };
    
    const statsRes = await apiCall(`${endpoint}/api/server/statistics`, { headers });
    
    return {
      status: 'active',
      title: `${statsRes.photos} photos`,
      subtitle: `${statsRes.videos} videos • ${statsRes.usageByUser.length} users`,
      metrics: [
        { label: 'Photos', value: statsRes.photos, icon: 'fa-image' },
        { label: 'Videos', value: statsRes.videos, icon: 'fa-video' },
        { label: 'Users', value: statsRes.usageByUser.length, icon: 'fa-users' },
        { label: 'Storage', value: formatBytes(statsRes.usage), icon: 'fa-database' }
      ],
      details: {
        photos: statsRes.photos,
        videos: statsRes.videos,
        usage: statsRes.usage,
        users: statsRes.usageByUser.length,
        usageByUser: statsRes.usageByUser
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'Immich unavailable',
      details: { error: error.message }
    };
  }
}

// Helper function for formatting bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
