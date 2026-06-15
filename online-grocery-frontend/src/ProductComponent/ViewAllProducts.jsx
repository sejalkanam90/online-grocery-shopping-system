import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const ViewAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/product/fetch/all');
      console.log("API DATA:", response.data); // 🔥 DEBUG

      if (response.data?.success) {
        setProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const groceryShopId = user.shopId || user.groceryShopId;

        const response = await api.delete('/product/delete', {
          params: { productId: id, groceryShopId: groceryShopId },
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data?.success) {
          toast.success('Product deleted successfully!');
          fetchProducts();
        } else {
          toast.error(response.data?.message || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `http://localhost:8085/uploads/${image}`;
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
            <p className="text-gray-500 text-sm mt-1">Browse all available products</p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <span className="text-5xl">📦</span>
            <p className="text-gray-500 mt-3">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">

                {/* Image */}
                <div className="h-48 bg-gray-100">
                  <img
                    src={getImageUrl(product.image1) || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg">{product.name}</h3>

                  {/* ✅ FIXED CATEGORY */}
                  <div className="mb-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {product.categoryName || 'No Category'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mb-2">
                    {product.description || 'No description'}
                  </p>

                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-emerald-600">₹{product.price}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="w-full bg-emerald-600 text-white py-1 rounded"
                  >
                    View
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default ViewAllProducts;