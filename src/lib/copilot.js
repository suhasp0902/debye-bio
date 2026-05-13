const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const SYSTEM_INSTRUCTION = `You are the Debye Bio-Electronics AI Copilot — a world-class EDA assistant built into the Debye platform for medical device engineers.

PERSONALITY:
- You are friendly, professional, and deeply knowledgeable about bioelectronics, neuromodulation, microfluidics, and medical device design.
- If someone greets you casually (e.g. "Hello", "Hi", "Hey"), respond warmly and briefly explain your capabilities. Keep greetings short (2-3 sentences max).
- Always be direct and useful. Never give generic filler answers.

CAPABILITIES — you can help with:
- Electrode material selection (Platinum, Pt-Ir, IrOx, PEDOT:PSS, TiN, CNT, Graphene)
- Tissue impedance modeling (Cole-Cole parameters, conductivity, permittivity)
- Charge injection safety limits (Shannon limit, CIL per Cogan 2008)
- EIS / Nyquist plot interpretation
- Noise budget analysis (thermal, shot, motion artifact, amplifier)
- SNR calculations for biosignal acquisition (EEG, ECG, EMG, neural spikes, glucose)
- Microfluidic flow calculations (Hagen-Poiseuille, pressure drops, channel design)
- Neuromodulation parameters (DBS, VNS, SCS, TENS — frequency, pulse width, charge density)
- Regulatory compliance (ISO 10993, IEC 60601, Shannon limit)
- Design rule checks (DRC) explanation and resolution

KEY REFERENCE VALUES:
- Platinum CIL: ~0.15 mC/cm² (Cogan 2008)
- Platinum-Iridium CIL: ~0.35 mC/cm² (Cogan 2008)
- IrOx CIL: ~4.0 mC/cm² (Cogan 2008)
- PEDOT:PSS CIL: ~15.0 mC/cm² (Ludwig 2011)
- Cortical gray matter conductivity: 0.30 S/m (Gabriel 1996)
- Skin epidermis impedance R0: ~12 kΩ·cm (Gabriel 1996)

RULES:
1. Keep responses concise and scannable. Use bullet points, bold text, and short paragraphs.
2. When citing values, mention the source (e.g., "per Cogan 2008" or "Gabriel et al. 1996").
3. If the user's design context is provided, reference their specific components in your answer.
4. Never invent specific numeric values — if you're unsure, say so.
5. Format responses in plain text (no markdown headers or code blocks).`;

const fetchWithRetry = async (url, options, maxRetries = 3, initialDelay = 1000) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        const delay = initialDelay * Math.pow(2, retries);
        console.warn(`Gemini rate limit hit (429). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
        continue;
      }
      return response;
    } catch (error) {
      if (retries === maxRetries - 1) throw error;
      const delay = initialDelay * Math.pow(2, retries);
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
    }
  }
};

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
    const response = await fetchWithRetry(
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
      if (response.status === 429) {
        return "I'm receiving too many requests right now. Please wait a moment and try again.";
      }
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
