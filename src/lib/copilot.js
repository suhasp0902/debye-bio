import { TISSUES, MATERIALS } from '../data/bioData';
import { askCopilotBackend } from './backend';

export async function askCopilot(message, designContext, conversationHistory = []) {
  try {
    return await askCopilotBackend(message, designContext, conversationHistory);
  } catch (err) {
    console.warn('Using local copilot fallback:', err);
    return offlineGroundedResponse(message, designContext);
  }
}

function offlineGroundedResponse(message, designContext) {
  let response = '(Offline grounded mode)\n\n';
  const mLower = message.toLowerCase();
  let foundData = false;

  for (const [key, tissue] of Object.entries(TISSUES)) {
    if (mLower.includes(key) || mLower.includes(tissue.name.toLowerCase().split(' ')[0])) {
      response += `${tissue.name}: R0 ${tissue.r0} ohm-cm, Rinf ${tissue.r_inf} ohm-cm, alpha ${tissue.cole_alpha}, tau ${tissue.tau}s, biological noise ${tissue.noise_uV} uVrms. Citation: ${tissue.citation}. `;
      foundData = true;
    }
  }

  for (const [key, mat] of Object.entries(MATERIALS)) {
    if (mLower.includes(key) || mLower.includes(mat.name.toLowerCase().split(' ')[0])) {
      response += `${mat.name}: CIL ${mat.cil} mC/cm2, EIS factor ${mat.eis_factor}. ${mat.notes} Citation: ${mat.citation}. `;
      foundData = true;
    }
  }

  if (!foundData) {
    response += `I found ${designContext?.nodes?.length || 0} components in this design, but no specific tissue/material keyword in your question. I will not invent numeric values; ask about a named tissue, material, DRC issue, or simulation metric.`;
  }

  return response;
}
