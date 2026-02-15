import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';
import CATEGORIES from '../config/categories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTICLES_DIR = path.join(__dirname, '..', '..', 'content', 'articles');

// ============================================================
// In-Memory Cache — 5 minute TTL
// ============================================================
let articlesCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid() {
    return articlesCache !== null && (Date.now() - cacheTimestamp) < CACHE_TTL;
}

function invalidateCache() {
    articlesCache = null;
    cacheTimestamp = 0;
}

/**
 * Get all articles with metadata (async, cached).
 * Returns sorted array (newest first).
 */
async function getAllArticles() {
    if (isCacheValid()) {
        return articlesCache;
    }

    try {
        await fs.access(ARTICLES_DIR);
    } catch {
        return [];
    }

    const allFiles = await fs.readdir(ARTICLES_DIR);
    const mdFiles = allFiles.filter(f => f.endsWith('.md'));

    const articles = await Promise.all(
        mdFiles.map(async (file) => {
            const raw = await fs.readFile(path.join(ARTICLES_DIR, file), 'utf-8');
            const { data } = matter(raw);
            const cat = CATEGORIES[data.category] || { name: data.category, color: 'primary' };
            return { ...data, categoryName: cat.name, categoryColor: cat.color };
        })
    );

    // Sort newest first
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Cache results
    articlesCache = articles;
    cacheTimestamp = Date.now();

    return articles;
}

/**
 * Get a single article by slug, with HTML content and related articles.
 * @param {string} slug - Article slug
 * @returns {Promise<object|null>} Article object or null if not found
 */
async function getArticleBySlug(slug) {
    try {
        await fs.access(ARTICLES_DIR);
    } catch {
        return null;
    }

    // Use cached list to quickly check if slug exists
    const allArticles = await getAllArticles();
    const meta = allArticles.find(a => a.slug === slug);
    if (!meta) return null;

    // Read only the matched file for full content
    const allFiles = await fs.readdir(ARTICLES_DIR);
    const mdFiles = allFiles.filter(f => f.endsWith('.md'));

    for (const file of mdFiles) {
        const raw = await fs.readFile(path.join(ARTICLES_DIR, file), 'utf-8');
        const { data, content } = matter(raw);

        if (data.slug === slug) {
            const cat = CATEGORIES[data.category] || { name: data.category, color: 'primary' };
            const html = marked(content);

            // Get related articles (same category, exclude current)
            const related = allArticles
                .filter(a => a.category === data.category && a.slug !== data.slug)
                .slice(0, 3);

            return {
                ...data,
                categoryName: cat.name,
                categoryColor: cat.color,
                content: html,
                related,
            };
        }
    }

    return null;
}

export { getAllArticles, getArticleBySlug, invalidateCache };
