// src/CategoryComponent/CategoryList.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Demo data if API fails
      const demoCategories = [
        { id: 1, name: 'Vegetables', icon: '🥬', count: 45, color: 'from-green-400 to-green-600' },
        { id: 2, name: 'Fruits', icon: '🍎', count: 38, color: 'from-red-400 to-red-600' },
        { id: 3, name: 'Dairy', icon: '🥛', count: 25, color: 'from-blue-400 to-blue-600' },
        { id: 4, name: 'Beverages', icon: '🥤', count: 32, color: 'from-orange-400 to-orange-600' },
        { id: 5, name: 'Snacks', icon: '🍪', count: 56, color: 'from-yellow-400 to-yellow-600' },
        { id: 6, name: 'Bakery', icon: '🍞', count: 28, color: 'from-amber-400 to-amber-600' },
        { id: 7, name: 'Household', icon: '🧼', count: 42, color: 'from-purple-400 to-purple-600' },
        { id: 8, name: 'Personal Care', icon: '🧴', count: 35, color: 'from-pink-400 to-pink-600' },
      ];
      setCategories(demoCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="text-center py-20">Loading categories...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">Shop by Category 📂</h1>
          <p className="text-gray-600 mb-8">Browse products by category</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link 
                to={`/category/${category.id}`} 
                key={category.id}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className={`h-32 bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                    <span className="text-5xl">{category.icon}</span>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-800">{category.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{category.count} items</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryList;