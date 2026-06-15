// src/AdminComponent/AllProducts.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/product/fetch/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      console.log("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getShopName = (product) => {
    if (product.groceryShop && product.groceryShop.storeName) {
      return product.groceryShop.storeName;
    }
    if (product.groceryShopName) {
      return product.groceryShopName;
    }
    if (product.groceryShopId) {
      return `Shop ID: ${product.groceryShopId}`;
    }
    return '—';
  };

  const getCategoryName = (product) => {
    if (product.category && product.category.name) {
      return product.category.name;
    }
    if (product.categoryName) {
      return product.categoryName;
    }
    if (product.categoryId) {
      const categoryMap = {
        1: 'Vegetables',
        2: 'Fruits',
        3: 'Dairy'
      };
      return categoryMap[product.categoryId] || '—';
    }
    return '—';
  };

  const getCategoryColor = (categoryName) => {
    const colors = {
      'Fruits': 'bg-orange-100 text-orange-700',
      'Vegetables': 'bg-green-100 text-green-700',
      'Dairy': 'bg-blue-100 text-blue-700',
      '—': 'bg-gray-100 text-gray-500'
    };
    return colors[categoryName] || 'bg-gray-100 text-gray-600';
  };

  const getProductImage = (product) => {
    let image = product.image1 || product.image2 || product.image3;
    if (image && !image.startsWith('http')) {
      image = `http://localhost:8085/uploads/${image}`;
    }
    return image;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">All Products</h1>
              <p className="text-sm text-gray-500">Manage all products from all stores</p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📦</div>
              <h3 className="text-lg font-medium text-gray-700">No Products Found</h3>
              <p className="text-gray-400 text-sm mt-1">No products added yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Qty</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Grocery Shop</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, idx) => {
                    const imageUrl = getProductImage(product);
                    const categoryName = getCategoryName(product);
                    return (
                      <tr key={product.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {imageUrl ? (
                            <img 
                              src={imageUrl}
                              alt={product.name}
                              className="h-9 w-9 object-cover rounded border border-gray-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://cdn-icons-png.flaticon.com/512/1046/1046751.png';
                              }}
                            />
                          ) : (
                            <div className="h-9 w-9 rounded bg-gray-100 flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm font-bold text-gray-800">{product.name}</span>
                        </td>
                        {/* ✅ Description - Same size as Name (text-sm), Bold */}
                        <td className="px-5 py-3">
                          <span className="text-sm font-bold text-gray-700 line-clamp-2 block max-w-xs">
                            {product.description || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getCategoryColor(categoryName)}`}>
                            {categoryName}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm font-semibold text-gray-700">
                          {product.quantity || 0}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="text-sm font-bold text-emerald-600">₹{product.price || 0}</span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-gray-600">{getShopName(product)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {products.length > 0 && (
          <div className="mt-4 text-right">
            <p className="text-xs text-gray-400">
              Total: <span className="font-bold text-gray-600">{products.length}</span> products
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AllProducts;