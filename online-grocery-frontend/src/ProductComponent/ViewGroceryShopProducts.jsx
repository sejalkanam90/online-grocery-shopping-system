// src/ProductComponent/ViewGroceryShopProducts.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ViewGroceryShopProducts = () => {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (shopId) {
      fetchShopDetails();
      fetchProducts();
    }
  }, [shopId]);

  const fetchShopDetails = async () => {
    try {
      const response = await api.get(`/shops/user/${shopId}`);
      if (response.data?.success) {
        setShop(response.data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/product/fetch/groceryShop-wise', {
        params: { groceryShopId: shopId }
      });
      if (response.data?.success) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) => {
    return image ? `http://localhost:8085/uploads/${image}` : null;
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Shop Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 mb-8 text-white">
        <h1 className="text-2xl font-bold">{shop?.storeName || 'Grocery Shop'}</h1>
        <p className="mt-1">{shop?.address}, {shop?.city}</p>
        <p className="mt-2">⭐ {shop?.rating || 'New'} | 📞 {shop?.user?.phone || 'N/A'}</p>
      </div>
      
      {/* Products */}
      <h2 className="text-xl font-bold mb-4">Our Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
            <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
              {getImageUrl(product.image1) ? (
                <img src={getImageUrl(product.image1)} alt={product.name} className="h-full w-full object-cover rounded-lg" />
              ) : (
                <span className="text-4xl">🛒</span>
              )}
            </div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xl font-bold text-green-600">₹{product.price}</span>
              <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center py-10 text-gray-500">No products available</div>
      )}
    </div>
  );
};

export default ViewGroceryShopProducts;