const ALLOWED_ROLES = ['user', 'model'];
const MAX_USER_TEXT_LENGTH = 2000;  // Batas hanya untuk input user
const MAX_CONVERSATION_LENGTH = 20;

/**
 * Validate chat request body.
 * Ensures conversation is an array with valid roles and reasonable text lengths.
 */
function validateChatInput(req, res, next) {
    const { conversation } = req.body;

    // Must be array
    if (!Array.isArray(conversation)) {
        return res.status(400).json({
            error: 'Format tidak valid. "conversation" harus berupa array.',
        });
    }

    // Must not be empty
    if (conversation.length === 0) {
        return res.status(400).json({
            error: 'Conversation tidak boleh kosong.',
        });
    }

    // Max conversation length
    if (conversation.length > MAX_CONVERSATION_LENGTH) {
        return res.status(400).json({
            error: `Maksimal ${MAX_CONVERSATION_LENGTH} pesan per permintaan.`,
        });
    }

    // Validate each message
    for (let i = 0; i < conversation.length; i++) {
        const msg = conversation[i];

        // Validate role
        if (!msg.role || !ALLOWED_ROLES.includes(msg.role)) {
            return res.status(400).json({
                error: `Pesan ke-${i + 1}: role harus "${ALLOWED_ROLES.join('" atau "')}".`,
            });
        }

        // Validate text
        if (!msg.text || typeof msg.text !== 'string') {
            return res.status(400).json({
                error: `Pesan ke-${i + 1}: text harus berupa string.`,
            });
        }

        // Trim and check length
        msg.text = msg.text.trim();
        if (msg.text.length === 0) {
            return res.status(400).json({
                error: `Pesan ke-${i + 1}: text tidak boleh kosong.`,
            });
        }

        // Hanya batasi panjang untuk pesan user, bukan respons model yang bisa panjang
        if (msg.role === 'user' && msg.text.length > MAX_USER_TEXT_LENGTH) {
            return res.status(400).json({
                error: `Pesan ke-${i + 1}: pesan terlalu panjang. Maksimal ${MAX_USER_TEXT_LENGTH} karakter.`,
            });
        }
    }

    next();
}

export { validateChatInput };
