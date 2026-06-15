// src/ShopComponent/ShopDetails.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const ShopDetails = () => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const BASE_URL = 'http://localhost:8085';

  useEffect(() => {
    fetchShopDetails();
  }, []);

  const fetchShopDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!user?.id) {
        toast.error('User not found. Please login again.');
        navigate('/login');
        return;
      }
      
      const response = await api.get(`/shops/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setShop(response.data.data);
        setImageError(false);
      }
    } catch (error) {
      console.error('Error fetching shop details:', error);
      
      if (error.response?.status === 401) {
        localStorage.clear();
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error('Failed to load shop details');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShopStatus = async () => {
    if (!shop?.id) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/shops/${shop.id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success(`Shop ${response.data.data.open ? 'opened' : 'closed'} successfully!`);
        setShop(response.data.data);
      }
    } catch (error) {
      console.error('Error toggling shop status:', error);
      
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        toast.error('Failed to update shop status');
      }
    } finally {
      setUpdating(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${BASE_URL}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading shop details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-5xl">🏪</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Shop Found</h2>
            <p className="text-gray-600 mb-6">Please add your grocery shop first to get started.</p>
            <button 
              onClick={() => navigate('/shop/add')} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-sm"
            >
              + Add Grocery Shop
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Check if shop is approved
  const isApproved = shop.approvalStatus === 'APPROVED';

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shop Details</h1>
          <p className="text-gray-600 mt-1">View and manage your store information</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Store Identity Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              
              {/* Store Image */}
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-b border-gray-200">
                <div className="flex justify-center">
                  {shop.imageUrl && !imageError ? (
                    <img
                      src={getImageUrl(shop.imageUrl)}
                      alt={shop.storeName}
                      className="w-48 h-48 object-cover rounded-2xl shadow-md border-2 border-white"
                      onError={() => setImageError(true)}
                      onLoad={() => console.log('Image loaded successfully')}
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center shadow-md border-2 border-white">
                      <span className="text-7xl">🏪</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Store Name & Status - Based on Approval Status */}
              <div className="p-6 text-center border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{shop.storeName}</h2>
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isApproved && shop.open ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  <span className={`text-sm font-semibold ${
                    isApproved && shop.open ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {isApproved ? (shop.open ? 'Open' : 'Closed') : 'Inactive'}
                  </span>
                </div>
                {!isApproved && (
                  <p className="text-xs text-yellow-600 mt-2">
                    ⏳ Shop {shop.approvalStatus === 'PENDING' ? 'pending admin approval' : 'rejected'}. Features are limited.
                  </p>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="p-6 bg-gray-50">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate('/shop/edit')}
                    className="w-full px-4 py-2.5 bg-white border-2 border-emerald-600 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition shadow-sm"
                  >
                    ✏️ Edit Shop Details
                  </button>
                  
                  {/* Show toggle button only if shop is APPROVED */}
                  {isApproved && (
                    <button
                      onClick={toggleShopStatus}
                      disabled={updating}
                      className={`w-full px-4 py-2.5 rounded-xl font-semibold transition shadow-sm ${
                        shop.open 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'   // ✅ Open = Green
                          : 'bg-red-500 hover:bg-red-600 text-white'           // ✅ Closed = Red
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updating ? 'Processing...' : (shop.open ? '🟢 Open' : '🔴 Closed')}
                    </button>
                  )}
                  
                  {/* Show message if not approved */}
                  {!isApproved && (
                    <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-700">
                        ⏳ Your shop is {shop.approvalStatus === 'PENDING' ? 'pending approval' : 'rejected'}.<br/>
                        Shop activation will be available after admin approval.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Store Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Store Information</h3>
                <p className="text-sm text-gray-600 mt-0.5">Basic details about your grocery shop</p>
              </div>
              
              <div className="p-6">
                {/* Description */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
                  <p className="text-gray-800 leading-relaxed">
                    {shop.description || 'No description provided'}
                  </p>
                </div>
                
                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">📧 Business Email</label>
                      <p className="text-gray-800 font-medium">
                        {shop.email || 'Not specified'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Customers will contact on this email</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">📍 Address</label>
                      <p className="text-gray-800 font-medium">{shop.address || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">🏙️ City</label>
                      <p className="text-gray-800 font-medium">{shop.city || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">🗺️ Area / Locality</label>
                      <p className="text-gray-800 font-medium">{shop.area || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">📮 Pincode</label>
                      <p className="text-gray-800 font-medium">{shop.pincode || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">👤 Owner Name</label>
                      <p className="text-gray-800 font-medium">{shop.ownerName || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">🔑 Login Email</label>
                      <p className="text-gray-800 font-medium">{shop.user?.email || 'Not specified'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Used for login (not visible to customers)</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">📞 Phone</label>
                      <p className="text-gray-800 font-medium">{shop.user?.phone || shop.phone || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">🔢 GST Number</label>
                      <p className="text-gray-800 font-medium">{shop.gstNumber || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Coordinates Card */}
            {(shop.latitude || shop.longitude) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Location Coordinates</h3>
                  <p className="text-sm text-gray-600 mt-0.5">Geographic location of your store</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Latitude</label>
                      <p className="text-gray-900 font-mono text-base font-medium">{shop.latitude || '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Longitude</label>
                      <p className="text-gray-900 font-mono text-base font-medium">{shop.longitude || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Business Hours & Approval Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Business Details</h3>
                <p className="text-sm text-gray-600 mt-0.5">Hours, status, and approval information</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">🕐 Opening Time</label>
                    <p className="text-gray-800 font-medium">{shop.openingTime || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">🕒 Closing Time</label>
                    <p className="text-gray-800 font-medium">{shop.closingTime || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">✅ Approval Status</label>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      shop.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      shop.approvalStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {shop.approvalStatus === 'APPROVED' ? 'APPROVED' :
                       shop.approvalStatus === 'REJECTED' ? 'REJECTED' : 'PENDING'}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">📅 Registered On</label>
                    <p className="text-gray-800 font-medium">
                      {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-start">
              <button
                onClick={() => navigate('/shop')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition shadow-sm"
              >
                ← Back to Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ShopDetails;