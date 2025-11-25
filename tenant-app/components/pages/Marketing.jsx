'use client';


import React, { useEffect, useState, useRef } from 'react';
import { QrCode } from 'lucide-react';
import LazyImage from '@/components/LazyImage';
import api from '@/lib/api';

const Marketing = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [counters, setCounters] = useState({
    apps: 0,
    uptime: 0,
    brand: 0,
    updates: 0
  });

  const navInnerRef = useRef(null);
  const aboutSliderRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/public/restaurants');
        setRestaurants(res.data?.data || []);
      } catch (e) {
        setError('Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const [search, setSearch] = useState('');
  const filtered = restaurants.filter(r => {
    const q = search.toLowerCase();
    return !q || (String(r.name||'').toLowerCase().includes(q) || String(r.slug||'').toLowerCase().includes(q));
  });

  const hostname = window.location.hostname.toLowerCase();
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;
  const baseDomain = hostname.replace(/^admin\./, '');

  const subdomainHref = (slug) => {
    const isLocalEnv = hostname === 'localhost' || hostname.endsWith('.localhost');

    if (isLocalEnv) {
      return `${protocol}//${slug}.localhost${port}`;
    }

    return `${protocol}//${slug}.${baseDomain}`;
  };

  // Navbar scroll effect
   useEffect(() => {
     const handleScroll = () => {
       if (navInnerRef.current) {
         const heroElement = document.querySelector('#home');
         const heroHeight = heroElement ? heroElement.offsetHeight : window.innerHeight;
         const scrolled = window.scrollY > heroHeight;
         navInnerRef.current.classList.toggle('scrolled', scrolled);
       }
     };

     window.addEventListener('scroll', handleScroll);
     return () => window.removeEventListener('scroll', handleScroll);
   }, []);

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Smooth scroll
  const smoothScroll = (targetId) => {
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    setMobileMenuOpen(false);
  };

  // About slider images
  const aboutImages = [
    { src: '/Images/bck.jpg', alt: 'Bemi Creatives workspace' },
    { src: '/Images/IMG_8647.JPEG', alt: 'Bemi Creatives team' },
  ];

  // Slider functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % aboutImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [aboutImages.length]);

  // Form handling
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://formspree.io/f/xovpgdjv', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        setFormSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setFormSubmitted(false), 5000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error sending your message. Please try again.');
    }
  };

  // Scroll reveal effect
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');

          // Count-up animation for counters
          const duration = 1500;
          const startTime = performance.now();
          const animate = () => {
            const now = performance.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setCounters({
              apps: 0,
              uptime: Math.round(100 * progress),
              brand: Math.round(100 * progress),
              updates: Math.round(30 * progress)
            });
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <style jsx>{`
        /* Configure Tailwind to use Inter font */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

        :root {
          --primary-color: #00A884;
          --primary-hover: #008f73;
          --text-color: #1f2937;
          --bg-light: #f9fafb;
        }

        body {
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        .hero-wrapper {
          background-image: url('/Images/Gemini_Generated_Image_oxejnioxejnioxej.png');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          background-color: var(--bg-light);
          position: relative;
          color: var(--text-color);
          min-height: 100vh;
        }

        .hero-wrapper::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1;
        }

        .hero {
          position: relative;
          z-index: 1;
        }

        .saas-shadow {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.03);
        }

        nav {
          transition: background-color 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease;
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          padding: 1.5rem 1rem;
          border-radius: 9999px;
          transition: all 300ms ease;
          color: #fff;
        }
        .nav-inner .logo-img {
          width: 7rem;
          transition: width 300ms ease, transform 300ms ease;
        }
        .nav-links .nav-link {
          color: #fff;
          text-decoration: none;
        }
        .nav-links .underline {
          position: absolute;
          left: 0;
          bottom: -6px;
          height: 3px;
          width: 0;
          background: #fff;
          transition: width 300ms ease;
        }
        .nav-links .nav-link:hover .underline {
          width: 100%;
        }
        .contact-btn {
          background-color: var(--primary-color);
          color: #fff;
          box-shadow: 0 4px 15px rgba(0,168,132,0.4);
        }

        .nav-inner.scrolled {
          padding: 0.45rem 1rem;
          background: rgba(255,255,255,0.32);
          backdrop-filter: blur(8px) saturate(120%);
          -webkit-backdrop-filter: blur(8px) saturate(120%);
          box-shadow: 0 8px 30px rgba(0,0,0,0.08);
          border-radius: 9999px;
          transform: translateY(-2px);
          color: var(--text-color);
        }
        .nav-inner.scrolled .logo-img {
          width: 4.5rem;
        }
        .nav-inner.scrolled .nav-links .nav-link {
          color: var(--text-color);
        }
        .nav-inner.scrolled .underline {
          background: var(--text-color);
        }
        .nav-inner.scrolled .contact-btn {
          background-color: white;
          color: var(--primary-color);
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.06);
        }

        #mobile-menu-btn {
          color: var(--primary-color) !important;
        }
        #mobile-menu-btn i {
          color: var(--primary-color) !important;
        }

        #navbar nav {
          display: block;
        }
        .nav-inner {
          max-width: 1250px;
          margin: 8px auto;
        }

        .nav-inner.scrolled {
          max-width: 980px;
        }

        .mobile-connector {
          position: absolute;
          left: 1.25rem;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e5e7eb;
          display: none !important;
        }

        .step-card[data-step="2"] {
          background: var(--primary-color);
          color: #fff;
          border-color: transparent;
        }
        .step-card[data-step="2"] h4,
        .step-card[data-step="2"] p,
        .step-card[data-step="2"] .text-4xl {
          color: #fff !important;
        }
        .step-card[data-step="2"] .p-3 {
          background-color: rgba(255,255,255,0.08) !important;
        }
        .step-card[data-step="2"] i {
          color: #fff !important;
        }

        @media (max-width: 1024px) {
          .nav-inner {
            padding: 1rem 1rem;
          }
          .nav-inner.scrolled {
            padding: 0.5rem 1rem;
          }
        }

        .hero-visual-elements-animation {
          animation: float-qr 5s ease-in-out infinite;
        }

        @keyframes float-qr {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
          50% { transform: translateY(-10px) rotate(2deg); opacity: 1; }
          100% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
        }

        @keyframes float-icon {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(5px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }

        .floating-qr {
          animation: float-qr 5s ease-in-out infinite;
        }
        .floating-icon {
          animation: float-icon 6s ease-in-out infinite;
        }

        @keyframes jump {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }

        @keyframes spin {
          0%, 80% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        .spin-animation {
          animation: jump 1s ease-in-out infinite, spin 5s linear infinite;
        }

        @media (max-width: 768px) {
          .spin-animation {
            animation: jump 1s ease-in-out infinite, spin 5s linear infinite;
            max-width: 200px;
          }
        }

        .wave {
          position: absolute;
          left: 0;
          width: 100%;
          height: 120px;
          z-index: 10;
          pointer-events: none;
        }
        .wave svg {
          display: block;
          width: 100%;
          height: 100%;
        }
        .wave-top {
          top: 0;
          transform: translateY(-1px);
        }
        .wave-bottom {
          bottom: 0;
          transform: translateY(1px) rotate(180deg);
        }
        @media (max-width: 768px) {
          .wave {
            height: 80px;
          }
        }

        .reveal {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 2000ms ease, transform 2000ms ease;
        }
        .reveal-left {
          transform: translateX(-40px);
        }
        .reveal-right {
          transform: translateX(40px);
        }
        .reveal.in-view {
          opacity: 1;
          transform: translateX(0) translateY(0);
        }
        @media (max-width: 768px) {
          .reveal-left, .reveal-right {
            transform: translateY(20px);
          }
        }

        @keyframes heartbeat {
          0% { transform: scale(1.05); }
          10% { transform: scale(1.09); }
          20% { transform: scale(1.05); }
          30% { transform: scale(1.09); }
          40% { transform: scale(1.05); }
          100% { transform: scale(1.05); }
        }
        .heartbeat {
          animation: heartbeat 2s ease-in-out infinite;
          will-change: transform;
        }

        .slider-img {
          transition: all 0.7s ease-in-out;
        }

        .slider-dot {
          transition: background-color 0.3s ease;
        }
      `}</style>

      <header id="navbar" className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
        <nav className="w-full pointer-events-auto">
          <div ref={navInnerRef} className="nav-inner max-w-7xl mx-auto px-4 lg:px-8 py-6 flex items-center justify-between transition-all duration-300">
            <div className="logo flex items-center space-x-2">
              <img src="/Images/IMG_8135.PNG" className="logo-img" alt="Bemi Creatives Logo" />
            </div>

            <div className="nav-links hidden lg:flex space-x-8 text-sm font-medium">
              <a href="#home" className="nav-link relative group" onClick={(e) => { e.preventDefault(); smoothScroll('#home'); }}>
                Home<span className="underline"></span>
              </a>
              <a href="#about-us" className="nav-link relative group" onClick={(e) => { e.preventDefault(); smoothScroll('#about-us'); }}>
                About Us<span className="underline"></span>
              </a>
              <a href="#what-we-do" className="nav-link relative group" onClick={(e) => { e.preventDefault(); smoothScroll('#what-we-do'); }}>
                Clients<span className="underline"></span>
              </a>
              <a href="#pricing" className="nav-link relative group" onClick={(e) => { e.preventDefault(); smoothScroll('#pricing'); }}>
                Pricing<span className="underline"></span>
              </a>
            </div>

            <a href="#contact" className="contact-btn hidden lg:inline-flex items-center justify-center px-5 py-2 text-sm font-semibold rounded-xl transition duration-300 saas-shadow" onClick={(e) => { e.preventDefault(); smoothScroll('#contact'); }}>
              Contact
            </a>

            <button id="mobile-menu-btn" className="lg:hidden p-2 text-white hover:text-white transition duration-150" onClick={toggleMobileMenu}>
              <svg data-lucide={mobileMenuOpen ? "x" : "menu"} className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          <div id="mobile-menu" className={`${mobileMenuOpen ? 'fixed inset-0 z-[10000] bg-black bg-opacity-50 backdrop-blur-sm flex flex-col' : 'hidden'} lg:hidden transition-all duration-300`}>
            <div className={`bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 h-screen transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'}}>
              <button onClick={toggleMobileMenu} className="absolute top-4 right-4 p-2 text-gray-800 hover:text-gray-600 transition duration-150">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex flex-col space-y-6 text-center text-lg font-semibold text-gray-800 pt-12">
                <a href="#home" className="py-3 px-6 rounded-xl hover:bg-gradient-to-r hover:from-[#00A884] hover:to-[#008f73] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg" onClick={(e) => { e.preventDefault(); smoothScroll('#home'); }}>Home</a>
                <a href="#about-us" className="py-3 px-6 rounded-xl hover:bg-gradient-to-r hover:from-[#00A884] hover:to-[#008f73] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg" onClick={(e) => { e.preventDefault(); smoothScroll('#about-us'); }}>About Us</a>
                <a href="#what-we-do" className="py-3 px-6 rounded-xl hover:bg-gradient-to-r hover:from-[#00A884] hover:to-[#008f73] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg" onClick={(e) => { e.preventDefault(); smoothScroll('#what-we-do'); }}>Clients</a>
                <a href="#pricing" className="py-3 px-6 rounded-xl hover:bg-gradient-to-r hover:from-[#00A884] hover:to-[#008f73] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg" onClick={(e) => { e.preventDefault(); smoothScroll('#pricing'); }}>Pricing</a>
                <a href="#contact" className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#00A884] to-[#008f73] text-white shadow-lg hover:shadow-xl transition-all duration-300" onClick={(e) => { e.preventDefault(); smoothScroll('#contact'); }}>Contact</a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <div className="hero-wrapper" id="home">
        <section className="hero min-h-screen flex items-center max-w-7xl mx-auto px-4 lg:px-8 pt-32 pb-20 lg:pt-40">
          <div className="grid lg:grid-cols-12 gap-12 items-center w-full">
            <div className="lg:col-span-6 xl:col-span-7 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6 text-white">
                Turn Your Restaurant Menu into a QR Code in Seconds.
              </h1>
              <p className="text-lg sm:text-xl text-white mb-10 max-w-xl lg:max-w-none mx-auto lg:mx-0">
                Let customers browse your menu digitally — fast, contactless, and eco-friendly.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
                <a href="#contact" className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white rounded-xl transition duration-300 saas-shadow hover:scale-[1.02]" style={{backgroundColor: 'var(--primary-color)', boxShadow: '0 5px 20px rgba(0, 168, 132, 0.5)'}} onClick={(e) => { e.preventDefault(); smoothScroll('#contact'); }}>
                  contact us
                </a>
                <a href="#" className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-xl border-2 transition duration-300 hover:bg-gray-100 hover:scale-[1.02]" style={{color: 'var(--primary-color)', borderColor: 'var(--primary-color)'}}>
                  See Demo
                </a>
              </div>
            </div>
            <div className="lg:col-span-6 xl:col-span-5 relative flex justify-center lg:justify-end mt-12 lg:mt-0">
              <img src="/Images/my_qr_code.png" alt="Hero Image" className="w-full max-w-sm rounded-2xl saas-shadow spin-animation" />
            </div>
          </div>
        </section>
      </div>

      <section id="what-we-do" className="py-20 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="mb-16 reveal">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-24">
              <div className="lg:w-2/5">
                <div className="flex items-center mb-3">
                  <svg className="w-6 h-6 mr-2" style={{color: 'var(--primary-color)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h2 className="text-xl font-semibold uppercase tracking-widest" style={{color: 'var(--primary-color)'}}>
                    What We Do
                  </h2>
                </div>
                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{color:'var(--text-color)', background: 'linear-gradient(45deg, var(--primary-color), var(--text-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  Transforming Restaurant Menus
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  We deliver tailored QR Code menus that revolutionize dining, providing instant access via QR codes for a seamless, interactive, and eco-friendly experience.
                </p>
                <a href="#about-us" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white rounded-xl transition duration-300 saas-shadow hover:scale-[1.02]" style={{backgroundColor: 'var(--primary-color)', boxShadow: '0 5px 20px rgba(0, 168, 132, 0.4)'}} onClick={(e) => { e.preventDefault(); smoothScroll('#about-us'); }}>
                  Learn More About Us
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              <div className="lg:w-3/5 flex flex-col items-center lg:items-start">
                <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-4" style={{color:'var(--text-color)'}}>
                  Trusted by Restaurants
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 mb-8 text-center lg:text-left">
                  See some of our satisfied clients who have transformed their menus with our QR solutions.
                </p>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-6 w-full max-w-7xl mx-auto">
                  <img src="/Images/IMG_8095.JPG" alt="Client 1" className="w-full h-16 object-cover rounded-full" />
                  <img src="/Images/IMG_8410.PNG" alt="Client 2" className="w-full h-16 object-cover rounded-full" />
                  <img src="/Images/IMG_8679.PNG" alt="Client 3" className="w-full h-16 object-cover rounded-full" />
                  <img src="/Images/IMG_8694.JPEG" alt="Client 4" className="w-full h-16 object-cover rounded-full" />
                  <img src="/Images/IMG_8699.png" alt="Client 5" className="w-full h-16 object-cover rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about-us" className="py-20 lg:pt-20 lg:pb-2 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="mb-16 reveal">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
              <div className="lg:w-2/5">
                <h2 className="text-xl font-semibold mb-3 uppercase tracking-widest" style={{color: 'var(--primary-color)'}}>
                  About Us
                </h2>
                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{color:'var(--text-color)'}}>
                  Who we are
                </h3>
              </div>

              <div className="lg:w-3/5">
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  We are Bemi Creatives, dedicated to transforming the way restaurants present their offerings through customized QR Code Menu solutions. Our team of experts leverages modern technologies to create seamless, interactive digital menus that are instantly accessible via QR codes.
                </p>
                <a href="#pricing" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white rounded-xl transition duration-300 saas-shadow hover:scale-[1.02]" style={{backgroundColor: 'var(--primary-color)', boxShadow: '0 5px 20px rgba(0, 168, 132, 0.4)'}} onClick={(e) => { e.preventDefault(); smoothScroll('#pricing'); }}>
                  See Our Process
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div ref={aboutSliderRef} className="mb-16 reveal">
            <div className="relative w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
              <div className="relative w-full flex items-center justify-center gap-6 min-h-[360px] lg:min-h-[440px]">
                {aboutImages.map((img, i) => (
                  <img
                    key={i}
                    src={img.src}
                    alt={img.alt}
                    data-index={i}
                    className="transition-all duration-700 ease-in-out rounded-2xl shadow-lg slider-img"
                    style={{
                      width: i === currentSlide ? '65%' : '35%',
                      opacity: i === currentSlide ? 1 : 0.5,
                      transform: `scale(${i === currentSlide ? 1 : 0.9})`,
                      zIndex: i === currentSlide ? 2 : 1,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-center mt-6 gap-2">
                {aboutImages.map((_, i) => (
                  <button
                    key={i}
                    className={`w-3 h-3 rounded-full ${i === currentSlide ? 'bg-[#00A884]' : 'bg-gray-300'} slider-dot`}
                    data-index={i}
                    onClick={() => setCurrentSlide(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why-choose-us" className="py-20 lg:pt-16 lg:pb-20 bg-gray-50 text-center">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-gray-900">
              Why Choose Us
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
              We focus on speed, simplicity, and support so your restaurant can thrive.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-10 rounded-2xl bg-white border border-gray-100 shadow-md transition duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center justify-between mb-8">
                <span className="text-4xl font-extrabold" style={{color: '#00a884'}}>01</span>
                <div className="w-8 h-8 p-1.5 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M4 17l6-6 6 6M4 7h16" />
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">Fast & Reliable</h4>
              <p className="text-gray-600">
                Lightning-fast setup and dependable uptime so your digital menu is always ready.
              </p>
            </div>

            <div className="p-10 rounded-2xl text-white shadow-xl transition duration-300 hover:shadow-2xl hover:-translate-y-1" style={{backgroundColor: '#00a884'}}>
              <div className="flex items-center justify-between mb-8">
                <span className="text-4xl font-extrabold text-white">02</span>
                <div className="w-8 h-8 p-1.5 rounded-full border border-white border-opacity-30 text-white flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-white">Easy User Experience</h4>
              <p className="text-white text-opacity-90">
                Clean, intuitive, and mobile-first — customers browse faster with zero friction.
              </p>
            </div>

            <div className="p-10 rounded-2xl bg-white border border-gray-100 shadow-md transition duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center justify-between mb-8">
                <span className="text-4xl font-extrabold" style={{color: '#00a884'}}>03</span>
                <div className="w-8 h-8 p-1.5 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12" y2="18" />
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-bold mb-3 text-gray-900">24/7 Customer Support</h4>
              <p className="text-gray-600">
                Our dedicated support team is available around the clock to assist you with any questions or issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="product-preview" className="relative bg-[#00A884] pt-36 pb-32 lg:pt-44 lg:pb-44">
        <div className="wave wave-top">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,80 C240,20 480,20 720,80 C960,140 1200,140 1440,80 L1440,0 L0,0 Z" fill="#ffffff"/>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 relative z-0">
          <div className="text-center mb-16">
            <h3 className="text-xs font-semibold mb-3 text-white uppercase tracking-widest">Product Showcase</h3>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 text-white">See Bemi Creatives in Action</h2>
            <p className="text-xl text-white max-w-2xl mx-auto">A simple, digital menu experience for you and your customers.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative flex justify-center lg:justify-start pt-12 lg:pt-0 reveal reveal-left">
              <div className="relative w-full max-w-md p-4 bg-gray-900 rounded-[2.5rem] shadow-lg border-4 border-gray-700 transform hover:scale-[1.02] transition duration-500">
                <div className="h-[32rem] bg-white rounded-3xl overflow-hidden shadow-inner">
                  <img src="/Images/demo.jpg" alt="Phone screen preview" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="absolute top-10 right-0 p-3 bg-white rounded-xl shadow-lg z-10 transform translate-x-1/4 -rotate-3">
                <QrCode className="w-16 h-16 text-[#00A884]" />
                <p className="text-sm font-medium text-center mt-1 text-gray-700">Scan Demo</p>
              </div>
            </div>

            <div className="lg:col-span-6 text-center lg:text-left pt-12 lg:pt-0 reveal reveal-right">
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-10 text-white">Effortless management and a seamless user experience.</h3>

              <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                <div>
                  <p className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white">{counters.apps}</p>
                  <p className="text-lg font-semibold mt-1 text-white">Required Apps</p>
                  <p className="text-sm text-white/90">Customers access your menu instantly through their camera.</p>
                </div>

                <div>
                  <p className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white">{counters.uptime}<span className="suffix">%</span></p>
                  <p className="text-lg font-semibold mt-1 text-white">Guaranteed Uptime</p>
                  <p className="text-sm text-white/90">Cloud-hosted reliability means your menu is always available.</p>
                </div>

                <div>
                  <p className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white">{counters.brand}<span className="suffix">%</span></p>
                  <p className="text-lg font-semibold mt-1 text-white">Brand Match</p>
                  <p className="text-sm text-white/90">Colors, fonts, and logos customized to reflect your restaurant identity.</p>
                </div>

                <div>
                  <p className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white">{counters.updates}</p>
                  <p className="text-lg font-semibold mt-1 text-white">Second Updates</p>
                  <p className="text-sm text-white/90">Push changes live faster than any print job.</p>
                </div>
              </div>

              <div className="mt-12">
                <a href="#" className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white rounded-xl transition duration-300 shadow-lg hover:scale-[1.02] bg-white/10 border border-white/10 backdrop-blur-sm">
                  See Sample Menu
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="wave wave-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,80 C240,20 480,20 720,80 C960,140 1200,140 1440,80 L1440,0 L0,0 Z" fill="#ffffff"/>
          </svg>
        </div>
      </section>

      <section id="pricing" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center mt-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4" style={{color:'var(--text-color)'}}>
            One-Time Setup Packages
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12">
            Choose a one-time package to get your digital menu fully set up and running.
          </p>

          <div className="grid lg:grid-cols-4 gap-6 items-stretch">
            <div className="step-card p-6 bg-white saas-shadow rounded-3xl border-2 border-gray-100 text-left flex flex-col justify-between" data-step="1">
              <div>
                <h4 className="text-xl font-bold mb-2" style={{color:'var(--text-color)'}}>1. Starter Menu Package</h4>
                <p className="text-sm text-gray-500 mb-6">Foundational setup for new digital menus.</p>

                <div className="text-4xl font-extrabold mb-1" style={{color:'#007bff'}}>15,000<span className="text-xl font-normal text-gray-600"> Birr</span></div>
                <p className="text-sm text-gray-400 mb-8">One-time payment</p>

                <h5 className="font-bold uppercase text-xs text-gray-700 mb-4">Features Included:</h5>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: '#007bff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Easy-to-use Admin Dashboard</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: '#007bff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Real-time menu updates</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: '#007bff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Multi-category menu support</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: '#007bff'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">5 Free Acrylic QR Menu Holders(Extra holders 700 Birr each)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="step-card p-6 saas-shadow rounded-3xl text-left flex flex-col justify-between transform scale-[1.05] border-4 heartbeat" style={{backgroundColor: 'var(--primary-color)', borderColor: '#008f73', color: 'white'}} data-step="2">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xl font-bold">2. Business Menu Package</h4>
                </div>
                <p className="text-sm opacity-80 mb-6">Designed for businesses focused on online presence.</p>

                <div className="text-4xl font-extrabold mb-1">17,000<span className="text-xl font-normal opacity-80"> Birr</span></div>
                <p className="text-sm opacity-60 mb-8">One-time payment</p>

                <h5 className="font-bold uppercase text-xs mb-4">Features Included:</h5>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Google Business Profile included</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Mobile-friendly, responsive design</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Multi-category menu support</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>5 Free Acrylic QR Menu Holders(Extra holders 700 Birr each)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="step-card p-6 bg-white saas-shadow rounded-3xl border-2 border-gray-100 text-left flex flex-col justify-between" data-step="new-3">
              <div>
                <h4 className="text-xl font-bold mb-2" style={{color:'var(--text-color)'}}>3. Premium Menu Experience</h4>
                <p className="text-sm text-gray-500 mb-6">Enhanced experience with loyalty features and website integration.</p>

                <div className="text-4xl font-extrabold mb-1" style={{color:'#ff9900'}}>25,000<span className="text-xl font-normal text-gray-600"> Birr</span></div>
                <p className="text-sm text-gray-700 mb-8 font-semibold">
                  One-time payment
                </p>

                <h5 className="font-bold uppercase text-xs text-gray-700 mb-4">Features Included:</h5>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: '#ff9900'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Loyalty/Discount Integration(Special offers via QR)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: '#ff9900'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Website & QR menu fully integrated</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: '#ff9900'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Easy to use admin dashboard</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: '#ff9900'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">10 Free Acrylic QR Menu Holders(Extra holders 700 Birr each)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="step-card p-6 bg-white saas-shadow rounded-3xl border-2 border-gray-100 text-left flex flex-col justify-between" data-step="new-4">
              <div>
                <h4 className="text-xl font-bold mb-2" style={{color:'var(--text-color)'}}>4. Ultimate Brand + Website Package</h4>
                <p className="text-sm text-gray-500 mb-6">Complete digital presence with long-term maintenance.</p>

                <div className="text-4xl font-extrabold mb-1" style={{color:'#5a67d8'}}>33,000<span className="text-xl font-normal text-gray-600"> Birr</span></div>
                <p className="text-sm text-gray-700 mb-8 font-semibold">
                  One-time payment
                </p>

                <h5 className="font-bold uppercase text-xs text-gray-700 mb-4">Features Included:</h5>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: '#5a67d8'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Everything in Premium</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: '#5a67d8'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">Professional Business Website (About, Services, Gallery, Contact, Map)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: '#5a67d8'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">2 Year free maintenance & updates</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: '#5a67d8'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">15 Free Acrylic QR Menu Holders(Extra holders 700 Birr each)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6" style={{color: 'var(--text-color)'}}>
                Get in Touch
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Ready to transform your restaurant's menu? Contact us today to discuss your QR code menu needs. Our team is here to help you get started.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" style={{color: 'var(--primary-color)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">bemicreatives@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" style={{color: 'var(--primary-color)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">0902397727 / 0966829514</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6" style={{color: 'var(--primary-color)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">Addis Ababa, Ethiopia</span>
                </div>
              </div>
            </div>
            <div className="reveal">
              <form onSubmit={handleFormSubmit} className="bg-white p-8 rounded-2xl saas-shadow">
                <div className="mb-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A884] focus:border-transparent transition duration-300"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A884] focus:border-transparent transition duration-300"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A884] focus:border-transparent transition duration-300 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white py-3 px-6 rounded-xl font-semibold transition duration-300 saas-shadow hover:scale-[1.02]"
                  style={{backgroundColor: 'var(--primary-color)', boxShadow: '0 5px 20px rgba(0, 168, 132, 0.5)'}}
                >
                  Send Message
                </button>
              </form>

              {formSubmitted && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">Thank You!</h3>
                      <p className="text-green-700">Your message has been sent successfully. We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer id="footer" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center lg:text-start">
            <div>
              <img src="/Images/IMG_8135.PNG" alt="Bemi Creatives Logo" className="w-12 h-8 mb-4 mx-auto lg:mx-0" />
              <p className="text-gray-400 mb-4">
                Transforming restaurant menus with innovative QR code solutions. Fast, reliable, and eco-friendly.
              </p>
              <div className="flex space-x-4 justify-center lg:justify-start">
                <a href="https://www.tiktok.com/@bemi.creatives" className="text-gray-400 hover:text-white transition duration-300" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com/bemi_creatives/?igsh=MTBwd2o4dG9tb3VsYw%3D%3D#" className="text-gray-400 hover:text-white transition duration-300" target="_blank" rel="noopener noreferrer">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="m16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition duration-300" target="_blank" rel="noopener noreferrer">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div className="lg:ms-16">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-white transition duration-300" onClick={(e) => { e.preventDefault(); smoothScroll('#home'); }}>Home</a></li>
                <li><a href="#about-us" className="text-gray-400 hover:text-white transition duration-300" onClick={(e) => { e.preventDefault(); smoothScroll('#about-us'); }}>About Us</a></li>
                <li><a href="#what-we-do" className="text-gray-400 hover:text-white transition duration-300" onClick={(e) => { e.preventDefault(); smoothScroll('#what-we-do'); }}>Clients</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition duration-300" onClick={(e) => { e.preventDefault(); smoothScroll('#pricing'); }}>Pricing</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition duration-300" onClick={(e) => { e.preventDefault(); smoothScroll('#contact'); }}>Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>QR Code Menu Solutions</li>
                <li>Digital Menu Management</li>
                <li>24/7 Customer Support</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li>bemicreatives@gmail.com</li>
                <li>0902397727 / 0966829514</li>
                <li>Addis Ababa, Ethiopia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Bemi Creatives. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Marketing;
