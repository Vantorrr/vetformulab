import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-8 animate-pulse">
            🐾 VetFormuLab Pro
          </h1>
          <p className="text-2xl text-blue-200 mb-12">
            Профессиональная система расчета питания для животных
          </p>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold text-white mb-6">
              ✅ Система успешно развернута!
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 text-white">
              <div className="bg-green-500/20 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">🎯 Frontend</h3>
                <p>React + TypeScript</p>
                <p className="text-green-300">✅ Vercel</p>
              </div>
              
              <div className="bg-blue-500/20 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">🚀 Backend</h3>
                <p>Node.js + Express</p>
                <p className="text-blue-300">✅ Railway</p>
              </div>
              
              <div className="bg-purple-500/20 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">💾 Database</h3>
                <p>SQLite</p>
                <p className="text-purple-300">✅ Ready</p>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-yellow-500/20 rounded-xl">
              <p className="text-lg text-yellow-200">
                🔧 <strong>Статус:</strong> Система готова к демонстрации заказчику!
              </p>
              <p className="text-sm text-yellow-300 mt-2">
                API: https://vetformulab-production.up.railway.app
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
