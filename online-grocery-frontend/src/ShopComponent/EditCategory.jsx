// src/ShopComponent/EditCategory.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const EditCategory = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        const category = response.data.data;
        setFormData({
          name: category.name || '',
          description: category.description || '',
          active: category.active === 1 || category.active === true
        });
      } else {
        toast.error('Category not found');
        navigate('/shop/categories');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to load category');
      navigate('/shop/categories');
    } finally {
      setLoading(false);
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
    setUpdating(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/categories/${id}`, {
        name: formData.name,
        description: formData.description,
        active: formData.active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        toast.success('Category updated successfully!');
        navigate('/shop/categories');
      } else {
        toast.error(response.data?.message || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
          <p className="text-gray-600 text-sm mt-1">Update your category information</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
            />
          </div>
          
          <div className="mb-6 flex items-center gap-3">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="active" className="text-sm text-gray-700">
              Active (Category will be visible to customers)
            </label>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/shop/categories')}
              className="px-5 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Update Category'}
            </button>
          </div>
          
        </form>
      </div>
      
      <Footer />
    </div>
  );
};

export default EditCategory;