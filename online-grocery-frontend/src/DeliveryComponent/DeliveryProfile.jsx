// src/DeliveryComponent/DeliveryProfile.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const DeliveryProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    aadharNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    vehicleType: 'BIKE',
    vehicleNumber: ''
  });
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    rating: 0,
    joinedDate: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!userData || !userData.id) {
      toast.error('Please login to view profile');
      navigate('/login');
      return;
    }
    
    setUser(userData);
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }
      
      // ✅ Use /me endpoint - gets current user from token
      const response = await api.get(`/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Profile API Response:", response.data);
      
      let userData = null;
      if (response.data?.success && response.data?.data) {
        userData = response.data.data;
      } else if (response.data?.id) {
        userData = response.data;
      } else {
        userData = response.data;
      }
      
      if (userData) {
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          aadharNumber: userData.aadharNumber || userData.aadhar_number || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          pincode: userData.pincode || '',
          vehicleType: userData.vehicleType || userData.vehicle_type || 'BIKE',
          vehicleNumber: userData.vehicleNumber || userData.vehicle_number || ''
        });
        
        setStats(prev => ({
          ...prev,
          joinedDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-IN') : '—'
        }));
      }
      
      // Fetch delivery stats with dynamic rating
      const userId = userData?.id || JSON.parse(localStorage.getItem('user') || '{}').id;
      const ordersResponse = await api.get(`/orders/delivery/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (ordersResponse.data?.success) {
        const orders = ordersResponse.data.data || [];
        const completedOrders = orders.filter(o => o.orderStatus === 'DELIVERED' && o.deliveredAt !== null);
        
        let avgRating = 0;
        const ratings = orders
          .filter(o => o.customerRating && o.customerRating > 0)
          .map(o => o.customerRating);
        
        if (ratings.length > 0) {
          const sum = ratings.reduce((a, b) => a + b, 0);
          avgRating = parseFloat((sum / ratings.length).toFixed(1));
        }
        
        setStats(prev => ({
          ...prev,
          totalDeliveries: completedOrders.length,
          rating: avgRating
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!userData.id) {
        toast.error('User not found');
        return;
      }
      
      const updatePayload = {
        name: formData.name,
        phone: formData.phone,
        aadharNumber: formData.aadharNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber
      };
      
      console.log("Updating profile with:", updatePayload);
      
      const response = await api.put(`/users/${userData.id}`, updatePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Update Response:", response.data);
      
      if (response.data?.success) {
        toast.success('Profile updated successfully!');
        setEditing(false);
        
        const updatedUser = { 
          ...userData, 
          name: formData.name, 
          phone: formData.phone,
          aadharNumber: formData.aadharNumber
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        await fetchProfileData();
      } else {
        toast.error(response.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const getInitials = (name) => {
    if (!name) return '👤';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatAadharDisplay = (aadhar) => {
    if (!aadhar || aadhar.length !== 12) return aadhar || 'Not provided';
    return `XXXX-XXXX-${aadhar.slice(-4)}`;
  };

  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-500">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-500">½</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
      </div>
    );
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">My Profile 👤</h1>
                <p className="text-emerald-100 mt-1">Manage your personal information</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <span className="text-3xl">👤</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Profile Header with Avatar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {getInitials(formData.name)}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{formData.name || 'Delivery Partner'}</h2>
              <p className="text-gray-500">{formData.email}</p>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <div className="flex items-center gap-1">
                  {renderRatingStars(stats.rating)}
                  <span className="text-sm text-gray-600 ml-1">({stats.rating.toFixed(1)})</span>
                </div>
                <span className="text-sm text-gray-400">Joined: {stats.joinedDate || '—'}</span>
                {formData.aadharNumber && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    ✓ KYC Verified
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalDeliveries}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Customer Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-yellow-500">{stats.rating.toFixed(1)}</p>
                  <div className="flex">{renderRatingStars(stats.rating)}</div>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aadhar Number <span className="text-red-500">*</span>
                </label>
                {editing ? (
                  <>
                    <input
                      type="text"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleChange}
                      maxLength="12"
                      pattern="[0-9]{12}"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition font-mono"
                      placeholder="Enter 12-digit Aadhar Number"
                    />
                    <p className="text-xs text-gray-400 mt-1">12-digit Aadhar number for KYC verification</p>
                  </>
                ) : (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono">
                    {formatAadharDisplay(formData.aadharNumber)}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value="BIKE">Bike</option>
                  <option value="SCOOTY">Scooty</option>
                  <option value="CAR">Car</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                  placeholder="MH 12 AB 1234"
                />
              </div>
            </div>
            
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!editing}
                rows="2"
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none ${
                  !editing ? 'bg-gray-50' : ''
                }`}
                placeholder="Enter your address"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                  placeholder="Mumbai"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value="">Select State</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  disabled={!editing}
                  maxLength="6"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                  placeholder="400001"
                />
              </div>
            </div>
            
            {editing && (
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    fetchProfileData();
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
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
            onClick={() => navigate('/delivery/shops')}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-2xl">🔍</span>
            <p className="text-sm font-medium text-gray-700 mt-1">Find Shops</p>
          </button>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default DeliveryProfile;