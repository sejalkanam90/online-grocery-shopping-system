// src/AdminComponent/AdminPendingShops.jsx

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AdminPendingShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPendingShops();
  }, []);

  const fetchPendingShops = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/pending-shops', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShops(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch pending shops');
      }
    } catch (error) {
      console.error('Error fetching pending shops:', error);
      toast.error('Failed to load pending shops');
    } finally {
      setLoading(false);
    }
  };

  const approveShop = async (shopId) => {
    setProcessingId(shopId);
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/admin/approve-shop/${shopId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Shop approved successfully!');
        fetchPendingShops();
      } else {
        toast.error(response.data.message || 'Failed to approve shop');
      }
    } catch (error) {
      console.error('Error approving shop:', error);
      toast.error('Failed to approve shop');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectShop = async (shopId) => {
    setProcessingId(shopId);
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/admin/reject-shop/${shopId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Shop rejected!');
        fetchPendingShops();
      } else {
        toast.error(response.data.message || 'Failed to reject shop');
      }
    } catch (error) {
      console.error('Error rejecting shop:', error);
      toast.error('Failed to reject shop');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredShops = shops.filter(shop =>
    shop.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRowColor = (index) =>
    index % 2 === 0 ? 'bg-white hover:bg-yellow-50' : 'bg-gray-50 hover:bg-yellow-50';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              ⏳ Pending Grocery Shops
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Review and approve pending shop registrations
            </p>
          </div>

          {/* Stats */}
          <div className="mb-6 text-sm text-gray-600">
            Pending Approval: {shops.length}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

            {loading ? (
              <div className="py-20 text-center">Loading...</div>
            ) : filteredShops.length === 0 ? (
              <div className="py-16 text-center">
                No Pending Shops
              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="min-w-full">

                  <thead className="bg-yellow-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Shop</th>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-left">Description</th>
                      <th className="px-6 py-4 text-left">Contact</th>
                      <th className="px-6 py-4 text-left">Email</th>
                      <th className="px-6 py-4 text-left">Address</th>
                      <th className="px-6 py-4 text-left">City</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredShops.map((shop, index) => (
                      <tr key={shop.id} className={getRowColor(index)}>

                        <td className="px-6 py-4">🏪 {shop.storeName}</td>

                        <td className="px-6 py-4">{shop.ownerName}</td>

                        <td className="px-6 py-4">
                          {shop.description || 'Fresh grocery store'}
                        </td>

                        <td className="px-6 py-4">
                          {shop.user?.phone || shop.phone || '—'}
                        </td>

                        <td className="px-6 py-4">
                          {shop.user?.email || shop.email || '—'}
                        </td>

                        <td className="px-6 py-4">
                          {shop.address || '—'}
                        </td>

                        <td className="px-6 py-4">
                          {shop.city || '—'}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">

                            <button
                              onClick={() => approveShop(shop.id)}
                              disabled={processingId === shop.id}
                              className="bg-green-600 text-white px-3 py-1 rounded"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => rejectShop(shop.id)}
                              disabled={processingId === shop.id}
                              className="bg-red-600 text-white px-3 py-1 rounded"
                            >
                              Reject
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>
            )}

          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPendingShops;