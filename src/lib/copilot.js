const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const SYSTEM_INSTRUCTION = `You are the Debye Bio-Electronics AI Copilot, a professional EDA assistant for medical device engineers.
You help design bio-electronic interfaces, electrode systems, neuromodulation devices, and microfluidic circuits.

RULES:
1. Be conversational and helpful. If someone says "Hello", greet them warmly and explain what you can help with.
2. Provide accurate, research-backed advice on bio-interface design, electrode materials, tissue properties, and neuromodulation parameters.
3. When discussing specific materials or tissues, cite known values (e.g., "Platinum has a charge injection limit of ~0.15 mC/cm² per Cogan 2008").
4. Keep responses concise, technical, and actionable. Use bullet points for lists.
5. If you don't know something, say so honestly.
6. You can help with: impedance analysis, material selection, DRC violations, simulation interpretation, microfluidic flow calculations, and neuromodulation safety.
7. Maintain a professional, confident tone suitable for clinical engineering.`;

export async function askCopilot(message, designContext, conversationHistory = []) {
  if (!GEMINI_API_KEY) {
    return 'Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment.';
  }

  // Build context about the current design
  let contextStr = '';
  if (designContext) {
    if (designContext.nodes?.length > 0) {
      contextStr += `\nCurrent design has ${designContext.nodes.length} components: `;
      contextStr += designContext.nodes.map(n => `${n.data?.label || n.type} (${n.type})`).join(', ');
    }
    if (designContext.simulationData) {
      contextStr += `\nSimulation results: Impedance@1kHz=${designContext.simulationData.impedance1kHz}, SNR=${designContext.simulationData.snr}dB, Noise=${designContext.simulationData.noiseTotal}µVrms`;
    }
    if (designContext.drcResults?.errors?.length > 0) {
      contextStr += `\nDRC errors: ${designContext.drcResults.errors.map(e => e.message).join('; ')}`;
    }
  }

  // Build conversation contents for Gemini
  const contents = [];
  
  // Add conversation history
  for (const msg of conversationHistory) {
    if (msg.role === 'user' || msg.role === 'model') {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }]
      });
    }
  }

  // Add current message with design context
  const userMessage = contextStr 
    ? `${message}\n\n[Design Context: ${contextStr}]`
    : message;
  
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return `AI service error (${response.status}). Please check your API key configuration.`;
    }

    const data = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
    
    return 'No response generated. Please try rephrasing your question.';
  } catch (error) {
    console.error('Gemini API call failed:', error);
    return `Connection error: ${error.message}. Please check your internet connection.`;
  }
}
