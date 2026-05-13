import { runSimulation as runLocalSimulation } from './simulation';
import { runDRC as runLocalDRC } from './drc';
import { supabase } from './supabase';

async function callApi(path, payload, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch(path, {
    method: options.method || 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: options.method === 'GET' ? undefined : JSON.stringify(payload || {}),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${path} failed (${response.status}): ${text}`);
  }

  return response.json();
}

export async function simulateDesign({ nodes, edges, scenarioId, signalProfile }) {
  try {
    return await callApi('/api/simulate', {
      nodes,
      edges,
      scenarioId,
      signalProfile,
      sweep: { minHz: 1, maxHz: 100000, points: 61 },
    });
  } catch (error) {
    console.warn('Using local simulation fallback:', error);
    return runLocalSimulation(nodes, scenarioId);
  }
}

export async function runDesignRules({ nodes, edges, scenarioId }) {
  try {
    return await callApi('/api/drc', { nodes, edges, scenarioId });
  } catch (error) {
    console.warn('Using local DRC fallback:', error);
    return runLocalDRC(nodes, scenarioId, edges);
  }
}

export async function askCopilotBackend(message, designContext, conversationHistory = []) {
  const data = await callApi('/api/copilot', {
    message,
    designContext,
    conversationHistory,
  });
  return data.response || 'The copilot returned no response.';
}

export async function generateDesignBackend(prompt) {
  return callApi('/api/generate-design', { message: prompt });
}

export async function loadKnowledge() {
  return callApi('/api/knowledge', null, { method: 'GET' });
}
