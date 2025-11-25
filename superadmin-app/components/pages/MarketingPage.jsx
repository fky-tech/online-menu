'use client';

import React, { useEffect, useState, useRef } from 'react';
import { QrCode } from 'lucide-react';
import LazyImage from '../LazyImage';
import api from '@/lib/api';

const MarketingPage = () => {
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
        return !q || (String(r.name || '').toLowerCase().includes(q) || String(r.slug || '').toLowerCase().includes(q));
    });

    const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
    const port = typeof window !== 'undefined' && window.location.port ? `:${window.location.port}` : '';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
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
                        <div className={`bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 h-screen transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
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
                                <a href="#contact" className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white rounded-xl transition duration-300 saas-shadow hover:scale-[1.02]" style={{ backgroundColor: 'var(--primary-color)', boxShadow: '0 5px 20px rgba(0, 168, 132, 0.5)' }} onClick={(e) => { e.preventDefault(); smoothScroll('#contact'); }}>
                                    contact us
                                </a>
                                <a href="#" className="inline-flex items-center justify-center px-8 py-3 text-lg font-semibold rounded-xl border-2 transition duration-300 hover:bg-gray-100 hover:scale-[1.02]" style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
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
                                    <svg className="w-6 h-6 mr-2" style={{ color: 'var(--primary-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <h2 className="text-xl font-semibold uppercase tracking-widest" style={{ color: 'var(--primary-color)' }}>
                                        What We Do
                                    </h2>
                                </div>
                                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{ color: 'var(--text-color)', background: 'linear-gradient(45deg, var(--primary-color), var(--text-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Transforming Restaurant Menus
                                </h3>
                                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                    We deliver tailored QR Code menus that revolutionize dining, providing instant access via QR codes for a seamless, interactive, and eco-friendly experience.
                                </p>
                                <a href="#about-us" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white rounded-xl transition duration-300 saas-shadow hover:scale-[1.02]" style={{ backgroundColor: 'var(--primary-color)', boxShadow: '0 5px 20px rgba(0, 168, 132, 0.4)' }} onClick={(e) => { e.preventDefault(); smoothScroll('#about-us'); }}>
                                    Learn More About Us
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>

                            <div className="lg:w-3/5 flex flex-col items-center lg:items-start">
                                <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-4" style={{ color: 'var(--text-color)' }}>
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
                                <h2 className="text-xl font-semibold mb-3 uppercase tracking-widest" style={{ color: 'var(--primary-color)' }}>
                                    About Us
                                </h2>
                                <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{ color: 'var(--text-color)' }}>
                                    Who we are
                                </h3>
                            </div>

                            <div className="lg:w-3/5">
                                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                    We are Bemi Creatives, dedicated to transforming the way restaurants present their offerings through customized QR Code Menu solutions. Our team of experts leverages modern technologies to create seamless, interactive digital menus that are instantly accessible via QR codes.
                                </p>
                                <a href="#pricing" className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white rounded-xl transition duration-300 saas-shadow hover:scale-[1.02]" style={{ backgroundColor: 'var(--primary-color)', boxShadow: '0 5px 20px rgba(0, 168, 132, 0.4)' }} onClick={(e) => { e.preventDefault(); smoothScroll('#pricing'); }}>
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
                                <span className="text-4xl font-extrabold" style={{ color: '#00a884' }}>01</span>
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

                        <div className="p-10 rounded-2xl text-white shadow-xl transition duration-300 hover:shadow-2xl hover:-translate-y-1" style={{ backgroundColor: '#00a884' }}>
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
                                <span className="text-4xl font-extrabold" style={{ color: '#00a884' }}>03</span>
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
                        <path d="M0,80 C240,20 480,20 720,80 C960,140 1200,140 1440,80 L1440,0 L0,0 Z" fill="#ffffff" />
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
                        <path d="M0,80 C240,20 480,20 720,80 C960,140 1200,140 1440,80 L1440,0 L0,0 Z" fill="#ffffff" />
                    </svg>
                </div>
            </section>

            <section id="pricing" className="py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center mt-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4" style={{ color: 'var(--text-color)' }}>
                        One-Time Setup Packages
                    </h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12">
                        Choose a one-time package to get your digital menu fully set up and running.
                    </p>

                    <div className="grid lg:grid-cols-4 gap-6 items-stretch">
                        <div className="step-card p-6 bg-white saas-shadow rounded-3xl border-2 border-gray-100 text-left flex flex-col justify-between" data-step="1">
                            <div>
                                <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>1. Starter Menu Package</h4>
                                <p className="text-sm text-gray-500 mb-6">Foundational setup for new digital menus.</p>

                                <div className="text-4xl font-extrabold mb-1" style={{ color: '#007bff' }}>15,000<span className="text-xl font-normal text-gray-600"> Birr</span></div>
                                <p className="text-sm text-gray-400 mb-8">One-time payment</p>

                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-gray-600 text-sm">Digital Menu Creation</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-gray-600 text-sm">QR Code Generation</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-gray-600 text-sm">1 Year Hosting Included</span>
                                    </li>
                                </ul>
                            </div>
                            <a href="#contact" className="block w-full py-3 px-4 bg-gray-50 text-gray-800 font-semibold rounded-xl text-center hover:bg-gray-100 transition duration-300" onClick={(e) => { e.preventDefault(); smoothScroll('#contact'); }}>Get Started</a>
                        </div>

                        <div className="step-card p-6 bg-white saas-shadow rounded-3xl border-2 border-[#00A884] relative transform lg:-translate-y-4 text-left flex flex-col justify-between" data-step="2">
                            <div className="absolute top-0 right-0 bg-[#00A884] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">POPULAR</div>
                            <div>
                                <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>2. Premium Menu Experience</h4>
                                <p className="text-sm text-gray-500 mb-6">Enhanced features for better engagement.</p>

                                <div className="text-4xl font-extrabold mb-1" style={{ color: '#00A884' }}>25,000<span className="text-xl font-normal text-gray-600"> Birr</span></div>
                                <p className="text-sm text-gray-400 mb-8">One-time payment</p>

                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-[#00A884] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-gray-600 text-sm">Everything in Starter</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-[#00A884] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-gray-600 text-sm">Custom Branding (Logo/Colors)</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-[#00A884] mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-gray-600 text-sm">1 Year Hosting Included</span>
                                    </li>
                                </ul>
                            </div>
                            <a href="#contact" className="block w-full py-3 px-4 bg-[#00A884] text-white font-semibold rounded-xl text-center hover:bg-[#008f73] transition duration-300 shadow-lg" onClick={(e) => { e.preventDefault(); smoothScroll('#contact'); }}>Get Started</a>
                        </div>

                        <div className="step-card p-6 bg-white saas-shadow rounded-3xl border-2 border-gray-100 text-left flex flex-col justify-between" data-step="3">
                            <div>
                                <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--text-color)' }}>3. Ultimate Brand + Website</h4>
                                <p className="text-sm text-gray-500 mb-6">Full digital presence for your restaurant.</p>

                                <div className="text-4xl font-extrabold mb-1" style={{ color: '#6f42c1' }}>40,000<span className="text-xl font-normal text-gray-600"> Birr</span></div>
                                <p className="text-sm text-gray-400 mb-8">One-time payment</p>

                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-gray-600 text-sm">Everything in Premium</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-gray-600 text-sm">Full Website Creation</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-gray-600 text-sm">3 Years Hosting Included</span>
                                    </li>
                                </ul>
                            </div>
                            <a href="#contact" className="block w-full py-3 px-4 bg-gray-50 text-gray-800 font-semibold rounded-xl text-center hover:bg-gray-100 transition duration-300" onClick={(e) => { e.preventDefault(); smoothScroll('#contact'); }}>Get Started</a>
                        </div>

                        <div className="step-card p-6 bg-gray-900 text-white saas-shadow rounded-3xl border-2 border-gray-800 text-left flex flex-col justify-between" data-step="4">
                            <div>
                                <h4 className="text-xl font-bold mb-2 text-white">4. Custom Enterprise</h4>
                                <p className="text-sm text-gray-400 mb-6">Tailored solutions for franchises.</p>

                                <div className="text-4xl font-extrabold mb-1 text-white">Custom</div>
                                <p className="text-sm text-gray-500 mb-8">Contact for quote</p>

                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-gray-300 text-sm">Multi-Location Management</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-gray-300 text-sm">Advanced Analytics</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-gray-300 text-sm">Dedicated Account Manager</span>
                                    </li>
                                </ul>
                            </div>
                            <a href="#contact" className="block w-full py-3 px-4 bg-white text-gray-900 font-semibold rounded-xl text-center hover:bg-gray-100 transition duration-300" onClick={(e) => { e.preventDefault(); smoothScroll('#contact'); }}>Contact Sales</a>
                        </div>
                    </div>
                </div>
            </section>

            <section id="contact" className="py-20 lg:py-32 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 lg:px-8">
                    <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden">
                        <div className="grid lg:grid-cols-2">
                            <div className="p-10 lg:p-12 bg-[#00A884] text-white">
                                <h3 className="text-3xl font-bold mb-6">Get in Touch</h3>
                                <p className="text-white/90 mb-8 leading-relaxed">
                                    Ready to transform your menu? Have questions about our packages? Fill out the form and we'll get back to you shortly.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                        </div>
                                        <span>+251 911 22 33 44</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <span>contact@bemicreatives.com</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        </div>
                                        <span>Addis Ababa, Ethiopia</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 lg:p-12">
                                {formSubmitted ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <h4 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                                        <p className="text-gray-600">Thank you for contacting us. We will get back to you shortly.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleFormSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleFormChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00A884] focus:ring focus:ring-[#00A884] focus:ring-opacity-20 transition duration-300 outline-none"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleFormChange}
                                                required
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00A884] focus:ring focus:ring-[#00A884] focus:ring-opacity-20 transition duration-300 outline-none"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleFormChange}
                                                required
                                                rows="4"
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00A884] focus:ring focus:ring-[#00A884] focus:ring-opacity-20 transition duration-300 outline-none resize-none"
                                                placeholder="How can we help you?"
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full py-4 px-6 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition duration-300 shadow-lg"
                                        >
                                            Send Message
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <img src="/Images/IMG_8135.PNG" className="w-8" alt="Logo" />
                        <span className="font-bold text-xl text-gray-900">Bemi Creatives</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} Bemi Creatives. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MarketingPage;
