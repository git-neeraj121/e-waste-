

const getApiKey = () => process.env.GEMINI_API_KEY || '';

export const geminiService = {
  generateChatResponse: async (message, history = []) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key is not configured in .env');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Structure conversation contents
    const contents = [];

    // System prompt setup (Gemini 1.5 Flash supports systemInstruction)
    const systemInstruction = {
      role: "system",
      parts: [{
        text: "You are the EcoLocate AI assistant, an expert in electronic waste (e-waste) management, recycling, safety sorting, and sustainability. Help citizens understand how to recycle their devices, why e-waste is toxic (lead, mercury hazard), data wiping instructions (factory resets), and points earnings. Keep answers helpful, concise, and friendly. Advise them to use the E-Waste Facility Locator map to book local pickups."
      }]
    };

    // Format chat history
    // History entries look like: { sender: 'bot'|'user', text: '...' }
    history.forEach(h => {
      contents.push({
        role: h.sender === 'bot' ? 'model' : 'user',
        parts: [{ text: h.text }]
      });
    });

    // Add current user query
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API returned error status: ${response.status} - ${errText}`);
      }

      const resData = await response.json();
      return resData.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini Service Chat Error:', error);
      throw error;
    }
  },

  detectWasteFromImage: async (base64Data, mimeType = 'image/jpeg') => {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key is not configured in .env');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Clean base64 header if present (e.g. data:image/png;base64,...)
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');

    const promptText = `
      Analyze this image containing electronic waste. 
      Identify all electronic items shown and classify them into one of these exact categories:
      - Mobile Phones
      - Laptops & Computers
      - Batteries
      - Large Appliances
      - Screens & Monitors
      - Cables & Chargers
      - Bulbs & Lighting

      For each detected category, output a JSON array of objects with fields:
      - type: (Must exactly match one of the categories listed above)
      - quantity: (Integer count of items)
      - confidence: (Float value between 0.0 and 1.0)

      Return ONLY a valid JSON array block, nothing else. No markdown syntax like \`\`\`json, just raw JSON.
      If no electronic items are detected, return an empty array: []
    `;

    const payload = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType,
                data: base64Clean
              }
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini Vision API returned error status: ${response.status} - ${errText}`);
      }

      const resData = await response.json();
      const rawText = resData.candidates[0].content.parts[0].text.trim();
      
      // Clean possible markdown wrapper tags in response (like ```json ... ```)
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error('Gemini Service Vision Error:', error);
      throw error;
    }
  }
};
