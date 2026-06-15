// src/AdminComponent/AllCategories.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AllCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      console.log('User role:', user.role);
      
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }
      
      const endpoint = user.role === 'ADMIN' ? '/categories' : `/categories/store/${user.shopId}`;
      
      console.log('Fetching from endpoint:', endpoint);
      
      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response:', response.data);
      
      let categoriesData = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      }
      
      setCategories(categoriesData);
      
      if (categoriesData.length === 0) {
        toast('No categories found');
      } else {
        toast.success(`${categoriesData.length} categories loaded`);
      }
      
    } catch (err) {
      console.error('Error fetching categories:', err);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else if (err.response?.status === 403) {
        toast.error('You don\'t have permission to view categories');
      } else {
        toast.error(err.response?.data?.message || 'Failed to fetch categories');
      }
    } finally {
      setLoading(false);
    }
  };

  const getShopName = (category) => {
    if (category.groceryShop?.storeName) {
      return category.groceryShop.storeName;
    }
    if (category.groceryShop?.name) {
      return category.groceryShop.name;
    }
    if (category.shopName) {
      return category.shopName;
    }
    if (category.groceryShopId) {
      return `Shop ID: ${category.groceryShopId}`;
    }
    return '—';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all product categories</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl">📂</span>
              <p className="text-gray-500 mt-2 font-medium">No categories found</p>
              <p className="text-gray-400 text-sm mt-1">Categories will appear here once added by shop owners</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-700">
                    <th className="px-4 py-3 text-center text-white font-semibold">Category ID</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Category Name</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Description</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Grocery Shop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50 transition">
                      {/* ✅ ID - Bold, Center, WITHOUT # */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-gray-900">{cat.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-700">{cat.description || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {getShopName(cat)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {categories.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Total categories: <span className="font-semibold">{categories.length}</span>
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllCategories;