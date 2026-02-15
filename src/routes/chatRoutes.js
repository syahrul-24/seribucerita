import { Router } from 'express';
import { generateChatResponse } from '../services/geminiService.js';

const router = Router();

/**
 * POST /api/chat
 * Input already validated by validateChatInput middleware.
 */
router.post('/', async (req, res, next) => {
    try {
        const { conversation } = req.body;
        const result = await generateChatResponse(conversation);
        res.status(200).json({ result });
    } catch (err) {
        next(err);
    }
});

export default router;
