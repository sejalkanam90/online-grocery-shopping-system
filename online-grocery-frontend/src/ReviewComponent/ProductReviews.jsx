// src/ReviewComponent/ProductReviews.jsx
import React, { useState, useEffect } from 'react';
import { Star, User, Truck, Send, ThumbsUp, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

// Rating Stars Component (इथेच)
const RatingStars = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const starSize = sizes[size] || sizes.md;
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none`}
        >
          <Star className={`${starSize} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 fill-none'}`} />
        </button>
      ))}
    </div>
  );
};

// Main Component
const ProductReviews = ({ productId, productName, orderId, deliveryPersonId }) => {
  const [activeTab, setActiveTab] = useState('product'); // 'product' or 'delivery'
  const [productReviews, setProductReviews] = useState([]);
  const [productRating, setProductRating] = useState(0);
  
  // Product Review Form
  const [productRatingVal, setProductRatingVal] = useState(5);
  const [productComment, setProductComment] = useState('');
  
  // Delivery Rating
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [deliveryComment, setDeliveryComment] = useState('');
  const [hasRatedDelivery, setHasRatedDelivery] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    fetchProductReviews();
    checkDeliveryRating();
  }, [productId]);

  const fetchProductReviews = async () => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      if (response.data?.success) {
        setProductReviews(response.data.data || []);
        const avg = response.data.data.reduce((sum, r) => sum + r.rating, 0) / (response.data.data.length || 1);
        setProductRating(avg);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDeliveryRating = async () => {
    if (!orderId) return;
    try {
      const response = await api.get(`/delivery-rating/check/${orderId}`);
      if (response.data?.rated) {
        setHasRatedDelivery(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const submitProductReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token || !currentUser?.id) {
      toast.error('Please login to submit review');
      return;
    }
    
    if (!productComment.trim()) {
      toast.error('Please write a review');
      return;
    }
    
    try {
      const response = await api.post('/reviews/product/add', {
        productId: Number(productId),
        rating: productRatingVal,
        comment: productComment.trim(),
        userId: currentUser.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        toast.success('Review submitted!');
        setProductComment('');
        setProductRatingVal(5);
        fetchProductReviews();
      }
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const submitDeliveryRating = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token || !currentUser?.id) {
      toast.error('Please login to rate delivery');
      return;
    }
    
    if (!orderId) {
      toast.error('No order found');
      return;
    }
    
    try {
      const response = await api.post('/delivery-rating/add', {
        orderId: Number(orderId),
        deliveryPersonId: Number(deliveryPersonId),
        rating: deliveryRating,
        comment: deliveryComment.trim(),
        userId: currentUser.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        toast.success('Thanks for rating the delivery!');
        setHasRatedDelivery(true);
        setDeliveryComment('');
      }
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="mt-10">
      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('product')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition ${
            activeTab === 'product' 
              ? 'border-b-2 border-emerald-600 text-emerald-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Star className="w-4 h-4" />
          Product Reviews ({productReviews.length})
        </button>
        
        {orderId && (
          <button
            onClick={() => setActiveTab('delivery')}
            className={`flex items-center gap-2 px-4 py-2 font-medium transition ${
              activeTab === 'delivery' 
                ? 'border-b-2 border-emerald-600 text-emerald-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Truck className="w-4 h-4" />
            Rate Delivery Person
          </button>
        )}
      </div>

      {/* Product Reviews Tab */}
      {activeTab === 'product' && (
        <div className="space-y-6">
          {/* Write Review */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="font-semibold mb-3">Write Review for {productName}</h3>
            <form onSubmit={submitProductReview} className="space-y-3">
              <RatingStars rating={productRatingVal} onRatingChange={setProductRatingVal} size="lg" />
              <textarea
                value={productComment}
                onChange={(e) => setProductComment(e.target.value)}
                placeholder="Share your experience..."
                rows="3"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                <Send className="w-4 h-4" /> Submit Review
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RatingStars rating={Math.round(productRating)} readonly />
              <span className="text-sm text-gray-500">({productReviews.length} reviews)</span>
            </div>
            
            {productReviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No reviews yet. Be the first!</p>
            ) : (
              productReviews.map(review => (
                <div key={review.id} className="bg-white rounded-lg border p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{review.user?.name || 'Anonymous'}</p>
                      <RatingStars rating={review.rating} readonly size="sm" />
                    </div>
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Delivery Rating Tab */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          {hasRatedDelivery ? (
            <div className="text-center py-8 bg-green-50 rounded-xl">
              <span className="text-4xl">✅</span>
              <p className="text-green-600 mt-2">Thank you for rating the delivery!</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mt-2">Rate Your Delivery Experience</h3>
                <p className="text-sm text-gray-500">How was your delivery person?</p>
              </div>
              
              <form onSubmit={submitDeliveryRating} className="space-y-4">
                <div className="text-center">
                  <RatingStars rating={deliveryRating} onRatingChange={setDeliveryRating} size="xl" />
                </div>
                
                <textarea
                  value={deliveryComment}
                  onChange={(e) => setDeliveryComment(e.target.value)}
                  placeholder="Share your delivery experience (optional)..."
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Truck className="w-4 h-4" /> Submit Delivery Rating
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;