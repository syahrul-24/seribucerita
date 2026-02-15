const ALLOWED_ROLES = ['user', 'assistant'];
const MAX_TEXT_LENGTH = 2000;
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

        if (msg.text.length > MAX_TEXT_LENGTH) {
            return res.status(400).json({
                error: `Pesan ke-${i + 1}: text maksimal ${MAX_TEXT_LENGTH} karakter.`,
            });
        }
    }

    next();
}

export { validateChatInput };
