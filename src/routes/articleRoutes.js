import { Router } from 'express';
import { getAllArticles, getArticleBySlug } from '../services/articleService.js';
import CATEGORIES from '../config/categories.js';

const router = Router();

/**
 * GET /api/articles — list all articles, optional ?category= filter
 */
router.get('/', async (req, res, next) => {
    try {
        let articles = await getAllArticles();
        if (req.query.category) {
            articles = articles.filter(a => a.category === req.query.category);
        }
        res.json({ articles, categories: CATEGORIES });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/articles/:slug — get single article with HTML content
 */
router.get('/:slug', async (req, res, next) => {
    try {
        const article = await getArticleBySlug(req.params.slug);
        if (!article) {
            return res.status(404).json({ error: 'Artikel tidak ditemukan.' });
        }
        res.json(article);
    } catch (err) {
        next(err);
    }
});

export default router;
