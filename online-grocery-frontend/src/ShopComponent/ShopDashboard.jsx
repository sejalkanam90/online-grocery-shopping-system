import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const ShopDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!user?.id) return;

      // ================= SHOP =================
      const shopResponse = await api.get(`/shops/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const shopData = shopResponse.data?.data;
      setShop(shopData);

      if (!shopData?.id) return;

      // ================= PRODUCTS =================
      const productsResponse = await api.get(
        '/product/fetch/groceryShop-wise',
        {
          params: { groceryShopId: shopData.id },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const totalProducts = productsResponse.data?.data?.length || 0;

      // ================= ORDERS =================
      const ordersResponse = await api.get(
        `/orders/store/${shopData.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const ordersList = ordersResponse.data?.data || [];

      const totalOrders = ordersList.length;
      const pendingOrders = ordersList.filter(
        o => o.orderStatus === 'PENDING'
      ).length;

      const totalRevenue = ordersList.reduce(
        (sum, o) => sum + (o.finalAmount || 0),
        0
      );

      // latest 5 orders
      setOrders(ordersList.slice(-5).reverse());

      setStats({
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue
      });

    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: '📦', color: 'bg-blue-500' },
    { title: 'Total Orders', value: stats.totalOrders, icon: '📋', color: 'bg-green-500' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: '⏳', color: 'bg-yellow-500' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: '💰', color: 'bg-purple-500' },
  ];

  const quickActions = [
    { title: 'Add Product', link: '/shop/products/add', icon: '➕', color: 'bg-green-100' },
    { title: 'Manage Products', link: '/shop/products', icon: '📦', color: 'bg-blue-100' },
    { title: 'View Orders', link: '/shop/orders', icon: '📋', color: 'bg-yellow-100' },
    { title: 'Manage Categories', link: '/shop/categories', icon: '📁', color: 'bg-purple-100' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏪</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {shop?.ownerName || 'Shop Owner'}!
              </h1>
              <p className="text-gray-500 text-sm">
                {shop?.storeName} • {shop?.city}
              </p>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-5">
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((a, i) => (
              <Link key={i} to={a.link} className="bg-white p-4 rounded-xl text-center shadow-sm">
                <div className={`h-12 w-12 ${a.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                  {a.icon}
                </div>
                <p className="text-sm font-medium">{a.title}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-green-600 text-white px-6 py-3 font-semibold">
            Recent Orders
          </div>

          <div className="p-6">

            {orders.length === 0 ? (
              <p className="text-center text-gray-500">No orders found</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Order ID</th>
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-left">Amount</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-3 text-blue-600">
                        {order.orderId || order.id}
                      </td>

                      <td className="p-3">
                        {order.customerName || "Customer"}
                      </td>

                      <td className="p-3">
                        ₹{order.finalAmount || 0}
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus || 'PENDING'}
                        </span>
                      </td>

                      <td className="p-3">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : new Date().toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default ShopDashboard;