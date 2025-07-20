import React, { useState, useEffect } from 'react';
import config from '../config';

interface Feed {
  id: number;
  name: string;
  brand: string;
  type: string;
  animal_type: string;
  crude_protein: number;
  crude_fat: number;
  crude_fiber: number;
  ash: number;
  moisture: number;
  metabolizable_energy: number;
  calcium: number;
  phosphorus: number;
  sodium: number;
  potassium: number;
  vitamin_a: number;
  vitamin_d3: number;
  vitamin_e: number;
  feeding_guide: {
    [key: string]: string;
  };
}

interface AnimalData {
  weight: number;
  energyNeed: number;
  name: string;
}

const Comparisons: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [selectedFeeds, setSelectedFeeds] = useState<number[]>([]);
  const [animalData, setAnimalData] = useState<AnimalData>({
    weight: 15,
    energyNeed: 800,
    name: 'Мой питомец'
  });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    fetchFeeds();
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const handleFeedSelection = (feedId: number) => {
    if (selectedFeeds.includes(feedId)) {
      setSelectedFeeds(selectedFeeds.filter(id => id !== feedId));
    } else if (selectedFeeds.length < 4) {
      setSelectedFeeds([...selectedFeeds, feedId]);
    } else {
      alert('Можно сравнивать максимум 4 корма одновременно');
    }
  };

  const getSelectedFeedsData = () => {
    return feeds.filter(feed => selectedFeeds.includes(feed.id));
  };

  const calculateDailyAmount = (feed: Feed) => {
    const dailyAmountGrams = (animalData.energyNeed / feed.metabolizable_energy) * 1000;
    const dailyAmountCups = dailyAmountGrams / 120; // 120г = 1 чашка
    
    return {
      grams: Math.round(dailyAmountGrams * 10) / 10,
      cups: Math.round(dailyAmountCups * 10) / 10,
      protein: Math.round((feed.crude_protein * dailyAmountGrams / 100) * 10) / 10,
      fat: Math.round((feed.crude_fat * dailyAmountGrams / 100) * 10) / 10,
      calcium: Math.round((feed.calcium * dailyAmountGrams / 100) * 10) / 10,
      phosphorus: Math.round((feed.phosphorus * dailyAmountGrams / 100) * 10) / 10
    };
  };

  const getBestValue = (values: number[], isLower = false) => {
    return isLower ? Math.min(...values) : Math.max(...values);
  };

  const getValueColor = (value: number, bestValue: number, isLower = false) => {
    const isBest = isLower ? value === bestValue : value === bestValue;
    return isBest ? '#00C851' : '#666';
  };

  const getComparisonChart = (feeds: Feed[], property: keyof Feed, title: string) => {
    const maxValue = Math.max(...feeds.map(feed => Number(feed[property])));
    
    return (
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '20px',
        border: '2px solid rgba(0, 200, 81, 0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{
          color: '#2d3748',
          marginBottom: '15px',
          fontSize: '1.2rem',
          fontWeight: '600'
        }}>
          {title}
        </h3>
        
        {feeds.map(feed => {
          const value = Number(feed[property]);
          const percentage = (value / maxValue) * 100;
          
          return (
            <div key={feed.id} style={{ marginBottom: '15px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '5px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {feed.brand} {feed.name.substring(0, 30)}...
                </span>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: getValueColor(value, getBestValue(feeds.map(f => Number(f[property]))))
                }}>
                  {value}{property === 'metabolizable_energy' ? ' ккал/кг' : '%'}
                </span>
              </div>
              
              <div style={{
                background: '#f1f3f4',
                borderRadius: '10px',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: `linear-gradient(90deg, #00C851 0%, #33B5E5 100%)`,
                  height: '100%',
                  width: `${percentage}%`,
                  borderRadius: '10px',
                  transition: 'width 0.8s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const selectedFeedsData = getSelectedFeedsData();

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1600px',
      margin: '0 auto'
    }}>
      {/* Заголовок */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#2d3748',
          marginBottom: '15px',
          background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
            color: 'white',
            width: '45px',
            height: '45px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            ≈
          </span>
          Сравнение кормов
        </h1>
        <p style={{
          color: '#666',
          fontSize: '1.1rem'
        }}>
          Подробное сравнение питательности и расчет суточных норм
        </p>
      </div>

      {/* Настройки животного */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '25px',
        borderRadius: '15px',
        marginBottom: '25px',
        border: '2px solid rgba(0, 200, 81, 0.1)'
      }}>
        <h2 style={{
          color: '#2d3748',
          marginBottom: '20px',
          fontSize: '1.4rem',
          fontWeight: '600'
        }}>
          🐕 Данные животного
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: windowWidth > 768 ? '1fr 1fr 1fr' : '1fr',
          gap: '20px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
              Кличка
            </label>
            <input
              type="text"
              value={animalData.name}
              onChange={(e) => setAnimalData({...animalData, name: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid rgba(0, 200, 81, 0.2)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              placeholder="Имя питомца"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
              Вес (кг)
            </label>
            <input
              type="number"
              step="0.1"
              value={animalData.weight}
              onChange={(e) => setAnimalData({...animalData, weight: parseFloat(e.target.value)})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid rgba(0, 200, 81, 0.2)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              placeholder="15.0"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
              Потребность в энергии (ккал/день)
            </label>
            <input
              type="number"
              value={animalData.energyNeed}
              onChange={(e) => setAnimalData({...animalData, energyNeed: parseInt(e.target.value)})}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid rgba(0, 200, 81, 0.2)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              placeholder="800"
            />
          </div>
        </div>
      </div>

      {/* Выбор кормов */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '25px',
        borderRadius: '15px',
        marginBottom: '25px',
        border: '2px solid rgba(0, 200, 81, 0.1)'
      }}>
        <h2 style={{
          color: '#2d3748',
          marginBottom: '20px',
          fontSize: '1.4rem',
          fontWeight: '600'
        }}>
          🍖 Выберите корма для сравнения (максимум 4)
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          {feeds.map(feed => (
            <div
              key={feed.id}
              onClick={() => handleFeedSelection(feed.id)}
              style={{
                background: selectedFeeds.includes(feed.id) 
                  ? 'linear-gradient(135deg, rgba(0, 200, 81, 0.1) 0%, rgba(51, 181, 229, 0.1) 100%)'
                  : 'white',
                border: selectedFeeds.includes(feed.id) 
                  ? '2px solid #00C851' 
                  : '2px solid rgba(0, 200, 81, 0.1)',
                borderRadius: '12px',
                padding: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!selectedFeeds.includes(feed.id)) {
                  e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedFeeds.includes(feed.id)) {
                  e.currentTarget.style.borderColor = 'rgba(0, 200, 81, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {selectedFeeds.includes(feed.id) && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#00C851',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  ✓
                </div>
              )}

              <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '8px' }}>
                {feed.name}
              </div>
              <div style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
                {feed.brand}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#666'
              }}>
                <span>Белок: {feed.crude_protein}%</span>
                <span>МЭ: {feed.metabolizable_energy}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedFeeds.length > 0 && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(0, 200, 81, 0.05)',
            borderRadius: '10px',
            border: '1px solid rgba(0, 200, 81, 0.2)'
          }}>
            <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '5px' }}>
              Выбрано кормов: {selectedFeeds.length} из 4
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {selectedFeedsData.map(feed => feed.brand + ' ' + feed.name).join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* Результаты сравнения */}
      {selectedFeedsData.length > 0 && (
        <>
          {/* Таблица сравнения */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '25px',
            border: '2px solid rgba(0, 200, 81, 0.1)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
              color: 'white',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                📋 Детальное сравнение
              </h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#2d3748' }}>
                      Показатель
                    </th>
                    {selectedFeedsData.map(feed => (
                      <th key={feed.id} style={{ 
                        padding: '15px', 
                        textAlign: 'center', 
                        fontWeight: '600',
                        color: '#2d3748',
                        minWidth: '150px'
                      }}>
                        <div>{feed.brand}</div>
                        <div style={{ fontSize: '12px', fontWeight: '400', color: '#666' }}>
                          {feed.name.substring(0, 20)}...
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'МЭ (ккал/кг)', key: 'metabolizable_energy', suffix: '' },
                    { label: 'Белок (%)', key: 'crude_protein', suffix: '%' },
                    { label: 'Жир (%)', key: 'crude_fat', suffix: '%' },
                    { label: 'Клетчатка (%)', key: 'crude_fiber', suffix: '%' },
                    { label: 'Кальций (%)', key: 'calcium', suffix: '%' },
                    { label: 'Фосфор (%)', key: 'phosphorus', suffix: '%' },
                    { label: 'Витамин А (МЕ/кг)', key: 'vitamin_a', suffix: '' },
                    { label: 'Витамин D3 (МЕ/кг)', key: 'vitamin_d3', suffix: '' },
                    { label: 'Витамин E (мг/кг)', key: 'vitamin_e', suffix: '' }
                  ].map((row, index) => {
                    const values = selectedFeedsData.map(feed => Number(feed[row.key as keyof Feed]));
                    const bestValue = getBestValue(values, row.key === 'crude_fiber');
                    
                    return (
                      <tr key={row.key} style={{
                        background: index % 2 === 0 ? 'white' : '#f8f9fa',
                        borderBottom: '1px solid rgba(0, 200, 81, 0.1)'
                      }}>
                        <td style={{ 
                          padding: '12px 15px', 
                          fontWeight: '600',
                          color: '#2d3748'
                        }}>
                          {row.label}
                        </td>
                        {selectedFeedsData.map(feed => {
                          const value = Number(feed[row.key as keyof Feed]);
                          const isBest = row.key === 'crude_fiber' ? value === bestValue : value === bestValue;
                          
                          return (
                            <td key={feed.id} style={{ 
                              padding: '12px 15px', 
                              textAlign: 'center',
                              fontWeight: isBest ? '700' : '500',
                              color: isBest ? '#00C851' : '#666',
                              background: isBest ? 'rgba(0, 200, 81, 0.05)' : 'transparent'
                            }}>
                              {value}{row.suffix}
                              {isBest && <span style={{ marginLeft: '5px' }}>🏆</span>}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Расчет суточных норм */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '15px',
            overflow: 'hidden',
            marginBottom: '25px',
            border: '2px solid rgba(0, 200, 81, 0.1)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              color: 'white',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                🥣 Суточные нормы для {animalData.name} ({animalData.weight} кг, {animalData.energyNeed} ккал/день)
              </h2>
            </div>

            <div style={{ padding: '25px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${selectedFeedsData.length}, 1fr)`,
                gap: '20px'
              }}>
                {selectedFeedsData.map(feed => {
                  const dailyData = calculateDailyAmount(feed);
                  
                  return (
                    <div key={feed.id} style={{
                      background: 'linear-gradient(135deg, rgba(0, 200, 81, 0.05) 0%, rgba(51, 181, 229, 0.05) 100%)',
                      border: '2px solid rgba(0, 200, 81, 0.1)',
                      borderRadius: '15px',
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <h3 style={{
                        color: '#2d3748',
                        marginBottom: '15px',
                        fontSize: '1.1rem',
                        fontWeight: '600'
                      }}>
                        {feed.brand} {feed.name.substring(0, 20)}...
                      </h3>

                      <div style={{
                        background: '#00C851',
                        color: 'white',
                        padding: '15px',
                        borderRadius: '10px',
                        marginBottom: '15px'
                      }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                          {dailyData.grams} г
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.9 }}>
                          ({dailyData.cups} чашек)
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        fontSize: '12px'
                      }}>
                        <div style={{
                          background: 'white',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(0, 200, 81, 0.1)'
                        }}>
                          <div style={{ fontWeight: '600', color: '#2d3748' }}>Белок</div>
                          <div style={{ color: '#666' }}>{dailyData.protein} г</div>
                        </div>

                        <div style={{
                          background: 'white',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(0, 200, 81, 0.1)'
                        }}>
                          <div style={{ fontWeight: '600', color: '#2d3748' }}>Жир</div>
                          <div style={{ color: '#666' }}>{dailyData.fat} г</div>
                        </div>

                        <div style={{
                          background: 'white',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(0, 200, 81, 0.1)'
                        }}>
                          <div style={{ fontWeight: '600', color: '#2d3748' }}>Ca</div>
                          <div style={{ color: '#666' }}>{dailyData.calcium} г</div>
                        </div>

                        <div style={{
                          background: 'white',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(0, 200, 81, 0.1)'
                        }}>
                          <div style={{ fontWeight: '600', color: '#2d3748' }}>P</div>
                          <div style={{ color: '#666' }}>{dailyData.phosphorus} г</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Графики сравнения */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '25px'
          }}>
            {getComparisonChart(selectedFeedsData, 'crude_protein', '🥩 Содержание белка (%)')}
            {getComparisonChart(selectedFeedsData, 'crude_fat', '🧈 Содержание жира (%)')}
            {getComparisonChart(selectedFeedsData, 'metabolizable_energy', '⚡ Энергетическая ценность (ккал/кг)')}
            {getComparisonChart(selectedFeedsData, 'calcium', '🦴 Содержание кальция (%)')}
          </div>
        </>
      )}

      {selectedFeeds.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '20px',
          border: '2px dashed rgba(0, 200, 81, 0.3)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📊</div>
          <h2 style={{
            color: '#2d3748',
            marginBottom: '15px',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Выберите корма для сравнения
          </h2>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Выберите от 2 до 4 кормов выше, чтобы увидеть подробное сравнение
          </p>
        </div>
      )}
    </div>
  );
};

export default Comparisons; 