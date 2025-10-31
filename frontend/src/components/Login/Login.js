import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Animation states
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const slides = [
    {
      type: 'features',
      title: 'AI-Powered Grant Writing',
      subtitle: 'Generate compelling grant proposals in minutes',
      description: 'Our advanced AI assistant helps you create professional grant applications with optimized content structure and persuasive language.',
      icon: 'fas fa-robot',
      stats: null
    },
    {
      type: 'features',
      title: 'Smart Grant Matching',
      subtitle: 'Find perfect funding opportunities automatically',
      description: 'Intelligent algorithms match your organization with the most suitable grants based on your profile, goals, and requirements.',
      icon: 'fas fa-bolt',
      stats: null
    },
    {
      type: 'features',
      title: 'Real-time Analytics',
      subtitle: 'Track performance with detailed insights',
      description: 'Monitor your grant success rates, track application status, and get actionable insights to improve your funding strategy.',
      icon: 'fas fa-chart-line',
      stats: null
    },
    {
      type: 'stats',
      title: 'Trusted by Thousands',
      subtitle: 'Proven results across industries',
      description: '',
      icon: null,
      stats: [
        { number: '$2.1B+', label: 'Funding Secured' },
        { number: '15K+', label: 'Successful Grants' },
        { number: '98%', label: 'Client Satisfaction' }
      ]
    },
    {
      type: 'testimonial',
      title: 'Success Story',
      subtitle: 'From our valued partners',
      description: '"Grant Funds helped us secure $500K in funding we never would have found on our own. The AI writing assistant is a game-changer!"',
      icon: null,
      stats: null,
      author: {
        name: 'Sarah Chen',
        role: 'Executive Director, GreenTech Initiative',
        avatar: 'https://i.pravatar.cc/150?img=32'
      }
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAnimating(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        setMessage('Success! Redirecting to dashboard...');
        // The redirect will happen automatically via the useEffect above
        // and the ProtectedRoute in App.js
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (email, password) => {
    setFormData({
      ...formData,
      email,
      password
    });
  };

  const renderSlideContent = () => {
    const slide = slides[currentSlide];
    
    switch (slide.type) {
      case 'features':
        return (
          <div className="slide-content feature-slide">
            <div className="slide-icon">
              <i className={slide.icon}></i>
            </div>
            <div className="slide-text">
              <h3 className="slide-title">{slide.title}</h3>
              <p className="slide-subtitle">{slide.subtitle}</p>
              <p className="slide-description">{slide.description}</p>
            </div>
          </div>
        );
      
      case 'stats':
        return (
          <div className="slide-content stats-slide">
            <h3 className="slide-title">{slide.title}</h3>
            <p className="slide-subtitle">{slide.subtitle}</p>
            <div className="animated-stats">
              {slide.stats.map((stat, index) => (
                <div key={index} className="animated-stat">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'testimonial':
        return (
          <div className="slide-content testimonial-slide">
            <div className="quote-icon">
              <i className="fas fa-quote-left"></i>
            </div>
            <h3 className="slide-title">{slide.title}</h3>
            <p className="slide-subtitle">{slide.subtitle}</p>
            <div className="testimonial-content">
              <p className="testimonial-text">{slide.description}</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src={slide.author.avatar} alt={slide.author.name} />
                </div>
                <div className="author-info">
                  <div className="author-name">{slide.author.name}</div>
                  <div className="author-role">{slide.author.role}</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Don't render login page if already authenticated
  if (isAuthenticated) {
    return null; // or a loading spinner, redirect will happen
  }

  return (
    <div className="login-container">
      {/* Left Side - Login Form */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="login-header">
            <div className="logo">
              <i className="fas fa-hand-holding-usd"></i>
              <span className="logo-text">Grant Funds</span>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to your Grant Funds account</p>
          </div>

          {/* Demo Credentials */}
          <div className="demo-credentials">
            <div className="demo-header">
              <i className="fas fa-key"></i>
              <span>Demo Access</span>
            </div>
            <div className="demo-buttons">
              <button 
                type="button" 
                className="demo-btn"
                onClick={() => fillDemoCredentials('demo@grantfunds.com', 'demo123')}
              >
                <i className="fas fa-user"></i>
                Demo User
              </button>
              <button 
                type="button" 
                className="demo-btn"
                onClick={() => fillDemoCredentials('sarah.johnson@grantfunds.com', 'password123')}
              >
                <i className="fas fa-user-tie"></i>
                Sarah Johnson
              </button>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">
                  <i className="fas fa-user"></i>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {message && (
              <div className={`message ${message.includes('Success') ? 'success' : 'error'}`}>
                <i className={`fas ${message.includes('Success') ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              className="login-btn" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Processing...
                </>
              ) : (
                <>
                  <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'}`}></i>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>

            <div className="login-footer">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button" 
                  className="link-btn"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setMessage('');
                  }}
                >
                  {isLogin ? 'Create one here' : 'Sign in here'}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Watermark */}
        <div className="watermark">
          Tool Made with <span className="heart">❤️</span> by NeonByteAI
        </div>
      </div>

      {/* Right Side - Animated Company Messaging */}
      <div className="company-section">
        <div className="company-content">
          <div className="company-header">
            <h2>Transform Your Grant Management</h2>
            <div className="accent-line"></div>
          </div>
          
          <div className={`animated-slider ${isAnimating ? 'animating' : ''}`}>
            <div className="slider-container">
              {renderSlideContent()}
            </div>
            
            {/* Slide Indicators */}
            <div className="slide-indicators">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentSlide(index);
                      setIsAnimating(false);
                    }, 500);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Static CTA */}
          <div className="static-cta">
            <div className="cta-text">
              Ready to transform your grant strategy?
            </div>
            <div className="cta-subtext">
              Join thousands of successful organizations
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="floating-elements">
          <div className="floating-element element-1">
            <i className="fas fa-star"></i>
          </div>
          <div className="floating-element element-2">
            <i className="fas fa-heart"></i>
          </div>
          <div className="floating-element element-3">
            <i className="fas fa-gem"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;