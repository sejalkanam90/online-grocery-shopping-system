// src/ProductComponent/AddProductForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AddProductForm = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    categoryId: '',
    groceryShopId: '',
    image1: null,
    image2: null,
    image3: null
  });
  const [imagePreviews, setImagePreviews] = useState({
    image1: null,
    image2: null,
    image3: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchShopId();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/categories/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchShopId = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      let shopId = user.shopId || user.groceryShopId;
      
      if (!shopId && user.id) {
        const response = await api.get(`/shops/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.success && response.data.data) {
          shopId = response.data.data.id;
          user.shopId = shopId;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      
      setFormData(prev => ({ ...prev, groceryShopId: shopId || '' }));
    } catch (error) {
      console.error('Error fetching shop id:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [key]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({ ...prev, [key]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // ✅ Ensure groceryShopId is set
      let shopId = formData.groceryShopId;
      if (!shopId || shopId === '') {
        const shopResponse = await api.get(`/shops/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (shopResponse.data?.success && shopResponse.data.data) {
          shopId = shopResponse.data.data.id;
        }
      }
      
      if (!shopId) {
        toast.error('Shop not found. Please contact admin.');
        setLoading(false);
        return;
      }
      
      // ✅ DEBUG: Check data types before sending
      console.log('=== SUBMITTING PRODUCT ===');
      console.log('Name:', formData.name);
      console.log('Price:', formData.price, 'Type:', typeof formData.price);
      console.log('Quantity:', formData.quantity, 'Type:', typeof formData.quantity);
      console.log('CategoryId:', formData.categoryId, 'Type:', typeof formData.categoryId);
      console.log('ShopId:', shopId, 'Type:', typeof shopId);
      
      // ✅ Create FormData - single API call
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description || '');
      
      // ✅ IMPORTANT: Convert to Number (fix for 500 error)
      submitData.append('price', Number(formData.price));
      submitData.append('quantity', Number(formData.quantity));
      submitData.append('categoryId', Number(formData.categoryId));
      submitData.append('groceryShopId', Number(shopId));
      
      // ✅ Append images directly
      if (formData.image1) {
        submitData.append('image1', formData.image1);
      }
      if (formData.image2) {
        submitData.append('image2', formData.image2);
      }
      if (formData.image3) {
        submitData.append('image3', formData.image3);
      }
      
      // ✅ Remove Content-Type - let axios set it automatically
      const response = await api.post('/product/add', submitData, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Response:', response.data);
      
      if (response.data?.success) {
        toast.success('Product added successfully!');
        navigate('/shop/products');
      } else {
        toast.error(response.data?.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Product Name"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                required
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description..."
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                rows="3"
              />
            </div>
            
            {/* Price & Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Price"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Quantity"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            {/* Images */}
            <div className="space-y-3">
              <h3 className="font-medium">Product Images</h3>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Image 1 (Main)</label>
                <input
                  type="file"
                  onChange={(e) => handleImageChange(e, 'image1')}
                  accept="image/*"
                  className="w-full p-1"
                />
                {imagePreviews.image1 && (
                  <img src={imagePreviews.image1} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Image 2 (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => handleImageChange(e, 'image2')}
                  accept="image/*"
                  className="w-full p-1"
                />
                {imagePreviews.image2 && (
                  <img src={imagePreviews.image2} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Image 3 (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => handleImageChange(e, 'image3')}
                  accept="image/*"
                  className="w-full p-1"
                />
                {imagePreviews.image3 && (
                  <img src={imagePreviews.image3} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                )}
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddProductForm;