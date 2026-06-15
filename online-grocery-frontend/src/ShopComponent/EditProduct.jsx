// src/ProductComponent/EditProduct.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [categories, setCategories] = useState([]);
  const [shop, setShop] = useState(null);
  
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    description: '',
    categoryId: '',
    quantity: '',
    price: '',
    image1: null,
    image2: null,
    image3: null
  });

  const [imagePreviews, setImagePreviews] = useState({
    image1: null,
    image2: null,
    image3: null
  });

  const [existingImages, setExistingImages] = useState({
    image1: '',
    image2: '',
    image3: ''
  });

  // Helper Functions
  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:')) return imagePath;
    return `http://localhost:8085/uploads/${imagePath}`;
  }, []);

  const cleanImagePath = useCallback((path) => {
    if (!path) return '';
    return path.replace('http://localhost:8085/uploads/', '');
  }, []);

  // Fetch Shop
  const fetchShop = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/shops/my-shop', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.success) {
        setShop(response.data.data);
      }
    } catch (error) {
      console.error('Shop fetch error:', error);
    }
  }, []);

  // Fetch Product Data
  const fetchProduct = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/product/fetch', {
        params: { productId: id },
        headers: { Authorization: `Bearer ${token}` }
      });

      const product = response.data;
      if (product && product.id) {
        setFormData({
          productId: product.id,
          name: product.name || '',
          description: product.description || '',
          categoryId: product.categoryId || '',
          quantity: product.quantity || 0,
          price: product.price || 0,
          image1: null,
          image2: null,
          image3: null
        });

        // Store existing images
        setExistingImages({
          image1: cleanImagePath(product.image1),
          image2: cleanImagePath(product.image2),
          image3: cleanImagePath(product.image3)
        });

        // Set previews
        setImagePreviews({
          image1: getImageUrl(product.image1),
          image2: getImageUrl(product.image2),
          image3: getImageUrl(product.image3)
        });
      } else {
        toast.error('Product not found');
        navigate('/shop/products');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, getImageUrl, cleanImagePath]);

  // Fetch Categories for this shop
  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const shopId = user.shopId || user.groceryShopId;
      
      if (!shopId) return;
      
      const response = await api.get(`/categories/store/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Category fetch error:', error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchShop();
      fetchProduct();
      fetchCategories();
    }
  }, [id, fetchProduct, fetchCategories, fetchShop]);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Image Change
  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setFormData(prev => ({ ...prev, [key]: file }));

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviews(prev => ({ ...prev, [key]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const groceryShopId = user.shopId || user.groceryShopId;

      if (!groceryShopId) {
        toast.error('Shop not found');
        setUpdating(false);
        return;
      }

      // 1. Update Product Details
      const detailData = {
        productId: parseInt(formData.productId),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        categoryId: parseInt(formData.categoryId),
        groceryShopId: groceryShopId
      };

      const detailResponse = await api.put('/product/update/detail', detailData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!detailResponse.data?.success) {
        throw new Error(detailResponse.data?.message || 'Failed to update product details');
      }

      // 2. Update Images (if any new images selected)
      const hasNewImages = formData.image1 || formData.image2 || formData.image3;
      if (hasNewImages) {
        const imageData = new FormData();
        imageData.append('productId', formData.productId);
        if (formData.image1) imageData.append('image1', formData.image1);
        if (formData.image2) imageData.append('image2', formData.image2);
        if (formData.image3) imageData.append('image3', formData.image3);

        await api.put('/product/update/image', imageData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast.success('Product updated successfully!');
      navigate('/shop/products');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update product');
    } finally {
      setUpdating(false);
    }
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

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4">
            <h1 className="text-xl font-bold text-white">Edit Product</h1>
            <p className="text-emerald-100 text-sm">Update your product information</p>
            {shop && (
              <p className="text-emerald-100 text-xs mt-1">Shop: {shop.storeName}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                placeholder="Enter product name"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                placeholder="Enter product description"
              />
            </div>

            {/* Price & Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Existing Images Display */}
            {(existingImages.image1 || existingImages.image2 || existingImages.image3) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Images
                </label>
                <div className="flex gap-3 flex-wrap">
                  {existingImages.image1 && (
                    <div className="text-center">
                      <img
                        src={getImageUrl(existingImages.image1)}
                        alt="Current 1"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Image 1</p>
                    </div>
                  )}
                  {existingImages.image2 && (
                    <div className="text-center">
                      <img
                        src={getImageUrl(existingImages.image2)}
                        alt="Current 2"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Image 2</p>
                    </div>
                  )}
                  {existingImages.image3 && (
                    <div className="text-center">
                      <img
                        src={getImageUrl(existingImages.image3)}
                        alt="Current 3"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Image 3</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Images
              </label>
              <p className="text-xs text-gray-500 mb-3">Upload new images to replace existing ones</p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Image 1 (Main)</label>
                  <input
                    type="file"
                    onChange={(e) => handleImageChange(e, 'image1')}
                    accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {imagePreviews.image1 && !existingImages.image1 && (
                    <img src={imagePreviews.image1} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-lg" />
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Image 2 (Optional)</label>
                  <input
                    type="file"
                    onChange={(e) => handleImageChange(e, 'image2')}
                    accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {imagePreviews.image2 && !existingImages.image2 && (
                    <img src={imagePreviews.image2} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-lg" />
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Image 3 (Optional)</label>
                  <input
                    type="file"
                    onChange={(e) => handleImageChange(e, 'image3')}
                    accept="image/*"
                    className="w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {imagePreviews.image3 && !existingImages.image3 && (
                    <img src={imagePreviews.image3} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-lg" />
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/shop/products')}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EditProduct;