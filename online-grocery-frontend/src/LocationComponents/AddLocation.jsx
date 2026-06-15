// src/LocationComponents/AddLocation.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AddLocation = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '',
    latitude: '18.5204',
    longitude: '73.8567',
    active: true
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapSrc, setMapSrc] = useState(`https://maps.google.com/maps?q=18.5204,73.8567&z=13&output=embed`);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Function to get pincode from coordinates
  const getPincodeFromCoordinates = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        // Try to get postcode/pincode
        const pincode = data.address.postcode;
        const city = data.address.city || data.address.town || data.address.village || '';
        const state = data.address.state || '';
        
        if (pincode) {
          setFormData(prev => ({
            ...prev,
            pincode: pincode,
            city: city || prev.city,
            state: state || prev.state
          }));
          toast.success(`Pincode found: ${pincode}`);
        } else {
          toast.info('Pincode not found for this location');
        }
        return pincode;
      }
    } catch (error) {
      console.error('Error getting pincode:', error);
      return null;
    }
  };

  // ✅ Function to get location details from address
  const getLocationDetailsFromAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;
        const addressDetails = data[0].address || {};
        
        const pincode = addressDetails.postcode;
        const city = addressDetails.city || addressDetails.town || addressDetails.village || '';
        const state = addressDetails.state || '';
        
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon,
          pincode: pincode || prev.pincode,
          city: city || prev.city,
          state: state || prev.state
        }));
        
        if (pincode) {
          toast.success(`Pincode: ${pincode}, City: ${city}, State: ${state}`);
        }
        
        return { lat, lon, pincode, city, state };
      }
    } catch (error) {
      console.error('Error getting location details:', error);
      return null;
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const encodedQuery = encodeURIComponent(searchQuery);
    setMapSrc(`https://maps.google.com/maps?q=${encodedQuery}&z=15&output=embed`);
    
    // ✅ Get full location details including pincode
    const details = await getLocationDetailsFromAddress(searchQuery);
    
    if (!details) {
      // Fallback to basic coordinates if address details not found
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setFormData(prev => ({
              ...prev,
              latitude: data[0].lat,
              longitude: data[0].lon
            }));
            toast.success(`Coordinates found`);
          }
        })
        .catch(err => console.error(err));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Area name is required');
      return false;
    }
    if (formData.pincode && formData.pincode.length !== 6) {
      toast.error('Pincode must be 6 digits');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/locations', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        toast.success('Location added successfully!');
        setFormData({
          name: '',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '',
          latitude: '18.5204',
          longitude: '73.8567',
          active: true
        });
        setSearchQuery('');
        setMapSrc(`https://maps.google.com/maps?q=18.5204,73.8567&z=13&output=embed`);
      } else {
        toast.error(response.data?.message || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Add Location</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Side - Form */}
              <div>
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Area Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Kurla West, Bandra, Andheri"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-medium">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Will be auto-filled on search"
                    maxLength="6"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">📍 Search location above to auto-fill pincode</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">Latitude</label>
                    <input
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">Longitude</label>
                    <input
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                  >
                    {loading ? 'Adding...' : 'Add Location'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Right Side - Google Maps with Search */}
              <div>
                <div className="mb-3">
                  <label className="block mb-2 font-medium">📍 Search Location</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Search... (e.g., Kurla West, Mumbai)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 transition"
                    >
                      🔍 Search
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    title="Location Map"
                    src={mapSrc}
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  <p>📍 Search location - Pincode, City, State auto-fill</p>
                  <p>🗺️ Map shows approximate location</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AddLocation;