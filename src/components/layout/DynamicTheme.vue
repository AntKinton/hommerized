<script>
import { watch, onMounted, onUnmounted } from 'vue';

export default {
  name: "DynamicTheme",
  props: {
    themes: {
      type: Object,
      default: () => ({ light: {}, dark: {} })
    }
  },
  setup(props) {
    const updateStyles = () => {
      // Sistema híbrido: solo inyectar valores proporcionados en config.yml
      // El resto lo deja a Bulma con sus defaults
      const themes = props.themes || { light: {}, dark: {} };

      const getVars = (themeObj) => {
        if (!themeObj || Object.keys(themeObj).length === 0) return '';
        
        return Object.entries(themeObj).map(([key, value]) => {
          if (!value) return '';
          if (key === 'background-image') return `--${key}: url('${value}');`;
          return `--${key}: ${value};`;
        }).join(' ');
      };

      // Solo generar CSS si hay valores para inyectar
      const lightVars = getVars(themes.light);
      const darkVars = getVars(themes.dark);
      
      if (!lightVars && !darkVars) {
        // No hay valores personalizados, eliminar estilo si existe
        const styleEl = document.getElementById('homer-dynamic-theme');
        if (styleEl) styleEl.remove();
        return;
      }

      let css = '';
      
      if (lightVars) {
        css += `
          html[data-theme="light"] {
            ${lightVars}
          }
          @media (prefers-color-scheme: light), (prefers-color-scheme: no-preference) {
            html[data-theme="light"] {
              ${lightVars}
            }
          }
        `;
      }
      
      if (darkVars) {
        css += `
          html[data-theme="dark"] {
            ${darkVars}
          }
          @media (prefers-color-scheme: dark) {
            :root, html[data-theme="dark"] {
              ${darkVars}
            }
          }
        `;
      }

      let styleEl = document.getElementById('homer-dynamic-theme');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'homer-dynamic-theme';
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = css;
    };

    watch(() => props.themes, updateStyles, { deep: true });
    onMounted(updateStyles);

    onUnmounted(() => {
      const styleEl = document.getElementById('homer-dynamic-theme');
      if (styleEl) styleEl.remove();
    });

    return () => null; // Componente renderless
  }
};
</script>
