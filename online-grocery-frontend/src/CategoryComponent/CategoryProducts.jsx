// src/CategoryComponent/CategoryProducts.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const CategoryProducts = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch category and products
  const fetchCategoryProducts = async () => {
    try {
      const [categoryRes, productsRes] = await Promise.all([
        api.get(`/categories/${id}`),
        api.get(`/products/category/${id}`)
      ]);
      
      setCategory(categoryRes.data.data);
      setProducts(productsRes.data.data || []);
    } catch (error) {
      console.error('Error:', error);
      // Demo data
      setCategory({ id: id, name: 'Vegetables', icon: '🥬' });
      setProducts([
        { id: 1, name: 'Fresh Tomato', price: 40, unit: 'kg', image: '🍅', rating: 4.5, description: 'Fresh organic tomatoes' },
        { id: 2, name: 'Onion', price: 35, unit: 'kg', image: '🧅', rating: 4.2, description: 'Fresh red onions' },
        { id: 3, name: 'Potato', price: 30, unit: 'kg', image: '🥔', rating: 4.3, description: 'Farm fresh potatoes' },
        { id: 4, name: 'Cabbage', price: 25, unit: 'pc', image: '🥬', rating: 4.0, description: 'Fresh cabbage' },
        { id: 5, name: 'Cauliflower', price: 30, unit: 'pc', image: '🥦', rating: 4.1, description: 'Fresh cauliflower' },
        { id: 6, name: 'Capsicum', price: 60, unit: 'kg', image: '🫑', rating: 4.4, description: 'Fresh capsicum' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryProducts();
  }, [id]);

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      toast.error('Please login first to add items to cart!');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (user.role !== 'CUSTOMER') {
      toast.error('Only customers can add items to cart!');
      return;
    }

    try {
      await api.post(`/cart/${user.id}/add`, {
        productId: product.id,
        quantity: 1,
      });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="text-center py-20">Loading products...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Category Banner */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{category?.icon || '📂'}</span>
              <div>
                <h1 className="text-2xl font-bold">{category?.name}</h1>
                <p className="opacity-90 mt-1">Explore fresh {category?.name?.toLowerCase()}</p>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No products found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition hover:-translate-y-1">
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-6xl">
                    {product.image || '🥬'}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{product.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-xl font-bold text-green-600">₹{product.price}</span>
                        <span className="text-gray-400 text-sm ml-1">/{product.unit || 'kg'}</span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryProducts;