// src/ShopComponent/EditShopDetails.jsx (UPDATED)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const EditShopDetails = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // ✅ New: Green message
  const navigate = useNavigate();

  const BASE_URL = 'http://localhost:8085'; // ✅ Changed to 8085

  const [formData, setFormData] = useState({
    id: '',
    storeName: '',
    ownerName: '',
    description: '',
    address: '',
    city: '',
    area: '',
    downtown: '',
    pincode: '',
    latitude: '',
    longitude: '',
    openingTime: '',
    closingTime: '',
    gstNumber: '',
    phone: '',
    email: '',
    imageUrl: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
        const shop = response.data.data;
        setFormData({
          id: shop.id || '',
          storeName: shop.storeName || '',
          ownerName: shop.ownerName || '',
          description: shop.description || '',
          address: shop.address || '',
          city: shop.city || '',
          area: shop.area || '',
          downtown: shop.downtown || '',
          pincode: shop.pincode || '',
          latitude: shop.latitude || '',
          longitude: shop.longitude || '',
          openingTime: shop.openingTime || '',
          closingTime: shop.closingTime || '',
          gstNumber: shop.gstNumber || '',
          phone: shop.user?.phone || shop.phone || '',
          email: shop.user?.email || shop.email || '',
          imageUrl: shop.imageUrl || ''
        });
        
        if (shop.imageUrl) {
          setImagePreview(getImageUrl(shop.imageUrl));
        }
      }
    } catch (error) {
      console.error('Error fetching shop details:', error);
      toast.error('Failed to load shop details');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${BASE_URL}${imageUrl}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccessMessage(''); // Clear message when user types
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ✅ FIXED: Image upload to correct endpoint
  const uploadImage = async (shopId) => {
    if (!imageFile) return formData.imageUrl;
    
    setUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const uploadFormData = new FormData();
      uploadFormData.append('file', imageFile); // 'file' not 'image'
      
      const response = await api.post(`/shops/${shopId}/upload-image`, uploadFormData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast.success('Image uploaded successfully!');
        return response.data.data.imageUrl;
      }
      return formData.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return formData.imageUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  // ✅ UPDATED: Stay on same page, show green message
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Upload image if changed
      let imageUrl = formData.imageUrl;
      if (imageFile && formData.id) {
        imageUrl = await uploadImage(formData.id);
      }
      
      const updateData = {
        storeName: formData.storeName,
        ownerName: formData.ownerName,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        area: formData.area,
        pincode: formData.pincode,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        gstNumber: formData.gstNumber,
        email: formData.email,
        imageUrl: imageUrl
      };
      
      // ✅ Use update-details endpoint
      const response = await api.put(`/shops/update-details/${formData.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success || response.status === 200) {
        // ✅ Show green success message
        setSuccessMessage('✅ Shop details updated successfully!');
        
        // ✅ Update formData with new image URL
        if (imageUrl) {
          setFormData(prev => ({ ...prev, imageUrl: imageUrl }));
          setImagePreview(getImageUrl(imageUrl));
        }
        
        // ✅ Clear image file state (but keep preview)
        setImageFile(null);
        
        // ✅ Scroll to top to show message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // ✅ Auto hide message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
        
        // ✅ Refresh shop details in background
        fetchShopDetails();
        
      } else {
        toast.error(response.data.message || 'Failed to update shop');
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      toast.error(error.response?.data?.message || 'Failed to update shop details');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ✅ Green Success Message */}
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
        
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Shop Details</h1>
          <p className="text-gray-600 text-sm mt-1">Update your grocery store information</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Image Section */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Image</h3>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-emerald-50 to-teal-50">
                    🏪
                  </div>
                )}
              </div>
              <div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                    📷 Change Image
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-2">Max size: 2MB (JPG, PNG)</p>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-6">
            
            {/* Basic Information */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="Enter store name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="Enter owner name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="Describe your store..."
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="Business email"
                  />
                  <p className="text-xs text-gray-400 mt-1">Customers will see this email</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="GST number"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area / Locality</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="Area or locality"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="Pincode"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    name="downtown"
                    value={formData.downtown}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="Nearby landmark"
                  />
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                Business Hours
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                  <input
                    type="time"
                    name="openingTime"
                    value={formData.openingTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                  <input
                    type="time"
                    name="closingTime"
                    value={formData.closingTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Location Coordinates */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                Location Coordinates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g., 19.073245"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g., 72.882991"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/shop-details')}
              className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving || uploadingImage ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>

      <Footer />
      
      {/* CSS Animation */}
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

export default EditShopDetails;