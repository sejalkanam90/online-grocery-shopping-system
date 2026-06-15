// src/AdminComponent/AdminGroceryShops.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AdminGroceryShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/shops', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShops(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to fetch shops');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  const updateShopStatus = async (shopId, status) => {
    setProcessingId(shopId);

    try {
      const token = localStorage.getItem('token');
      const endpoint =
        status === 'APPROVED'
          ? `/admin/approve-shop/${shopId}`
          : `/admin/reject-shop/${shopId}`;

      const response = await api.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(`Shop ${status.toLowerCase()} successfully`);

        // 🔥 Optimized update instead of full reload
        setShops(prev =>
          prev.map(shop =>
            shop.id === shopId
              ? { ...shop, approvalStatus: status }
              : shop
          )
        );
      } else {
        toast.error(response.data.message || 'Action failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Request failed');
    } finally {
      setProcessingId(null);
    }
  };

  const getFilteredShops = () => {
    if (activeTab === 'approved')
      return shops.filter(s => s.approvalStatus === 'APPROVED');

    if (activeTab === 'pending')
      return shops.filter(s => s.approvalStatus === 'PENDING');

    if (activeTab === 'rejected')
      return shops.filter(s => s.approvalStatus === 'REJECTED');

    return shops;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">✅ Approved</span>;
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">⏳ Pending</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">❌ Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  const filteredShops = getFilteredShops();

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">

          <h1 className="text-2xl font-bold mb-4">🏪 Grocery Shops</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            {['all', 'approved', 'pending', 'rejected'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded ${
                  activeTab === tab
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">

            {loading ? (
              <div className="p-10 text-center">Loading...</div>
            ) : filteredShops.length === 0 ? (
              <div className="p-10 text-center">No Shops Found</div>
            ) : (
              <table className="w-full">

                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Shop</th>
                    <th className="p-3 text-left">Owner</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">City</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredShops.map(shop => (
                    <tr key={shop.id} className="border-b">

                      <td className="p-3">{shop.storeName}</td>
                      <td className="p-3">{shop.ownerName}</td>
                      <td className="p-3">{shop.user?.email || '—'}</td>
                      <td className="p-3">{shop.user?.phone || '—'}</td>
                      <td className="p-3">{shop.city || '—'}</td>

                      <td className="p-3">
                        {getStatusBadge(shop.approvalStatus)}
                      </td>

                      <td className="p-3 text-center">

                        {shop.approvalStatus === 'PENDING' && (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => updateShopStatus(shop.id, 'APPROVED')}
                              disabled={processingId === shop.id}
                              className="bg-green-600 text-white px-3 py-1 rounded"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => updateShopStatus(shop.id, 'REJECTED')}
                              disabled={processingId === shop.id}
                              className="bg-red-600 text-white px-3 py-1 rounded"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {shop.approvalStatus === 'APPROVED' && (
                          <Link
                            to={`/admin/shops/${shop.id}`}
                            className="text-blue-600"
                          >
                            View
                          </Link>
                        )}

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

export default AdminGroceryShops;