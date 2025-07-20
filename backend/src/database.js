const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/vetformulab.db');
let db = null;

const connectDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Ошибка подключения к SQLite:', err);
        reject(err);
      } else {
        console.log('✅ Подключение к SQLite базе данных установлено');
        resolve();
      }
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    // Создаем таблицы в правильном порядке (пользователи первые)
    const queries = [
      // Таблица пользователей (ветклиники)
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        clinic_name TEXT NOT NULL,
        clinic_phone TEXT,
        clinic_address TEXT,
        contact_person TEXT,
        is_active INTEGER DEFAULT 1,
        subscription_type TEXT DEFAULT 'basic',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Обновленная таблица животных с user_id
      `CREATE TABLE IF NOT EXISTS animals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'ferret')),
        weight REAL NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
        breed TEXT,
        is_neutered BOOLEAN DEFAULT 0,
        activity_level TEXT NOT NULL CHECK (activity_level IN ('low', 'moderate', 'high', 'very_high')),
        physiological_state TEXT DEFAULT 'normal' CHECK (physiological_state IN ('normal', 'pregnant', 'lactating', 'growing', 'senior', 'overweight', 'underweight')),
        metabolic_energy_need REAL,
        owner_name TEXT,
        owner_phone TEXT,
        medical_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      // Таблица кормов (может быть общей или привязанной к пользователю)
      `CREATE TABLE IF NOT EXISTS feeds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NULL,
        name TEXT NOT NULL,
        brand TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('dry', 'wet', 'raw', 'treats')),
        metabolic_energy REAL NOT NULL,
        protein REAL,
        fat REAL,
        carbohydrates REAL,
        fiber REAL,
        ash REAL,
        moisture REAL,
        calcium INTEGER,
        phosphorus INTEGER,
        sodium INTEGER,
        potassium INTEGER,
        magnesium INTEGER,
        iron INTEGER,
        zinc INTEGER,
        copper INTEGER,
        manganese INTEGER,
        selenium REAL,
        iodine INTEGER,
        vitamin_a INTEGER,
        vitamin_d INTEGER,
        vitamin_e INTEGER,
        vitamin_k INTEGER,
        vitamin_b1 REAL,
        vitamin_b2 REAL,
        vitamin_b3 REAL,
        vitamin_b5 REAL,
        vitamin_b6 REAL,
        vitamin_b7 REAL,
        vitamin_b9 REAL,
        vitamin_b12 REAL,
        vitamin_c INTEGER,
        ingredients TEXT,
        notes TEXT,
        price_per_kg REAL,
        is_available BOOLEAN DEFAULT 1,
        is_public BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      )`,
      
      // Обновленная таблица сравнений с user_id
      `CREATE TABLE IF NOT EXISTS comparisons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        animal_id INTEGER NOT NULL,
        feed_ids TEXT NOT NULL,
        comparison_data TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (animal_id) REFERENCES animals (id) ON DELETE CASCADE
      )`
    ];

    let completed = 0;
    let hasError = false;

    queries.forEach((query, index) => {
      db.run(query, (err) => {
        if (err && !hasError) {
          console.error(`Ошибка создания таблицы ${index + 1}:`, err);
          hasError = true;
          reject(err);
          return;
        }
        
        completed++;
        if (completed === queries.length && !hasError) {
          console.log('✅ Все таблицы созданы успешно');
          resolve();
        }
      });
    });
  });
};

const insertSampleData = () => {
  return new Promise((resolve, reject) => {
    // Проверяем есть ли уже данные
    db.get('SELECT COUNT(*) as count FROM feeds WHERE user_id IS NULL', (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count > 0) {
        console.log('📦 Образцы данных уже существуют');
        resolve();
        return;
      }

      // Вставляем образцы общих кормов (user_id = NULL означает общедоступные)
      const sampleFeeds = [
        {
          name: 'Royal Canin Medium Adult',
          brand: 'Royal Canin',
          type: 'dry',
          metabolic_energy: 374,
          protein: 23,
          fat: 12,
          carbohydrates: 42,
          fiber: 1.3,
          ash: 6.6,
          moisture: 9.5,
          calcium: 800,
          phosphorus: 600,
          sodium: 400,
          vitamin_a: 15500,
          vitamin_d: 1000,
          vitamin_e: 600,
          price_per_kg: 850,
          is_public: 1
        },
        {
          name: "Hill's Science Diet Adult",
          brand: "Hill's",
          type: 'dry',
          metabolic_energy: 365,
          protein: 21,
          fat: 10.5,
          carbohydrates: 45,
          fiber: 2.5,
          ash: 5.5,
          moisture: 10,
          calcium: 750,
          phosphorus: 580,
          sodium: 300,
          vitamin_a: 14000,
          vitamin_d: 900,
          vitamin_e: 550,
          price_per_kg: 920,
          is_public: 1
        },
        {
          name: 'Purina Pro Plan Adult',
          brand: 'Purina',
          type: 'dry',
          metabolic_energy: 380,
          protein: 26,
          fat: 16,
          carbohydrates: 38,
          fiber: 2,
          ash: 8,
          moisture: 12,
          calcium: 850,
          phosphorus: 650,
          sodium: 350,
          vitamin_a: 16000,
          vitamin_d: 1100,
          vitamin_e: 650,
          price_per_kg: 780,
          is_public: 1
        }
      ];

      const placeholders = sampleFeeds.map(() => 
        '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).join(', ');

      const values = sampleFeeds.flatMap(feed => [
        feed.name, feed.brand, feed.type, feed.metabolic_energy,
        feed.protein, feed.fat, feed.carbohydrates, feed.fiber,
        feed.ash, feed.moisture, feed.calcium, feed.phosphorus,
        feed.sodium, feed.vitamin_a, feed.vitamin_d, feed.vitamin_e,
        feed.price_per_kg, 1  // is_public = 1 (true)
      ]);

      const query = `INSERT INTO feeds (
        name, brand, type, metabolic_energy, protein, fat, carbohydrates,
        fiber, ash, moisture, calcium, phosphorus, sodium, vitamin_a, vitamin_d,
        vitamin_e, price_per_kg, is_public
      ) VALUES ${placeholders}`;

      db.run(query, values, (err) => {
        if (err) {
          console.error('Ошибка вставки образцов данных:', err);
          reject(err);
        } else {
          console.log('📦 Образцы данных вставлены успешно');
          resolve();
        }
      });
    });
  });
};

const initDatabase = async () => {
  try {
    await connectDatabase();
    await createTables();
    await insertSampleData();
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error);
    throw error;
  }
};

const getDatabase = () => {
  if (!db) {
    throw new Error('База данных не инициализирована');
  }
  return db;
};

module.exports = {
  initDatabase,
  getDatabase
}; 