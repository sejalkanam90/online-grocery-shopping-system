// src/ShopComponent/AddGroceryShop.jsx (Updated)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AddGroceryShop = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [existingShop, setExistingShop] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    businessEmail: '',
    phone: '',
    description: '',
    address: '',
    pincode: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    // Load user data
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.name) {
        setFormData(prev => ({ 
          ...prev, 
          ownerName: user.name
        }));
      }
    }
    
    fetchExistingShop();
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/locations/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success && response.data.data?.length > 0) {
        setLocations(response.data.data);
      } else {
        setLocations([]);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchExistingShop = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/shops/my-shop', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success && response.data.data) {
        const shop = response.data.data;
        setExistingShop(shop);
        
        setFormData({
          storeName: shop.storeName || '',
          ownerName: shop.ownerName || '',
          businessEmail: shop.email || '',
          phone: shop.user?.phone || '',
          description: shop.description || '',
          address: shop.address || '',
          pincode: shop.pincode || '',
          latitude: shop.latitude || '',
          longitude: shop.longitude || ''
        });
        setSelectedLocation(shop.city || '');
      }
    } catch (error) {
      console.log('No existing shop found:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccessMessage('');
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedImage(file);
    }
  };

  const getCoordinatesFromAddress = async (address) => {
    if (!address.trim()) return;
    
    try {
      const encodedAddress = encodeURIComponent(address + ', India');
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          latitude: data[0].lat,
          longitude: data[0].lon
        }));
        toast.success('Location coordinates found!');
      } else {
        toast.error('Could not find coordinates for this address');
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      toast.error('Failed to get coordinates');
    }
  };

  const handleAddressBlur = () => {
    if (formData.address && selectedLocation) {
      const fullAddress = `${formData.address}, ${selectedLocation}`;
      getCoordinatesFromAddress(fullAddress);
    } else if (formData.address) {
      getCoordinatesFromAddress(formData.address);
    }
  };

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) {
      toast.error('Please enter address to search');
      return;
    }
    
    try {
      const encodedAddress = encodeURIComponent(searchAddress + ', India');
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          address: searchAddress,
          latitude: data[0].lat,
          longitude: data[0].lon
        }));
        toast.success('Location found! Coordinates updated.');
      } else {
        toast.error('Location not found');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to search location');
    }
  };

  const uploadImage = async (shopId) => {
    if (!selectedImage) return null;
    
    const formDataImage = new FormData();
    formDataImage.append('file', selectedImage);
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(`/shops/${shopId}/upload-image`, formDataImage, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        toast.success('Shop image uploaded successfully!');
        return response.data.data.imageUrl;
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    }
    return null;
  };

  const getLocationDisplayText = (location) => {
    if (location.name && location.city) {
      return `${location.city} [${location.name}]`;
    }
    if (location.city) {
      return location.city;
    }
    return location.name || 'Unknown';
  };

  // ✅ Reset Form Function
  const resetForm = () => {
    setFormData({
      storeName: '',
      ownerName: '',
      businessEmail: '',
      phone: '',
      description: '',
      address: '',
      pincode: '',
      latitude: '',
      longitude: ''
    });
    setSelectedLocation('');
    setSelectedImage(null);
    setSearchAddress('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.storeName.trim()) {
      toast.error('Please enter grocery shop name');
      return;
    }
    if (!formData.phone) {
      toast.error('Please enter contact number');
      return;
    }
    if (!formData.address) {
      toast.error('Please enter address');
      return;
    }
    if (!selectedLocation) {
      toast.error('Please select location');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      const updateData = {
        description: formData.description,
        imageUrl: null,
        businessEmail: formData.businessEmail,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        area: formData.address,
        phone: formData.phone,
        address: formData.address,
        city: selectedLocation,
        pincode: formData.pincode
      };
      
      if (existingShop) {
        await api.put(`/shops/update-details/${existingShop.id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (selectedImage && existingShop.id) {
          await uploadImage(existingShop.id);
        }
        
        // ✅ Show success message
        setSuccessMessage('✅ Grocery Shop Details Saved Successfully!');
        
        // ✅ Clear the form after successful submission
        resetForm();
        
        // ✅ Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // ✅ Auto hide message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
        
        // ✅ Update localStorage to indicate shop exists
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.hasShop = true;
        user.shopId = existingShop.id;
        localStorage.setItem('user', JSON.stringify(user));
        
        // ✅ Trigger event to update navbar
        window.dispatchEvent(new Event('storage'));
        
      } else {
        toast.error('Please complete basic registration first');
        navigate('/register-grocery-shop');
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      
      if (error.response?.status === 404) {
        toast.error('Shop not found. Please complete basic registration first.');
        navigate('/register-grocery-shop');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update grocery shop');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Green Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
            <button 
              onClick={() => setSuccessMessage('')}
              className="text-green-700 hover:text-green-900"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-green-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Add Grocery Shop Details
            </h1>
          </div>
          <p className="text-gray-600 text-sm ml-14">
            Complete your store registration
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grocery Shop Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="storeName" 
                    value={formData.storeName} 
                    onChange={handleChange} 
                    placeholder="Enter grocery shop name" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Contact <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="Enter contact number" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                    required 
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows="3" 
                    placeholder="Describe your shop, products, specialties, etc." 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    onBlur={handleAddressBlur}
                    placeholder="Enter full address" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                    required 
                  />
                  <p className="text-xs text-gray-400 mt-1">Address will auto-fetch coordinates</p>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={selectedLocation} 
                    onChange={(e) => setSelectedLocation(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                    required
                    disabled={loadingLocations}
                  >
                    <option value="">-- Select Location --</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.city || location.name}>
                        {getLocationDisplayText(location)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Email <span className="text-green-600 text-xs">(Shop Contact)</span>
                  </label>
                  <input 
                    type="email" 
                    name="businessEmail" 
                    value={formData.businessEmail} 
                    onChange={handleChange} 
                    placeholder="shop@yourbusiness.com" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Address (Auto Coordinates)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={searchAddress} 
                      onChange={(e) => setSearchAddress(e.target.value)} 
                      placeholder="Search any location..." 
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                    />
                    <button
                      type="button"
                      onClick={handleSearchAddress}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      🔍
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Image</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="hidden" 
                      id="shopImage" 
                    />
                    <label 
                      htmlFor="shopImage" 
                      className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200"
                    >
                      Choose File
                    </label>
                    <span className="text-sm text-gray-500">
                      {selectedImage ? selectedImage.name : 'No file chosen'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Max size: 5MB (JPEG, PNG, GIF)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input 
                      type="text" 
                      name="latitude" 
                      value={formData.latitude} 
                      onChange={handleChange} 
                      placeholder="Auto-filled" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" 
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input 
                      type="text" 
                      name="longitude" 
                      value={formData.longitude} 
                      onChange={handleChange} 
                      placeholder="Auto-filled" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" 
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input 
                    type="text" 
                    name="pincode" 
                    value={formData.pincode} 
                    onChange={handleChange} 
                    placeholder="Enter pincode" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Grocery Shop'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/shop')} 
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Go to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddGroceryShop;