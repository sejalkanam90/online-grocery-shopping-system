// src/DeliveryComponent/DeliveryMap.jsx

import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../NavbarComponent/Navbar';

const DeliveryMap = () => {
  const mapRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { destination } = location.state || {};
  
  const [info, setInfo] = useState({ distance: 'Calculating...', duration: '...' });
  const [error, setError] = useState(null);
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    if (!destination) {
      navigate('/my-orders');
      return;
    }

    // Check if Google Maps is loaded
    if (!window.google) {
      setError("Google Maps API not loaded. Please check your API key.");
      setLoadingMap(false);
      return;
    }

    // Get current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = { lat: position.coords.latitude, lng: position.coords.longitude };

        // Create map
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 15,
          center: origin,
          disableDefaultUI: true,
          zoomControl: true,
        });

        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: false,
        });

        // Calculate route
        directionsService.route(
          {
            origin: origin,
            destination: destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            setLoadingMap(false);
            if (status === 'OK') {
              directionsRenderer.setDirections(result);
              const leg = result.routes[0].legs[0];
              setInfo({
                distance: leg.distance.text,
                duration: leg.duration.text
              });
            } else {
              setError("Route not found: " + status);
            }
          }
        );
      },
      (error) => {
        setLoadingMap(false);
        console.error("Geolocation error:", error);
        setError("Please allow location access to see the map.");
      }
    );
  }, [destination, navigate]);

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gray-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-md">
            <div className="text-5xl mb-4">📍</div>
            <p className="text-red-500 font-semibold">{error}</p>
            <button 
              onClick={() => navigate('/my-orders')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      <Navbar />

      <div className="relative flex-1">
        {/* Floating Info Card */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-white shadow-2xl rounded-2xl border border-gray-100 p-6 flex items-center gap-16 min-w-[500px]">
          <div className="flex flex-col">
            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Distance</span>
            <span className="text-2xl font-black text-gray-800 tracking-tight">{info.distance}</span>
          </div>
          
          <div className="h-10 w-[1px] bg-gray-200"></div>

          <div className="flex flex-col">
            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Duration</span>
            <span className="text-2xl font-black text-gray-800 tracking-tight">{info.duration}</span>
          </div>

          <button 
            onClick={() => navigate(-1)} 
            className="ml-auto bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading Spinner */}
        {loadingMap && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-40">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
          </div>
        )}

        {/* Map Container */}
        <div ref={mapRef} className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
};

export default DeliveryMap;