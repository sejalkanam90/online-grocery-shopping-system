// src/ShopComponent/AllCategories.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log('=== AUTH CHECK ===');
    console.log('Token exists:', !!token);
    console.log('User:', user);
    
    if (!token) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    
    await fetchCategories();
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // ✅ Get storeId from user object
      let storeId = user.shopId || user.groceryShopId || user.storeId;
      
      // ✅ If storeId is string, convert to number
      if (storeId && typeof storeId === 'string') {
        storeId = parseInt(storeId, 10);
      }
      
      console.log('=== API CALL DEBUG ===');
      console.log('StoreId:', storeId);
      console.log('StoreId type:', typeof storeId);
      console.log('Token exists:', !!token);
      
      // ✅ If no storeId, try to fetch from API
      if (!storeId || isNaN(storeId)) {
        console.log('No storeId found, fetching from API...');
        
        try {
          // Try to get shop by user ID
          const shopResponse = await api.get(`/shops/user/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Shop API Response:', shopResponse.data);
          
          if (shopResponse.data && shopResponse.data.success) {
            storeId = shopResponse.data.data.id;
            // Save for future use
            localStorage.setItem('shopData', JSON.stringify(shopResponse.data.data));
            console.log('Fetched storeId from API:', storeId);
          }
        } catch (shopError) {
          console.error('Error fetching shop:', shopError);
        }
      }
      
      // ✅ Final check
      if (!storeId || isNaN(storeId)) {
        console.error('No valid storeId found!');
        toast.error('Store not found. Please contact support.');
        setLoading(false);
        return;
      }
      
      // ✅ Make API call to get categories
      const url = `/categories/store/${storeId}`;
      console.log('Calling URL:', url);
      
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Categories API Response:', response.data);
      console.log('Response type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));
      
      // ✅ Handle both response formats (direct array OR wrapped response)
      let categoriesData = [];
      
      if (Array.isArray(response.data)) {
        // Backend returns direct array
        categoriesData = response.data;
        console.log('Direct array response');
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Backend returns wrapped response
        categoriesData = response.data.data;
        console.log('Wrapped response');
      } else {
        console.log('Unexpected response format');
        categoriesData = [];
      }
      
      setCategories(categoriesData);
      
      if (categoriesData.length === 0) {
        toast.success('No categories found. Add your first category!');
      } else {
        toast.success(`${categoriesData.length} categories loaded`);
      }
      
    } catch (error) {
      console.error('=== ERROR DEBUG ===');
      console.error('Error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('You don\'t have permission to view categories. Please login with shop owner account.');
        navigate('/shop/login');
      } else if (error.response?.status === 400) {
        toast.error('Invalid store ID. Please contact support.');
      } else if (error.response?.status === 404) {
        toast.error('Categories API not found. Please check backend.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load categories');
      }
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await api.delete(`/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Delete response:', response.data);
        
        if (response.data && (response.data.success || response.data === '')) {
          toast.success('Category deleted successfully!');
          fetchCategories();
        } else {
          toast.error(response.data?.message || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat?.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading categories...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Categories</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your product categories</p>
          </div>
          <button
            onClick={() => navigate('/shop/categories/add')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by category name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <p className="text-lg font-medium">No categories found</p>
                        <p className="text-sm">Add your first category to get started</p>
                        <button
                          onClick={() => navigate('/shop/categories/add')}
                          className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition"
                        >
                          + Add Category
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {category.id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {category.description || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.active === 1 || category.active === true
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.active === 1 || category.active === true ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/shop/categories/edit/${category.id}`)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition shadow-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition shadow-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {categories.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredCategories.length}</span> of{' '}
                <span className="font-semibold">{categories.length}</span> categories
              </p>
              {searchTerm && filteredCategories.length !== categories.length && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default AllCategories;