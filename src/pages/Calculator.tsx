import React, { useState, useEffect, useCallback } from 'react';
import config from '../config';

interface Feed {
  id: number;
  name: string;
  brand: string;
  type: string;
  metabolizable_energy: number;
  crude_protein: number;
  crude_fat: number;
  crude_fiber: number;
  moisture: number;
  calcium: number;
  phosphorus: number;
}

interface AnimalData {
  species: string;
  gender: string;
  age: number;
  condition: number;
  name: string;
  breed: string;
  status: string;
  activity: string;
  owner: string;
  currentWeight: number;
  targetWeight: number;
  adultWeight: number;
  lactationWeeks: number;
  contact: string;
  meCoefficient: number;
}

interface NutritionRequirements {
  proteinME: number;
  fatME: number;
  carbME: number;
  structure: {
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  };
}

const Calculator: React.FC = () => {
  const [animalData, setAnimalData] = useState<AnimalData>({
    species: 'собака',
    gender: 'самец',
    age: 3.5,
    condition: 6,
    name: 'Купер',
    breed: 'вольш корги пемброк',
    status: 'кастрированный',
    activity: 'склонность к ожирению',
    owner: '',
    currentWeight: 14.6,
    targetWeight: 13.14,
    adultWeight: 13.14,
    lactationWeeks: 0,
    contact: '',
    meCoefficient: 1.0
  });

  const [energyNeed, setEnergyNeed] = useState<number>(621.14);
  const [nutritionReq, setNutritionReq] = useState<NutritionRequirements>({
    proteinME: 35,
    fatME: 25,
    carbME: 40,
    structure: {
      protein: 4,
      fat: 4,
      carbs: 4,
      fiber: 4
    }
  });

  const [diagnosis, setDiagnosis] = useState('');
  const [intolerances, setIntolerances] = useState('');
  
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null);
  const [dailyAmount, setDailyAmount] = useState<number>(0);

  // Добавляю единые стили для полей
  const fieldStyle = {
    width: '100%',
    height: '48px',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    background: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none',
    appearance: 'none' as 'none',
    boxSizing: 'border-box' as 'border-box'
  };

  const focusStyle = {
    borderColor: '#00c851',
    boxShadow: '0 0 0 3px rgba(0, 200, 81, 0.1)'
  };

  const labelStyle = {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
    marginTop: '4px',
    display: 'block'
  };

  // Расчет потребности в энергии
  const calculateEnergyNeed = useCallback(() => {
    let rer = 70 * Math.pow(animalData.targetWeight, 0.75);
    
    // Коэффициенты активности
    let activityMultiplier = 1.0;
    
    if (animalData.status === 'кастрированный') {
      activityMultiplier = animalData.activity === 'склонность к ожирению' ? 1.2 : 1.4;
    } else if (animalData.status === 'интактный') {
      activityMultiplier = 1.6;
    } else if (animalData.status === 'беременность 1-4 недели') {
      activityMultiplier = 1.8;
    } else if (animalData.status === 'беременность >5 недель') {
      activityMultiplier = 2.0;
    } else if (animalData.status === 'лактация') {
      activityMultiplier = 2.0 + (0.25 * animalData.lactationWeeks);
    }

    const totalEnergy = rer * activityMultiplier * animalData.meCoefficient;
    setEnergyNeed(Math.round(totalEnergy * 100) / 100);
  }, [animalData.targetWeight, animalData.status, animalData.activity, animalData.lactationWeeks, animalData.meCoefficient]);

  useEffect(() => {
    calculateEnergyNeed();
  }, [calculateEnergyNeed]);

  useEffect(() => {
    // Пересчитываем суточную норму корма при изменении энергетической потребности
    if (selectedFeed && energyNeed > 0) {
      const dailyGrams = (energyNeed * 100) / selectedFeed.metabolizable_energy;
      setDailyAmount(dailyGrams);
    } else {
      setDailyAmount(0);
    }
  }, [energyNeed, selectedFeed]);

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.feeds}/detailed`);
      const data = await response.json();
      if (data.success) {
        setFeeds(data.feeds);
      }
    } catch (error) {
      console.error('Error fetching feeds:', error);
    }
  };



  const handleInputChange = (field: keyof AnimalData, value: any) => {
    setAnimalData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const handleFeedSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const feedId = parseInt(e.target.value);
    const feed = feeds.find(f => f.id === feedId);
    setSelectedFeed(feed || null);
    
    // Пересчитываем суточную норму при выборе корма
    if (feed && energyNeed > 0) {
      const dailyGrams = (energyNeed * 100) / feed.metabolizable_energy;
      setDailyAmount(dailyGrams);
    } else {
      setDailyAmount(0);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: window.innerWidth <= 768 ? '10px' : '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{
            fontSize: window.innerWidth <= 768 ? '28px' : '36px',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #00c851, #00ff88)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>🧮 Калькулятор питания</h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: window.innerWidth <= 768 ? '14px' : '16px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Профессиональный расчет потребности в энергии и суточной нормы корма
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '30px'
        }}>
          {/* Левая колонка - основные данные */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: window.innerWidth <= 768 ? '16px' : '24px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            }}
          >
            <h3 style={{ color: '#1a202c', marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              Данные животного
            </h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <div style={{ position: 'relative' }}>
                  <select
                    value={animalData.species}
                    onChange={(e) => handleInputChange('species', e.target.value)}
                    style={{
                      ...fieldStyle,
                      paddingRight: '40px',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="собака">🐕 Собака</option>
                    <option value="кошка">🐱 Кошка</option>
                    <option value="хорек">🦡 Хорек</option>
                  </select>
                </div>
                <label style={labelStyle}>вид животного</label>
              </div>

              <div>
                <div style={{ position: 'relative' }}>
                  <select
                    value={animalData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    style={{
                      ...fieldStyle,
                      paddingRight: '40px',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="самец">♂️ Самец</option>
                    <option value="самка">♀️ Самка</option>
                  </select>
                </div>
                <label style={labelStyle}>пол</label>
              </div>

              <div>
                <input
                  type="text"
                  value={animalData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                  style={fieldStyle}
                  placeholder="Введите породу"
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>порода</label>
              </div>

              <div>
                <input
                  type="number"
                  step="0.1"
                  value={animalData.age}
                  onChange={(e) => handleInputChange('age', parseFloat(e.target.value))}
                  style={fieldStyle}
                  placeholder="0.0"
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>возраст (лет)</label>
              </div>

              <div>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={animalData.condition}
                  onChange={(e) => handleInputChange('condition', parseInt(e.target.value))}
                  style={fieldStyle}
                  placeholder="1-9"
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>кондиция (1-9)</label>
              </div>

              <div>
                <input
                  type="text"
                  value={animalData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={fieldStyle}
                  placeholder="Введите кличку"
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>кличка</label>
              </div>

              <div>
                <div style={{ position: 'relative' }}>
                  <select
                    value={animalData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    style={{
                      ...fieldStyle,
                      paddingRight: '40px',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="кастрированный">✂️ Кастрированный</option>
                    <option value="интактный">🔸 Интактный</option>
                    <option value="беременность 1-4 недели">🤱 Беременность 1-4 недели</option>
                    <option value="беременность >5 недель">🤱 Беременность {'>'}5 недель</option>
                    <option value="лактация">🍼 Лактация</option>
                  </select>
                </div>
                <label style={labelStyle}>статус</label>
              </div>

              <div>
                <div style={{ position: 'relative' }}>
                  <select
                    value={animalData.activity}
                    onChange={(e) => handleInputChange('activity', e.target.value)}
                    style={{
                      ...fieldStyle,
                      paddingRight: '40px',
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 12px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="склонность к ожирению">😴 Склонность к ожирению</option>
                    <option value="нормальная активность">🚶 Нормальная активность</option>
                    <option value="высокая активность">🏃 Высокая активность</option>
                  </select>
                </div>
                <label style={labelStyle}>активность</label>
              </div>

              <div>
                <input
                  type="text"
                  value={animalData.owner}
                  onChange={(e) => handleInputChange('owner', e.target.value)}
                  style={fieldStyle}
                  placeholder="Введите имя владельца"
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>владелец</label>
              </div>
            </div>
          </div>

          {/* Средняя колонка - вес и расчеты */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: window.innerWidth <= 768 ? '16px' : '24px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            }}
          >
            <h3 style={{ color: '#1a202c', marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              📏 Параметры веса
            </h3>
            
            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <div>
                <input
                  type="number"
                  step="0.1"
                  value={animalData.currentWeight}
                  onChange={(e) => handleInputChange('currentWeight', parseFloat(e.target.value))}
                  style={fieldStyle}
                  placeholder="0.0"
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>текущий (кг)</label>
              </div>

              <div>
                <input
                  type="number"
                  step="0.1"
                  value={animalData.targetWeight}
                  onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value))}
                  style={fieldStyle}
                  placeholder="0.0"
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>расчетный (кг)</label>
              </div>

              <div>
                <input
                  type="number"
                  step="0.1"
                  value={animalData.adultWeight}
                  onChange={(e) => handleInputChange('adultWeight', parseFloat(e.target.value))}
                  style={fieldStyle}
                  placeholder="0.0"
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>взрослый (кг)</label>
              </div>

              <div>
                <input
                  type="text"
                  value={animalData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  style={fieldStyle}
                  placeholder="Введите контакт"
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>контакт</label>
              </div>

              <div>
                <input
                  type="number"
                  step="0.1"
                  value={animalData.meCoefficient}
                  onChange={(e) => handleInputChange('meCoefficient', parseFloat(e.target.value))}
                  style={fieldStyle}
                  placeholder="1.0"
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>коэффициент МЭ</label>
              </div>
            </div>

            {/* Результат расчета энергии */}
            <div style={{
              background: 'linear-gradient(135deg, #ff9a8b 0%, #fad0c4 100%)',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '14px', color: '#7c2d12', marginBottom: '4px' }}>
                потребность в МЭ, ккал
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c2d12' }}>
                {energyNeed.toFixed(2)}
              </div>
            </div>

            <button
              onClick={() => {
                setAnimalData({
                  species: 'собака',
                  gender: 'самец',
                  breed: '',
                  age: 0,
                  condition: 5,
                  name: '',
                  status: 'кастрированный',
                  activity: 'нормальная активность',
                  owner: '',
                  currentWeight: 0,
                  targetWeight: 0,
                  adultWeight: 0,
                  lactationWeeks: 0,
                  contact: '',
                  meCoefficient: 1
                });
                setEnergyNeed(0);
                setSelectedFeed(null);
                setDailyAmount(0);
                setDiagnosis('');
                setIntolerances('');
              }}
              style={{
                width: '100%',
                height: '48px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: window.innerWidth <= 768 ? '13px' : '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)'
              }}
              onMouseEnter={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.transform = 'translateY(-3px) scale(1.02)';
                btn.style.boxShadow = '0 8px 25px rgba(240, 147, 251, 0.4)';
                btn.style.background = 'linear-gradient(135deg, #f093fb 0%, #e74c3c 100%)';
              }}
              onMouseLeave={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.transform = 'translateY(0) scale(1)';
                btn.style.boxShadow = '0 4px 15px rgba(240, 147, 251, 0.3)';
                btn.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
              }}
              onMouseDown={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.transform = 'translateY(-1px) scale(0.98)';
              }}
              onMouseUp={(e) => {
                const btn = e.target as HTMLButtonElement;
                btn.style.transform = 'translateY(-3px) scale(1.02)';
              }}
            >
              🗑️ Очистить данные
            </button>
          </div>

                  {/* Правая колонка - выбор корма */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: window.innerWidth <= 768 ? '16px' : '24px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
          }}
        >
            <h3 style={{ color: '#1a202c', marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
              🍖 Выбор корма
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedFeed?.id || ''}
                  onChange={handleFeedSelection}
                  style={{
                    ...fieldStyle,
                    paddingRight: '40px',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 12px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px'
                  }}
                >
                  <option value="">Выберите корм для расчета суточной нормы</option>
                  {feeds.map((feed) => (
                    <option key={feed.id} value={feed.id}>
                      {feed.brand} - {feed.name}
                    </option>
                  ))}
                </select>
              </div>
              <label style={labelStyle}>Выберите корм для расчета суточной нормы</label>
            </div>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
              <div>
                <input
                  type="number"
                  value={nutritionReq.proteinME}
                  onChange={(e) => setNutritionReq(prev => ({ ...prev, proteinME: parseInt(e.target.value) }))}
                  style={fieldStyle}
                  placeholder="35"
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>МЭ белка, %</label>
              </div>

              <div>
                <input
                  type="number"
                  value={nutritionReq.fatME}
                  onChange={(e) => setNutritionReq(prev => ({ ...prev, fatME: parseInt(e.target.value) }))}
                  style={fieldStyle}
                  placeholder="25"
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>МЭ жира, %</label>
              </div>

              <div>
                <input
                  type="number"
                  value={nutritionReq.carbME}
                  onChange={(e) => setNutritionReq(prev => ({ ...prev, carbME: parseInt(e.target.value) }))}
                  style={fieldStyle}
                  placeholder="40"
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>МЭ углеводов, %</label>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
              <div>
                <textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  style={{
                    ...fieldStyle,
                    height: '80px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Хроническая энтеропатия..."
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>Основной диагноз</label>
              </div>

              <div>
                <textarea
                  value={intolerances}
                  onChange={(e) => setIntolerances(e.target.value)}
                  style={{
                    ...fieldStyle,
                    height: '60px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Аллергии и непереносимости..."
                  onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.target.style, { borderColor: '#e2e8f0', boxShadow: 'none' })}
                />
                <label style={labelStyle}>Непереносимость продуктов</label>
              </div>
            </div>

            {/* Результаты расчета корма */}
            {selectedFeed && dailyAmount > 0 && (
              <div 
                style={{
                  background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  padding: window.innerWidth <= 768 ? '16px' : '20px',
                  borderRadius: '12px',
                  marginTop: '20px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(168, 237, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h4 style={{ color: '#1a202c', marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                  📊 Суточная норма
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a202c' }}>
                      {dailyAmount.toFixed(0)} г
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>граммы в день</div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a202c' }}>
                      {(dailyAmount / 120).toFixed(1)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>чашек в день</div>
                  </div>
                </div>

                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  <strong>{selectedFeed.brand} - {selectedFeed.name}</strong>
                  <br />
                  Калорийность: {selectedFeed.metabolizable_energy} ккал/100г
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Показ питательных веществ в суточной порции */}
      {selectedFeed && dailyAmount > 0 && (
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: window.innerWidth <= 768 ? '16px' : '24px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)',
            marginBottom: window.innerWidth <= 768 ? '20px' : '30px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
          }}
        >
          <h3 style={{ color: '#1a202c', marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
            🧪 Питательные вещества в суточной порции
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: window.innerWidth <= 768 ? 'repeat(auto-fit, minmax(150px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: window.innerWidth <= 768 ? '12px' : '16px' 
          }}>
            <div 
              style={{
                background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
                padding: window.innerWidth <= 768 ? '12px' : '16px',
                borderRadius: '12px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 234, 167, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3436' }}>
                {((selectedFeed.crude_protein / 100) * dailyAmount).toFixed(1)} г
              </div>
              <div style={{ fontSize: '12px', color: '#636e72' }}>Белок</div>
            </div>

            <div 
              style={{
                background: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)',
                padding: window.innerWidth <= 768 ? '12px' : '16px',
                borderRadius: '12px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(253, 121, 168, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3436' }}>
                {((selectedFeed.crude_fat / 100) * dailyAmount).toFixed(1)} г
              </div>
              <div style={{ fontSize: '12px', color: '#636e72' }}>Жир</div>
            </div>

            <div 
              style={{
                background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                padding: window.innerWidth <= 768 ? '12px' : '16px',
                borderRadius: '12px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(116, 185, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                {((selectedFeed.crude_fiber / 100) * dailyAmount).toFixed(1)} г
              </div>
              <div style={{ fontSize: '12px', color: '#ddd' }}>Клетчатка</div>
            </div>

            <div 
              style={{
                background: 'linear-gradient(135deg, #55a3ff 0%, #003d82 100%)',
                padding: window.innerWidth <= 768 ? '12px' : '16px',
                borderRadius: '12px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(85, 163, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                {((selectedFeed.moisture / 100) * dailyAmount).toFixed(1)} г
              </div>
              <div style={{ fontSize: '12px', color: '#ddd' }}>Влага</div>
            </div>
          </div>
        </div>
      )}


      </div>
    </div>
  );
};

export default Calculator; 