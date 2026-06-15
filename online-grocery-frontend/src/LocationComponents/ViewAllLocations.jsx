// src/LocationComponents/ViewAllLocations.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const ViewAllLocations = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/locations');
      if (response.data.success) {
        setLocations(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch locations');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (location) => {
    // ✅ Navigate to edit page with location data
    navigate('/admin/edit-location', { state: { location } });
  };

  const handleDelete = async () => {
    const { id } = deleteModal;
    try {
      const response = await api.delete(`/locations/${id}`);
      if (response.data.success) {
        toast.success('Location deleted successfully');
        fetchLocations();
      } else {
        toast.error(response.data.message || 'Failed to delete location');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    } finally {
      setDeleteModal({ isOpen: false, id: null, name: '' });
    }
  };

  const openDeleteModal = (id, name) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, id: null, name: '' });
  };

  const formatCoordinate = (value) => {
    if (value === null || value === undefined) return '—';
    return Number(value).toFixed(4);
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📍 Locations</h1>
              <p className="text-gray-500 mt-1">Manage delivery locations</p>
            </div>
            <button
              onClick={() => navigate('/admin/add-location')}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-md flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Location
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-600">Loading locations...</span>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📍</div>
                <h3 className="text-xl font-medium text-gray-800">No Locations Found</h3>
                <p className="text-gray-500 mt-2">Click "Add Location" to create your first location</p>
                <button
                  onClick={() => navigate('/admin/add-location')}
                  className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  + Add Location
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Area Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">City</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">State</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Pincode</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Latitude</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Longitude</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((location) => (
                      <tr
                        key={location.id}
                        className="border-b hover:bg-green-50 transition duration-200 group"
                      >
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                          {location.name || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {location.city || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {location.state || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {location.pincode || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatCoordinate(location.latitude)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatCoordinate(location.longitude)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-3">
                            {/* ✅ Edit Button */}
                            <button
                              onClick={() => handleEdit(location)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => openDeleteModal(location.id, location.name)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Location</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <span className="font-semibold">{deleteModal.name || 'this location'}</span>?
                This action cannot be undone.
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
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
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

export default ViewAllLocations;