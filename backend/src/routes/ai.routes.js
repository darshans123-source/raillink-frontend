/**
 * AI Assistant Router
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// GET /api/ai/status
router.get('/status', aiController.getStatus);

// POST /api/ai/chat
router.post('/chat', aiController.chat);

module.exports = router;
