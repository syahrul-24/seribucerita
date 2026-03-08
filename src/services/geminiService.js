import { ai, GEMINI_MODEL, FALLBACK_MODELS, SYSTEM_INSTRUCTION, SAFETY_SETTINGS } from '../config/gemini.js';

// Pesan terbaru yang tetap dikirim verbatim (tidak diringkas)
const RECENT_WINDOW = 12;
// Jika total pesan melebihi ini, pesan lama akan diringkas
const SUMMARIZE_THRESHOLD = 16;

/**
 * Try generating content with a specific model.
 */
async function tryModel(model, contents, config = {}) {
    try {
        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                temperature: 0.8,
                maxOutputTokens: 2048,
                topP: 0.95,
                systemInstruction: SYSTEM_INSTRUCTION,
                safetySettings: SAFETY_SETTINGS,
                ...config,
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
 * Ringkas pesan-pesan lama menjadi satu paragraf konteks.
 * Ini memastikan bot tetap "ingat" seluruh percakapan tanpa
 * mengirim banyak token ke API.
 *
 * @param {Array} oldMessages - Pesan yang akan diringkas
 * @returns {Promise<string>} Ringkasan teks
 */
async function summarizeOldMessages(oldMessages) {
    const transcript = oldMessages
        .map(m => `${m.role === 'user' ? 'Pengguna' : 'SeribuCerita'}: ${m.text}`)
        .join('\n');

    const summarizePrompt = `Berikut adalah potongan awal percakapan antara pengguna dan SeribuCerita (psikolog AI):

${transcript}

Buatlah ringkasan singkat (maksimal 3-4 kalimat, dalam bahasa Indonesia) yang mencakup:
- Topik utama yang dibicarakan pengguna
- Kondisi emosional atau masalah yang diungkapkan
- Respons atau pendekatan yang sudah diberikan SeribuCerita

Ringkasan ini akan digunakan sebagai konteks untuk melanjutkan percakapan. Tulis ringkasan saja, tanpa kalimat pembuka.`;

    const contents = [{ role: 'user', parts: [{ text: summarizePrompt }] }];

    for (const model of [GEMINI_MODEL, ...FALLBACK_MODELS]) {
        const result = await tryModel(model, contents, {
            temperature: 0.3,
            maxOutputTokens: 256,
            systemInstruction: undefined,
        });
        if (result) {
            console.log('📝 Session summary generated.');
            return result.trim();
        }
    }

    // Fallback: gabungkan teks mentah jika summarization gagal
    return oldMessages
        .slice(-4)
        .map(m => `${m.role === 'user' ? 'Pengguna' : 'Bot'}: ${m.text.slice(0, 200)}`)
        .join('\n');
}

/**
 * Generate a chat response from Gemini with fallback models.
 * Menggunakan strategi summarization untuk percakapan panjang:
 * - Pesan lama diringkas menjadi 1 blok konteks
 * - Pesan terbaru (RECENT_WINDOW) dikirim verbatim
 * Ini menjaga kualitas dan akurasi respons tanpa membuang konteks penting.
 *
 * @param {Array<{role: string, text: string}>} conversation - Validated conversation array
 * @param {string|null} existingSummary - Ringkasan sesi sebelumnya (dari frontend)
 * @returns {Promise<{result: string, summary: string|null}>}
 */
async function generateChatResponse(conversation, existingSummary = null) {
    let summaryToUse = existingSummary;
    let messagesToSend = conversation;

    // Jika percakapan panjang, pertimbangkan summarization
    if (conversation.length > SUMMARIZE_THRESHOLD) {
        const oldMessages = conversation.slice(0, -RECENT_WINDOW);
        const recentMessages = conversation.slice(-RECENT_WINDOW);

        // Gabungkan summary lama (jika ada) dengan pesan-pesan lama baru
        const toSummarize = summaryToUse
            ? [{ role: 'model', text: `[Ringkasan sebelumnya: ${summaryToUse}]` }, ...oldMessages]
            : oldMessages;

        summaryToUse = await summarizeOldMessages(toSummarize);
        messagesToSend = recentMessages;

        console.log(`📊 History: ${conversation.length} msgs → summary + ${recentMessages.length} recent`);
    }

    // Bangun contents: sisipkan ringkasan sebagai sistem konteks jika ada
    let contents;
    if (summaryToUse) {
        const summaryBlock = {
            role: 'user',
            parts: [{ text: `[Konteks percakapan sebelumnya — jangan dibalas, hanya sebagai referensi]:\n${summaryToUse}` }],
        };
        const summaryAck = {
            role: 'model',
            parts: [{ text: 'Baik, saya sudah memahami konteks percakapan kita sebelumnya.' }],
        };
        contents = [
            summaryBlock,
            summaryAck,
            ...messagesToSend.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }],
            })),
        ];
    } else {
        contents = messagesToSend.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }],
        }));
    }

    const models = [GEMINI_MODEL, ...FALLBACK_MODELS];
    for (const model of models) {
        console.log(`🔄 Trying model: ${model}...`);
        const result = await tryModel(model, contents);
        if (result) {
            // Kembalikan hasil dan summary terbaru agar frontend bisa menyimpannya
            return { result, summary: summaryToUse };
        }
    }

    return {
        result: 'Maaf, saya tidak bisa merespons saat ini. Coba ceritakan lagi ya 💙',
        summary: summaryToUse,
    };
}

export { generateChatResponse };
