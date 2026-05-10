export async function askCopilot(message, designContext, conversationHistory = []) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    // Mock response if no API key
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`(Mock Mode - No VITE_GEMINI_API_KEY found)\n\nBased on your question about "${message}", I would normally analyze your design context to provide insights on tissue impedance, electrode materials, or signal integrity. Please add a Gemini API key to your .env file to enable the real AI.`);
      }, 1500);
    });
  }

  const systemInstruction = `You are Debye's AI design copilot — an expert in bioelectronics, 
electrochemistry, and medical device design. You have deep knowledge of:
- Electrode-tissue interface physics (Randles circuit, Cole-Cole model)
- Biological noise sources (thermal, motion artifact, 1/f flicker, shot noise)
- Electrode materials (Pt, PEDOT:PSS, Au, IrOx, TiN) and their properties
- Biocompatibility (ISO 10993, FDA requirements)
- Signal processing for biological waveforms
- Tissue electrical properties (conductivity, permittivity, impedance)

Current design context:
${JSON.stringify(designContext)}

Answer concisely. Be specific. Always cite physical reasoning. 
When you suggest a change, explain the quantitative impact.
Never guess — if you don't know a specific value, say so and give a range.
Keep responses under 150 words unless the question requires more detail.`;

  try {
    const contents = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response from Gemini API");
    }
  } catch (err) {
    console.error("Copilot API Error:", err);
    return "Sorry, I encountered an error connecting to the AI service. Please check your API key and connection.";
  }
}
