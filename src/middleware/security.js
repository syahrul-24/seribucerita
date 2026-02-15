import helmet from 'helmet';
import cors from 'cors';

// Helmet — security headers with CSP allowing Tailwind CDN and Google Fonts
const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
});

// CORS — restrict origins
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];

const corsMiddleware = cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (same-origin, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // In development, allow all. Tighten for production.
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
});

export { helmetMiddleware, corsMiddleware };
