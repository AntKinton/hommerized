/**
 * This module provides a single-timer solution for managing automatic data updates
 * across all service components in Hommerized. Instead of each service component creating
 * its own setInterval timer, all components register with this centralized scheduler.
 *
 */

const TICK_INTERVAL_MS = 1000; // 1 second tick resolution
const MIN_INTERVAL_MS = TICK_INTERVAL_MS; // Minimum allowed update interval

class UpdateScheduler {
  constructor() {
    this.registeredComponents = new Map();
    this.frequencyGroups = new Map(); // Group by interval for optimization
    this.globalTimer = null;
    this.tickCount = 0;
  }

  register(component, intervalMs, updateMethod) {
    if (!component || !updateMethod || intervalMs <= 0) {
      console.warn("UpdateScheduler: Invalid registration parameters");
      return;
    }

    if (intervalMs < MIN_INTERVAL_MS) {
      console.warn(
        `UpdateScheduler: Interval ${intervalMs}ms is below minimum. Adjusting to ${MIN_INTERVAL_MS}ms`,
      );
      intervalMs = MIN_INTERVAL_MS;
    }

    const intervalSeconds = Math.floor(intervalMs / 1000);
    const componentId = this.generateComponentId(component);

    if (!componentId) {
      console.error(`UpdateScheduler: invalid component id`);
      return;
    }

    const componentConfig = {
      component,
      interval: intervalSeconds,
      method: updateMethod,
      lastUpdate: 0,
    };

    this.registeredComponents.set(componentId, componentConfig);

    // Add to frequency group for optimization
    if (!this.frequencyGroups.has(intervalSeconds)) {
      this.frequencyGroups.set(intervalSeconds, new Set());
    }
    this.frequencyGroups.get(intervalSeconds).add(componentId);

    this.startGlobalTimer();
    /*console.log(
      `UpdateScheduler: Registered component with ${intervalSeconds}s interval`,
    );*/
  }

  unregister(component) {
    const componentId = this.generateComponentId(component);
    const componentConfig = this.registeredComponents.get(componentId);
    const removed = this.registeredComponents.delete(componentId);

    if (removed) {
      //console.log("UpdateScheduler: Unregistered component");
      
      // Remove from frequency group
      if (componentConfig && this.frequencyGroups.has(componentConfig.interval)) {
        this.frequencyGroups.get(componentConfig.interval).delete(componentId);
        
        // Clean up empty frequency groups
        if (this.frequencyGroups.get(componentConfig.interval).size === 0) {
          this.frequencyGroups.delete(componentConfig.interval);
        }
      }
    }

    if (this.registeredComponents.size === 0) {
      this.stopGlobalTimer();
    }
  }

  generateComponentId(component) {
    // Use component's unique identifier or Vue instance uid
    return component._uid || component.$.uid
  }

  startGlobalTimer() {
    if (!this.globalTimer) {
      this.tickCount = 0;

      this.globalTimer = setInterval(() => {
        this.tickCount++;
        this.processUpdates();
      }, TICK_INTERVAL_MS);

      //console.log("UpdateScheduler: Global timer started");
    }
  }

  stopGlobalTimer() {
    if (this.globalTimer) {
      clearInterval(this.globalTimer);
      this.globalTimer = null;
      this.tickCount = 0;
      //console.log("UpdateScheduler: Global timer stopped");
    }
  }

  processUpdates() {
    // Process by frequency groups for better performance
    for (const [interval, componentIds] of this.frequencyGroups) {
      // Check if this frequency group should update this tick
      if (this.tickCount % interval === 0) {
        for (const componentId of componentIds) {
          const config = this.registeredComponents.get(componentId);
          if (config) {
            try {
              config.method.call(config.component);
              config.lastUpdate = this.tickCount;
            } catch (error) {
              console.error("UpdateScheduler: Error during component update:", error);
            }
          }
        }
      }
    }
  }
}

// Create and export global singleton instance
const updateScheduler = new UpdateScheduler();

// Pause updates when tab is hidden (power saving)
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      updateScheduler.stopGlobalTimer();
    } else if (updateScheduler.registeredComponents.size > 0) {
      updateScheduler.startGlobalTimer();
    }
  });
}

export default updateScheduler;
