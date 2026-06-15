// src/DeliveryComponent/MyOrders.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const MyOrders = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const getProductImage = (order) => {
    if (order.productImage && order.productImage !== '—') {
      return order.productImage;
    }
    if (order.items && order.items.length > 0) {
      const item = order.items[0];
      if (item.productImage && item.productImage !== '—') {
        return item.productImage;
      }
      if (item.product && item.product.image1 && item.product.image1 !== '—') {
        return `http://localhost:8085/uploads/${item.product.image1}`;
      }
    }
    return 'https://via.placeholder.com/40?text=No+Image';
  };

  const handleDirection = (order) => {
    const destAddress = order.address;
    if (!destAddress || destAddress === "Address not available") {
      toast.error("Valid delivery address is not available for this order");
      return;
    }
    navigate('/delivery/map', { state: { destination: destAddress } });
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!status) {
      toast.error('Please select a status');
      return;
    }
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await api.put(`/orders/${orderId}/status?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        toast.success(`Order status updated to ${status}`);
        setShowStatusModal(false);
        fetchMyOrders(userData.id);
      } else {
        toast.error(response.data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Internal Server Error while updating status');
    } finally {
      setUpdating(false);
    }
  };

  const fetchMyOrders = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(`/orders/delivery/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("API Response:", response.data);
      
      if (response.data?.success) {
        const orderData = response.data.data || [];
        setOrders(orderData);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("Failed to load your delivery assignments");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === 'DELIVERED') return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">✅ Delivered</span>;
    if (s === 'OUT_FOR_DELIVERY') return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">🚚 On the Way</span>;
    if (s === 'ASSIGNED') return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">📦 Assigned</span>;
    if (s === 'CANCELLED') return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">❌ Cancelled</span>;
    return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">⏳ {status || 'PENDING'}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData && userData.id) {
      setUser(userData);
      fetchMyOrders(userData.id);
    } else {
      navigate('/login');
    }
  }, []);

  const filteredOrders = orders.filter(order =>
    (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Delivery Orders</h1>
            <p className="text-gray-500 text-sm mt-1">Track your delivery orders</p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter Order Id..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* ✅ Table Headers - Always Visible */}
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Order Id</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Product Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Order Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Order Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-5xl mb-3">📦</span>
                        <p className="text-gray-500 text-lg font-medium">No delivery orders found</p>
                        <p className="text-gray-400 text-sm mt-1">You don't have any assigned orders yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-mono text-sm font-bold text-blue-600">
                        #{order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <img 
                          src={getProductImage(order)} 
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200" 
                          alt="product"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/40?text=No+Image'}
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {order.productName || 'Product'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {order.category || '—'}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">
                        ₹{order.price || order.finalAmount}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {order.quantity || '1'}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {formatDate(order.createdAt)}<br/>
                        <span className="text-gray-400">{formatTime(order.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.orderStatus)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {order.orderStatus !== 'DELIVERED' ? (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setSelectedStatus(order.orderStatus);
                                  setShowStatusModal(true);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                              >
                                Update Status
                              </button>
                              <button
                                onClick={() => handleDirection(order)}
                                className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                              >
                                Direction
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleDirection(order)}
                              className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                            >
                              Direction
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {orders.length > 0 && (
          <div className="mt-4 text-right text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 text-center">Update Delivery Status</h2>
              <p className="text-center text-sm text-gray-500 mt-1">Order #{selectedOrder.orderNumber}</p>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Order Status</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, selectedStatus)}
                  disabled={updating}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyOrders;