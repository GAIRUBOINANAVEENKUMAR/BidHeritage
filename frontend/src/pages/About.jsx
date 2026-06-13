import { FiUserPlus, FiUpload, FiZap, FiAward, FiGithub, FiLinkedin, FiInstagram, FiHeart, FiStar, FiShield } from 'react-icons/fi';
import './About.css';

const About = () => {
  const steps = [
    { icon: <FiUserPlus />, title: 'Register', desc: 'Create your free account and join our community of vintage collectors and enthusiasts.' },
    { icon: <FiUpload />, title: 'List Item', desc: 'Upload your vintage treasures with detailed history, images, and set your starting price.' },
    { icon: <FiZap />, title: 'Live Auction', desc: 'Watch bids come in real-time. Our platform ensures fair and transparent bidding.' },
    { icon: <FiAward />, title: 'Win & Collect', desc: 'Win the auction and add a unique piece to your collection. Secure payment guaranteed.' },
  ];

  const stats = [
    { value: '12,500+', label: 'Items Auctioned' },
    { value: '8,200+', label: 'Happy Collectors' },
    { value: '340+', label: 'Live Auctions' },
  ];

  return (
    <div className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-ornament top-left" />
        <div className="about-hero-ornament top-right" />
        <span className="about-hero-tag">EST. 2024</span>
        <h1 className="about-hero-title">About <span>BidHeritage</span></h1>
        <p className="about-hero-subtitle">
          Where vintage meets technology — a premium auction platform dedicated to preserving history, one bid at a time.
        </p>
        <div className="about-hero-ornament bottom-left" />
        <div className="about-hero-ornament bottom-right" />
      </section>

      {/* Mission */}
      <section className="about-mission">
        <div className="about-mission-card">
          <div className="about-mission-icon"><FiHeart /></div>
          <h2>Our Mission</h2>
          <p>
            BidHeritage was born from a passion for preserving the beauty and stories behind vintage and antique treasures. 
            We believe every artifact carries a legacy — a piece of history waiting to be cherished by its next guardian.
          </p>
          <p>
            Our platform bridges the gap between sellers who wish to find worthy homes for their cherished items 
            and collectors who seek pieces with soul and authenticity. Through transparent, real-time auctions, 
            we create a marketplace built on trust, heritage, and the thrill of discovery.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="about-steps-section">
        <h2 className="about-section-title">How It Works</h2>
        <p className="about-section-subtitle">Four simple steps to start your journey</p>
        <div className="about-steps-grid">
          {steps.map((step, i) => (
            <div key={i} className="about-step-card">
              <div className="about-step-number">{String(i + 1).padStart(2, '0')}</div>
              <div className="about-step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              {i < steps.length - 1 && <div className="about-step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats-section">
        {stats.map((s, i) => (
          <div key={i} className="about-stat">
            <span className="about-stat-value">{s.value}</span>
            <span className="about-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Values */}
      <section className="about-values-section">
        <h2 className="about-section-title">What We Stand For</h2>
        <div className="about-values-grid">
          {[
            { icon: <FiShield />, title: 'Trust & Security', desc: 'Every transaction is secure. We verify sellers and ensure authentic listings.' },
            { icon: <FiStar />, title: 'Quality First', desc: 'We curate a marketplace where only genuine vintage pieces find their home.' },
            { icon: <FiHeart />, title: 'Passion for Heritage', desc: 'Every item has a story. We honor that story through our platform.' },
          ].map((v, i) => (
            <div key={i} className="about-value-card">
              <div className="about-value-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Developer */}
      <section className="about-dev-section">
        <h2 className="about-section-title">The Mind Behind BidHeritage</h2>
        <div className="about-dev-card">
          <div className="about-dev-avatar">
            <img src="https://ui-avatars.com/api/?name=G+Naveen+Kumar&background=d4a853&color=0a0a0f&size=150&bold=true&font-size=0.35" alt="G. Naveen Kumar" />
          </div>
          <div className="about-dev-info">
            <h3>G. Naveen Kumar</h3>
            <span className="about-dev-role">Founder & Developer</span>
            <p>Passionate full-stack developer with a love for vintage aesthetics and modern technology. Built BidHeritage to create a premium auction experience that honors the legacy of every collectible.</p>
            <div className="about-dev-socials">
              <a href="https://github.com/" target="_blank" rel="noreferrer" className="about-social-link">
                <FiGithub /> GitHub
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noreferrer" className="about-social-link">
                <FiLinkedin /> LinkedIn
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="about-social-link">
                <FiInstagram /> Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
