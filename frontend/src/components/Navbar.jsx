import React from "react";
import { useI18n } from "../i18n.jsx";

const Navbar = () => {
  const { t, lang, setLang } = useI18n();
  return (
    <header className="w-full">
      <div className="container-narrow px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">OM</div>
          <div>
            <div className="text-xl font-serif font-bold text-stone-900">{t('appName')}</div>
            <div className="text-xs text-stone-500">{t('tagline')}</div>
          </div>
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-stone-700">
          <a className="hover:text-stone-900" href="#menu">{t('ourMenu')}</a>
          <a className="hover:text-stone-900" href="#contact">{t('contact')}</a>
          <a className="hover:text-stone-900" href="#hours">{t('hours')}</a>
        </nav>
          <select value={lang} onChange={(e)=>setLang(e.target.value)} className="flex text-xs border border-stone-300 rounded px-2 py-1">
            <option value="en">EN</option>
            <option value="am">AM</option>
          </select>
      </div>
    </header>
  );
};

export default Navbar;


