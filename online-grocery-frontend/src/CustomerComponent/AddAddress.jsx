// src/CustomerComponent/AddAddress.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AddAddress = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapSrc, setMapSrc] = useState('https://maps.google.com/maps?q=19.0760,72.8777&z=13&output=embed');
  const [formData, setFormData] = useState({
    addressLine1: '',
    landmark: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    isDefault: false,
    addressType: 'HOME',
    receiverName: '',
    phoneNumber: '',
    latitude: '19.0760',
    longitude: '72.8777'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setFormData(prev => ({
      ...prev,
      receiverName: user.name || '',
      phoneNumber: user.phone || ''
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const encodedQuery = encodeURIComponent(searchQuery);
    setMapSrc(`https://maps.google.com/maps?q=${encodedQuery}&z=15&output=embed`);
    
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setFormData(prev => ({
            ...prev,
            latitude: data[0].lat,
            longitude: data[0].lon
          }));
          toast.success(`Location found`);
        } else {
          toast.error('Location not found');
        }
      })
      .catch(err => console.error(err));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
        setMapSrc(`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`);
        toast.success('Current location detected');
      },
      () => {
        toast.error('Unable to fetch location');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!user?.id) {
        toast.error('Please login to add address');
        navigate('/login');
        return;
      }

      const payload = {
        addressLine1: formData.addressLine1,
        landmark: formData.landmark,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        isDefault: formData.isDefault,
        addressType: formData.addressType,
        receiverName: formData.receiverName,
        phoneNumber: formData.phoneNumber,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      console.log("Sending payload:", payload);

      const response = await api.post(`/addresses/${user.id}/add`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        toast.success('Address added successfully!');
        navigate('/address/view');
      } else {
        toast.error(response.data?.message || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error(error.response?.data?.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Add Delivery Address 📍</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LEFT SIDE - Form */}
              <div>
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Receiver Name *</label>
                  <input
                    type="text"
                    name="receiverName"
                    value={formData.receiverName}
                    onChange={handleChange}
                    placeholder="Full name of receiver"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="10 digit mobile number"
                    maxLength="10"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">Address Line *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="House No., Building Name, Street, Area"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    placeholder="Near any famous place"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-2 font-medium">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="400001"
                      maxLength="6"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                  />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Gujarat">Gujarat</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">Address Type</label>
                  <select
                    name="addressType"
                    value={formData.addressType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="HOME">🏠 Home</option>
                    <option value="WORK">💼 Work</option>
                    <option value="OTHER">📍 Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">Latitude</label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">Longitude</label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50 font-mono text-sm"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCurrentLocation}
                  className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition mb-4"
                >
                  📍 Use Current Location
                </button>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label className="text-sm text-gray-700">Set as default delivery address</label>
                </div>
              </div>

              {/* RIGHT SIDE - Google Maps Embed */}
              <div>
                <div className="mb-3">
                  <label className="block mb-2 font-medium">📍 Search Location</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Search... (e.g., Andheri East, Mumbai)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-r-lg hover:bg-emerald-700 transition"
                    >
                      🔍 Search
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    title="Location Map"
                    src={mapSrc}
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  <p>📍 Type location name and click Search to navigate</p>
                  <p>🗺️ Click on map to see coordinates</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Adding...' : 'Add Address'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/address/view')}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AddAddress;