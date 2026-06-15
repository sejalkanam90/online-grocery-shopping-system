// src/ShopComponent/AddCategory.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AddCategory = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState(null);
  const [isShopApproved, setIsShopApproved] = useState(false);
  const [checkingShop, setCheckingShop] = useState(true);
  const navigate = useNavigate();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true;
      checkShopStatus();
    }
  }, []);

  const checkShopStatus = async () => {
    setCheckingShop(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !user.id) {
        toast.error('Please login first');
        return;
      }
      
      const response = await api.get('/shops/my-shop', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success && response.data.data) {
        const shopData = response.data.data;
        setShop(shopData);
        
        if (shopData.approvalStatus === 'APPROVED') {
          setIsShopApproved(true);
        } else if (shopData.approvalStatus === 'PENDING') {
          toast.error('Your shop is pending admin approval');
        } else if (shopData.approvalStatus === 'REJECTED') {
          toast.error('Your shop has been rejected');
        }
      } else {
        toast.error('No shop found');
      }
    } catch (error) {
      console.error('Error checking shop:', error);
      toast.error('Failed to load shop details');
    } finally {
      setCheckingShop(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const categoryData = {
        name: formData.name,
        description: formData.description,
        groceryShopId: shop?.id || user.shopId,
        active: formData.active
      };
      
      const response = await api.post('/categories', categoryData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Category added successfully!');
        // ✅ Clear form - stay on same page
        setFormData({
          name: '',
          description: '',
          active: true
        });
      } else {
        toast.error(response.data.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  if (checkingShop) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
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
              You can add categories only after approval.
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

      <div className="max-w-2xl mx-auto px-4 py-8">
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add Category</h1>
          <p className="text-gray-600 text-sm mt-1">Create a new product category</p>
          <p className="text-xs text-green-600 mt-1">✓ Shop: {shop?.storeName} (Approved)</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Fruits, Vegetables, Dairy"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Enter category description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="active"
                id="active"
                checked={formData.active}
                onChange={handleChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="active" className="text-sm text-gray-700">
                Active (Visible to customers)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/shop/categories')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </div>

        </form>

      </div>

      <Footer />
    </div>
  );
};

export default AddCategory;