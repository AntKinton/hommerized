import { useConfigStore } from './module-config';
import { usePoliciesStore } from './module-policy';
import { useModulesStore } from './module-extras';
import { useAuthStore } from './module-auth';

/**
 * Centralized store initialization orchestration.
 * Handles parallel network requests and synchronous auth setup.
 */
export async function initAllStores() {
  const configStore = useConfigStore();
  const policiesStore = usePoliciesStore();
  const modulesStore = useModulesStore();
  const authStore = useAuthStore();

  // 1. Parallel fetch of all YAML configurations
  // These don't depend on each other for network requests
  const results = await Promise.allSettled([
    configStore.initialize(),
    policiesStore.initialize(),
    modulesStore.initialize()
  ]);

  // 2. Synchronize Policies with Modules configuration
  const policyEnabled = modulesStore.get('groupsPolicy.enabled', true);
  const policyFile = modulesStore.get('groupsPolicy.policyFile', '/assets/config/policy-rules.yml');
  
  policiesStore.enabled = policyEnabled;
  // If we have a custom policy file from modules, we might need to re-initialize or reload it
  // But for now, we assume the default /assets/config/policy-rules.yml is what we want

  // 3. Synchronous initialization of Auth (DOM/Memory based)
  authStore.initialize();

  // Return formatted results for error handling in App.vue
  return {
    config: results[0],
    policies: results[1],
    modules: results[2],
    auth: { status: 'fulfilled' } // Auth is sync, always fulfilled here
  };
}

// Re-export stores for convenience
export {
  useConfigStore,
  usePoliciesStore,
  useModulesStore,
  useAuthStore
};
