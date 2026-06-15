// src/ShopComponent/DeliveryRequests.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const DeliveryRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shop, setShop] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchShopAndRequests();
  }, []);

  const fetchShopAndRequests = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const shopResponse = await api.get(`/shops/user/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (shopResponse.data?.success) {
        const shopData = shopResponse.data.data;

        setShop(shopData);

        await fetchRequests(shopData.id);
      } else {
        toast.error('Shop not found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
      toast.error('Failed to load shop details');
      setLoading(false);
    }
  };

  const fetchRequests = async (shopId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await api.get(
        `/delivery/requests/shop/${shopId}/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ Requests:', response.data);

      if (response.data?.success) {
        setRequests(response.data.data || []);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load delivery requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await api.put(
        `/delivery/requests/${requestId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        toast.success('Request approved successfully');

        if (shop?.id) {
          fetchRequests(shop.id);
        }
      } else {
        toast.error(response.data?.message || 'Failed to approve');
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem('token');

      const response = await api.put(
        `/delivery/requests/${requestId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        toast.success('Request rejected successfully');

        if (shop?.id) {
          fetchRequests(shop.id);
        }
      } else {
        toast.error(response.data?.message || 'Failed to reject');
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Failed to reject request');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            ⏳ Pending
          </span>
        );

      case 'APPROVED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            ✅ Approved
          </span>
        );

      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            ❌ Rejected
          </span>
        );

      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status || '—'}
          </span>
        );
    }
  };

  // ✅ DYNAMIC DATE FUNCTION - Shows Today/Yesterday/Actual Date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '—';
    
    // Reset time part for accurate date comparison
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Check if it's today
    if (inputDate.getTime() === todayDate.getTime()) {
      return 'Today';
    }
    
    // Check if it's yesterday
    if (inputDate.getTime() === yesterdayDate.getTime()) {
      return 'Yesterday';
    }
    
    // Otherwise show formatted date
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFormattedAddress = (req) => {
    if (
      req.deliveryPersonAddress &&
      req.deliveryPersonAddress.trim() !== '' &&
      req.deliveryPersonAddress !== '—'
    ) {
      return req.deliveryPersonAddress;
    }

    const addressParts = [];

    if (req.deliveryPersonCity?.trim()) {
      addressParts.push(req.deliveryPersonCity);
    }

    if (req.deliveryPersonState?.trim()) {
      addressParts.push(req.deliveryPersonState);
    }

    if (req.deliveryPersonPincode?.trim()) {
      addressParts.push(req.deliveryPersonPincode);
    }

    if (addressParts.length > 0) {
      return addressParts.join(', ');
    }

    return 'Address not provided';
  };

  const getInitials = (name) => {
    if (!name || name.trim() === '') {
      return '?';
    }

    return name.trim().charAt(0).toUpperCase();
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
            <h1 className="text-3xl font-bold text-gray-900">
              Delivery Requests
            </h1>

            <p className="text-gray-600 text-sm mt-1">
              Manage delivery person requests for{' '}
              {shop?.storeName || 'your shop'}
            </p>
          </div>

          <button
            onClick={() => navigate('/shop/delivery/persons')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition"
          >
            ← Back to Delivery Persons
          </button>

        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {requests.length === 0 ? (

            <div className="text-center py-16">
              <div className="text-5xl mb-3">📋</div>

              <h3 className="text-lg font-semibold text-gray-900">
                No Delivery Requests
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                No pending delivery requests found
              </p>
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-gray-50 border-b border-gray-200">

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Name
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Address
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Request Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-200">

                  {requests.map((req) => (

                    <tr
                      key={req.id}
                      className="hover:bg-gray-50 transition"
                    >

                      {/* Name */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-4">

                          {/* Profile Circle */}
                          <div className="h-10 w-10 min-h-[40px] min-w-[40px] rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm overflow-hidden">
                            <span className="text-white font-bold text-base">
                              {getInitials(req.deliveryPersonName)}
                            </span>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {req.deliveryPersonName || '—'}
                            </p>

                            <p className="text-xs text-gray-500 mt-0.5">
                              ID: {req.deliveryPersonId}
                            </p>
                          </div>

                        </div>

                       </td>

                      {/* Email */}
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {req.deliveryPersonEmail || '—'}
                       </td>

                      {/* Phone */}
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {req.deliveryPersonPhone || '—'}
                       </td>

                      {/* Address */}
                      <td className="px-6 py-5 text-sm text-gray-700">
                        <div className="max-w-xs leading-relaxed">
                          {getFormattedAddress(req)}
                        </div>
                       </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        {getStatusBadge(req.status)}
                       </td>

                      {/* ✅ Request Date - Dynamic (Today/Yesterday/Actual Date) */}
                      <td className="px-6 py-5 text-sm font-medium text-gray-700">
                        {formatDate(req.createdAt)}
                       </td>

                      {/* Actions */}
                      <td className="px-6 py-5">

                        {req.status === 'PENDING' && (

                          <div className="flex items-center gap-2">

                            <button
                              onClick={() => handleApprove(req.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => handleReject(req.id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
                            >
                              Reject
                            </button>

                          </div>

                        )}

                        {req.status === 'APPROVED' && (
                          <span className="text-green-600 font-medium text-sm">
                            ✓ Approved
                          </span>
                        )}

                        {req.status === 'REJECTED' && (
                          <span className="text-red-600 font-medium text-sm">
                            ✗ Rejected
                          </span>
                        )}

                       </td>

                     </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* Footer Count */}
        {requests.length > 0 && (
          <div className="mt-4 text-right text-sm text-gray-500">
            Total requests: {requests.length}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default DeliveryRequests;