// src/service-adapters/copytoclipboard.js
export default {
  archetype: 'ActionCard',
  
  async fetch(item) {
    // CopyToClipboard typically just displays a static value or a simple state
    return {
      status: 'online',
      content: item.content || item.url || 'Nothing to copy',
      action: 'copy'
    };
  }
};
