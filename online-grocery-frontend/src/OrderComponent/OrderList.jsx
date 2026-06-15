// src/OrderComponent/OrderList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!user?.id) {
        toast.error('Please login to view orders');
        navigate('/login');
        return;
      }

      const response = await api.get(`/orders/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'PROCESSING': 'bg-purple-100 text-purple-800',
      'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
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
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white mb-8">
          <h1 className="text-2xl font-bold">My Orders 📦</h1>
          <p className="text-emerald-100 mt-1">Track your order history</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-4">You haven't placed any orders</p>
            <button
              onClick={() => navigate('/')}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center flex-wrap">
                  <div>
                    <span className="text-sm text-gray-500">Order #{order.orderNumber}</span>
                    <span className="ml-3 text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                  </div>
                  <div>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="p-6">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 py-2 border-b last:border-0">
                      <img
                        src={item.product?.image1 ? `http://localhost:8085/uploads/${item.product.image1}` : 'https://via.placeholder.com/50'}
                        className="h-12 w-12 rounded object-cover"
                        alt=""
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName || item.product?.name}</h4>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <div className="font-semibold text-emerald-600">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                  
                  {/* Order Total */}
                  <div className="mt-4 pt-3 border-t text-right">
                    <p className="text-sm text-gray-500">Delivery: ₹{order.deliveryCharge || 40}</p>
                    <p className="text-lg font-bold text-emerald-600">
                      Total: ₹{order.finalAmount}
                    </p>
                  </div>
                </div>
                
                {/* Order Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    View Details →
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

export default OrderList;