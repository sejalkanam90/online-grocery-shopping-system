// src/ProductComponent/GroceryShopProducts.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const GroceryShopProducts = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShops();
    fetchCategories();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await api.get('/shops/approved');
      if (response.data?.success) {
        setShops(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/all');
      if (response.data?.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredShops = shops.filter(shop =>
    shop.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-700">Loading shops...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Stores</h1>
          <p className="text-gray-600 mt-1">Shop from your favorite grocery stores</p>
        </div>
        
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Product here...</label>
              <input
                type="text"
                placeholder="Search by store name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Shops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <div 
              key={shop.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/store/${shop.id}`)}
            >
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3">
                <h3 className="text-white font-semibold text-lg">{shop.storeName}</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-600 text-sm mb-2">{shop.address}, {shop.city}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-sm text-gray-500">
                    ⭐ {shop.rating || 'New Store'}
                  </span>
                  <span className={`text-sm font-medium ${shop.open ? 'text-green-600' : 'text-red-600'}`}>
                    {shop.open ? 'Open' : 'Closed'}
                  </span>
                </div>
                <button className="mt-3 w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm">
                  Start Shopping →
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredShops.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <span className="text-5xl">🏪</span>
            <p className="text-gray-500 mt-2">No stores found</p>
          </div>
        )}
        
      </div>
      
      <Footer />
    </div>
  );
};

export default GroceryShopProducts;