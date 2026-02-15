import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Middleware
import { helmetMiddleware, corsMiddleware } from './middleware/security.js';
import { chatLimiter, articlesLimiter } from './middleware/rateLimiter.js';
import { validateChatInput } from './middleware/validator.js';
import errorHandler from './middleware/errorHandler.js';

// Routes
import chatRoutes from './routes/chatRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import { getAllArticles } from './services/articleService.js';
import CATEGORIES from './config/categories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Render.com)
const PORT = process.env.PORT || 3000;

// ============================================================
// Global Middleware
// ============================================================
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' })); // Limit request body size

// ============================================================
// Clean URLs & Static Files
// ============================================================
const publicPath = path.join(__dirname, '..', 'public');

// Edukasi listing page (all articles or filtered by category)
app.get('/edukasi', (req, res) => {
    res.sendFile(path.join(publicPath, 'edukasi.html'));
});

// Edukasi category page → serve edukasi.html (JS reads category from URL)
app.get('/edukasi/:category', (req, res, next) => {
    const cat = req.params.category.replace(/[^a-z0-9-]/gi, '');
    if (CATEGORIES[cat]) {
        return res.sendFile(path.join(publicPath, 'edukasi.html'));
    }
    next(); // Not a valid category → fall through to 404
});

// Article detail page → serve artikel.html (JS reads slug from URL)
app.get('/edukasi/:category/:slug', (req, res, next) => {
    const cat = req.params.category.replace(/[^a-z0-9-]/gi, '');
    if (CATEGORIES[cat]) {
        return res.sendFile(path.join(publicPath, 'artikel.html'));
    }
    next();
});

// 301 redirect: old /artikel?slug=xxx → new /edukasi/:category/:slug
app.get('/artikel', async (req, res) => {
    const slug = req.query.slug;
    if (!slug) return res.sendFile(path.join(publicPath, 'edukasi.html'));

    try {
        const articles = await getAllArticles();
        const article = articles.find(a => a.slug === slug);
        if (article) {
            return res.redirect(301, `/edukasi/${article.category}/${article.slug}`);
        }
    } catch { /* ignore */ }
    res.redirect(301, '/edukasi');
});

// Middleware to handle .html redirects
app.use((req, res, next) => {
    if (req.path.endsWith('.html') && req.path !== '/') {
        const cleanPath = req.path.slice(0, -5);
        return res.redirect(301, cleanPath + (req.url.slice(req.path.length)));
    }
    next();
});

// Serve static files (css, js, images, components)
app.use(express.static(publicPath));

// ============================================================
// Health Check
// ============================================================
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// API Routes
// ============================================================
app.use('/api/chat', chatLimiter, validateChatInput, chatRoutes);
app.use('/api/articles', articlesLimiter, articleRoutes);

// ============================================================
// 404 — Catch-all for unknown routes
// ============================================================
app.use((req, res) => {
    res.status(404).sendFile(path.join(publicPath, '404.html'));
});

// ============================================================
// Centralized Error Handler (must be LAST)
// ============================================================
app.use(errorHandler);

// ============================================================
// Start Server
// ============================================================
const server = app.listen(PORT, () => {
    console.log(`Server ready on http://localhost:${PORT}`);

    // Self-ping to prevent Render free tier from spinning down
    if (process.env.NODE_ENV === 'production' && process.env.PRODUCTION_URL) {
        const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes
        setInterval(async () => {
            try {
                const res = await fetch(`${process.env.PRODUCTION_URL}/health`);
                console.log(`[keep-alive] ping → ${res.status}`);
            } catch (err) {
                console.error('[keep-alive] ping failed:', err.message);
            }
        }, PING_INTERVAL);
        console.log('[keep-alive] Self-ping enabled (every 14 min)');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down...');
    server.close(() => {
        process.exit(0);
    });
});

export default app;
