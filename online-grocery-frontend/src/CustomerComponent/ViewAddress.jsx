// src/CustomerComponent/ViewAddress.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const ViewAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!user?.id) {
        toast.error('Please login to view addresses');
        navigate('/login');
        return;
      }

      const response = await api.get(`/addresses/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Addresses Response:", response.data);

      if (response.data?.success) {
        setAddresses(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await api.delete(`/addresses/${user.id}/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        toast.success('Address deleted successfully!');
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await api.put(`/addresses/${user.id}/set-default/${addressId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        toast.success('Default address updated!');
        fetchAddresses();
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
    }
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
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">All Delivery Addresses 📍</h1>
                <p className="text-emerald-100 mt-1">Manage your saved addresses</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <span className="text-3xl">📍</span>
              </div>
            </div>
          </div>
        </div>

        {/* Add Address Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate('/address/add')}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
          >
            <span className="text-lg">➕</span>
            Add New Address
          </button>
        </div>

        {/* Addresses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Address</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Downtown</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">City</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Latitude</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Longitude</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {addresses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-12 text-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📍</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses found</h3>
                        <p className="text-gray-500 mb-4">You haven't added any delivery addresses yet</p>
                        <button
                          onClick={() => navigate('/address/add')}
                          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
                        >
                          Add Your First Address
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  addresses.map((address) => (
                    <tr key={address.id} className="hover:bg-gray-50 transition">
                      
                      {/* Address Column */}
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {address.addressLine1 || address.address_line1 || '—'}
                        {address.addressLine2 && (
                          <div className="text-xs text-gray-500 mt-0.5">{address.addressLine2}</div>
                        )}
                      </td>
                      
                      {/* Downtown Column */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {address.addressLine2 || address.landmark || '—'}
                      </td>
                      
                      {/* City Column */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {address.city || '—'}
                      </td>
                      
                      {/* ✅ Latitude Column - Fixed */}
                      <td className="px-4 py-3 text-sm font-mono">
                        {address.latitude ? (
                          <span className="text-gray-600">{address.latitude}</span>
                        ) : (
                          <span className="text-gray-400 italic">Not added</span>
                        )}
                      </td>
                      
                      {/* ✅ Longitude Column - Fixed */}
                      <td className="px-4 py-3 text-sm font-mono">
                        {address.longitude ? (
                          <span className="text-gray-600">{address.longitude}</span>
                        ) : (
                          <span className="text-gray-400 italic">Not added</span>
                        )}
                      </td>
                      
                      {/* Status Column */}
                      <td className="px-4 py-3">
                        {address.isDefault ? (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            ✓ Default
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Active
                          </span>
                        )}
                      </td>
                      
                      {/* Action Column */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefault(address.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(address.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                          >
                            Delete
                          </button>
                        </div>
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
            onClick={() => navigate('/cart')}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-2xl">🛒</span>
            <p className="text-sm font-medium text-gray-700 mt-1">My Cart</p>
          </button>
          <button
            onClick={() => navigate('/customer/orders')}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-2xl">📦</span>
            <p className="text-sm font-medium text-gray-700 mt-1">My Orders</p>
          </button>
          <button
            onClick={() => navigate('/address/view')}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-2xl">📍</span>
            <p className="text-sm font-medium text-gray-700 mt-1">Addresses</p>
          </button>
          <button
            onClick={() => navigate('/wallet')}
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-2xl">👛</span>
            <p className="text-sm font-medium text-gray-700 mt-1">Wallet</p>
          </button>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default ViewAddress;