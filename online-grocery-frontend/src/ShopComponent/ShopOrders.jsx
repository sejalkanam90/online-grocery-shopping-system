// src/ShopComponent/ShopOrders.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const ShopOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState('');
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [shop, setShop] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShopData();
    fetchOrders();
  }, []);

  const fetchShopData = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const shopResponse = await api.get(`/shops/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (shopResponse.data?.success) {
        const shopData = shopResponse.data.data;
        setShop(shopData);
        fetchDeliveryPersons(shopData.id);
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const storeId = user.shopId || user.groceryShopId || shop?.id || 1;
      
      const response = await api.get(`/orders/store/${storeId}/old-format`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        const ordersData = response.data.data || [];
        
        const normalizedOrders = ordersData.map((order, index) => ({
          ...order,
          numericId: order.id || index + 1,
          deliveryPerson: order.deliveryPerson || order.deliveryPersonName || order.deliveryBoy || 'Pending',
          deliveryPersonPhone: order.deliveryPersonPhone || order.deliveryContact || null,
          deliveryStatus: order.deliveryStatus || 'PENDING',
          deliveredAt: order.deliveredAt || null,
          orderStatus: order.orderStatus || 'Pending'
        }));
        
        setOrders(normalizedOrders);
      } else {
        toast.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPersons = async (shopId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.get(`/delivery/shop/${shopId}/approved-persons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        const persons = response.data.data || [];
        const availablePersons = persons.filter(p => p.deliveryStatus === 'AVAILABLE');
        setDeliveryPersons(availablePersons);
      } else {
        setDeliveryPersons([]);
      }
    } catch (error) {
      console.error('Error fetching delivery persons:', error);
      setDeliveryPersons([]);
    }
  };

  const canAssignDelivery = (order) => {
    if (order.orderStatus === 'Delivered') return false;
    if (order.orderStatus === 'Cancelled') return false;
    
    const isAssigned = order.deliveryPerson && 
                       order.deliveryPerson !== 'Not Assigned' &&
                       order.deliveryPerson !== 'NOT_ASSIGNED' &&
                       order.deliveryPerson !== '' &&
                       order.deliveryPerson !== null &&
                       order.deliveryPerson !== 'Pending';
    
    return !isAssigned;
  };

  const handleAssignDelivery = (order) => {
    const isAssigned = order.deliveryPerson && 
                       order.deliveryPerson !== 'Not Assigned' &&
                       order.deliveryPerson !== 'NOT_ASSIGNED' &&
                       order.deliveryPerson !== '' &&
                       order.deliveryPerson !== 'Pending';
    
    if (isAssigned) {
      toast.error(`Delivery already assigned to ${order.deliveryPerson}`);
      return;
    }
    
    setSelectedOrder(order);
    setSelectedDeliveryPersonId('');
    setShowAssignModal(true);
  };

  const confirmAssignDelivery = async () => {
    if (!selectedDeliveryPersonId) {
      toast.error('Please select a delivery person');
      return;
    }

    setAssigning(true);
    
    try {
      const token = localStorage.getItem('token');
      const orderIdForApi = selectedOrder.numericId || selectedOrder.id;
      
      const response = await api.put(`/orders/${orderIdForApi}/assign-delivery`, null, {
        params: { deliveryPersonId: selectedDeliveryPersonId },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        toast.success('Delivery person assigned successfully!');
        
        const assignedPerson = deliveryPersons.find(p => p.id === parseInt(selectedDeliveryPersonId));
        const personName = assignedPerson?.name || 'Assigned';
        const personPhone = assignedPerson?.phone || '—';
        
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.orderId === selectedOrder.orderId 
              ? { ...order, deliveryPerson: personName, deliveryPersonPhone: personPhone, deliveryStatus: 'Assigned' }
              : order
          )
        );
        
        setShowAssignModal(false);
        setSelectedDeliveryPersonId('');
        
        setTimeout(() => {
          fetchOrders();
          if (shop?.id) fetchDeliveryPersons(shop.id);
        }, 1000);
      } else {
        toast.error(response.data?.message || 'Failed to assign delivery person');
      }
    } catch (error) {
      console.error('Error assigning delivery:', error);
      toast.error(error.response?.data?.message || 'Failed to assign delivery person');
    } finally {
      setAssigning(false);
    }
  };

  const handlePrintReceipt = (order) => {
    const shopEmail = order.shopEmail || 'shop@example.com';
    const shopName = order.groceryShop || shop?.storeName || 'GroceryShop';
    const totalAmount = (order.price || 0) * (order.quantity || 1);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt - ${order.orderId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .receipt { max-width: 400px; margin: 0 auto; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #2e7d32; padding-bottom: 10px; margin-bottom: 15px; }
            .header h2 { color: #2e7d32; margin: 0; }
            .header p { color: #666; font-size: 12px; margin-top: 5px; }
            .row { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; border-bottom: 1px dotted #eee; }
            .total { font-weight: bold; border-top: 2px solid #333; border-bottom: none; padding-top: 10px; margin-top: 5px; }
            .total span { color: #2e7d32; }
            .footer { text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 11px; color: #888; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>${shopName}</h2>
              <p>Order Receipt</p>
            </div>
            <div class="row"><strong>Order ID:</strong><span>${order.orderId}</span></div>
            <div class="row"><strong>Customer:</strong><span>${order.customer || '—'}</span></div>
            <div class="row"><strong>Product:</strong><span>${order.productName || '—'}</span></div>
            <div class="row"><strong>Quantity:</strong><span>${order.quantity || 1}</span></div>
            <div class="row"><strong>Price:</strong><span>₹${order.price || 0}</span></div>
            <div class="row total"><strong>Total:</strong><span>₹${totalAmount}</span></div>
            <div class="footer">
              <p>Thank you for shopping!</p>
              <p>${shopEmail}</p>
            </div>
          </div>
          <script>window.print(); window.onafterprint=function(){window.close();};</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusDisplay = (status) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return 'Delivered';
    if (s === 'pending') return 'Pending';
    if (s === 'processing') return 'Processing';
    if (s === 'cancelled') return 'Cancelled';
    if (s === 'assigned') return 'Assigned';
    return status || 'Pending';
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return 'text-green-600';
    if (s === 'pending') return 'text-red-600';
    if (s === 'processing') return 'text-red-600';
    if (s === 'cancelled') return 'text-gray-500';
    if (s === 'assigned') return 'text-purple-600';
    return 'text-gray-600';
  };

  const getDeliveryPersonDisplay = (deliveryPerson) => {
    if (!deliveryPerson || deliveryPerson === 'Not Assigned' || deliveryPerson === 'NOT_ASSIGNED' || deliveryPerson === '') {
      return 'Pending';
    }
    return deliveryPerson;
  };

  const getDeliveryPersonColor = (deliveryPerson) => {
    if (deliveryPerson === 'Pending') return 'text-red-600';
    return 'text-gray-800';
  };

  const getDeliveryContactDisplay = (order) => {
    if (order.orderStatus?.toLowerCase() === 'delivered') {
      return order.deliveryPersonPhone || '—';
    }
    const deliveryPerson = getDeliveryPersonDisplay(order.deliveryPerson);
    if (deliveryPerson !== 'Pending') {
      return order.deliveryPersonPhone || '—';
    }
    return 'Pending';
  };

  const getDeliveryContactColor = (contact) => {
    if (contact === 'Pending') return 'text-red-600';
    return 'text-emerald-600';
  };

  const getDeliveryTimeDisplay = (order) => {
    const status = order.orderStatus?.toLowerCase();
    if (status === 'delivered') {
      return formatDeliveryDate(order.deliveredAt);
    }
    if (status === 'assigned') {
      return 'Out for Delivery';
    }
    return 'Processing';
  };

  const getDeliveryTimeColor = (time) => {
    if (time === 'Processing') return 'text-red-600';
    if (time === 'Out for Delivery') return 'text-purple-600';
    return 'text-amber-600';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  const formatDeliveryDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="max-w-full mx-auto px-4 py-8">
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">GroceryShop Orders</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your shop orders</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">ORDER ID</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">PRODUCT</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">NAME</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">CATEGORY</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">GROCERY SHOP</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">PRICE</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">QTY</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">CUSTOMER</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">ORDER TIME</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">ORDER STATUS</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">DELIVERY PERSON</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">DELIVERY CONTACT</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">DELIVERY TIME</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="text-center py-12 text-gray-500">
                      <span className="text-4xl">📦</span>
                      <p className="mt-2 font-medium">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, idx) => {
                    const deliveryContact = getDeliveryContactDisplay(order);
                    const deliveryTime = getDeliveryTimeDisplay(order);
                    const deliveryPerson = getDeliveryPersonDisplay(order.deliveryPerson);
                    const orderStatus = getStatusDisplay(order.orderStatus);
                    
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-3 py-3 font-mono text-sm font-bold text-blue-700">{order.orderId}</td>
                        <td className="px-3 py-3">
                          {order.productPic && order.productPic !== '—' ? (
                            <img 
                              src={order.productPic} 
                              className="w-10 h-10 object-cover rounded-lg border border-gray-200" 
                              alt="product"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=No+Img'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                              <span className="text-xs text-gray-400">No img</span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm font-bold text-gray-800 max-w-[200px] break-words">{order.productName || '—'}</td>
                        <td className="px-3 py-3 text-sm font-bold text-gray-700">{order.category || '—'}</td>
                        <td className="px-3 py-3 text-sm font-bold text-gray-800">{order.groceryShop || shop?.storeName || '—'}</td>
                        <td className="px-3 py-3 text-sm font-bold text-green-700">₹{order.price || 0}</td>
                        <td className="px-3 py-3 text-sm font-bold text-center text-gray-800">{order.quantity || 1}</td>
                        <td className="px-3 py-3 text-sm font-bold text-gray-800">{order.customer || '—'}</td>
                        <td className="px-3 py-3 text-sm font-bold text-gray-600 whitespace-nowrap">
                          {order.orderTime ? formatDate(order.orderTime) : (order.createdAt ? formatDate(order.createdAt) : '—')}
                        </td>
                        <td className={`px-3 py-3 text-sm font-bold whitespace-nowrap text-center ${getStatusColor(order.orderStatus)}`}>
                          {orderStatus}
                        </td>
                        <td className={`px-3 py-3 text-sm font-bold whitespace-nowrap ${getDeliveryPersonColor(deliveryPerson)}`}>
                          {deliveryPerson}
                        </td>
                        <td className={`px-3 py-3 text-sm font-bold whitespace-nowrap ${getDeliveryContactColor(deliveryContact)}`}>
                          {deliveryContact}
                        </td>
                        <td className={`px-3 py-3 text-sm font-bold whitespace-nowrap ${getDeliveryTimeColor(deliveryTime)}`}>
                          {deliveryTime}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAssignDelivery(order)}
                              disabled={!canAssignDelivery(order)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                                canAssignDelivery(order)
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Assign Delivery
                            </button>
                            <button
                              onClick={() => handlePrintReceipt(order)}
                              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg transition"
                            >
                              Print Receipt
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">Assign To Delivery Person</h2>
            
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">Order Id</label>
              <div className="border-b border-gray-200 pb-2">
                <p className="text-md font-mono font-bold text-blue-600 break-all">{selectedOrder.orderId}</p>
              </div>
            </div>
            
            <div className="mb-5">
              <p className="text-md font-bold text-gray-800">{selectedOrder.productName || 'Product Name'}</p>
              <p className="text-sm text-gray-500 mt-1">{selectedOrder.category || 'Category'}</p>
            </div>
            
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Person</label>
              <select
                value={selectedDeliveryPersonId}
                onChange={(e) => setSelectedDeliveryPersonId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-700 font-medium bg-white"
              >
                <option value="">Select Delivery Person</option>
                {deliveryPersons.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} - {person.phone}
                  </option>
                ))}
              </select>
              {deliveryPersons.length === 0 && (
                <p className="text-xs text-amber-600 mt-2 font-medium">⚠️ No approved delivery persons available.</p>
              )}
            </div>
            
            <button
              onClick={confirmAssignDelivery}
              disabled={assigning || deliveryPersons.length === 0 || !selectedDeliveryPersonId}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md mb-4"
            >
              {assigning ? 'Assigning...' : 'Assign'}
            </button>
            
            <button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedDeliveryPersonId('');
              }}
              className="w-full py-2 bg-transparent border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ShopOrders;