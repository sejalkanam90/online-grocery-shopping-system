// src/ShopComponent/RegisterGroceryShop.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const RegisterGroceryShop = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    storeName: '',
    email: '',
    password: '',
    phone: '',
    gstNumber: '',
    address: '',
    area: '',
    city: '',
    pincode: '',
    latitude: '',
    longitude: '',
    openingTime: '09:00:00',
    closingTime: '21:00:00'
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim()) {
      toast.error('Please enter first name');
      return;
    }
    if (!formData.storeName.trim()) {
      toast.error('Please enter store name');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter email');
      return;
    }
    if (!formData.password) {
      toast.error('Please enter password');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!formData.phone) {
      toast.error('Please enter phone number');
      return;
    }
    if (!formData.address) {
      toast.error('Please enter address');
      return;
    }
    if (!formData.city) {
      toast.error('Please enter city');
      return;
    }
    if (!formData.pincode) {
      toast.error('Please enter pincode');
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    
    const requestData = {
      ownerName: fullName,
      storeName: formData.storeName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      gstNumber: formData.gstNumber,
      address: formData.address,
      area: formData.area,
      city: formData.city,
      pincode: formData.pincode,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      openingTime: formData.openingTime,
      closingTime: formData.closingTime
    };

    setLoading(true);
    try {
      const response = await api.post('/shops/register', requestData);
      
      console.log("Response:", response.data);
      
      if (response.data.success) {
        toast.success('✅ Shop registered successfully! Waiting for admin approval.');
        
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          storeName: '',
          email: '',
          password: '',
          phone: '',
          gstNumber: '',
          address: '',
          area: '',
          city: '',
          pincode: '',
          latitude: '',
          longitude: '',
          openingTime: '09:00:00',
          closingTime: '21:00:00'
        });
      } else {
        toast.error(response.data.message || 'Failed to register shop');
      }
    } catch (error) {
      console.error('Error registering shop:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error('Bad request. Please check all fields.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again.');
      } else {
        toast.error('Failed to register shop. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-green-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Register Grocery Shop</h1>
          </div>
          <p className="text-gray-600 text-sm ml-14">Create your account to start selling</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6">
            
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder="Enter store name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Id <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password (min 6 characters)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="Enter GST number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street/Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter street address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area/Locality
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="Enter area or locality"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter pincode"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="e.g., 19.0760"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="e.g., 72.8777"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      name="openingTime"
                      value={formData.openingTime.slice(0, 5)}
                      onChange={(e) => setFormData({ ...formData, openingTime: e.target.value + ':00' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      name="closingTime"
                      value={formData.closingTime.slice(0, 5)}
                      onChange={(e) => setFormData({ ...formData, closingTime: e.target.value + ':00' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register Grocery Shop'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              After registration, your shop will be pending for admin approval. You will be notified once approved.
            </p>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterGroceryShop;