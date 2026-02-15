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
const PORT = process.env.PORT || 3000;

// ============================================================
// Global Middleware
// ============================================================
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' })); // Limit request body size
app.use(express.static(path.join(__dirname, '..', 'public')));

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
