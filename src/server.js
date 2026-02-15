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
// Explicitly serve main pages for clean URLs
const publicPath = path.join(__dirname, '..', 'public');

app.get('/edukasi', (req, res) => {
    res.sendFile(path.join(publicPath, 'edukasi.html'));
});

app.get('/artikel', (req, res) => {
    res.sendFile(path.join(publicPath, 'artikel.html'));
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
