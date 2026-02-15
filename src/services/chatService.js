import { client, PRIMARY_MODEL, FALLBACK_MODEL, SYSTEM_INSTRUCTION } from '../config/ai.js';

/**
 * Call SumoPod AI with the given model.
 * @param {Array<{role: string, text: string}>} conversation
 * @param {string} model - Model name to use
 * @returns {Promise<string>} AI response text
 */
async function callModel(conversation, model) {
    // Convert conversation format: { role, text } → OpenAI { role, content }
    const messages = [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        ...conversation.map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.text,
        })),
    ];

    const response = await client.chat.completions.create({
        model,
        messages,
        temperature: 1.0,
        max_tokens: 1024,
        top_p: 0.95,
    });

    const content = response.choices?.[0]?.message?.content;
    if (content) return content;

    throw new Error('Empty response from model');
}

/**
 * Generate a chat response with primary + fallback strategy.
 * Tries PRIMARY_MODEL first, falls back to FALLBACK_MODEL on failure.
 * @param {Array<{role: string, text: string}>} conversation
 * @returns {Promise<string>} AI response text
 */
async function generateChatResponse(conversation) {
    try {
        return await callModel(conversation, PRIMARY_MODEL);
    } catch (primaryErr) {
        console.warn(`[ai] Primary model (${PRIMARY_MODEL}) failed:`, primaryErr.message);

        try {
            console.log(`[ai] Falling back to ${FALLBACK_MODEL}...`);
            return await callModel(conversation, FALLBACK_MODEL);
        } catch (fallbackErr) {
            console.error(`[ai] Fallback model (${FALLBACK_MODEL}) also failed:`, fallbackErr.message);
            return 'Maaf, saya tidak bisa merespons saat ini. Coba ceritakan lagi ya 💙';
        }
    }
}

export { generateChatResponse };
