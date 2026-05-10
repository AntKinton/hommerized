/**
 * Common formatting utilities for service components
 * Centralizes byte conversion and duration calculations
 */

/**
 * Format bytes to human readable string
 * @param {number} bytes - Bytes to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  const result = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  const formattedResult = result + ' ' + sizes[i];

  return formattedResult;
}

/**
 * Format seconds to human readable duration
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted duration (e.g., "2m 30s", "1h 45m")
 */
export function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  
  if (remainingSeconds > 0) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(' ');
}

/**
 * Format percentage with configurable decimals
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage (e.g., "75.5%")
 */
export function formatPercentage(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format speed with units
 * @param {number} bytesPerSecond - Speed in bytes/second
 * @returns {string} Formatted speed (e.g., "2.5 MB/s")
 */
export function formatSpeed(bytesPerSecond) {
  const formattedBytes = formatBytes(bytesPerSecond);
  return `${formattedBytes}/s`;
}

/**
 * Calculate estimated time remaining based on current speed and remaining bytes
 * @param {number} remainingBytes - Bytes remaining to download
 * @param {number} currentSpeed - Current speed in bytes/second
 * @returns {string} Estimated time remaining (e.g., "2m 15s")
 */
export function calculateETA(remainingBytes, currentSpeed) {
  if (!currentSpeed || currentSpeed === 0) return '∞';
  
  const secondsRemaining = remainingBytes / currentSpeed;
  return formatDuration(secondsRemaining);
}

/**
 * Convert duration to timestamp format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Timestamp format (e.g., "2:30:45")
 */
export function formatTimestamp(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format number with locale-specific separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number with proper separators
 */
export function formatNumber(num) {
  return num.toLocaleString();
}

/**
 * Convert Unix timestamp to human readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp) {
  return new Date(timestamp * 1000).toLocaleString();
}
