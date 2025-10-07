import React from 'react';
import { NavLink } from 'react-router-dom';

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center gap-1 transition-colors ${
        isActive ? 'text-brand-primary' : 'text-brand-muted'
      }`
    }
  >
    {icon}
    <span className="text-xs font-semibold">{label}</span>
  </NavLink>
);

const Footer = () => {
  const iconClass = "w-6 h-6";
  return (
    <footer className="sticky bottom-0 z-50 bg-white/80 backdrop-blur-sm border-t border-stone-200/80 flex justify-around items-center h-16">
      <NavItem
        to="/menu"
        label="Menu"
        icon={
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        }
      />
      <NavItem
        to="/about"
        label="About"
        icon={
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        }
      />
      <NavItem
        to="/contact"
        label="Contact"
        icon={
          <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
          </svg>
        }
      />
    </footer>
  );
};

export default Footer;