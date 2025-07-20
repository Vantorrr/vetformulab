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

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, /\.railway\.app$/, /\.render\.com$/, /\.vercel\.app$/]
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
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

// Serve static files from React app
// Обслуживаем статичные файлы из frontend/build
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Catch-all handler: отправляем index.html для всех неопознанных роутов
app.get('*', (req, res) => {
  // Пропускаем API роуты
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
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