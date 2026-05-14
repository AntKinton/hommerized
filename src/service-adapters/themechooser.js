// src/adapters/themechooser.js
export default {
  archetype: 'ActionCard',
  
  async getControls(item) {
    // Get current theme from localStorage or default
    const currentTheme = localStorage.getItem('bulma-theme') || 'default';
    
    return [
      {
        label: 'Default',
        icon: 'fas fa-sun',
        class: currentTheme === 'default' ? 'is-primary' : 'is-light',
        action: () => {
          localStorage.setItem('bulma-theme', 'default');
          document.documentElement.classList.remove('is-dark');
          document.documentElement.classList.add('is-light');
          window.dispatchEvent(new Event('theme-changed'));
        }
      },
      {
        label: 'Dark',
        icon: 'fas fa-moon',
        class: currentTheme === 'dark' ? 'is-primary' : 'is-light',
        action: () => {
          localStorage.setItem('bulma-theme', 'dark');
          document.documentElement.classList.remove('is-light');
          document.documentElement.classList.add('is-dark');
          window.dispatchEvent(new Event('theme-changed'));
        }
      },
      {
        label: 'Auto',
        icon: 'fas fa-adjust',
        class: currentTheme === 'auto' ? 'is-primary' : 'is-light',
        action: () => {
          localStorage.setItem('bulma-theme', 'auto');
          // Auto theme detection based on system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.remove(prefersDark ? 'is-light' : 'is-dark');
          document.documentElement.classList.add(prefersDark ? 'is-dark' : 'is-light');
          window.dispatchEvent(new Event('theme-changed'));
        }
      }
    ];
  }
};
