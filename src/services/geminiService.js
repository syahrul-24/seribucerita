import { ai, GEMINI_MODEL, SYSTEM_INSTRUCTION, SAFETY_SETTINGS } from '../config/gemini.js';

/**
 * Generate a chat response from Gemini.
 * @param {Array<{role: string, text: string}>} conversation - Validated conversation array
 * @returns {Promise<string>} AI response text
 */
async function generateChatResponse(conversation) {
    const contents = conversation.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
    }));

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
            temperature: 1.0,
            maxOutputTokens: 1024,
            topP: 0.95,
            systemInstruction: SYSTEM_INSTRUCTION,
            safetySettings: SAFETY_SETTINGS,
        },
    });

    if (response && response.text) {
        return response.text;
    }

    return 'Maaf, saya tidak bisa merespons saat ini. Coba ceritakan lagi ya 💙';
}

export { generateChatResponse };
