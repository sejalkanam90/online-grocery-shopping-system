import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const UpdateProductForm = () => {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    categoryId: '',
    groceryShopId: '',
    image1: null,
    image2: null,
    image3: null
  });
  const [existingImages, setExistingImages] = useState({
    image1: '',
    image2: '',
    image3: ''
  });
  const [imagePreviews, setImagePreviews] = useState({
    image1: null,
    image2: null,
    image3: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchCategories();
      fetchShopId();
    }
  }, [id]);

  // Helper function to clean image path (remove BASE_URL)
  const cleanImagePath = (path) => {
    if (!path) return '';
    return path.replace('http://localhost:8085/uploads/', '');
  };

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/product/fetch', {
        params: { productId: id },
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Product response:', response.data);
      
      if (response.data && response.data.id) {
        setFormData({
          name: response.data.name || '',
          description: response.data.description || '',
          price: response.data.price || '',
          quantity: response.data.quantity || '',
          categoryId: response.data.categoryId || '',
          groceryShopId: response.data.groceryShopId || '',
          image1: null,
          image2: null,
          image3: null
        });
        
        // ✅ Store only filename (remove BASE_URL)
        setExistingImages({
          image1: cleanImagePath(response.data.image1),
          image2: cleanImagePath(response.data.image2),
          image3: cleanImagePath(response.data.image3)
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch product');
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchShopId = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const shopId = user.shopId || user.groceryShopId;
    setFormData(prev => ({ ...prev, groceryShopId: shopId }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [key]: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({ ...prev, [key]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const groceryShopId = user.shopId || user.groceryShopId;
      
      // Update product details
      const productData = {
        productId: parseInt(id),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        categoryId: parseInt(formData.categoryId),
        groceryShopId: groceryShopId
      };
      
      await api.put('/product/update/detail', productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Upload new images if selected
      if (formData.image1 || formData.image2 || formData.image3) {
        const imageData = new FormData();
        imageData.append('productId', id);
        if (formData.image1) imageData.append('image1', formData.image1);
        if (formData.image2) imageData.append('image2', formData.image2);
        if (formData.image3) imageData.append('image3', formData.image3);
        
        await api.put('/product/update/image', imageData, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      toast.success('Product updated successfully!');
      navigate('/shop/products');
      
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:')) return imagePath;
    return `http://localhost:8085/uploads/${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Update Product</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                rows="3"
              />
            </div>
            
            {/* Price & Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>
            
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            {/* Existing Images Display */}
            {(existingImages.image1 || existingImages.image2 || existingImages.image3) && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Current Images</h3>
                <div className="flex gap-3 flex-wrap">
                  {existingImages.image1 && (
                    <div className="text-center">
                      <img 
                        src={getImageUrl(existingImages.image1)} 
                        alt="Current 1" 
                        className="h-20 w-20 object-cover rounded border"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Image 1</p>
                    </div>
                  )}
                  {existingImages.image2 && (
                    <div className="text-center">
                      <img 
                        src={getImageUrl(existingImages.image2)} 
                        alt="Current 2" 
                        className="h-20 w-20 object-cover rounded border"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Image 2</p>
                    </div>
                  )}
                  {existingImages.image3 && (
                    <div className="text-center">
                      <img 
                        src={getImageUrl(existingImages.image3)} 
                        alt="Current 3" 
                        className="h-20 w-20 object-cover rounded border"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Image 3</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* New Images Upload */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Update Images (Optional)</h3>
              <p className="text-xs text-gray-500">Upload new images to replace existing ones</p>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Image 1 (Main)</label>
                <input
                  type="file"
                  onChange={(e) => handleImageChange(e, 'image1')}
                  accept="image/*"
                  className="w-full p-1"
                />
                {imagePreviews.image1 && (
                  <img src={imagePreviews.image1} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Image 2 (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => handleImageChange(e, 'image2')}
                  accept="image/*"
                  className="w-full p-1"
                />
                {imagePreviews.image2 && (
                  <img src={imagePreviews.image2} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Image 3 (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => handleImageChange(e, 'image3')}
                  accept="image/*"
                  className="w-full p-1"
                />
                {imagePreviews.image3 && (
                  <img src={imagePreviews.image3} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                )}
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate('/shop/products')}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UpdateProductForm;