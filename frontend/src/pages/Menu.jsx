import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import fallbackMenu from "../data/fallbackMenu";
import Layout from "../components/Layout";
import { useI18n } from "../i18n.jsx";
import { useParams } from "react-router-dom";

const Menu = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { t } = useI18n();
  const searchInputRef = useRef(null);
  const itemsSectionRef = useRef(null);

  const { slug } = useParams();

  // Derive slug from current hostname for subdomain tenants in dev/prod
  const deriveSlugFromHost = () => {
    const h = window.location.hostname.toLowerCase();
    const idx = h.indexOf('.localhost');
    if (idx > 0) return h.slice(0, idx);
    const root = (import.meta.env.VITE_ROOT_DOMAIN || '').toLowerCase();
    if (root && h.endsWith(root)) {
      const withoutRoot = h.slice(0, -root.length).replace(/\.$/, '');
      return withoutRoot || null;
    }
    return null;
  };


  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Host-based tenancy: backend resolves tenant from Host header.
        // For local dev routes like /restaurant/:slug, keep passing slug as fallback.
        const effectiveSlug = slug || deriveSlugFromHost();
        const res = await api.get(`/public/menu`, { params: effectiveSlug ? { slug: effectiveSlug } : {} });
        const fetchedCats = res?.data?.data?.categories || [];
        const fetchedItems = res?.data?.data?.items || [];
        const allCategories = [{ id: 'all', name: 'All' }, ...fetchedCats];
        if (fetchedCats.length === 0 && fetchedItems.length === 0) {
          // Use fallback when backend returns no data
          setCategories(fallbackMenu.categories);
          setSelectedCategory(fallbackMenu.categories[0]);
          setMenuItems(fallbackMenu.items);
        } else {
          setCategories(allCategories);
          setSelectedCategory(allCategories[0]); // Select 'All' by default
          setMenuItems(fetchedItems);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // On any error, fall back to the bundled data so the UI still renders
        setCategories(fallbackMenu.categories);
        setSelectedCategory(fallbackMenu.categories[0]);
        setMenuItems(fallbackMenu.items);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [slug]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setQuery(""); // reset search when changing category
    setLoading(true);
    // Simulate loading for UX (e.g. 500ms)
    setTimeout(() => setLoading(false), 500);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = !selectedCategory || selectedCategory.id === 'all' ? true : item.category_id === selectedCategory.id;
    const q = query.trim().toLowerCase();
    const matchesQuery = q === '' ? true : (`${item.name} ${item.description}`.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <Layout title={t('menu') || "Menu"} query={query} setQuery={setQuery} searchInputRef={searchInputRef}>
  {/* Category Pills */}
      <nav className="sticky top-[57px] z-40 bg-brand-background/95 backdrop-blur-sm border-b border-stone-200/80 overflow-x-auto no-scrollbar">
        <ul className="flex space-x-4 px-4">
          {categories.map((cat) => (
            <li key={cat.id} className="flex-shrink-0">
              <button
                className={`py-3 border-b-2 transition-colors duration-200 font-medium text-base tracking-tight ${
                  selectedCategory?.id === cat.id
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-stone-600 hover:text-brand-primary"
                }`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Search is now in the header (Layout) */}

      {/* Menu Items */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-2 animate-pulse">
                <div className="w-20 h-20 bg-stone-200 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 bg-stone-200 rounded" />
                  <div className="h-3 w-full bg-stone-200 rounded" />
                  <div className="h-3 w-1/2 bg-stone-200 rounded" />
                </div>
                <div className="w-16 h-5 bg-stone-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div ref={itemsSectionRef} className="divide-y divide-stone-200/60">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-start gap-4 py-4">
                <img
                  src={
                    item.image_url?.startsWith("/uploads/")
                      ? `${window.location.origin}${item.image_url}`
                      : item.image_url
                  }
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0 shadow-sm"
                />
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-base text-brand-text whitespace-normal break-words">{item.name}</h3>
                    <div className="font-extrabold text-base text-brand-primary whitespace-nowrap">{`Br ${Number(item.price).toFixed(2)}`}</div>
                  </div>
                  <p className="text-brand-muted text-sm mt-1 whitespace-normal break-words">{item.description}</p>
                  {typeof item.is_available !== 'undefined' && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <span className={`w-2 h-2 rounded-full mr-1.5 ${item.is_available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {item.is_available ? 'Available' : 'Not available'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Menu;