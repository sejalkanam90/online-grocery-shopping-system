// src/DeliveryComponent/MyShops.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const MyShops = () => {
  const [user, setUser] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalShops: 0,
    activeShops: 0,
    totalDeliveries: 0,
    totalEarnings: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    if (userData.id) {
      fetchMyShops(userData.id);
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ CORRECTED: No extra /api in endpoint
  const fetchMyShops = async (deliveryPersonId) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log("Fetching my shops for delivery person:", deliveryPersonId);
      
      const response = await api.get(`/delivery/my-shops/${deliveryPersonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("My Shops API Response:", response.data);
      
      if (response.data?.success) {
        const shopsData = response.data.data || [];
        console.log("Shops data:", shopsData);
        setShops(shopsData);
        
        // Calculate stats
        const activeShops = shopsData.filter(s => s.open === true || s.isOpen === true).length;
        const totalDeliveries = shopsData.reduce((sum, s) => sum + (s.totalOrders || 0), 0);
        const totalEarnings = shopsData.reduce((sum, s) => sum + (s.earnings || 0), 0);
        
        setStats({
          totalShops: shopsData.length,
          activeShops: activeShops,
          totalDeliveries: totalDeliveries,
          totalEarnings: totalEarnings
        });
      } else {
        console.log("No shops found or API error:", response.data?.message);
        setShops([]);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load your shops');
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    if (imageName.startsWith('http')) return imageName;
    return `http://localhost:8085/uploads/${imageName}`;
  };

  const getShopStatus = (shop) => {
    if (shop.open === true || shop.isOpen === true) {
      return { text: 'Active', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' };
    }
    return { text: 'Inactive', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">My Shops 🏪</h1>
                <p className="text-emerald-100 mt-1">Shops where you are approved to deliver</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <span className="text-3xl">🏪</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Shops</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalShops}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">🏪</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Shops</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeShops}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Deliveries</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalDeliveries}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-emerald-600">₹{stats.totalEarnings}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {shops.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-3">🏪</div>
            <h3 className="text-lg font-medium text-gray-900">No Shops Yet</h3>
            <p className="text-gray-500 mt-2">You haven't been approved to any shop yet.</p>
            <button
              onClick={() => navigate('/delivery/shops')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Find Shops to Join →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop, index) => {
              const status = getShopStatus(shop);
              return (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                >
                  {/* Shop Image */}
                  <div className="h-32 bg-gradient-to-r from-green-600 to-green-700 relative overflow-hidden">
                    {getImageUrl(shop.imageUrl) ? (
                      <img 
                        src={getImageUrl(shop.imageUrl)} 
                        alt={shop.storeName}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x160?text=Store'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl">🏪</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.color} bg-opacity-90`}>
                        {status.text}
                      </span>
                    </div>
                  </div>
                  
                  {/* Shop Info */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{shop.storeName}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{shop.city}, {shop.address}</span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {shop.description || 'Premium grocery store offering fresh products'}
                    </p>
                    
                    {/* Stats Row */}
                    <div className="flex justify-between items-center mb-4 pt-2 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Orders</p>
                        <p className="text-sm font-semibold text-gray-700">{shop.totalOrders || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Rating</p>
                        <p className="text-sm font-semibold text-yellow-500">★ {shop.rating || 4.5}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400">Earnings</p>
                        <p className="text-sm font-semibold text-emerald-600">₹{shop.earnings || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
                        <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
                      </div>
                      <button
                        onClick={() => navigate(`/store/${shop.id}`)}
                        className="px-4 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition"
                      >
                        View Shop →
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <button
            onClick={() => navigate('/delivery/dashboard')}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-2xl">📊</span>
            <p className="text-sm font-medium text-gray-700 mt-1">Dashboard</p>
          </button>
          <button
            onClick={() => navigate('/delivery/my-orders')}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-2xl">📦</span>
            <p className="text-sm font-medium text-gray-700 mt-1">My Orders</p>
          </button>
          <button
            onClick={() => navigate('/delivery/earnings')}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-2xl">💰</span>
            <p className="text-sm font-medium text-gray-700 mt-1">Earnings</p>
          </button>
          <button
            onClick={() => navigate('/delivery/shops')}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-2xl">🔍</span>
            <p className="text-sm font-medium text-gray-700 mt-1">Find More</p>
          </button>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default MyShops;