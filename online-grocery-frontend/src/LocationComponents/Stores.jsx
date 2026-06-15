// src/LocationComponents/Stores.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const Stores = () => {
  const [shops, setShops] = useState([]);
  const [adminLocations, setAdminLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedLocation, setSelectedLocation] = useState('');
  const [searchedLocation, setSearchedLocation] = useState('');

  const [locationOptions, setLocationOptions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const shopsResponse = await api.get('/shops/approved');

      let adminLocationsData = [];

      try {
        const locationsResponse = await api.get('/locations');

        if (locationsResponse.data?.success) {
          adminLocationsData = locationsResponse.data.data || [];
          setAdminLocations(adminLocationsData);
        }
      } catch (err) {
        console.log('Locations API error:', err);
      }

      let shopsData = [];

      if (shopsResponse.data?.success) {
        shopsData = shopsResponse.data.data || [];
        setShops(shopsData);
      }

      const shopLocations = [];

      shopsData.forEach((shop) => {
        if (shop.city && shop.area) {
          const loc = `${shop.city} [${shop.area}]`;

          if (!shopLocations.includes(loc)) {
            shopLocations.push(loc);
          }
        }
      });

      const adminLocationNames = [];

      adminLocationsData.forEach((loc) => {
        if (loc.city && loc.name) {
          const locName = `${loc.city} [${loc.name}]`;

          if (!adminLocationNames.includes(locName)) {
            adminLocationNames.push(locName);
          }
        }
      });

      const allLocations = [
        ...new Set([...shopLocations, ...adminLocationNames]),
      ];

      setLocationOptions(allLocations);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const getShopLocationDisplay = (shop) => {
    if (shop.city && shop.area) {
      return `${shop.city} [${shop.area}]`;
    }

    return shop.city || shop.area || 'Location';
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('/uploads/')) {
      return `http://localhost:8085${imageUrl}`;
    }

    const encodedUrl = imageUrl.replace(/ /g, '%20');

    return `http://localhost:8085/uploads/${encodedUrl}`;
  };

  // FILTER AFTER SEARCH BUTTON CLICK
  const filteredShops = shops.filter((shop) => {
    const shopLocation = getShopLocationDisplay(shop);

    const matchesLocation =
      searchedLocation === '' || shopLocation === searchedLocation;

    return matchesLocation;
  });

  // SEARCH BUTTON FUNCTION
  const handleSearch = () => {
    setSearchedLocation(selectedLocation);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Grocery-Mart
          </h1>

          <p className="text-gray-500 mt-2">
            Find the best grocery stores near you
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">

            {/* Location Dropdown */}
            <div className="relative w-full md:w-[420px]">
              <div
                onClick={() =>
                  setShowLocationDropdown(!showLocationDropdown)
                }
                className="w-full h-12 border border-gray-300 rounded-lg px-4 bg-white flex items-center justify-between cursor-pointer hover:border-emerald-500 transition"
              >
                <span
                  className={
                    selectedLocation
                      ? 'text-gray-800'
                      : 'text-gray-400'
                  }
                >
                  {selectedLocation || 'Select Location'}
                </span>

                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    showLocationDropdown ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Dropdown */}
              {showLocationDropdown && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto">

                  <div
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedLocation('');
                      setShowLocationDropdown(false);
                    }}
                  >
                    All Locations
                  </div>

                  {locationOptions.map((loc, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedLocation(loc);
                        setShowLocationDropdown(false);
                      }}
                    >
                      {loc}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="h-12 px-10 bg-emerald-900 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-all duration-200 shadow-sm"
            >
              Search
            </button>
          </div>
        </div>

        {/* Store Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {filteredShops.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
              <div className="text-6xl mb-4">🏪</div>

              <h3 className="text-xl font-semibold text-gray-800">
                No Stores Found
              </h3>

              <p className="text-gray-500 mt-2">
                Try another location
              </p>
            </div>
          ) : (
            filteredShops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => navigate(`/store/${shop.id}`)}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  {getImageUrl(shop.imageUrl) ? (
                    <img
                      src={getImageUrl(shop.imageUrl)}
                      alt={shop.storeName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;

                        e.target.src =
                          'https://cdn-icons-png.flaticon.com/512/1046/1046751.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-emerald-500 to-green-600 text-white text-6xl">
                      🏪
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition"></div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="text-lg font-bold text-gray-900 truncate">
                    {shop.storeName}
                  </h2>

                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 min-h-[40px]">
                    {shop.description ||
                      `${shop.storeName} provides fresh grocery products and daily essentials.`}
                  </p>

                  <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                    <span className="text-emerald-600 text-base">📍</span>

                    <span className="truncate">
                      {shop.area || shop.city || 'Location'}
                    </span>
                  </div>

                  <button className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium transition">
                    View Store
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Stores;