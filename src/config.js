// API Configuration for VetFormuLab
const config = {
  // Railway backend URL
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://vetformulab-production.up.railway.app'
    : 'http://localhost:3001',
  
  // API endpoints
  API_ENDPOINTS: {
    auth: '/api/auth',
    animals: '/api/animals', 
    feeds: '/api/feeds',
    calculations: '/api/calculations',
    health: '/api/health'
  }
};

export default config; 