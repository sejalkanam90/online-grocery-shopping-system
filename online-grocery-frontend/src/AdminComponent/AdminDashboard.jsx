// src/AdminComponent/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    shops: 0,
    users: 0,
    deliveries: 0,
    orders: 0,
    customers: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentOrders();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log("No token found");
        navigate('/login');
        return;
      }

      // ✅ Fixed URLs as per your backend
      const [shopsRes, usersRes, ordersRes] = await Promise.all([
        api.get('/shops', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/users', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/orders/all', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      console.log("Shops Response:", shopsRes.data);
      console.log("Users Response:", usersRes.data);
      console.log("Orders Response:", ordersRes.data);

      const allUsers = usersRes.data?.data || [];
      const allOrders = ordersRes.data?.data || [];
      
      const customers = allUsers.filter(user => user.role === 'CUSTOMER').length;
      const deliveries = allUsers.filter(user => user.role === 'DELIVERY').length;
      
      setStats({
        shops: shopsRes.data?.data?.length || 0,
        users: allUsers.length,
        deliveries: deliveries,
        orders: allOrders.length,
        customers: customers
      });
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.get('/orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        const orders = response.data.data || [];
        setRecentOrders(orders.slice(0, 5)); // Last 5 orders
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        
        {/* Stats Cards - 5 cards now (Revenue removed) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Grocery Shops */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Grocery Shops</h3>
              <span className="text-2xl">🏪</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.shops}</p>
            <p className="text-xs text-gray-400 mt-2">Total registered shops</p>
          </div>
          
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.users}</p>
            <p className="text-xs text-gray-400 mt-2">All registered users</p>
          </div>
          
          {/* Customers */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Customers</h3>
              <span className="text-2xl">🛒</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.customers}</p>
            <p className="text-xs text-gray-400 mt-2">Active customers</p>
          </div>
          
          {/* Delivery Persons */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Delivery Persons</h3>
              <span className="text-2xl">🚚</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.deliveries}</p>
            <p className="text-xs text-gray-400 mt-2">Available for delivery</p>
          </div>
          
          {/* Total Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{stats.orders}</p>
            <p className="text-xs text-gray-400 mt-2">Orders placed</p>
          </div>
        </div>
        
        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        #{order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {order.user?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-600">
                        ₹{order.finalAmount || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <button
            onClick={() => navigate('/admin/shops')}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-2xl">🏪</span>
            <p className="text-sm font-medium text-gray-700 mt-1">Manage Shops</p>
          </button>
          <button
            onClick={() => navigate('/admin/customers')}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-2xl">👥</span>
            <p className="text-sm font-medium text-gray-700 mt-1">Manage Users</p>
          </button>
          <button
            onClick={() => navigate('/admin/orders/all')}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-2xl">📦</span>
            <p className="text-sm font-medium text-gray-700 mt-1">View Orders</p>
          </button>
          <button
            onClick={() => navigate('/admin/deliveries')}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-2xl">🚚</span>
            <p className="text-sm font-medium text-gray-700 mt-1">Deliveries</p>
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;