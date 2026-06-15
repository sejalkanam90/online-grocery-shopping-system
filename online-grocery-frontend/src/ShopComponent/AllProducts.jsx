// src/ShopComponent/AllProducts.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [shop, setShop] = useState(null);
  const navigate = useNavigate();

  const FALLBACK_IMAGE = 'https://cdn-icons-png.flaticon.com/512/1323/1323985.png';

  useEffect(() => {
    fetchShopAndProducts();
  }, []);

  // Get current shop first, then its products
  const fetchShopAndProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Step 1: Get current logged-in user's shop
      const shopResponse = await api.get('/shops/my-shop', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (shopResponse.data?.success) {
        const currentShop = shopResponse.data.data;
        setShop(currentShop);
        
        // Step 2: Fetch products only for this shop
        await fetchProductsByShop(currentShop.id);
      } else {
        toast.error('No shop found. Please register your shop first.');
        navigate('/shop/add');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
      if (error.response?.status === 404) {
        toast.error('Please register your grocery shop first');
        navigate('/shop/add');
      } else {
        toast.error('Failed to load shop details');
      }
      setLoading(false);
    }
  };

  // Fetch products for specific shop ID
  const fetchProductsByShop = async (shopId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.get(`/product/shop/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Shop Products:", response.data);
      
      if (response.data?.success) {
        setProducts(response.data.data || []);
      } else {
        setProducts([]);
        if (response.data?.message && response.data.message !== 'No products found') {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching shop products:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load products');
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return image;
  };

  const getCategoryName = (product) => {
    if (product.categoryName) {
      return product.categoryName;
    }
    if (product.category?.name) {
      return product.category.name;
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

  const filteredProducts = products.filter(product =>
    (product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product?.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading products...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage products from {shop?.storeName || 'your store'}
          </p>
        </div>

        {/* Add Product Button */}
        <div className="mb-6 flex justify-between items-center">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* ✅ Fixed: Correct path for Add Product */}
          <button
            onClick={() => navigate('/shop/products/add')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Add Product
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">PRODUCT</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">NAME</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">DESCRIPTION</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">CATEGORY</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">QUANTITY</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">PRICE</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-5xl">📦</span>
                        <p className="font-medium">No products found in your store</p>
                        <button
                          onClick={() => navigate('/shop/products/add')}
                          className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                        >
                          Add Your First Product
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <img
                          src={getImageUrl(product.image1) || FALLBACK_IMAGE}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-800">{product.name}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm max-w-xs truncate">
                        {product.description || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {getCategoryName(product)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.quantity || 0}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-emerald-600">₹{product.price}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          
                          <button
                            onClick={() => navigate(`/shop/products/edit/${product.id}`)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition"
                          >
                            Edit
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this product?')) {
                                try {
                                  const token = localStorage.getItem('token');
                                  await api.delete(`/product/${product.id}`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  toast.success('Product deleted successfully');
                                  fetchShopAndProducts();
                                } catch (error) {
                                  toast.error('Failed to delete product');
                                }
                              }
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition"
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
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default AllProducts;