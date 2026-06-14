import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUserPlus,
  FiSearch,
  FiAward,
  FiZap,
  FiShoppingBag,
  FiShield,
  FiClock,
  FiArrowRight,
} from 'react-icons/fi';
import './Welcome.css';

const slides = [
  {
    image: '1736272541504-horse.jpg',
    // bgClass: 'slide-bg-1',
    title: 'Rare Antique Pottery',
    description: 'Centuries-old craftsmanship, preserved for the modern collector.',
  },
  {
    image: 'old_art.jpg',
    // bgClass: 'slide-bg-2',
    title: 'Classic Fine Art',
    description: 'Masterpieces from forgotten eras, waiting to adorn your walls.',
  },
  {
    image: 'image.png',
    // bgClass: 'slide-bg-3',
    title: 'Precious Vintage Jewels',
    description: 'Timeless elegance captured in every gemstone and setting.',
  },
];

const steps = [
  {
    icon: <FiUserPlus />,
    number: 'STEP 01',
    title: 'Register',
    description: 'Create your free account in seconds and join a community of passionate vintage collectors.',
  },
  {
    icon: <FiSearch />,
    number: 'STEP 02',
    title: 'Browse or List',
    description: 'Explore curated collections of rare items or list your own vintage treasures for auction.',
  },
  {
    icon: <FiAward />,
    number: 'STEP 03',
    title: 'Bid & Win',
    description: 'Place bids on items you love. Win auctions and add unique pieces to your collection.',
  },
];

const services = [
  {
    icon: <FiZap />,
    title: 'Live Auctions',
    description: 'Experience the thrill of real-time bidding on rare vintage items with live countdown timers.',
  },
  {
    icon: <FiShoppingBag />,
    title: 'Sell Items',
    description: 'List your vintage treasures and reach thousands of passionate collectors worldwide.',
  },
  {
    icon: <FiClock />,
    title: 'Preserve History',
    description: 'Every item has a story. We help preserve the history and provenance of each piece.',
  },
  {
    icon: <FiShield />,
    title: 'Secure Transactions',
    description: 'Bank-grade security ensures your bids, payments, and personal data stay protected.',
  },
];

export default function Welcome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const revealRefs = useRef([]);

  // Auto-rotate slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addRevealRef = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="welcome-page">
      {/* ===== HERO ===== */}
      <section className="welcome-hero">
        <div className="hero-particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="hero-particle" />
          ))}
        </div>

        <div className="hero-content">
          <span className="hero-badge">Est. 2024 — Premium Vintage Auctions</span>
          <h1 className="hero-title">Discover Timeless Treasures</h1>
          <p className="hero-subtitle">
            Step into a world of rare antiques and vintage collectibles. Bid on
            extraordinary pieces of history from the comfort of your home.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="hero-btn hero-btn-primary">
              Start Bidding <FiArrowRight />
            </Link>
            <Link to="/login" className="hero-btn hero-btn-secondary">
              Sign In
            </Link>
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <span />
        </div>
      </section>

      {/* ===== SLIDESHOW ===== */}
      <section
        className="welcome-slideshow reveal-section"
        ref={addRevealRef}
      >
        <div className="slideshow-container">
          <div className="slideshow-header">
            <h2>Featured Collections</h2>
            <p>Curated selections of the finest vintage items</p>
          </div>

          <div className="slideshow-viewport">
            {slides.map((slide, index) => (
              // <div
              //   key={index}
              //   className={`slideshow-slide ${slide.bgClass} ${
              //     index === currentSlide ? 'active' : ''
              //   }`}
              // >
              <div
  key={index}
  className={`slideshow-slide ${
    index === currentSlide ? 'active' : ''
  }`}
  style={{
    backgroundImage: `url(${slide.image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
                <div className="slide-content">
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="slideshow-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`slideshow-dot ${
                  index === currentSlide ? 'active' : ''
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        className="welcome-how-it-works reveal-section"
        ref={addRevealRef}
      >
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Three simple steps to start your vintage collecting journey</p>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
          <div className="step-connector step-connector-1" />
          <div className="step-connector step-connector-2" />
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="welcome-services reveal-section" ref={addRevealRef}>
        <div className="section-header">
          <h2>Our Services</h2>
          <p>Everything you need for the ultimate auction experience</p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="welcome-cta reveal-section" ref={addRevealRef}>
        <div className="cta-container">
          <h2>Ready to Begin?</h2>
          <p>
            Join thousands of collectors and sellers on BidHeritage. Your next
            treasure is just a bid away.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="hero-btn hero-btn-primary">
              Create Free Account <FiArrowRight />
            </Link>
            <Link to="/login" className="hero-btn hero-btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
