// src/CustomerComponent/MyOrders.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Truck, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

// Rating Stars Component
const RatingStars = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const starSize = sizes[size] || sizes.md;
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none transition-transform hover:scale-110`}
        >
          <Star
            className={`${starSize} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 fill-none'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // ✅ Delivery Rating States
  const [ratingStates, setRatingStates] = useState({});
  const [showRatingForm, setShowRatingForm] = useState({});
  const [ratingComments, setRatingComments] = useState({});
  const [submitting, setSubmitting] = useState({});
  
  // ✅ Temporary states for modal 
  const [tempRating, setTempRating] = useState({});
  const [tempComment, setTempComment] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!user?.id) {
        toast.error('Please login');
        navigate('/login');
        return;
      }

      const response = await api.get(`/orders/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        console.log("Orders:", response.data.data);
        setOrders(response.data.data || []);
        
        // Check existing ratings for delivered orders
        checkExistingRatings(response.data.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Check if already rated
  const checkExistingRatings = async (ordersList) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    for (const order of ordersList) {
      if (order.orderStatus === 'DELIVERED') {
        // ✅ First check localStorage
        const savedRating = localStorage.getItem(`rating_order_${order.id}_user_${user.id}`);
        if (savedRating) {
          try {
            const ratingData = JSON.parse(savedRating);
            setRatingStates(prev => ({ ...prev, [order.id]: ratingData.rating }));
            continue;
          } catch(e) {}
        }
        
        // Then check API
        try {
          const response = await api.get(`/delivery-rating/check/${order.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data?.rated) {
            setRatingStates(prev => ({ ...prev, [order.id]: response.data.rating || 0 }));
            // Save to localStorage
            localStorage.setItem(`rating_order_${order.id}_user_${user.id}`, 
              JSON.stringify({ rating: response.data.rating, timestamp: Date.now() }));
          }
        } catch (error) {
          console.error('Error checking rating:', error);
        }
      }
    }
  };

  // ✅ Open rating modal
  const openRatingModal = (orderId, currentRating = 0, currentComment = '') => {
    setTempRating(prev => ({ ...prev, [orderId]: currentRating }));
    setTempComment(prev => ({ ...prev, [orderId]: currentComment }));
    setShowRatingForm(prev => ({ ...prev, [orderId]: true }));
  };

  // ✅ Close rating modal
  const closeRatingModal = (orderId) => {
    setShowRatingForm(prev => ({ ...prev, [orderId]: false }));
    // ✅ Reset temporary data 
    setTempRating(prev => ({ ...prev, [orderId]: 0 }));
    setTempComment(prev => ({ ...prev, [orderId]: '' }));
  };

  // ✅ Handle temporary rating change
  const handleTempRatingChange = (orderId, rating) => {
    setTempRating(prev => ({ ...prev, [orderId]: rating }));
  };

  // ✅ Handle temporary comment change
  const handleTempCommentChange = (orderId, comment) => {
    setTempComment(prev => ({ ...prev, [orderId]: comment }));
  };

  // ✅ Submit delivery rating
  const submitDeliveryRating = async (orderId, deliveryPersonId) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // ✅ Use tempRating, not ratingStates
    const rating = tempRating[orderId];
    
    if (!rating || rating === 0) {
      toast.error('Please select a rating (1-5 stars)');
      return;
    }

    setSubmitting(prev => ({ ...prev, [orderId]: true }));

    try {
      const response = await api.post('/delivery-rating/add', {
        orderId: Number(orderId),
        deliveryPersonId: Number(deliveryPersonId),
        rating: rating,
        comment: tempComment[orderId] || '',
        userId: user.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        // ✅ Save to localStorage permanently
        localStorage.setItem(`rating_order_${orderId}_user_${user.id}`, 
          JSON.stringify({ rating: rating, timestamp: Date.now() }));
        
        // ✅ Update main rating state
        setRatingStates(prev => ({ ...prev, [orderId]: rating }));
        
        toast.success('Thank you for rating the delivery! ⭐');
        closeRatingModal(orderId);
      } else {
        toast.error(response.data?.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  // IST Timezone formatDate function
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.orderStatus === 'PENDING' || order.orderStatus === 'PROCESSING';
    if (filter === 'delivered') return order.orderStatus === 'DELIVERED';
    if (filter === 'cancelled') return order.orderStatus === 'CANCELLED';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white mb-8">
          <h1 className="text-2xl font-bold">My Orders 📦</h1>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'delivered', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === f ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              {f === 'all' ? 'All Orders' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Product Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Shop</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Order Time</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Delivery Person</th>
                  <th className="px-4 py-3 text-left">Delivery Contact</th>
                  <th className="px-4 py-3 text-left">Delivery Time</th>
                  <th className="px-4 py-3 text-left">Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="text-center py-12 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const items = order.items || [];
                    const isDelivered = order.orderStatus === 'DELIVERED';
                    const alreadyRated = ratingStates[order.id] > 0;
                    
                    if (items.length === 0) {
                      return (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono">#{order.orderNumber}</td>
                          <td className="px-4 py-3">—</td>
                          <td className="px-4 py-3">—</td>
                          <td className="px-4 py-3">—</td>
                          <td className="px-4 py-3">{order.store?.storeName || '—'}</td>
                          <td className="px-4 py-3">—</td>
                          <td className="px-4 py-3">—</td>
                          <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.orderStatus)}`}>
                              {order.orderStatus || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-4 py-3">{order.deliveryPerson?.name || '—'}</td>
                          <td className="px-4 py-3">{order.deliveryPerson?.phone || '—'}</td>
                          <td className="px-4 py-3">{order.deliveredAt ? formatDate(order.deliveredAt) : '—'}</td>
                          <td className="px-4 py-3">
                            {isDelivered && (
                              alreadyRated ? (
                                <div className="flex items-center gap-1">
                                  <RatingStars rating={ratingStates[order.id]} readonly size="sm" />
                                  <span className="text-xs text-green-600 ml-1">✓ Rated</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => openRatingModal(order.id, 0, '')}
                                  className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition"
                                >
                                  <Truck className="w-3 h-3" />
                                  Rate Delivery
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    }
                    
                    return items.map((item, idx) => {
                      const product = item.product || {};
                      return (
                        <tr key={`${order.id}-${idx}`} className="border-b hover:bg-gray-50">
                          {idx === 0 && (
                            <td className="px-4 py-3 font-mono" rowSpan={items.length}>
                              #{order.orderNumber}
                            </td>
                          )}
                          <td className="px-4 py-3">
                            {product.image1 ? (
                              <img 
                                src={`http://localhost:8085/uploads/${product.image1}`}
                                alt=""
                                className="h-12 w-12 rounded object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                                No img
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium">{product.name || item.productName || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{product.category?.name || '—'}</td>
                          <td className="px-4 py-3">{order.store?.storeName || '—'}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-600">₹{item.price || 0}</td>
                          <td className="px-4 py-3">{item.quantity || 1}</td>
                          {idx === 0 && (
                            <>
                              <td className="px-4 py-3" rowSpan={items.length}>
                                {formatDate(order.createdAt)}
                              </td>
                              <td className="px-4 py-3" rowSpan={items.length}>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.orderStatus)}`}>
                                  {order.orderStatus || 'PENDING'}
                                </span>
                              </td>
                              <td className="px-4 py-3" rowSpan={items.length}>
                                {order.deliveryPerson?.name || '—'}
                              </td>
                              <td className="px-4 py-3" rowSpan={items.length}>
                                {order.deliveryPerson?.phone || '—'}
                              </td>
                              <td className="px-4 py-3" rowSpan={items.length}>
                                {order.deliveredAt ? formatDate(order.deliveredAt) : '—'}
                              </td>
                              <td className="px-4 py-3" rowSpan={items.length}>
                                {isDelivered && (
                                  alreadyRated ? (
                                    <div className="flex items-center gap-1">
                                      <RatingStars rating={ratingStates[order.id]} readonly size="sm" />
                                      <span className="text-xs text-green-600 ml-1">✓</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => openRatingModal(order.id, 0, '')}
                                      className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition"
                                    >
                                      <Truck className="w-3 h-3" />
                                      Rate
                                    </button>
                                  )
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    });
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ Rating Modal */}
        {orders.map((order) => {
          const isDelivered = order.orderStatus === 'DELIVERED';
          const showForm = showRatingForm[order.id];
          
          if (!isDelivered || !showForm) return null;
          
          return (
            <div key={`modal-${order.id}`} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => closeRatingModal(order.id)}>
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Truck className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold">Rate Your Delivery</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Order #{order.orderNumber} | {order.deliveryPerson?.name}
                  </p>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">How was your delivery experience?</p>
                  <RatingStars 
                    rating={tempRating[order.id] || 0} 
                    onRatingChange={(rating) => handleTempRatingChange(order.id, rating)} 
                    size="lg"
                  />
                </div>
                
                <textarea
                  value={tempComment[order.id] || ''}
                  onChange={(e) => handleTempCommentChange(order.id, e.target.value)}
                  placeholder="Share your delivery experience (optional)..."
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => closeRatingModal(order.id)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => submitDeliveryRating(order.id, order.deliveryPerson?.id)}
                    disabled={submitting[order.id]}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting[order.id] ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Rating
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <button onClick={() => navigate('/cart')} className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md">
            <span className="text-2xl">🛒</span>
            <p className="text-sm font-medium mt-1">My Cart</p>
          </button>
          <button onClick={() => navigate('/customer/orders')} className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md">
            <span className="text-2xl">📦</span>
            <p className="text-sm font-medium mt-1">My Orders</p>
          </button>
          <button onClick={() => navigate('/address/view')} className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md">
            <span className="text-2xl">📍</span>
            <p className="text-sm font-medium mt-1">Address</p>
          </button>
          <button onClick={() => navigate('/wallet')} className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md">
            <span className="text-2xl">👛</span>
            <p className="text-sm font-medium mt-1">Wallet</p>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyOrders;