import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AssignToOrders = () => {
  const [orders, setOrders] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const shopId = user.shopId || user.groceryShopId;

      const response = await api.get(`/orders/store/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        // Filter orders that are PENDING and not assigned
        const pendingOrders = (response.data.data || []).filter(
          order => order.orderStatus === 'PENDING' && !order.deliveryPersonId
        );
        setOrders(pendingOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const fetchDeliveryPersons = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const shopId = user.shopId || user.groceryShopId;

      // Get approved delivery persons for this shop
      const response = await api.get(`/delivery/shop/${shopId}/approved-persons`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        // Filter available delivery persons
        const available = (response.data.data || []).filter(
          person => person.deliveryStatus === 'AVAILABLE'
        );
        setDeliveryPersons(available);
      }
    } catch (error) {
      console.error('Error fetching delivery persons:', error);
    } finally {
      setLoading(false);
    }
  };

  const assignOrder = async (orderId, deliveryPersonId) => {
    setAssigning(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/orders/${orderId}/assign-delivery?deliveryPersonId=${deliveryPersonId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        toast.success('Order assigned successfully!');
        fetchOrders(); // Refresh orders list
      } else {
        toast.error(response.data?.message || 'Failed to assign');
      }
    } catch (error) {
      console.error('Error assigning order:', error);
      toast.error('Failed to assign order');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent"></div>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assign to Orders</h1>
            <p className="text-gray-600 text-sm mt-1">Assign delivery persons to pending orders</p>
          </div>
          <button
            onClick={() => navigate('/shop/orders')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition"
          >
            ← Back to Orders
          </button>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📦</div>
              <h3 className="text-lg font-medium text-gray-900">No Pending Orders</h3>
              <p className="text-gray-500 text-sm mt-1">All orders have been assigned to delivery persons</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assign To</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-mono">#{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.customerName || '—'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-emerald-600">₹{order.finalAmount}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          id={`delivery-${order.id}`}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          defaultValue=""
                        >
                          <option value="" disabled>Select delivery person</option>
                          {deliveryPersons.map(person => (
                            <option key={person.id} value={person.id}>
                              {person.name} - {person.deliveryStatus}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            const select = document.getElementById(`delivery-${order.id}`);
                            const deliveryPersonId = select.value;
                            if (!deliveryPersonId) {
                              toast.error('Please select a delivery person');
                              return;
                            }
                            assignOrder(order.id, parseInt(deliveryPersonId));
                          }}
                          disabled={assigning}
                          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Available Delivery Persons Info */}
        {deliveryPersons.length > 0 && (
          <div className="mt-4 text-right text-sm text-gray-500">
            Available delivery persons: {deliveryPersons.length}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AssignToOrders;