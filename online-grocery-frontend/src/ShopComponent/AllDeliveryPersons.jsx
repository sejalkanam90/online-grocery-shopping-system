import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AllDeliveryPersons = () => {
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeliveryPersons();
  }, []);

  const fetchDeliveryPersons = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const shopId = user.shopId || user.groceryShopId;

      if (!shopId) {
        setLoading(false);
        return;
      }

      const response = await api.get(`/delivery/shop/${shopId}/approved-persons`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('📦 API Response:', response.data);

      if (response.data?.success) {
        setDeliveryPersons(response.data.data || []);
      } else {
        setDeliveryPersons([]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load delivery persons');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-lg font-medium">🟢 Available</span>;
      case 'BUSY':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg font-medium">🟡 Busy</span>;
      case 'OFFLINE':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg font-medium">⚫ Offline</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg">{status || '—'}</span>;
    }
  };

  // ✅ SIMPLE DATE FORMAT - Always shows actual date (no Today/Yesterday)
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      
      // Always return formatted date like: 13 May 2026
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '—';
    }
  };

  const getFullAddress = (p) => {
    const addressParts = [];
    if (p.address && p.address !== '—') addressParts.push(p.address);
    if (p.city && p.city !== '—') addressParts.push(p.city);
    if (p.state && p.state !== '—') addressParts.push(p.state);
    if (p.pincode && p.pincode !== '—') addressParts.push(p.pincode);
    return addressParts.length > 0 ? addressParts.join(', ') : '—';
  };

  const getInitials = (name) => {
    if (!name || name.trim() === '') return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  const handleViewDetails = (person) => {
    setSelectedPerson(person);
    setShowDetailsModal(true);
  };

  // Safe search
  const filteredPersons = deliveryPersons.filter(p =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone || '').includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header with both buttons */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Delivery Persons</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your approved delivery partners</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/shop/delivery/requests')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition shadow-sm"
            >
              📋 View Requests
            </button>
            <button
              onClick={() => navigate('/shop/assign-orders')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition shadow-sm"
            >
              🚚 Assign to Orders
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search by name, email or phone..."
            className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {deliveryPersons.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🚚</div>
              <h3 className="text-lg font-semibold text-gray-900">No Delivery Persons Found</h3>
              <p className="text-gray-500 text-sm mt-1">No approved delivery persons for your shop yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Address</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPersons.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-700 font-bold text-sm">
                              {getInitials(p.name)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{p.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.email || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.phone || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        <div className="truncate max-w-[200px]" title={getFullAddress(p)}>
                          {getFullAddress(p)}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(p.deliveryStatus)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {formatDate(p.approvedAt || p.updatedAt || p.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(p)}
                          className="text-emerald-600 hover:text-emerald-800 font-medium text-sm transition"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Count */}
        {deliveryPersons.length > 0 && (
          <p className="mt-4 text-sm text-gray-500 text-right">
            Showing {filteredPersons.length} of {deliveryPersons.length} delivery persons
          </p>
        )}

      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Delivery Person Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-700 font-bold text-2xl">
                    {getInitials(selectedPerson.name)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedPerson.name || '—'}</h3>
                  <p className="text-sm text-gray-500">ID: {selectedPerson.id}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPerson.email || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPerson.phone || '—'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                  <p className="text-sm text-gray-900 mt-1">{getFullAddress(selectedPerson)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedPerson.deliveryStatus)}</div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Joined On</label>
                    <p className="text-sm text-gray-900 mt-1 font-medium">
                      {formatDate(selectedPerson.approvedAt || selectedPerson.updatedAt || selectedPerson.createdAt)}
                    </p>
                  </div>
                </div>

                {selectedPerson.vehicleNumber && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Vehicle Number</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPerson.vehicleNumber}</p>
                  </div>
                )}

                {selectedPerson.vehicleType && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Vehicle Type</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedPerson.vehicleType}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AllDeliveryPersons;