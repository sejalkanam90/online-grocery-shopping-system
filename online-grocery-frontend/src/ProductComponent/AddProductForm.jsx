// src/ProductComponent/AddProductForm.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AddProductForm = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [isShopApproved, setIsShopApproved] = useState(false);
  const [checkingShop, setCheckingShop] = useState(true);
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
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true;
      checkShopAndFetch();
    }
  }, []);

  const checkShopAndFetch = async () => {
    setCheckingShop(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !user.id) {
        toast.error('Please login first');
        setTimeout(() => navigate('/login'), 1000);
        return;
      }
      
      let shopId = user.shopId || user.groceryShopId;
      let shopData = null;
      
      if (!shopId && user.id) {
        const response = await api.get(`/shops/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.success && response.data.data) {
          shopData = response.data.data;
          shopId = shopData.id;
          user.shopId = shopId;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } else if (shopId) {
        const response = await api.get(`/shops/${shopId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.success && response.data.data) {
          shopData = response.data.data;
        }
      }
      
      if (shopData) {
        setShop(shopData);
        setFormData(prev => ({ ...prev, groceryShopId: shopData.id }));
        
        if (shopData.approvalStatus === 'APPROVED') {
          setIsShopApproved(true);
          await fetchCategories(shopData.id);
        } else if (shopData.approvalStatus === 'PENDING') {
          toast.error('Your shop is pending admin approval');
          setTimeout(() => navigate('/shop'), 1000);
        } else if (shopData.approvalStatus === 'REJECTED') {
          toast.error('Your shop has been rejected');
          setTimeout(() => navigate('/shop'), 1000);
        } else {
          toast.error('Shop not found');
          setTimeout(() => navigate('/shop/add'), 1000);
        }
      } else {
        toast.error('No shop found');
        setTimeout(() => navigate('/shop/add'), 1000);
      }
    } catch (error) {
      console.error('Error checking shop:', error);
      toast.error('Failed to load shop details');
      setTimeout(() => navigate('/shop'), 1000);
    } finally {
      setCheckingShop(false);
    }
  };

  // ✅ Fetch categories for the specific shop only
  const fetchCategories = async (shopId) => {
    try {
      const token = localStorage.getItem('token');
      // Get categories for this shop only
      const response = await api.get(`/categories/store/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Categories response:", response.data);

      if (response.data?.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
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
    
    if (loading) return;
    
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      toast.error('Please enter valid price');
      return;
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      toast.error('Please enter valid quantity');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description || '');
      submitData.append('price', Number(formData.price));
      submitData.append('quantity', Number(formData.quantity));
      submitData.append('categoryId', Number(formData.categoryId));
      submitData.append('groceryShopId', Number(formData.groceryShopId));
      
      if (formData.image1) submitData.append('image1', formData.image1);
      if (formData.image2) submitData.append('image2', formData.image2);
      if (formData.image3) submitData.append('image3', formData.image3);
      
      const response = await api.post('/product/add', submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data?.success) {
        toast.success('Product added successfully!');
        // Clear form - stay on same page
        setFormData({
          name: '',
          description: '',
          price: '',
          quantity: '',
          categoryId: '',
          groceryShopId: shop?.id || '',
          image1: null,
          image2: null,
          image3: null
        });
        setImagePreviews({
          image1: null,
          image2: null,
          image3: null
        });
      } else {
        toast.error(response.data?.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  if (checkingShop) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-700 font-medium">Checking shop status...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isShopApproved) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">⏳</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop Not Approved</h2>
            <p className="text-gray-600 mb-4">
              Your shop is <span className="font-semibold text-yellow-600">PENDING</span> for admin approval.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              You can add products only after approval.
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-2">Add New Product</h2>
          <p className="text-sm text-green-600 mb-6">✓ Shop: {shop?.storeName} (Approved)</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Product description..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                rows="3"
              />
            </div>
            
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
                  placeholder="Price"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
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
                  placeholder="Quantity"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              >
                <option value="">-- Select Category --</option>
                {categories.length === 0 ? (
                  <option value="" disabled>No categories found. Please add a category first.</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-gray-800">Product Images</h3>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Image 1 (Main) *</label>
                <input
                  type="file"
                  onChange={(e) => handleImageChange(e, 'image1')}
                  accept="image/*"
                  className="w-full p-1 border border-gray-300 rounded-lg"
                />
                {imagePreviews.image1 && (
                  <img src={imagePreviews.image1} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded border" />
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Image 2 (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => handleImageChange(e, 'image2')}
                  accept="image/*"
                  className="w-full p-1 border border-gray-300 rounded-lg"
                />
                {imagePreviews.image2 && (
                  <img src={imagePreviews.image2} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded border" />
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Image 3 (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => handleImageChange(e, 'image3')}
                  accept="image/*"
                  className="w-full p-1 border border-gray-300 rounded-lg"
                />
                {imagePreviews.image3 && (
                  <img src={imagePreviews.image3} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded border" />
                )}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-medium transition ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
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