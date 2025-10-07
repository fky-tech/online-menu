import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getAuthToken, clearAuthToken } from "../api";
import ToastModal from "../components/ToastModal";
import ConfirmationModal from "../components/ConfirmationModal";

const SectionHeader = ({ title, action, subtitle }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-2xl md:text-2xl font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-sm md:text-base text-gray-500 mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const Admin = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState(0);
  const [newRestaurant, setNewRestaurant] = useState({ name: "", slug: "", description: "", logo_url: "" });
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState(null);

  const [newItem, setNewItem] = useState({ category_id: "", name: "", description: "", price: "", image_url: "", imageFile: null, is_available: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [imageInputMode, setImageInputMode] = useState("url");

  const isAuthed = useMemo(() => Boolean(getAuthToken()), []);

  useEffect(() => {
    if (!isAuthed) {
      navigate("/admin/login", { replace: true });
      return;
    }
    const load = async () => {
      try {
        const restRes = await api.get('/restaurants');
        const allRests = restRes.data?.data || [];
        setRestaurants(allRests);
        const selectedId = allRests[0]?.id || 0;
        setActiveRestaurantId(selectedId);
        if (selectedId) {
          const slug = allRests.find(r => r.id === selectedId)?.slug;
          const [catsRes, itemsRes] = await Promise.all([
            api.get(`/restaurants/${slug}/categories`),
            api.get(`/restaurants/${slug}/menu-items`),
          ]);
          setCategories(catsRes.data?.data || []);
          setItems(itemsRes.data?.data || []);
        } else {
          setCategories([]);
          setItems([]);
        }
      } catch (e) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthed, navigate]);

  const reloadForActiveRestaurant = async (restaurantId) => {
    try {
      const rest = restaurants.find(r => r.id === restaurantId);
      if (!rest) return;
      const [catsRes, itemsRes] = await Promise.all([
        api.get(`/restaurants/${rest.slug}/categories`),
        api.get(`/restaurants/${rest.slug}/menu-items`),
      ]);
      setCategories(catsRes.data?.data || []);
      setItems(itemsRes.data?.data || []);
    } catch (e) {
      showToast('Failed to load restaurant data', false);
    }
  };

  const createRestaurant = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/restaurants', newRestaurant);
      const created = res.data?.data;
      setRestaurants(prev => [created, ...prev]);
      setNewRestaurant({ name: "", slug: "", description: "", logo_url: "" });
      if (!activeRestaurantId) {
        setActiveRestaurantId(created.id);
        await reloadForActiveRestaurant(created.id);
      }
      showToast('Restaurant created', true);
    } catch (e) {
      showToast(e?.response?.data?.message || 'Create failed', false);
    }
  };

  const logout = () => {
    clearAuthToken();
    navigate("/admin/login", { replace: true });
  };

  const [toast, setToast] = useState({ open: false, message: '', success: true });
  const showToast = (message, success = true) => setToast({ open: true, message, success });

  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', targetId: null });
  const openConfirmModal = (type, id) => setConfirmModal({ open: true, type, targetId: id });
  const closeConfirmModal = () => setConfirmModal({ open: false, type: '', targetId: null });

  // Categories (admin writes require restaurant_id)
  const createCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/categories?restaurant_id=${activeRestaurantId}`, newCategory);
      setCategories((prev) => [res.data.data, ...prev]);
      setNewCategory({ name: "", description: "" });
        showToast("Category created", true);
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || "Failed to create category", false);
    }
  };

  const startEditCategory = (cat) => setEditingCategory({ ...cat });
  const cancelEditCategory = () => setEditingCategory(null);

  const updateCategory = async (e) => {
    e.preventDefault();
    try {
      const { id, name, description } = editingCategory;
      const res = await api.put(`/categories/${id}?restaurant_id=${activeRestaurantId}`, { name, description });
      setCategories((prev) => prev.map((c) => (c.id === id ? res.data.data : c)));
      setEditingCategory(null);
        showToast("Category updated", true);
    } catch (err) {
      console.error(err);
      showToast("Failed to update category", false);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}?restaurant_id=${activeRestaurantId}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setItems((prev) => prev.filter((i) => i.category_id !== id));
      showToast("Category deleted", true);
    } catch (err) {
      console.error(err);
      showToast("Delete failed", false);
    } finally {
      closeConfirmModal();
    }
  };

  // Items
  const createItem = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('restaurant_id', String(activeRestaurantId));
      formData.append('category_id', newItem.category_id);
      formData.append('name', newItem.name);
      formData.append('description', newItem.description);
      formData.append('price', newItem.price);
      if (imageInputMode === 'upload' && newItem.imageFile) {
        formData.append('image', newItem.imageFile);
      } else if (imageInputMode === 'url' && newItem.image_url) {
        formData.append('image_url', newItem.image_url);
      }
      const res = await api.post("/menu-items", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setItems((prev) => [res.data.data, ...prev]);
  setNewItem({ category_id: "", name: "", description: "", price: "", image_url: "", imageFile: null, is_available: "" });
    showToast("Item created", true);
    } catch (err) {
      console.error(err);
      showToast("Failed to create item", false);
    }
  };

  const startEditItem = (it) => {
    setEditingItem({ ...it, price: String(it.price) });
    setImageInputMode("url");
  };
  const cancelEditItem = () => setEditingItem(null);

  const updateItem = async (e) => {
    e.preventDefault();
    try {
      const { id, category_id, name, description, price, image_url, imageFile, is_available } = editingItem;
      let res;
      if (imageInputMode === 'upload' && imageFile) {
        const formData = new FormData();
        formData.append('restaurant_id', String(activeRestaurantId));
        formData.append('category_id', category_id);
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('is_available', is_available);
        formData.append('image', imageFile);
        res = await api.put(`/menu-items/${id}?restaurant_id=${activeRestaurantId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const payload = { category_id, name, description, price: Number(price), image_url, is_available };
        res = await api.put(`/menu-items/${id}?restaurant_id=${activeRestaurantId}`, payload);
      }
      setItems((prev) => prev.map((i) => (i.id === id ? res.data.data : i)));
      setEditingItem(null);
  showToast("Item updated", true);
    } catch (err) {
      console.error(err);
      showToast("Failed to update item", false);
    }
  };

  const handleFileToDataUrl = (file, setter) => {
    if (!file) {
      console.log("No file selected");
      return;
    }
    console.log("File selected:", file.name, file.type, file.size);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      console.log("Data URL generated, length:", dataUrl.length);
      setter(dataUrl);
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };
    reader.readAsDataURL(file);
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/menu-items/${id}?restaurant_id=${activeRestaurantId}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Item deleted", true);
    } catch (err) {
      console.error(err);
      showToast("Delete failed", false);
    } finally {
      closeConfirmModal();
    }
  };

  if (!isAuthed) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:block">
                <label className="sr-only">Active Restaurant</label>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={activeRestaurantId}
                  onChange={async (e) => {
                    const id = Number(e.target.value);
                    setActiveRestaurantId(id);
                    await reloadForActiveRestaurant(id);
                  }}
                >
                  <option value={0} disabled>Select restaurant</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={logout} 
                className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm md:text-base text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Restaurants Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:col-span-2">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <SectionHeader 
                  title="Restaurants" 
                  subtitle={`${restaurants.length} total`}
                  action={null}
                />
              </div>
              <div className="p-4 sm:p-6">
                <form onSubmit={createRestaurant} className="bg-gray-50 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                  <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-3 md:mb-4">Add New Restaurant</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Name</label>
                      <input 
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                        value={newRestaurant.name}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Slug</label>
                      <input 
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                        value={newRestaurant.slug}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'-') })}
                        placeholder="pasta-house"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base"
                        rows="2"
                        value={newRestaurant.description}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Logo URL</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base"
                        value={newRestaurant.logo_url}
                        onChange={(e) => setNewRestaurant({ ...newRestaurant, logo_url: e.target.value })}
                        placeholder="/uploads/logo.png or https://..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                    >
                      Create Restaurant
                    </button>
                  </div>
                </form>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {restaurants.map((r) => (
                    <div key={r.id} className={`flex items-center justify-between bg-gray-50 border rounded-lg px-3 py-2 ${activeRestaurantId === r.id ? 'border-amber-300 bg-amber-50' : 'border-gray-200'}`}>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900">{r.name}</div>
                        <div className="text-sm text-gray-600">/{r.slug}</div>
                      </div>
                      <button
                        onClick={async () => { setActiveRestaurantId(r.id); await reloadForActiveRestaurant(r.id); }}
                        className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50"
                      >
                        {activeRestaurantId === r.id ? 'Active' : 'Manage'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Categories Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <SectionHeader 
                  title="Categories" 
                  subtitle={`${categories.length} categories`}
                />
              </div>
              
              <div className="p-4 sm:p-6">
                {/* Create Category Form */}
                <form onSubmit={createCategory} className="bg-gray-50 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                  <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-3 md:mb-4">Add New Category</h3>
                  <div>
                    <label htmlFor="categoryName" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Name</label>
                    <input 
                      id="categoryName"
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                      value={newCategory.name} 
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="categoryDescription" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Description</label>
                    <textarea 
                      id="categoryDescription"
                      className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                      value={newCategory.description} 
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} 
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Category
                    </button>
                  </div>
                </form>

                {/* Edit Category Form */}
                {editingCategory && (
                  <form onSubmit={updateCategory} className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-3 md:mb-4">Edit Category</h3>
                    <div>
                      <label htmlFor="editCategoryName" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Name</label>
                      <input 
                        id="editCategoryName"
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                        value={editingCategory.name} 
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} 
                        required 
                      />
                    </div>
                    <div>
                      <label htmlFor="editCategoryDescription" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Description</label>
                      <textarea 
                        id="editCategoryDescription"
                        className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                        value={editingCategory.description || ""} 
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })} 
                        rows="3"
                      />
                    </div>
                    <div className="flex gap-2 sm:gap-3 justify-end">
                      <button 
                        type="button" 
                        onClick={cancelEditCategory} 
                        className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-xs md:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                      >
                        Update Category
                      </button>
                    </div>
                  </form>
                )}

                {/* Categories List */}
                <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
                  {categories.map((c) => (
                    <div 
                      key={c.id} 
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-3 hover:shadow-sm transition-shadow duration-200"
                    >
                      <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                        <div className="font-medium text-base md:text-lg text-gray-900">{c.name}</div>
                        {c.description && <div className="text-sm md:text-base text-gray-600 mt-1">{c.description}</div>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button 
                          onClick={() => startEditCategory(c)} 
                          className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-1.5 border border-gray-300 text-xs font-medium rounded-md text-amber-700 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => openConfirmModal('category', c.id)} 
                          className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-1.5 border border-gray-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <SectionHeader 
                  title="Menu Items" 
                  subtitle={`${items.length} items`}
                />
              </div>
              
              <div className="p-4 sm:p-6">
                {/* Create Item Form */}
                <form onSubmit={createItem} className="bg-gray-50 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                  <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-3 md:mb-4">Add New Item</h3>
                  <div>
                    <label htmlFor="itemCategory" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Category</label>
                    <select 
                      id="itemCategory"
                      className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                      value={newItem.category_id} 
                      onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })} 
                      required
                    >
                      <option value="" disabled>Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label htmlFor="itemName" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Name</label>
                        <input 
                          id="itemName"
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                          value={newItem.name} 
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} 
                          required 
                        />
                      </div>
                      <div>
                        <label htmlFor="itemPrice" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Price (BIRR)</label>
                        <input 
                          id="itemPrice"
                          type="number" 
                          min="0" 
                          step="0.01" 
                          className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                          value={newItem.price} 
                          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="itemDescription" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Description</label>
                    <textarea 
                      id="itemDescription"
                      className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                      value={newItem.description} 
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} 
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Image</label>
                    <div className="flex items-center gap-2 mb-3">
                      <button 
                        type="button" 
                        className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
                          imageInputMode === 'url' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setImageInputMode('url')}
                      >
                        URL
                      </button>
                      <button 
                        type="button" 
                        className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
                          imageInputMode === 'upload' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setImageInputMode('upload')}
                      >
                        Upload
                      </button>
                    </div>
                    {imageInputMode === 'url' ? (
                      <input 
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                        value={newItem.image_url || ""} 
                        onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value, imageFile: null })} 
                        placeholder="https://example.com/image.jpg" 
                      />
                    ) : (
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setNewItem({ ...newItem, imageFile: file || null, image_url: "" });
                        }} 
                      />
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Item
                    </button>
                  </div>
                </form>

                {/* Edit Item Form */}
                {editingItem && (
                  <form onSubmit={updateItem} className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-3 md:mb-4">Edit Item</h3>
                    <div>
                      <label htmlFor="editItemCategory" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Category</label>
                      <select 
                        id="editItemCategory"
                        className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                        value={editingItem.category_id} 
                        onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })} 
                        required
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label htmlFor="editItemName" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Name</label>
                          <input 
                            id="editItemName"
                            type="text"
                            className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                            value={editingItem.name} 
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} 
                            required 
                          />
                        </div>
                        <div>
                          <label htmlFor="editItemPrice" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Price (BIRR)</label>
                          <input 
                            id="editItemPrice"
                            type="number" 
                            min="0" 
                            step="0.01" 
                            className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                            value={editingItem.price} 
                            onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })} 
                            required 
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="editItemDescription" className="block text-sm md:text-base font-medium text-gray-700 mb-2">Description</label>
                      <textarea 
                        id="editItemDescription"
                        className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base" 
                        value={editingItem.description || ''} 
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} 
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Image</label>
                      <div className="flex items-center gap-2 mb-3">
                        <button 
                          type="button" 
                          className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
                            imageInputMode === 'url' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setImageInputMode('url')}
                        >
                          URL
                        </button>
                        <button 
                          type="button" 
                          className={`px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
                            imageInputMode === 'upload' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setImageInputMode('upload')}
                        >
                          Upload
                        </button>
                      </div>
                      {imageInputMode === 'url' ? (
                        <input 
                          type="text"
                          className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base mb-2" 
                          value={editingItem.image_url || ''} 
                          onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value, imageFile: null })} 
                          placeholder="https://example.com/image.jpg" 
                        />
                      ) : (
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="w-full border border-stone-300 rounded-md px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            setEditingItem({ ...editingItem, imageFile: file || null, image_url: '' });
                          }}
                        />
                      )}
                      <div>
                        
                      <label 
                        htmlFor="editItemAvailability" 
                        className="block text-sm md:text-base font-medium text-gray-700 mb-2"
                      >
                        Availability
                      </label>

                      <select
                        id="editItemAvailability"
                        className="w-full border border-gray-300 rounded-md px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 text-sm md:text-base"
                        value={editingItem.is_available}
                        onChange={(e) => setEditingItem({ ...editingItem, is_available: Number(e.target.value) })}
                        required
                      >
                        <option value={1}>Available</option>
                        <option value={0}>Not Available</option>
                      </select>
                    </div>

                    </div>
                    <div className="flex gap-2 sm:gap-3 justify-end">
                      <button 
                        type="button" 
                        onClick={cancelEditItem} 
                        className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border border-gray-300 text-xs md:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border border-transparent text-xs md:text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                      >
                        Update Item
                      </button>
                    </div>
                  </form>
                )}

                {/* Items List */}
                <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
                  {items.map((it) => (
                    <div 
                      key={it.id} 
                      className="flex flex-col sm:flex-row items-start justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow duration-200"
                    >
                      <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div className="font-medium text-base md:text-lg text-gray-900 mb-1 sm:mb-0">{it.name}</div>
                          <span className="ml-0 sm:ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full whitespace-nowrap">{it.price} BIRR</span>
                        </div>
                        {it.description && <div className="text-sm md:text-base text-gray-600 mt-1">{it.description}</div>}
                        <div className="text-xs sm:text-sm text-gray-500 mt-1">
                          Category: {categories.find(c => c.id === it.category_id)?.name || 'Unknown'}
                        </div>
                        <span className={`ml-0 sm:ml-2 px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap"> ${it.is_available ? " bg-green-100 text-green-800" : " bg-red-100 text-red-800"}`}>{it.is_available ? "Avaliable": "Not Avaliable"}</span>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button 
                          onClick={() => startEditItem(it)} 
                          className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-1.5 border border-gray-300 text-xs font-medium rounded-md text-amber-700 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => openConfirmModal('item', it.id)} 
                          className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-1.5 border border-gray-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <ToastModal
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        message={toast.message}
        success={toast.success}
      />
      <ConfirmationModal
        open={confirmModal.open}
        title={confirmModal.type === 'category' ? 'Delete Category' : 'Delete Item'}
        message={confirmModal.type === 'category' ? 'Are you sure you want to delete this category? This will also remove its menu items.' : 'Are you sure you want to delete this item?'}
        onCancel={closeConfirmModal}
        onConfirm={() => {
          if (confirmModal.type === 'category') deleteCategory(confirmModal.targetId);
          else if (confirmModal.type === 'item') deleteItem(confirmModal.targetId);
        }}
      />
    </div>
  );
};

export default Admin;