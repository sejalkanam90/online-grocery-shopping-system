// src/AdminComponent/AllOrders.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';
import toast from 'react-hot-toast';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await api.get('/orders/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setOrders(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryPersons = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await api.get('/delivery/persons', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setDeliveryPersons(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching delivery persons:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
            ✅ Delivered
          </span>
        );

      case 'PENDING':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
            ⏳ Pending
          </span>
        );

      case 'PROCESSING':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            🔄 Processing
          </span>
        );

      case 'CONFIRMED':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
            ✓ Confirmed
          </span>
        );

      case 'CANCELLED':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
            ❌ Cancelled
          </span>
        );

      case 'ASSIGNED':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
            🚚 Assigned
          </span>
        );

      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            {status || '—'}
          </span>
        );
    }
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
      });
    } catch (e) {
      return dateString;
    }
  };

  const getProductImage = (product) => {
    if (!product) return null;

    let image = product.image1 || product.image2 || product.image3;

    if (!image) return null;

    if (
      image.startsWith('http://') ||
      image.startsWith('https://')
    ) {
      return image;
    }

    return `http://localhost:8085/uploads/${image}`;
  };

  const getProductName = (order) => {
    if (order?.items?.length > 0) {
      return order.items.map((item) => item.productName).join(', ');
    }

    return '—';
  };

  const getTotalQuantity = (order) => {
    if (order?.items?.length > 0) {
      return order.items.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );
    }

    return 1;
  };

  const getCategory = (order) => {
    if (
      order?.items?.length > 0 &&
      order.items[0]?.product?.category
    ) {
      return order.items[0].product.category.name;
    }

    return order.items?.[0]?.categoryName || '—';
  };

  const handleAssignDelivery = async () => {
    if (!selectedDeliveryPerson) {
      toast.error('Please select a delivery person');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const response = await api.put(
        `/orders/${selectedOrder.id}/assign-delivery`,
        {
          deliveryPersonId: selectedDeliveryPerson,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        toast.success('Delivery person assigned successfully');

        setShowAssignModal(false);
        setSelectedDeliveryPerson('');
        fetchOrders();
      } else {
        toast.error(
          response.data?.message || 'Failed to assign'
        );
      }
    } catch (error) {
      console.error('Error assigning delivery:', error);
      toast.error('Failed to assign delivery person');
    }
  };

  const handlePrintReceipt = (order) => {
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt - ${order.orderNumber}</title>
        </head>

        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #059669;">GroceryMart</h1>

          <h2>Order Receipt</h2>

          <hr/>

          <p><strong>Order ID:</strong> ${order.orderNumber}</p>

          <p><strong>Customer:</strong> ${
            order.user?.name || '—'
          }</p>

          <p><strong>Amount:</strong> ₹${order.finalAmount}</p>

          <p><strong>Status:</strong> ${
            order.orderStatus
          }</p>

          <p><strong>Date:</strong> ${formatDate(
            order.createdAt
          )}</p>

          <hr/>

          <h3>Items:</h3>

          <ul>
            ${
              order.items
                ?.map(
                  (item) =>
                    `<li>${item.productName} x ${
                      item.quantity
                    } = ₹${item.price * item.quantity}</li>`
                )
                .join('') || '<li>—</li>'
            }
          </ul>

          <hr/>

          <p>Thank you for shopping with GroceryMart!</p>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.user?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.orderStatus
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>

          <span className="ml-3 text-gray-600 text-sm">
            Loading orders...
          </span>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-full mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-indigo-700 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              All Orders
            </h1>
          </div>

          <p className="text-gray-600 text-sm ml-14">
            Manage all customer orders across all shops
          </p>
        </div>

        {/* Search */}
        <div className="mb-5">
          <div className="relative w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <input
              type="text"
              placeholder="Search by Order ID or Customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📋</div>

              <h3 className="text-lg font-medium text-gray-900">
                No Orders Found
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                No orders placed yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-indigo-700">

                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                      ORDER ID
                    </th>

                    <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase">
                      PRODUCT
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                      PRODUCT NAME
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                      CATEGORY
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                      GROCERY SHOP
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                      PRICE
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                      QUANTITY
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                      CUSTOMER
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                      ORDER TIME
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                      ORDER STATUS
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                      DELIVERY PERSON
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                      DELIVERY CONTACT
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                      DELIVERY TIME
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">
                      ACTION
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order, index) => {

                    const product = order.items?.[0]?.product;

                    const imageUrl = getProductImage(product);

                    return (
                      <tr
                        key={order.id}
                        className={`${
                          index % 2 === 0
                            ? 'bg-white'
                            : 'bg-gray-50'
                        } hover:bg-indigo-50 transition-colors duration-200`}
                      >

                        <td className="px-4 py-3 text-xs font-bold text-gray-700 break-all max-w-[180px]">
                          {order.orderNumber}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={getProductName(order)}
                              className="h-12 w-12 object-cover rounded-lg mx-auto border border-gray-200"
                              onError={(e) => {
                                e.target.src =
                                  'https://cdn-icons-png.flaticon.com/512/1323/1323985.png';
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mx-auto">
                              <svg
                                className="w-6 h-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-3 text-sm font-bold text-gray-800">
                          {getProductName(order)}
                        </td>

                        <td className="px-4 py-3 text-sm font-bold text-gray-600">
                          {getCategory(order)}
                        </td>

                        <td className="px-4 py-3 text-sm font-bold text-gray-700">
                          {order.store?.storeName || '—'}
                        </td>

                        <td className="px-4 py-3 text-sm font-bold text-green-600 whitespace-nowrap">
                          ₹{order.finalAmount}
                        </td>

                        <td className="px-4 py-3 text-sm font-bold text-center">
                          {getTotalQuantity(order)}
                        </td>

                        <td className="px-4 py-3 text-sm font-bold text-gray-700">
                          {order.user?.name || '—'}
                        </td>

                        <td className="px-4 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>

                        <td className="px-4 py-3">
                          {getStatusBadge(order.orderStatus)}
                        </td>

                        <td className="px-4 py-3 text-sm font-bold text-gray-700">
                          {order.deliveryPerson?.name || '—'}
                        </td>

                        <td className="px-4 py-3 text-sm font-bold text-gray-700">
                          {order.deliveryPerson?.phone || '—'}
                        </td>

                        <td className="px-4 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">
                          {order.deliveredAt
                            ? formatDate(order.deliveredAt)
                            : '—'}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex gap-2">

                            {order.orderStatus !==
                              'DELIVERED' && (
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowAssignModal(true);
                                }}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                Assign Delivery
                              </button>
                            )}

                            <button
                              onClick={() =>
                                handlePrintReceipt(order)
                              }
                              className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                            >
                              Print Receipt
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>

            </div>
          )}
        </div>

        {filteredOrders.length > 0 && (
          <div className="mt-4 text-right text-sm font-semibold text-gray-500">
            Showing {filteredOrders.length} of {orders.length}{' '}
            orders
          </div>
        )}
      </div>

      {/* Assign Delivery Modal */}
      {showAssignModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">

            <div className="p-4 bg-indigo-600 text-white rounded-t-lg">
              <h2 className="text-lg font-bold">
                Assign Delivery Person
              </h2>

              <p className="text-sm">
                Order: {selectedOrder.orderNumber}
              </p>
            </div>

            <div className="p-5">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Delivery Person
              </label>

              <select
                value={selectedDeliveryPerson}
                onChange={(e) =>
                  setSelectedDeliveryPerson(e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >

                <option value="">
                  Select Delivery Person
                </option>

                {deliveryPersons.map((dp) => (
                  <option key={dp.id} value={dp.id}>
                    {dp.name} - {dp.phone}
                  </option>
                ))}

              </select>

              <div className="flex gap-3 mt-6">

                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedDeliveryPerson('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAssignDelivery}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Assign
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

export default AllOrders;