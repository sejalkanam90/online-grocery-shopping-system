// src/AdminComponent/EditLocation.jsx

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const EditLocation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { location: locationData } = location.state || {};

  const [formData, setFormData] = useState({
    id: locationData?.id || '',
    name: locationData?.name || '',
    city: locationData?.city || '',
    state: locationData?.state || '',
    pincode: locationData?.pincode || '',
    latitude: locationData?.latitude || '',
    longitude: locationData?.longitude || '',
    active: locationData?.active !== undefined ? locationData.active : true
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Area name is required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/locations/${formData.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        toast.success('Location updated successfully!');
        navigate('/admin/locations');
      } else {
        toast.error(response.data?.message || 'Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error(error.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  if (!locationData) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-red-500">No location data found. Please go back and try again.</p>
            <button
              onClick={() => navigate('/admin/locations')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Back to Locations
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Location</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">Area Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium text-gray-700">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                maxLength="6"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Location'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/locations')}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditLocation;