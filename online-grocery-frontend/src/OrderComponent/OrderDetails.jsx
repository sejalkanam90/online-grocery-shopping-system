// src/OrderComponent/OrderDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await api.get(`/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="text-center py-20">
          <h2 className="text-xl font-bold">Order not found</h2>
          <button onClick={() => navigate('/orders')} className="mt-4 text-emerald-600">Back to Orders</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white mb-8">
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-emerald-100 mt-1">Order #{order.orderNumber}</p>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500">Order Status</span>
              <p className={`inline-flex ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.orderStatus)}`}>
                {order.orderStatus}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Placed on</p>
              <p>{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-bold mb-3">Delivery Address</h2>
          {order.address ? (
            <div className="text-gray-600">
              <p>{order.address.addressLine1}</p>
              <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
            </div>
          ) : (
            <p className="text-gray-400">No address saved for this order</p>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <h2 className="font-bold p-6 pb-0">Order Items</h2>
          <div className="p-6 space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 py-2 border-b last:border-0">
                <div className="flex-1">
                  <h4 className="font-medium">{item.productName}</h4>
                  <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                </div>
                <div className="font-semibold">₹{item.price * item.quantity}</div>
              </div>
            ))}
            <div className="pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Charge</span>
                <span>₹{order.deliveryCharge || 40}</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total</span>
                <span className="text-emerald-600">₹{order.finalAmount}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/orders')}
          className="text-emerald-600 hover:text-emerald-700"
        >
          ← Back to Orders
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default OrderDetails;