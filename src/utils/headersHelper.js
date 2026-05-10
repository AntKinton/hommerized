/**
 * Helper to capture headers from Caddy in development
 * This script will be injected by Vite during development
 */

// headersHelper.js
export function getHeaders() {
  if (typeof window !== 'undefined') {
    // 1. Prioridad: Datos inyectados por Caddy (Usando el nombre de index.html)
    const authData = window.__AUTH_HEADERS__;
    
    if (authData && authData.user) {
      return {
        user: authData.user,
        // Caddy devuelve los grupos como string separado por comas
        groups: authData.groups ? authData.groups.split(',').map(g => g.trim()) : [],
        name: authData.name,
        email: authData.email
      };
    }
    
    // 2. Fallback: Meta tags (Útil para desarrollo con tu plugin de Vite)
    const userMeta = document.querySelector('meta[name="remote-user"]')?.getAttribute('content');
    const groupsMeta = document.querySelector('meta[name="remote-groups"]')?.getAttribute('content');
    
    if (userMeta) {
      return {
        user: userMeta,
        groups: groupsMeta ? groupsMeta.split(',').map(g => g.trim()) : [],
        name: document.querySelector('meta[name="remote-name"]')?.getAttribute('content'),
        email: document.querySelector('meta[name="remote-email"]')?.getAttribute('content')
      };
    }
  }
  
  return { user: null, groups: [], name: null, email: null };
}

export function injectHeadersToWindow() {
  // This function can be called to inject headers into window
  // Useful for debugging or testing
  if (typeof window !== 'undefined') {
    window.__AUTH_HEADERS__ = {
      user: window.__AUTH_HEADERS__?.user || null,
      groups: window.__AUTH_HEADERS__?.groups || [],
      name: window.__AUTH_HEADERS__?.name || null,
      email: window.__AUTH_HEADERS__?.email || null
    };
  }
}
