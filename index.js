import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-2.5-flash"; // Global variable for model

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

app.post('/api/chat', async (req, res) => {
    try {
        const { conversation } = req.body; // Changed to conversation to match frontend request

        // Validation
        if (!Array.isArray(conversation)) {
            return res.status(400).json({ error: 'Conversation must be an array' });
        }

        // Transform messages to Gemini format
        const contents = conversation.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }] // Assuming input objects have 'role' and 'text'
        }));

        // System Instruction (Persona: Psychologist)
        const systemInstruction = "Anda adalah seorang psikolog yang empatik, profesional, dan pendengar yang baik. Tugas Anda adalah memberikan dukungan emosional, saran yang bijaksana, dan menjadi teman curhat yang aman bagi pengguna. Gunakan bahasa yang menenangkan dan suportif.";

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9, // Creative and empathetic
                systemInstruction: systemInstruction
            }
        });

        // Send response
        // In @google/genai SDK, response.text is a property/getter
        if (response && response.text) {
            res.status(200).json({ result: response.text });
        } else {
            // Fallback
            res.status(200).json({ result: "No response text generated." });
        }

    } catch (e) {
        console.error("Error generating content:", e);
        res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
});

app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));
