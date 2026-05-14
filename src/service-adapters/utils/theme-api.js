// src/adapters/utils/theme-api.js
// Utility for Theme Management API normalization

export async function fetchThemeStatus(endpoint, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    // ThemeChooser doesn't need API calls - it's a client-side utility
    // We'll return current theme state
    const app = document.getElementById("app");
    const currentTheme = Array.from(app.classList).filter(word =>
      word.startsWith("theme-")
    )[0] || 'theme-classic';
    
    const availableThemes = [
      { value: 'theme-classic', label: 'classic' },
      { value: 'theme-neon', label: 'neon' },
      { value: 'theme-walkxcode', label: 'walkxcode' }
    ];
    
    return {
      status: 'active',
      title: `Theme: ${currentTheme.replace('theme-', '')}`,
      subtitle: 'Theme switcher active',
      details: {
        currentTheme,
        availableThemes,
        themeCount: availableThemes.length
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Theme error',
      subtitle: 'Theme switcher unavailable',
      details: {
        error: error.message,
        currentTheme: 'unknown',
        availableThemes: []
      }
    };
  }
}
