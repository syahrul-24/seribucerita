import { ai, GEMINI_MODEL, FALLBACK_MODELS, SYSTEM_INSTRUCTION, SAFETY_SETTINGS } from '../config/gemini.js';

/**
 * Try generating content with a specific model.
 * @param {string} model - Model name to use
 * @param {Array} contents - Formatted conversation contents
 * @returns {Promise<string|null>} Response text or null on failure
 */
async function tryModel(model, contents) {
    try {
        const response = await ai.models.generateContent({
            model,
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
            console.log(`✅ Response generated using model: ${model}`);
            return response.text;
        }
        return null;
    } catch (err) {
        console.warn(`⚠️ Model ${model} failed: ${err.message}`);
        return null;
    }
}

/**
 * Generate a chat response from Gemini with fallback models.
 * Tries primary model first, then falls back to alternative models.
 * @param {Array<{role: string, text: string}>} conversation - Validated conversation array
 * @returns {Promise<string>} AI response text
 */
async function generateChatResponse(conversation) {
    const contents = conversation.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
    }));

    const models = [GEMINI_MODEL, ...FALLBACK_MODELS];

    for (const model of models) {
        console.log(`🔄 Trying model: ${model}...`);
        const result = await tryModel(model, contents);
        if (result) return result;
    }

    return 'Maaf, saya tidak bisa merespons saat ini. Coba ceritakan lagi ya 💙';
}

export { generateChatResponse };
