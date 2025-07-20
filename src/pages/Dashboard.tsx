import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import config from '../config';

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    feeds: 0,
    animals: 0,
    comparisons: 0,
    brands: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Всегда загружаем публичные корма
      const feedsRes = await fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.feeds}`);
      
      if (!feedsRes.ok) {
        throw new Error('Ошибка загрузки кормов');
      }
      
      const feeds = await feedsRes.json();
      const uniqueBrands = new Set(feeds.map((feed: any) => feed.brand));

      if (isAuthenticated) {
        // Для авторизованных пользователей загружаем все данные
        try {
          const token = localStorage.getItem('token');
          const requestOptions: RequestInit = token 
            ? { headers: { 'Authorization': `Bearer ${token}` } }
            : {};
          
          const [animalsRes, comparisonsRes] = await Promise.all([
            fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.animals}`, requestOptions),
            fetch(`${config.API_BASE_URL}${config.API_ENDPOINTS.calculations}`, requestOptions)
          ]);

          if (animalsRes.ok && comparisonsRes.ok) {
            const [animals, calculations] = await Promise.all([
              animalsRes.json(),
              comparisonsRes.json()
            ]);

            setStats({
              feeds: feeds.length,
              animals: animals.length,
              comparisons: calculations.length,
              brands: uniqueBrands.size
            });
          } else {
            setStats({
              feeds: feeds.length,
              animals: 0,
              comparisons: 0,
              brands: uniqueBrands.size
            });
          }
        } catch (authError) {
          console.error('Ошибка загрузки защищенных данных:', authError);
          setStats({
            feeds: feeds.length,
            animals: 0,
            comparisons: 0,
            brands: uniqueBrands.size
          });
        }
      } else {
        // Для неавторизованных пользователей показываем только публичные данные
        setStats({
          feeds: feeds.length,
          animals: 0,
          comparisons: 0,
          brands: uniqueBrands.size
        });
      }

    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        fontSize: '18px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🐕</div>
        <div>Загружаем данные...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        color: '#F44336',
        background: 'rgba(244, 67, 54, 0.1)',
        borderRadius: '16px',
        margin: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h3>Ошибка загрузки</h3>
        <p>{error}</p>
        <button 
          onClick={fetchStats}
          style={{
            padding: '12px 24px',
            background: '#00C851',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: window.innerWidth <= 768 ? '10px' : '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Hero блок */}
      <div style={{
        textAlign: 'center',
        marginBottom: window.innerWidth <= 768 ? '40px' : '60px',
        padding: window.innerWidth <= 768 ? '40px 15px' : '80px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: window.innerWidth <= 768 ? '20px' : '32px',
        color: 'white'
      }}>
        <div style={{ 
          fontSize: window.innerWidth <= 768 ? '60px' : '80px', 
          marginBottom: window.innerWidth <= 768 ? '20px' : '30px' 
        }}>🏥🐾</div>
        
        <h1 style={{
          fontSize: window.innerWidth <= 768 ? '2.5rem' : '4rem',
          fontWeight: '900',
          marginBottom: window.innerWidth <= 768 ? '16px' : '24px',
          color: 'white'
        }}>
          VetFormuLab Pro
        </h1>
        
        <p style={{
          fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.5rem',
          marginBottom: window.innerWidth <= 768 ? '30px' : '40px',
          maxWidth: '700px',
          margin: window.innerWidth <= 768 ? '0 auto 30px auto' : '0 auto 40px auto',
          opacity: 0.95,
          lineHeight: '1.4'
        }}>
          Научные расчеты питания для профессиональных ветеринаров
        </p>

        <Link 
          to="/calculator"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: window.innerWidth <= 768 ? '8px' : '12px',
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#667eea',
            fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
            fontWeight: '700',
            padding: window.innerWidth <= 768 ? '16px 32px' : '20px 40px',
            borderRadius: '25px',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.3)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
          }}
        >
          🧮 Попробовать бесплатно
        </Link>
      </div>

      {/* Карточки преимуществ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: window.innerWidth <= 768 ? '20px' : '30px',
        marginBottom: window.innerWidth <= 768 ? '40px' : '60px'
      }}>
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '2px solid rgba(0, 200, 81, 0.2)',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 200, 81, 0.15)';
            e.currentTarget.style.border = '2px solid rgba(0, 200, 81, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            e.currentTarget.style.border = '2px solid rgba(0, 200, 81, 0.2)';
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>👨‍⚕️</div>
          <h3 style={{ color: '#00C851', marginBottom: '15px' }}>
            Для ветеринаров
          </h3>
          <p style={{ color: '#666' }}>
            Профессиональные инструменты для точного расчета питания животных по международным стандартам
          </p>
        </div>

        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '2px solid rgba(51, 181, 229, 0.2)',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(51, 181, 229, 0.15)';
            e.currentTarget.style.border = '2px solid rgba(51, 181, 229, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            e.currentTarget.style.border = '2px solid rgba(51, 181, 229, 0.2)';
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔬</div>
          <h3 style={{ color: '#33B5E5', marginBottom: '15px' }}>
            Расчёт по науке
          </h3>
          <p style={{ color: '#666' }}>
            Формулы основаны на метаболических исследованиях и рекомендациях ведущих ветеринарных организаций
          </p>
        </div>

        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '2px solid rgba(255, 107, 53, 0.2)',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 20px 60px rgba(255, 107, 53, 0.15)';
            e.currentTarget.style.border = '2px solid rgba(255, 107, 53, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            e.currentTarget.style.border = '2px solid rgba(255, 107, 53, 0.2)';
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
          <h3 style={{ color: '#FF6B35', marginBottom: '15px' }}>
            Экономит время
          </h3>
          <p style={{ color: '#666' }}>
            Мгновенные расчёты, готовые рекомендации и сравнение кормов в несколько кликов
          </p>
        </div>
      </div>

      {/* Баннер для неавторизованных пользователей */}
      {!isAuthenticated && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 143, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
          border: '1px solid rgba(255, 143, 0, 0.3)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '15px' }}>🔑</div>
          
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#FF8F00',
            marginBottom: '12px'
          }}>
            Получите больше возможностей!
          </h3>
          
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '20px',
            maxWidth: '500px',
            margin: '0 auto 20px auto'
          }}>
            Зарегистрируйтесь в системе для сохранения истории расчетов, 
            создания профилей животных и доступа к расширенной аналитике.
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap'
          }}>
            <Link 
              to="/register"
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(255, 143, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 143, 0, 0.4)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #e74c3c 0%, #FF6B35 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 143, 0, 0.3)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
              }}
            >
              🚀 Создать аккаунт
            </Link>
            
            <Link 
              to="/login"
              style={{
                background: 'rgba(255, 143, 0, 0.1)',
                color: '#FF8F00',
                border: '2px solid rgba(255, 143, 0, 0.3)',
                padding: '10px 24px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 143, 0, 0.2)';
                e.currentTarget.style.background = 'rgba(255, 143, 0, 0.2)';
                e.currentTarget.style.border = '2px solid rgba(255, 143, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'rgba(255, 143, 0, 0.1)';
                e.currentTarget.style.border = '2px solid rgba(255, 143, 0, 0.3)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
              }}
            >
              🔓 Уже есть аккаунт
            </Link>
          </div>
        </div>
      )}

      {/* Статистические карточки */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: window.innerWidth <= 768 ? '16px' : '24px',
        marginBottom: window.innerWidth <= 768 ? '30px' : '40px'
      }}>
        {/* Карточка кормов */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(0, 200, 81, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 200, 81, 0.15)';
            e.currentTarget.style.border = '1px solid rgba(0, 200, 81, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            e.currentTarget.style.border = '1px solid rgba(0, 200, 81, 0.2)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ 
                color: '#666', 
                fontSize: '14px', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                ВСЕГО КОРМОВ
              </h3>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#00C851',
                marginBottom: '8px'
              }}>
                {stats.feeds}
              </div>
              <div style={{ 
                color: '#00C851', 
                fontSize: '14px',
                fontWeight: '600'
              }}>
                📈 +12% за месяц
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #00C851 0%, #007E33 100%)',
              borderRadius: '16px',
              padding: '12px',
              fontSize: '24px'
            }}>
              🍖
            </div>
          </div>
        </div>

        {/* Карточка животных */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(51, 181, 229, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(51, 181, 229, 0.15)';
            e.currentTarget.style.border = '1px solid rgba(51, 181, 229, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            e.currentTarget.style.border = '1px solid rgba(51, 181, 229, 0.2)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ 
                color: '#666', 
                fontSize: '14px', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                ЖИВОТНЫХ В БАЗЕ
              </h3>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#33B5E5',
                marginBottom: '8px'
              }}>
                {stats.animals}
              </div>
              <div style={{ 
                color: '#33B5E5', 
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {isAuthenticated ? '📊 Ваши данные' : '🔒 Нужен вход'}
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #33B5E5 0%, #0099CC 100%)',
              borderRadius: '16px',
              padding: '12px',
              fontSize: '24px'
            }}>
              🐕
            </div>
          </div>
        </div>

        {/* Карточка сравнений */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255, 107, 53, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(255, 107, 53, 0.15)';
            e.currentTarget.style.border = '1px solid rgba(255, 107, 53, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            e.currentTarget.style.border = '1px solid rgba(255, 107, 53, 0.2)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ 
                color: '#666', 
                fontSize: '14px', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                РАСЧЕТОВ ВЫПОЛНЕНО
              </h3>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#FF6B35',
                marginBottom: '8px'
              }}>
                {stats.comparisons}
              </div>
              <div style={{ 
                color: '#FF6B35', 
                fontSize: '14px',
                fontWeight: '600'
              }}>
                ⚡ Быстро и точно
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
              borderRadius: '16px',
              padding: '12px',
              fontSize: '24px'
            }}>
              📊
            </div>
          </div>
        </div>

        {/* Карточка брендов */}
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(139, 195, 74, 0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 16px 48px rgba(139, 195, 74, 0.15)';
            e.currentTarget.style.border = '1px solid rgba(139, 195, 74, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            e.currentTarget.style.border = '1px solid rgba(139, 195, 74, 0.2)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ 
                color: '#666', 
                fontSize: '14px', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                БРЕНДОВ КОРМОВ
              </h3>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                color: '#8BC34A',
                marginBottom: '8px'
              }}>
                {stats.brands}
              </div>
              <div style={{ 
                color: '#8BC34A', 
                fontSize: '14px',
                fontWeight: '600'
              }}>
                🏷️ Проверенные бренды
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #8BC34A 0%, #9CCC65 100%)',
              borderRadius: '16px',
              padding: '12px',
              fontSize: '24px'
            }}>
              🏭
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 