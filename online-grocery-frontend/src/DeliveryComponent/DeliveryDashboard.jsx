// src/DeliveryComponent/DeliveryDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Award, Calendar, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const DeliveryDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);

  const [stats, setStats] = useState({
    todayDeliveries: 0,
    weekDeliveries: 0,
    totalDeliveries: 0,
    rating: 0,
    totalRatings: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assigned');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);

    if (userData?.id) {
      fetchDashboardData(userData.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (userId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await api.get(`/orders/delivery/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        const allOrders = response.data.data || [];

        const assigned = allOrders.filter(
          (o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
        );

        const completed = allOrders.filter((o) => o.orderStatus === 'DELIVERED');

        setAssignedOrders(assigned);
        setCompletedOrders(completed);

        const today = new Date().toDateString();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const todayOrders = completed.filter((o) => {
          if (!o.deliveredAt) return false;
          return new Date(o.deliveredAt).toDateString() === today;
        });

        const weekOrders = completed.filter((o) => {
          if (!o.deliveredAt) return false;
          return new Date(o.deliveredAt) >= weekAgo;
        });

        let totalRating = 0;
        let ratedOrdersCount = 0;
        let ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

        completed.forEach((order) => {
          if (order.deliveryRating && order.deliveryRating > 0) {
            totalRating += order.deliveryRating;
            ratedOrdersCount++;
            const roundedRating = Math.floor(order.deliveryRating);
            if (ratingDist[roundedRating]) ratingDist[roundedRating]++;
          }
        });

        const averageRating = ratedOrdersCount > 0 ? (totalRating / ratedOrdersCount) : 0;

        setStats({
          todayDeliveries: todayOrders.length,
          weekDeliveries: weekOrders.length,
          totalDeliveries: completed.length,
          rating: averageRating,
          totalRatings: ratedOrdersCount,
          ratingDistribution: ratingDist
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard');
      setAssignedOrders([]);
      setCompletedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ASSIGNED':
        return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">📦 Assigned</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">🚚 Out For Delivery</span>;
      case 'DELIVERED':
        return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">✅ Delivered</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStarRating = (rating) => {
    const numRating = parseFloat(rating);
    if (numRating === 0) return 'Not rated yet';
    
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '⭐';
    if (hasHalfStar) stars += '½';
    
    return `${stars} (${numRating.toFixed(1)})`;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-emerald-600';
    if (rating >= 2.5) return 'text-yellow-600';
    if (rating >= 1.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const renderRatingBars = () => {
    const { ratingDistribution, totalRatings } = stats;
    if (totalRatings === 0) {
      return <p className="text-gray-400 text-sm text-center py-4">No ratings yet</p>;
    }

    return [5, 4, 3, 2, 1].map(star => {
      const count = ratingDistribution[star] || 0;
      const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
      
      return (
        <div key={star} className="flex items-center gap-2 mb-2">
          <span className="text-sm w-8">{star} ⭐</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-12">{count}</span>
        </div>
      );
    });
  };

  const handleOrderClick = (orderId) => {
    navigate(`/delivery/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-[70vh]">
          <div className="h-14 w-14 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* TOP HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-3xl p-6 text-white shadow-lg mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-emerald-100 mt-2">
                Ready for today's delivery journey 🚴
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-full">
              <span className="text-5xl">🏍️</span>
            </div>
          </div>
        </motion.div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Today's Delivery
                </p>
                <h2 className="text-3xl font-bold mt-2">{stats.todayDeliveries}</h2>
              </div>
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl">📦</div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> Weekly Delivery
                </p>
                <h2 className="text-3xl font-bold mt-2">{stats.weekDeliveries}</h2>
              </div>
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">📅</div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Truck className="w-4 h-4" /> Total Deliveries
                </p>
                <h2 className="text-3xl font-bold mt-2">{stats.totalDeliveries}</h2>
              </div>
              <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center text-2xl">🎯</div>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Award className="w-4 h-4" /> Rating
                </p>
                <div className="mt-2">
                  {stats.rating > 0 ? (
                    <>
                      <h2 className={`text-2xl font-bold ${getRatingColor(stats.rating)}`}>
                        {getStarRating(stats.rating)}
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Based on {stats.totalRatings} {stats.totalRatings === 1 ? 'review' : 'reviews'}
                      </p>
                    </>
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-400">Not rated yet</h2>
                  )}
                </div>
              </div>
              <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl">🌟</div>
            </div>
          </motion.div>
        </div>

        {/* Rating Details Section */}
        {stats.totalRatings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-5 mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <h3 className="font-semibold text-gray-800">Rating Details</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className={`text-5xl font-bold ${getRatingColor(stats.rating)}`}>
                  {stats.rating.toFixed(1)}
                </div>
                <div className="flex justify-center mt-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(stats.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Based on {stats.totalRatings} {stats.totalRatings === 1 ? 'rating' : 'ratings'}
                </p>
              </div>
              
              <div>
                {renderRatingBars()}
              </div>
            </div>
          </motion.div>
        )}

        {/* ORDERS SECTION */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">

          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`flex-1 py-4 font-semibold transition ${
                activeTab === 'assigned'
                  ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500'
              }`}
            >
              📋 Assigned ({assignedOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-4 font-semibold transition ${
                activeTab === 'completed'
                  ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500'
              }`}
            >
              ✅ Completed ({completedOrders.length})
            </button>
          </div>

          <div className="p-5">
            {activeTab === 'assigned' && assignedOrders.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-3">📭</div>
                <p className="text-gray-500 text-lg">No Assigned Orders</p>
              </div>
            )}

            {activeTab === 'completed' && completedOrders.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-3">🎯</div>
                <p className="text-gray-500 text-lg">No Completed Orders</p>
              </div>
            )}

            {activeTab === 'assigned' && (
              <div className="space-y-4">
                {assignedOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleOrderClick(order.id)}
                    className="border rounded-2xl p-5 cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex justify-between flex-wrap gap-4">
                      <div>
                        <p className="text-sm text-gray-400 font-mono">#{order.orderNumber || order.id}</p>
                        <h3 className="font-bold text-lg mt-1">{order.groceryShop || order.shop?.storeName || 'Shop'}</h3>
                        <p className="text-gray-500 text-sm mt-1">👤 {order.customer || order.user?.name || 'Customer'}</p>
                      </div>
                      <div className="text-right">
                        <div className="mb-2">{getStatusBadge(order.orderStatus)}</div>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'completed' && (
              <div className="space-y-4">
                {completedOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleOrderClick(order.id)}
                    className="border rounded-2xl p-5 bg-gray-50 cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex justify-between flex-wrap gap-4">
                      <div>
                        <p className="text-sm text-gray-400 font-mono">#{order.orderNumber || order.id}</p>
                        <h3 className="font-bold text-lg mt-1">{order.groceryShop || order.shop?.storeName || 'Shop'}</h3>
                        <p className="text-gray-500 text-sm mt-1">👤 {order.customer || order.user?.name || 'Customer'}</p>
                        
                        {order.deliveryRating && order.deliveryRating > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= Math.floor(order.deliveryRating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-medium text-amber-600">
                              {order.deliveryRating.toFixed(1)} / 5
                            </span>
                            {order.deliveryComment && (
                              <span className="text-xs text-gray-400 ml-2">
                                💬 "{order.deliveryComment.substring(0, 30)}..."
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="mb-2">{getStatusBadge(order.orderStatus)}</div>
                        <p className="text-xs text-gray-500">{formatDate(order.deliveredAt || order.createdAt)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DeliveryDashboard;