/**
 * Main routes
 * Handles page rendering routes
 */

import express from 'express';
import pageController from '../controllers/pageController.js';

const router = express.Router();

// Home page
router.get('/', pageController.renderHome.bind(pageController));

// Results page
router.get('/results', pageController.renderResults.bind(pageController));

// About page (optional)
// router.get('/about', pageController.renderAbout.bind(pageController));

export default router;
