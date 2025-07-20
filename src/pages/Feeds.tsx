import React, { useState, useEffect } from 'react';
import config from '../config';

interface Feed {
  id: number;
  name: string;
  brand: string;
  type: string;
  animal_type: string;
  life_stage: string;
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

const Feeds: React.FC = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterType, setFilterType] = useState('');

  const [newFeed, setNewFeed] = useState({
    name: '',
    brand: '',
    type: 'лечебный',
    animal_type: 'собака',
    life_stage: 'взрослый',
    crude_protein: 0,
    crude_fat: 0,
    crude_fiber: 0,
    ash: 0,
    moisture: 0,
    metabolizable_energy: 0,
    calcium: 0,
    phosphorus: 0,
    sodium: 0,
    potassium: 0,
    vitamin_a: 0,
    vitamin_d3: 0,
    vitamin_e: 0
  });

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeed = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.feeds}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newFeed,
          calories_per_100g: newFeed.metabolizable_energy / 10 // конвертация из kcal/kg в kcal/100g
        }),
      });

      if (response.ok) {
        await fetchFeeds();
        setShowAddForm(false);
        resetNewFeed();
        alert('Корм успешно добавлен!');
      } else {
        alert('Ошибка при добавлении корма');
      }
    } catch (error) {
      console.error('Error adding feed:', error);
      alert('Ошибка при добавлении корма');
    }
  };

  const handleDeleteFeed = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот корм?')) {
      try {
        const response = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.feeds}/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchFeeds();
          alert('Корм успешно удален!');
        } else {
          alert('Ошибка при удалении корма');
        }
      } catch (error) {
        console.error('Error deleting feed:', error);
        alert('Ошибка при удалении корма');
      }
    }
  };

  const resetNewFeed = () => {
    setNewFeed({
      name: '',
      brand: '',
      type: 'лечебный',
      animal_type: 'собака',
      life_stage: 'взрослый',
      crude_protein: 0,
      crude_fat: 0,
      crude_fiber: 0,
      ash: 0,
      moisture: 0,
      metabolizable_energy: 0,
      calcium: 0,
      phosphorus: 0,
      sodium: 0,
      potassium: 0,
      vitamin_a: 0,
      vitamin_d3: 0,
      vitamin_e: 0
    });
  };

  const filteredFeeds = feeds.filter(feed => {
    const matchesSearch = feed.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feed.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = !filterBrand || feed.brand === filterBrand;
    const matchesType = !filterType || feed.type === filterType;
    
    return matchesSearch && matchesBrand && matchesType;
  });

  const uniqueBrands = Array.from(new Set(feeds.map(feed => feed.brand)));
  const uniqueTypes = Array.from(new Set(feeds.map(feed => feed.type)));

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        Загрузка кормов...
      </div>
    );
  }

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
          WebkitTextFillColor: 'transparent'
        }}>
          🍖 База кормов
        </h1>
        <p style={{
          color: '#666',
          fontSize: '1.1rem'
        }}>
          Полная база данных кормов с подробным составом и питательностью
        </p>
      </div>

      {/* Панель управления */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '25px',
        borderRadius: '15px',
        marginBottom: '25px',
        border: '2px solid rgba(0, 200, 81, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 200, 81, 0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '20px',
          alignItems: 'center'
        }}>
          {/* Фильтры */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '15px'
          }}>
            <input
              type="text"
              placeholder="🔍 Поиск по названию или бренду..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid rgba(0, 200, 81, 0.2)',
                borderRadius: '10px',
                fontSize: '14px',
                transition: 'border-color 0.3s ease'
              }}
            />

            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid rgba(0, 200, 81, 0.2)',
                borderRadius: '10px',
                fontSize: '14px'
              }}
            >
              <option value="">Все бренды</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid rgba(0, 200, 81, 0.2)',
                borderRadius: '10px',
                fontSize: '14px'
              }}
            >
              <option value="">Все типы</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Кнопка добавления */}
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              boxShadow: '0 4px 16px rgba(0, 200, 81, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ➕ Добавить корм
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{filteredFeeds.length}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Всего кормов</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{uniqueBrands.length}</div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Брендов</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {Math.round(filteredFeeds.reduce((sum, feed) => sum + feed.metabolizable_energy, 0) / filteredFeeds.length) || 0}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Средняя МЭ</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {Math.round(filteredFeeds.reduce((sum, feed) => sum + feed.crude_protein, 0) / filteredFeeds.length) || 0}%
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Средний белок</div>
        </div>
      </div>

      {/* Таблица кормов */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '15px',
        overflow: 'hidden',
        border: '2px solid rgba(0, 200, 81, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 200, 81, 0.1)'
      }}>
        <div style={{
          overflowX: 'auto'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{
                background: 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)',
                color: 'white'
              }}>
                <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '600' }}>Корм</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Бренд</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Тип</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>МЭ<br/>ккал/кг</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Белок<br/>%</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Жир<br/>%</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Клетчатка<br/>%</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Ca<br/>%</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>P<br/>%</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Вит А<br/>МЕ/кг</th>
                <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeeds.map((feed, index) => (
                <tr
                  key={feed.id}
                  style={{
                    background: index % 2 === 0 ? '#f8f9fa' : 'white',
                    borderBottom: '1px solid rgba(0, 200, 81, 0.1)',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 200, 81, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : 'white';
                  }}
                >
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: '600', color: '#2d3748' }}>{feed.name}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                      {feed.animal_type} • {feed.life_stage}
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.brand}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{
                      background: feed.type === 'лечебный' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                      color: feed.type === 'лечебный' ? '#d32f2f' : '#388e3c',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {feed.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600' }}>
                    {feed.metabolizable_energy}
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.crude_protein}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.crude_fat}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.crude_fiber}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.calcium}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.phosphorus}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>{feed.vitamin_a}</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => alert('Функция редактирования в разработке')}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(33, 150, 243, 0.1)',
                          color: '#1976d2',
                          border: '1px solid rgba(33, 150, 243, 0.2)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteFeed(feed.id)}
                        style={{
                          padding: '6px 12px',
                          background: 'rgba(244, 67, 54, 0.1)',
                          color: '#d32f2f',
                          border: '1px solid rgba(244, 67, 54, 0.2)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Форма добавления корма */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              color: '#2d3748',
              marginBottom: '25px',
              textAlign: 'center',
              fontSize: '1.8rem',
              fontWeight: '700'
            }}>
              ➕ Добавить новый корм
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Название корма
                </label>
                <input
                  type="text"
                  value={newFeed.name}
                  onChange={(e) => setNewFeed({...newFeed, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="Название корма"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Бренд
                </label>
                <input
                  type="text"
                  value={newFeed.brand}
                  onChange={(e) => setNewFeed({...newFeed, brand: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="Бренд"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Тип корма
                </label>
                <select
                  value={newFeed.type}
                  onChange={(e) => setNewFeed({...newFeed, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="лечебный">Лечебный</option>
                  <option value="коммерческий">Коммерческий</option>
                  <option value="холистик">Холистик</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Вид животного
                </label>
                <select
                  value={newFeed.animal_type}
                  onChange={(e) => setNewFeed({...newFeed, animal_type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="собака">Собака</option>
                  <option value="кошка">Кошка</option>
                  <option value="хорек">Хорек</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  МЭ (ккал/кг)
                </label>
                <input
                  type="number"
                  value={newFeed.metabolizable_energy}
                  onChange={(e) => setNewFeed({...newFeed, metabolizable_energy: parseFloat(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="3600"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Белок (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newFeed.crude_protein}
                  onChange={(e) => setNewFeed({...newFeed, crude_protein: parseFloat(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="24.0"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Жир (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newFeed.crude_fat}
                  onChange={(e) => setNewFeed({...newFeed, crude_fat: parseFloat(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="12.0"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2d3748' }}>
                  Клетчатка (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newFeed.crude_fiber}
                  onChange={(e) => setNewFeed({...newFeed, crude_fiber: parseFloat(e.target.value)})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 200, 81, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  placeholder="2.5"
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              marginTop: '30px'
            }}>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetNewFeed();
                }}
                style={{
                  padding: '12px 24px',
                  background: 'rgba(108, 117, 125, 0.1)',
                  color: '#6c757d',
                  border: '2px solid rgba(108, 117, 125, 0.2)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>

              <button
                onClick={handleAddFeed}
                disabled={!newFeed.name || !newFeed.brand || !newFeed.metabolizable_energy}
                style={{
                  padding: '12px 24px',
                  background: newFeed.name && newFeed.brand && newFeed.metabolizable_energy 
                    ? 'linear-gradient(135deg, #00C851 0%, #33B5E5 100%)' 
                    : 'rgba(108, 117, 125, 0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: newFeed.name && newFeed.brand && newFeed.metabolizable_energy ? 'pointer' : 'not-allowed',
                  boxShadow: newFeed.name && newFeed.brand && newFeed.metabolizable_energy 
                    ? '0 4px 16px rgba(0, 200, 81, 0.3)' 
                    : 'none'
                }}
              >
                ➕ Добавить корм
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feeds; 