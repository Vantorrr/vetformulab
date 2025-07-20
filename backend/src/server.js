const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const { initDatabase } = require('./database');
const animalsRouter = require('./routes/animals');
const feedsRouter = require('./routes/feeds');
const calculationsRouter = require('./routes/calculations');
const { router: authRouter } = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for Vercel + Railway hybrid
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'https://vetformulab.vercel.app',
    /\.vercel\.app$/,
    /\.railway\.app$/,
    /\.render\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/animals', animalsRouter);
app.use('/api/feeds', feedsRouter);
app.use('/api/calculations', calculationsRouter);

// Обслуживание статических файлов React приложения
app.use(express.static(path.join(__dirname, '../public')));

// Health check and 404 for non-API routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'VetFormuLab API Server', 
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      animals: '/api/animals',
      feeds: '/api/feeds',
      calculations: '/api/calculations'
    }
  });
});

// SPA fallback - отправляем index.html для всех не-API маршрутов
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'VetFormuLab Backend API',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Инициализация базы данных
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📖 API документация: http://localhost:${PORT}/api/health`);
  });
}).catch(err => {
  console.error('Ошибка инициализации базы данных:', err);
  process.exit(1);
}); 