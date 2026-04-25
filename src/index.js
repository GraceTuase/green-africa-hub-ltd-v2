// Green Africa Hub Ltd v2 - Main Entry Point
// 🌍 Next generation sustainable African food platform

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Green Africa Hub Ltd v2! 🌍🍛🤖',
    platform: 'Sustainable African Food Platform',
    status: 'running',
    features: [
      'AI-Powered Recipe Optimization',
      'Carbon Footprint Tracking',
      'Smart Cooking Technologies',
      'African Food Heritage Preservation'
    ],
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Green Africa Hub Ltd v2',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    sustainability: 'active',
    ai_status: 'ready'
  });
});

// API Routes for Green Africa Hub Features
app.get('/api/recipes', (req, res) => {
  res.json({
    message: 'African Recipe Database',
    total_recipes: 0,
    categories: ['Jollof Rice', 'Egusi Soup', 'Moi Moi', 'Pounded Yam', 'Banga Soup'],
    carbon_tracking: 'enabled'
  });
});

app.get('/api/carbon-calculator', (req, res) => {
  res.json({
    message: 'Carbon Footprint Calculator',
    status: 'active',
    features: ['Real-time tracking', 'Recipe analysis', 'Sustainability scoring'],
    unit: 'kg CO2'
  });
});

app.get('/api/ai-recommendations', (req, res) => {
  res.json({
    message: 'AI Recipe Optimization',
    status: 'ready',
    capabilities: ['Smart suggestions', 'Nutritional analysis', 'Cost optimization'],
    model_version: 'v2.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌍 Green Africa Hub Ltd v2 running on port ${PORT}`);
  console.log(`📡 Platform: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🍛 Recipes: http://localhost:${PORT}/api/recipes`);
  console.log(`🌱 Carbon: http://localhost:${PORT}/api/carbon-calculator`);
  console.log(`🤖 AI: http://localhost:${PORT}/api/ai-recommendations`);
  console.log(`🚀 Building sustainable future for African food!`);
});

module.exports = app;
