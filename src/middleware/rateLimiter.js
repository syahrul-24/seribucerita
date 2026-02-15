import rateLimit from 'express-rate-limit';

// Chat API: 10 requests per minute per IP
const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Terlalu banyak permintaan. Coba lagi dalam 1 menit.',
    },
});

// Articles API: 60 requests per minute per IP
const articlesLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Terlalu banyak permintaan. Coba lagi dalam 1 menit.',
    },
});

export { chatLimiter, articlesLimiter };
