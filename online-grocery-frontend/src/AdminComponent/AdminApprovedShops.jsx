// src/AdminComponent/AdminApprovedShops.jsx

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AdminApprovedShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: null });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApprovedShops();
  }, []);

  const fetchApprovedShops = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/admin/approved-shops', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        setShops(response.data.data);
      } else {
        toast.error(response?.data?.message || 'Failed to fetch shops');
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const { id } = deleteModal;
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await api.delete(`/admin/shop/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        toast.success('Shop deleted successfully!');
        fetchApprovedShops();
      } else {
        toast.error(response?.data?.message || 'Failed to delete shop');
      }
    } catch (error) {
      console.error('Error deleting shop:', error);
      toast.error('Failed to delete shop');
    } finally {
      setProcessingId(null);
      setDeleteModal({ isOpen: false, id: null, name: null });
    }
  };

  const openDeleteModal = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null, name: null });
  };

  const getDescription = (shop) => {
    if (shop.description) return shop.description;
    return `${shop.storeName} is a premium grocery store located in ${shop.city}.`;
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/uploads/')) return `http://localhost:8085${imageUrl}`;
    return `http://localhost:8085/uploads/${imageUrl}`;
  };

  const filteredShops = shops.filter(shop =>
    shop.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-full mx-auto">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-green-700">✅ Approved Grocery Shops</h1>
            <p className="text-gray-500 text-sm mt-1">Manage all approved grocery shops</p>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative w-80">
              <input
                type="text"
                placeholder="Search by shop name, owner or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredShops.length === 0 ? (
              <div className="text-center py-16">No approved shops found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-green-700">
                      <th className="px-4 py-3 text-left text-white font-semibold">Grocery Shop</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">Name</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">Description</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">Contact</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">Email Id</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">Address</th>
                      <th className="px-4 py-3 text-left text-white font-semibold">Location</th>
                      <th className="px-4 py-3 text-center text-white font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredShops.map((shop, idx) => (
                      <tr
                        key={shop.id}
                        className={`hover:bg-green-50 transition ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        {/* Image + Shop Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={getImageUrl(shop.imageUrl) || 'https://cdn-icons-png.flaticon.com/512/1046/1046751.png'}
                              alt={shop.storeName}
                              className="w-10 h-10 object-cover rounded-full"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://cdn-icons-png.flaticon.com/512/1046/1046751.png';
                              }}
                            />
                            <span className="font-medium text-gray-800">
                              {shop.storeName || "No Shop Name"}
                            </span>
                          </div>
                        </td>

                        {/* Owner Name */}
                        <td className="px-4 py-3 text-gray-700">
                          {shop.ownerName || "—"}
                        </td>

                        {/* Description */}
                        <td className="px-4 py-3 text-gray-600 max-w-xs">
                          <div className="line-clamp-2">{getDescription(shop)}</div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3 text-gray-700">
                          {shop.phone || shop.user?.phone || '—'}
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 text-gray-700">
                          {shop.email || shop.user?.email || '—'}
                        </td>

                        {/* Address */}
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={shop.address}>
                          {shop.address || '—'}
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-gray-700">{shop.city || '—'}</span>
                            {shop.latitude && (
                              <span className="text-xs text-gray-400">
                                {Number(shop.latitude).toFixed(4)}, {Number(shop.longitude).toFixed(4)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => openDeleteModal(shop.id, shop.storeName)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium transition"
                          >
                            Delete
                          </button>
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

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Shop</h3>
              <p className="text-gray-500 text-sm mb-4">
                Are you sure you want to delete <span className="font-semibold">{deleteModal.name}</span>?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={processingId === deleteModal.id}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                >
                  {processingId === deleteModal.id ? 'Deleting...' : 'Delete Shop'}
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

export default AdminApprovedShops;