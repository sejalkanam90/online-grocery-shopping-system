// src/ProductComponent/ProductDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';
import ProductReviews from '../ReviewComponent/ProductReviews';

const ProductDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [latestOrderId, setLatestOrderId] = useState(null);
  const [deliveryPersonId, setDeliveryPersonId] = useState(null);
  const navigate = useNavigate();

  const FALLBACK_IMAGE = 'https://cdn-icons-png.flaticon.com/512/1323/1323985.png';

  useEffect(() => {
    fetchProduct();
    fetchUserOrders();
  }, [id, searchParams]);

  const fetchProduct = async () => {
    let productId = id || searchParams.get('productId');
    
    if (!productId || isNaN(Number(productId))) {
      console.error('Invalid product ID:', productId);
      toast.error('Invalid product ID');
      navigate('/shop/products');
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/product/fetch', { 
        params: { productId: Number(productId) }
      });
      
      if (response.data && response.data.id) {
        setProduct(response.data);
        if (response.data.groceryShopId) {
          fetchStoreDetails(response.data.groceryShopId);
          fetchRelatedProducts(response.data.categoryId, response.data.id);
        }
      } else {
        toast.error('Product not found');
        navigate('/shop/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/shop/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreDetails = async (storeId) => {
    try {
      const response = await api.get('/shops/approved');
      if (response.data?.success) {
        const foundStore = response.data.data.find(shop => Number(shop.id) === Number(storeId));
        setStore(foundStore || null);
      }
    } catch (error) {
      console.error('Error fetching store:', error);
    }
  };

  const fetchRelatedProducts = async (categoryId, currentProductId) => {
    try {
      const response = await api.get(`/product/fetch/category-wise`, {
        params: { categoryId: categoryId }
      });
      
      if (response.data?.success && response.data.data) {
        const filtered = response.data.data.filter(p => p.id !== currentProductId);
        setRelatedProducts(filtered.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const fetchUserOrders = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.id || user.role !== 'CUSTOMER') return;
    
    try {
      const response = await api.get('/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success && response.data.data?.length > 0) {
        // Get the latest completed order for this product
        const productOrders = response.data.data.filter(
          order => order.productId === Number(id) && order.status === 'DELIVERED'
        );
        
        if (productOrders.length > 0) {
          const latestOrder = productOrders[0];
          setLatestOrderId(latestOrder.id);
          setDeliveryPersonId(latestOrder.deliveryPersonId);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `http://localhost:8085/uploads/${image}`;
  };

  const getProductImages = () => {
    const images = [];
    const uniqueImages = new Set();
    
    if (product?.image1 && product.image1 !== 'null' && product.image1 !== '') uniqueImages.add(product.image1);
    if (product?.image2 && product.image2 !== 'null' && product.image2 !== '') uniqueImages.add(product.image2);
    if (product?.image3 && product.image3 !== 'null' && product.image3 !== '') uniqueImages.add(product.image3);
    
    uniqueImages.forEach(img => images.push(getImageUrl(img)));
    
    if (images.length === 0) images.push(FALLBACK_IMAGE);
    
    return images;
  };

  const nextImage = () => {
    const images = getProductImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getProductImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const addToCart = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.id) {
      toast.error('Please login to buy the products!!!');
      navigate('/login');
      return;
    }

    if (user.role !== 'CUSTOMER') {
      toast.error('Only customers can add products to cart!');
      return;
    }
    
    if (!product || !product.id) {
      toast.error('Product not found');
      return;
    }
    
    try {
      const response = await api.post('/cart/add', {
        userId: user.id,
        productId: product.id,
        quantity: quantity
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        toast.success(`${quantity} x ${product?.name} added to cart!`);
      } else {
        toast.error(response.data?.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error("Add to Cart Error:", error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const goToProduct = (productId) => {
    navigate(`/product/${productId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-emerald-500 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <span className="text-6xl">📦</span>
            <h2 className="text-2xl font-bold mt-4 text-gray-800">Product Not Found</h2>
            <button 
              onClick={() => navigate('/stores')} 
              className="mt-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2 rounded-lg"
            >
              Back to Stores
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const productImages = getProductImages();
  const hasMultipleImages = productImages.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex text-sm">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-emerald-600 transition">Home</button>
            <span className="mx-2 text-gray-400">/</span>
            <button onClick={() => navigate('/stores')} className="text-gray-500 hover:text-emerald-600 transition">Stores</button>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-emerald-700 font-semibold">{product.name}</span>
          </nav>
        </div>

        {/* Main Product Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* LEFT - Full Image Slider Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-md mx-auto">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
                  <img 
                    src={productImages[currentImageIndex]} 
                    alt={product.name}
                    className="w-full h-full object-contain p-4 transition-all duration-300"
                    onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                  />
                </div>
                
                {hasMultipleImages && (
                  <>
                    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110 z-10">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110 z-10">
                      <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {currentImageIndex + 1} / {productImages.length}
                    </div>
                  </>
                )}
              </div>
              
              {hasMultipleImages && (
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  {productImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectImage(idx)}
                      className={`w-16 h-16 rounded-lg border-2 cursor-pointer transition overflow-hidden ${
                        currentImageIndex === idx ? 'border-emerald-500 shadow-md scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* RIGHT - Product Info */}
            <div className="p-6 lg:p-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-3">{product.name}</h1>
              
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Description</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{product.description || 'Fresh organic product from local farms.'}</p>
              </div>
              
              <div className="mb-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Store Details</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold text-emerald-800">Name:</span> {store?.storeName || product.groceryShopName || 'Grocery Store'}<br />
                  <span className="font-semibold text-emerald-800">Contact:</span> {store?.email || product.groceryShopEmail || 'Not available'}
                </p>
              </div>
              
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Price</h3>
                </div>
                <p className="text-3xl font-bold text-emerald-600">₹{product.price}</p>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">Quantity</h3>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition">-</button>
                    <input type="number" value={quantity} min="1" max={product.quantity || 100} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center py-2 focus:outline-none" />
                    <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 transition">+</button>
                  </div>
                  <span className="text-sm text-gray-500">{product.quantity || 300} units available</span>
                </div>
              </div>
              
              <button onClick={addToCart} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M18 13l1.5 6M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        
        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-emerald-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">Related Products</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div 
                  key={relatedProduct.id} 
                  onClick={() => goToProduct(relatedProduct.id)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 group"
                >
                  <div className="h-48 overflow-hidden bg-gray-100">
                    <img 
                      src={getImageUrl(relatedProduct.image1) || FALLBACK_IMAGE}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 truncate">{relatedProduct.name}</h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                      {relatedProduct.description || 'Fresh organic product from local farms.'}
                    </p>
                    <p className="text-emerald-600 font-bold mt-2">₹{relatedProduct.price}</p>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                        if (!user.id) {
                          toast.error('Please login first');
                          navigate('/login');
                          return;
                        }
                        if (user.role !== 'CUSTOMER') {
                          toast.error('Only customers can add to cart');
                          return;
                        }
                        try {
                          const token = localStorage.getItem('token');
                          await api.post('/cart/add', {
                            userId: user.id,
                            productId: relatedProduct.id,
                            quantity: 1
                          }, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          toast.success(`1 x ${relatedProduct.name} added to cart!`);
                        } catch (error) {
                          toast.error('Failed to add to cart');
                        }
                      }}
                      className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Product Reviews Section - Both Product Review and Delivery Rating */}
        <div className="mt-12">
          <ProductReviews 
            productId={product.id}
            productName={product.name}
            orderId={latestOrderId}
            deliveryPersonId={deliveryPersonId}
          />
        </div>
        
        {/* Back Button */}
        <div className="mt-8 text-center">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </button>
        </div>
        
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetails;