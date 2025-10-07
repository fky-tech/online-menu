import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { getAuthToken, clearAuthToken } from "../api";

const AdminTenant = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const isAuthed = useMemo(() => Boolean(getAuthToken()), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState(null);

  const [newItem, setNewItem] = useState({ category_id: "", name: "", description: "", price: "", image_url: "", imageFile: null, is_available: 1 });
  const [editingItem, setEditingItem] = useState(null);
  const [imageInputMode, setImageInputMode] = useState("url");

  useEffect(() => {
    if (!isAuthed) {
      navigate(`/admin/restaurant/${slug}/login`, { replace: true });
      return;
    }
    const load = async () => {
      try {
        const [restRes, catsRes, itemsRes] = await Promise.all([
          api.get(`/restaurants/${slug}`),
          api.get(`/restaurants/${slug}/categories`),
          api.get(`/restaurants/${slug}/menu-items`),
        ]);
        setRestaurant(restRes.data?.data);
        setCategories(catsRes.data?.data || []);
        setItems(itemsRes.data?.data || []);
      } catch (e) {
        setError("Failed to load restaurant data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthed, navigate, slug]);

  const logout = () => {
    clearAuthToken();
    navigate(`/admin/restaurant/${slug}/login`, { replace: true });
  };

  // Admin writes with restaurant_id require restaurant id; get from restaurant
  const restaurantId = restaurant?.id;

  // Category ops
  const createCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/categories?restaurant_id=${restaurantId}`, newCategory);
      setCategories((prev) => [res.data.data, ...prev]);
      setNewCategory({ name: "", description: "" });
    } catch (e) {
      alert('Failed to create category');
    }
  };
  const startEditCategory = (cat) => setEditingCategory({ ...cat });
  const cancelEditCategory = () => setEditingCategory(null);
  const updateCategory = async (e) => {
    e.preventDefault();
    try {
      const { id, name, description } = editingCategory;
      const res = await api.put(`/categories/${id}?restaurant_id=${restaurantId}`, { name, description });
      setCategories((prev) => prev.map((c) => (c.id === id ? res.data.data : c)));
      setEditingCategory(null);
    } catch (e) {
      alert('Update failed');
    }
  };
  const deleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}?restaurant_id=${restaurantId}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setItems((prev) => prev.filter((i) => i.category_id !== id));
    } catch (e) {
      alert('Delete failed');
    }
  };

  // Items ops
  const createItem = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('restaurant_id', String(restaurantId));
      formData.append('category_id', newItem.category_id);
      formData.append('name', newItem.name);
      formData.append('description', newItem.description);
      formData.append('price', newItem.price);
      formData.append('is_available', String(newItem.is_available ?? 1));
      if (imageInputMode === 'upload' && newItem.imageFile) {
        formData.append('image', newItem.imageFile);
      } else if (imageInputMode === 'url' && newItem.image_url) {
        formData.append('image_url', newItem.image_url);
      }
      const res = await api.post(`/menu-items`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setItems((prev) => [res.data.data, ...prev]);
      setNewItem({ category_id: "", name: "", description: "", price: "", image_url: "", imageFile: null, is_available: 1 });
    } catch (e) {
      alert('Failed to create item');
    }
  };
  const startEditItem = (it) => { setEditingItem({ ...it, price: String(it.price) }); setImageInputMode('url'); };
  const cancelEditItem = () => setEditingItem(null);
  const updateItem = async (e) => {
    e.preventDefault();
    try {
      const { id, category_id, name, description, price, image_url, imageFile, is_available } = editingItem;
      let res;
      if (imageInputMode === 'upload' && imageFile) {
        const formData = new FormData();
        formData.append('restaurant_id', String(restaurantId));
        formData.append('category_id', category_id);
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('is_available', is_available);
        formData.append('image', imageFile);
        res = await api.put(`/menu-items/${id}?restaurant_id=${restaurantId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        const payload = { category_id, name, description, price: Number(price), image_url, is_available };
        res = await api.put(`/menu-items/${id}?restaurant_id=${restaurantId}`, payload);
      }
      setItems((prev) => prev.map((i) => (i.id === id ? res.data.data : i)));
      setEditingItem(null);
    } catch (e) {
      alert('Update failed');
    }
  };
  const deleteItem = async (id) => {
    try {
      await api.delete(`/menu-items/${id}?restaurant_id=${restaurantId}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      alert('Delete failed');
    }
  };

  if (!isAuthed) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Tenant Admin - {restaurant?.name || slug}</h1>
            </div>
            <button onClick={logout} className="px-3 py-2 text-xs md:text-sm bg-red-600 text-white rounded-md">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg md:text-xl font-medium text-gray-900">Categories</h2>
              </div>
              <div className="p-4 sm:p-6">
                <form onSubmit={createCategory} className="bg-gray-50 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 space-y-3">
                  <h3 className="font-medium">Add Category</h3>
                  <input className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Name" value={newCategory.name} onChange={(e)=>setNewCategory({...newCategory, name:e.target.value})} required />
                  <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Description" value={newCategory.description} onChange={(e)=>setNewCategory({...newCategory, description:e.target.value})} rows="3" />
                  <div className="flex justify-end">
                    <button type="submit" className="px-3 py-2 bg-amber-600 text-white rounded-md">Create</button>
                  </div>
                </form>
                {editingCategory && (
                  <form onSubmit={updateCategory} className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5 mb-4 space-y-3">
                    <h3 className="font-medium">Edit Category</h3>
                    <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={editingCategory.name} onChange={(e)=>setEditingCategory({...editingCategory, name:e.target.value})} required />
                    <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" value={editingCategory.description || ''} onChange={(e)=>setEditingCategory({...editingCategory, description:e.target.value})} rows="3" />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={cancelEditCategory} className="px-3 py-2 border rounded-md">Cancel</button>
                      <button type="submit" className="px-3 py-2 bg-amber-600 text-white rounded-md">Update</button>
                    </div>
                  </form>
                )}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {categories.map(c => (
                    <div key={c.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <div>
                        <div className="font-medium text-gray-900">{c.name}</div>
                        {c.description && <div className="text-sm text-gray-600">{c.description}</div>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>setEditingCategory(c)} className="px-2 py-1.5 border rounded-md text-xs">Edit</button>
                        <button onClick={()=>deleteCategory(c.id)} className="px-2 py-1.5 border rounded-md text-xs text-red-700">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg md:text-xl font-medium text-gray-900">Menu Items</h2>
              </div>
              <div className="p-4 sm:p-6">
                <form onSubmit={createItem} className="bg-gray-50 rounded-lg p-4 sm:p-5 mb-4 space-y-3">
                  <h3 className="font-medium">Add Item</h3>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2" value={newItem.category_id} onChange={(e)=>setNewItem({...newItem, category_id:e.target.value})} required>
                    <option value="" disabled>Select category</option>
                    {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className="border border-gray-300 rounded-md px-3 py-2" placeholder="Name" value={newItem.name} onChange={(e)=>setNewItem({...newItem, name:e.target.value})} required />
                    <input type="number" min="0" step="0.01" className="border border-gray-300 rounded-md px-3 py-2" placeholder="Price" value={newItem.price} onChange={(e)=>setNewItem({...newItem, price:e.target.value})} required />
                  </div>
                  <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="Description" rows="3" value={newItem.description} onChange={(e)=>setNewItem({...newItem, description:e.target.value})} />
                  <div className="flex items-center gap-2">
                    <button type="button" className={`px-2 py-1.5 rounded-md text-xs ${imageInputMode==='url'?'bg-amber-100 border border-amber-300':'border border-gray-300'}`} onClick={()=>setImageInputMode('url')}>URL</button>
                    <button type="button" className={`px-2 py-1.5 rounded-md text-xs ${imageInputMode==='upload'?'bg-amber-100 border border-amber-300':'border border-gray-300'}`} onClick={()=>setImageInputMode('upload')}>Upload</button>
                  </div>
                  {imageInputMode==='url' ? (
                    <input className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="https://..." value={newItem.image_url || ''} onChange={(e)=>setNewItem({...newItem, image_url:e.target.value, imageFile:null})} />
                  ) : (
                    <input type="file" accept="image/*" className="w-full border border-gray-300 rounded-md px-3 py-2" onChange={(e)=>setNewItem({...newItem, imageFile:e.target.files?.[0] || null, image_url:''})} />
                  )}
                  <div>
                    <label htmlFor="itemAvailability" className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <select
                      id="itemAvailability"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={newItem.is_available}
                      onChange={(e)=>setNewItem({...newItem, is_available: Number(e.target.value)})}
                    >
                      <option value={1}>Available</option>
                      <option value={0}>Not Available</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-3 py-2 bg-amber-600 text-white rounded-md">Create</button>
                  </div>
                </form>

                {editingItem && (
                  <form onSubmit={updateItem} className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-5 mb-4 space-y-3">
                    <h3 className="font-medium">Edit Item</h3>
                    <select className="w-full border border-gray-300 rounded-md px-3 py-2" value={editingItem.category_id} onChange={(e)=>setEditingItem({...editingItem, category_id:e.target.value})} required>
                      {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>

	                    <div>
	                      <label htmlFor="editItemAvailability" className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
	                      <select
	                        id="editItemAvailability"
	                        className="w-full border border-gray-300 rounded-md px-3 py-2"
	                        value={editingItem.is_available}
	                        onChange={(e)=>setEditingItem({...editingItem, is_available: Number(e.target.value)})}
	                      >
	                        <option value={1}>Available</option>
	                        <option value={0}>Not Available</option>
	                      </select>
	                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input className="border border-gray-300 rounded-md px-3 py-2" value={editingItem.name} onChange={(e)=>setEditingItem({...editingItem, name:e.target.value})} required />
                      <input type="number" min="0" step="0.01" className="border border-gray-300 rounded-md px-3 py-2" value={editingItem.price} onChange={(e)=>setEditingItem({...editingItem, price:e.target.value})} required />
                    </div>
                    <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" rows="3" value={editingItem.description || ''} onChange={(e)=>setEditingItem({...editingItem, description:e.target.value})} />
                    <div className="flex items-center gap-2">
                      <button type="button" className={`px-2 py-1.5 rounded-md text-xs ${imageInputMode==='url'?'bg-amber-100 border border-amber-300':'border border-gray-300'}`} onClick={()=>setImageInputMode('url')}>URL</button>
                      <button type="button" className={`px-2 py-1.5 rounded-md text-xs ${imageInputMode==='upload'?'bg-amber-100 border border-amber-300':'border border-gray-300'}`} onClick={()=>setImageInputMode('upload')}>Upload</button>
                    </div>
                    {imageInputMode==='url' ? (
                      <input className="w-full border border-gray-300 rounded-md px-3 py-2" value={editingItem.image_url || ''} onChange={(e)=>setEditingItem({...editingItem, image_url:e.target.value, imageFile:null})} placeholder="https://..." />
                    ) : (
                      <input type="file" accept="image/*" className="w-full border border-gray-300 rounded-md px-3 py-2" onChange={(e)=>setEditingItem({...editingItem, imageFile:e.target.files?.[0] || null, image_url:''})} />
                    )}
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={cancelEditItem} className="px-3 py-2 border rounded-md">Cancel</button>
                      <button type="submit" className="px-3 py-2 bg-amber-600 text-white rounded-md">Update</button>
                    </div>
                  </form>
                )}

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {items.map(it => (
                    <div key={it.id} className="flex items-start justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900">{it.name} <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{it.price} BIRR</span></div>
                        {it.description && <div className="text-sm text-gray-600">{it.description}</div>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>setEditingItem({ ...it, price: String(it.price) })} className="px-2 py-1.5 border rounded-md text-xs">Edit</button>
                        <button onClick={()=>deleteItem(it.id)} className="px-2 py-1.5 border rounded-md text-xs text-red-700">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminTenant;


