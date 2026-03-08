import { Router } from 'express';
import { generateChatResponse } from '../services/geminiService.js';

const router = Router();

/**
 * POST /api/chat
 * Input already validated by validateChatInput middleware.
 * Body: { conversation: [...], summary: string|null }
 *   summary — ringkasan sesi sebelumnya dari frontend (opsional)
 */
router.post('/', async (req, res, next) => {
    try {
        const { conversation, summary = null } = req.body;
        const { result, summary: updatedSummary } = await generateChatResponse(conversation, summary);
        res.status(200).json({ result, summary: updatedSummary });
    } catch (err) {
        next(err);
    }
});

export default router;
