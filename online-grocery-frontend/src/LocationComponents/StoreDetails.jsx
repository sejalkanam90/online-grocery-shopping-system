// src/LocationComponents/StoreDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const StoreDetails = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchStoreData();
    }
  }, [id]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/shops/approved');
      
      if (response.data?.success) {
        const foundStore = response.data.data.find(shop => Number(shop.id) === Number(id));
        if (foundStore) {
          setStore(foundStore);
          await Promise.all([
            fetchStoreProducts(foundStore.id),
            fetchStoreCategories(foundStore.id)
          ]);
        } else {
          toast.error('Store not found');
          navigate('/stores');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load store');
      navigate('/stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreProducts = async (storeId) => {
    try {
      const response = await api.get('/product/fetch/groceryShop-wise', {
        params: { groceryShopId: storeId }
      });
      if (response.data?.success) {
        setProducts(response.data.data || []);
        setFilteredProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  const fetchStoreCategories = async (storeId) => {
    try {
      const response = await api.get(`/categories/store/${storeId}`);
      if (response.data?.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];
    
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(product =>
        Number(product.categoryId) === Number(selectedCategory)
      );
    }
    
    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || !user.id) {
      alert('Please login to buy the products!!!');
      return;
    }
    toast.success(`${product.name} added to cart!`);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `http://localhost:8085/uploads/${image}`;
  };

  const getShopImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) return `http://localhost:8085${imageUrl}`;
    return `http://localhost:8085/uploads/${imageUrl}`;
  };

  const FALLBACK_IMAGE = 'https://cdn-icons-png.flaticon.com/512/1323/1323985.png';
  const FALLBACK_SHOP_IMAGE = 'https://cdn-icons-png.flaticon.com/512/1046/1046751.png';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <span className="text-6xl">🏪</span>
            <h2 className="text-2xl font-bold mt-4">Store Not Found</h2>
            <button onClick={() => navigate('/stores')} className="mt-6 bg-emerald-600 text-white px-6 py-2 rounded-lg">Back to Stores</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Store Header */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 h-48 md:h-auto bg-gradient-to-r from-emerald-600 to-green-700">
              {getShopImageUrl(store.imageUrl) ? (
                <img src={getShopImageUrl(store.imageUrl)} alt={store.storeName} className="w-full h-full object-cover" onError={(e) => { e.target.src = FALLBACK_SHOP_IMAGE; }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><span className="text-6xl">🏪</span></div>
              )}
            </div>
            <div className="md:w-2/3 p-5">
              <h1 className="text-xl font-bold text-gray-900 uppercase">{store.storeName}</h1>
              <p className="text-gray-600 text-sm mt-1">{store.description || `${store.storeName} is located in ${store.city || 'Mumbai'} from last 3 decades`}</p>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2"><span className="font-medium">Email:</span> {store.email || 'Not available'}</div>
                <div className="flex items-center gap-2"><span className="font-medium">City:</span> {store.city || 'Not specified'}</div>
                <div className="flex items-center gap-2"><span className="font-medium">Downtown:</span> {store.area || 'Not specified'}</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${store.open !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`font-semibold ${store.open !== false ? 'text-green-600' : 'text-red-600'}`}>Status: {store.open !== false ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Products Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Available Products</h2>
          </div>

          <div className="p-5">
            {/* Search and Filter Section - Exactly as screenshot */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <input
                type="text"
                placeholder="Search product here..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
              />
              
              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              )}
              
              <button
                onClick={handleClear}
                className="px-5 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition"
              >
                Clear
              </button>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl">📦</span>
                <p className="text-gray-500 mt-2">No products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="w-full h-36 bg-gray-100 rounded-lg overflow-hidden mb-2">
                      <img src={getImageUrl(product.image1) || FALLBACK_IMAGE} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm">{product.name}</h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{product.description?.substring(0, 60) || '—'}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-bold text-emerald-600">₹{product.price}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        className="px-2 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {products.length > 0 && (
              <div className="mt-4 text-center text-xs text-gray-400">Showing {filteredProducts.length} of {products.length} products</div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-5 text-center">
          <button onClick={() => navigate('/stores')} className="text-sm text-gray-500 hover:text-emerald-600 transition">← Back to Stores</button>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default StoreDetails;