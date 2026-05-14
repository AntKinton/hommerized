// src/adapters/utils/task-queue-api.js
// Utility for Task Queue API normalization (Tdarr, Medusa)

export async function fetchTdarrStatus(endpoint, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        headers: { "content-Type": "application/json" },
        data: {
          collection: "StatisticsJSONDB",
          mode: "getById",
          docID: "statistics",
          obj: {},
        },
        timeout: 1000,
      }),
    };
    
    const response = await apiCall("api/v2/cruddb", options);
    
    const queue = response.table1Count || 0;
    const errored = response.table6Count || 0;
    
    return {
      status: queue > 0 ? 'active' : (errored > 0 ? 'error' : 'idle'),
      title: queue > 0 ? `${queue} queued` : (errored > 0 ? `${errored} errors` : 'Queue empty'),
      subtitle: errored > 0 ? `${errored} failed tasks` : 'Processing queue',
      details: {
        queue,
        errored,
        processed: response.table2Count || 0,
        transcoded: response.table3Count || 0
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'Tdarr unavailable',
      details: {
        error: error.message,
        queue: 0,
        errored: 0,
        processed: 0,
        transcoded: 0
      }
    };
  }
}

export async function fetchMedusaStatus(endpoint, apiKey, fetchFn) {
  const apiCall = fetchFn || fetch;
  
  try {
    const response = await apiCall("api/v2/config", {
      headers: { "X-Api-Key": apiKey }
    });
    
    const unread = response?.system?.news?.unread || 0;
    const warnings = response?.main?.logs?.numWarnings || 0;
    const errors = response?.main?.logs?.numErrors || 0;
    
    return {
      status: errors > 0 ? 'error' : (warnings > 0 ? 'warning' : (unread > 0 ? 'active' : 'idle')),
      title: errors > 0 ? `${errors} errors` : (warnings > 0 ? `${warnings} warnings` : (unread > 0 ? `${unread} news` : 'System OK')),
      subtitle: 'Medusa status',
      details: {
        unread,
        warnings,
        errors,
        totalIssues: unread + warnings + errors
      }
    };
  } catch (error) {
    return {
      status: 'error',
      title: 'Connection failed',
      subtitle: 'Medusa unavailable',
      details: {
        error: error.message,
        unread: 0,
        warnings: 0,
        errors: 0
      }
    };
  }
}
