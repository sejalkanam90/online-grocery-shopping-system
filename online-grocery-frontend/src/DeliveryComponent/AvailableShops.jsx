// src/DeliveryComponent/AvailableShops.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AvailableShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [requestedShops, setRequestedShops] = useState({});
  const [sendingShopId, setSendingShopId] = useState(null);

  const navigate = useNavigate();
  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchInitialData();
    }
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchShops(), fetchMyRequests()]);
    setLoading(false);
  };

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  };

  const getToken = () => localStorage.getItem('token');

  const fetchShops = async () => {
    try {
      const response = await api.get('/shops/approved', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (response.data?.success) setShops(response.data.data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
      toast.error('Failed to load shops');
    }
  };

  const fetchMyRequests = async () => {
    try {
      const user = getUser();
      if (!user?.id) return;
      
      console.log("🔄 Fetching my requests for user:", user.id);
      
      // ✅ Use /delivery/requests/delivery-person/{id} instead
      const response = await api.get(`/delivery/requests/delivery-person/${user.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      console.log("📦 My Requests Response:", response.data);
      
      if (response.data?.success) {
        const requestsMap = {};
        const dataArray = response.data.data || [];
        
        dataArray.forEach((item) => {
          console.log("Processing item:", item);
          
          // ✅ Get shopId from different possible structures
          let shopId = null;
          let status = null;
          
          // Direct shopId
          if (item.shopId) {
            shopId = item.shopId;
          }
          // From shop object
          else if (item.shop && item.shop.id) {
            shopId = item.shop.id;
          }
          // From request object
          else if (item.id && item.deliveryPersonId) {
            // This might be a DeliveryPersonShop object directly
            shopId = item.shopId || item.shop?.id;
          }
          
          status = item.status || item.approvalStatus;
          
          console.log(`Extracted: shopId=${shopId}, status=${status}`);
          
          if (shopId && status) {
            requestsMap[shopId] = status;
          }
        });
        
        console.log("✅ Final requestsMap:", requestsMap);
        setRequestedShops(requestsMap);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Fallback: Try the other API endpoint
      try {
        const fallbackResponse = await api.get(`/delivery/my-shops/${user.id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        console.log("📦 Fallback My Shops Response:", fallbackResponse.data);
        
        if (fallbackResponse.data?.success) {
          const requestsMap = {};
          (fallbackResponse.data.data || []).forEach((item) => {
            let shopId = item.shopId || item.shop?.id;
            let status = item.status;
            if (shopId && status) {
              requestsMap[shopId] = status;
            }
          });
          setRequestedShops(requestsMap);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  };

  const sendRequest = async (shopId, shopName) => {
    const user = getUser();
    if (!user?.id) { 
      toast.error('Please login first');
      navigate('/login'); 
      return; 
    }
    
    setSendingShopId(shopId);
    try {
      const response = await api.post('/delivery/request', null, {
        params: { deliveryPersonId: user.id, shopId: shopId },
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      console.log("Send Request Response:", response.data);
      
      if (response.data?.success) {
        toast.success(`Request sent to ${shopName}`);
        setRequestedShops(prev => ({ ...prev, [shopId]: 'PENDING' }));
        await fetchMyRequests();
      } else {
        toast.error(response.data?.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error(error?.response?.data?.message || 'Failed to send request');
    } finally {
      setSendingShopId(null);
    }
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    if (imageName.startsWith('http')) return imageName;
    const baseUrl = "http://localhost:8085";
    if (imageName.includes('uploads')) return `${baseUrl}${imageName.startsWith('/') ? '' : '/'}${imageName}`;
    return `${baseUrl}/uploads/shops/${imageName}`;
  };

  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const name = shop?.storeName?.toLowerCase() || '';
      const city = shop?.city?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return name.includes(term) || city.includes(term);
    });
  }, [shops, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10 flex-grow w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Grocery Partners</h1>
            <p className="text-gray-500 mt-2">Choose a shop to start delivering orders</p>
          </div>
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search city or shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-none ring-1 ring-gray-300 rounded-xl py-3 pl-12 focus:ring-2 focus:ring-emerald-500 shadow-sm outline-none"
            />
            <span className="absolute left-4 top-3 text-gray-400">🔍</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredShops.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-gray-200">
              <p className="text-gray-500 text-xl">No shops found near you.</p>
            </div>
          ) : (
            filteredShops.map((shop) => {
              const status = requestedShops[shop.id];
              const isApproved = status === 'APPROVED';
              const isPending = status === 'PENDING';
              const isRejected = status === 'REJECTED';
              const isSending = sendingShopId === shop.id;

              console.log(`Shop ${shop.id} (${shop.storeName}) -> Status: ${status || 'NO REQUEST'}`);

              return (
                <div key={shop.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col group h-full border border-gray-100">
                  
                  {/* IMAGE SECTION */}
                  <div className="relative h-60 w-full overflow-hidden">
                    {getImageUrl(shop.imageUrl) ? (
                      <img
                        src={getImageUrl(shop.imageUrl)}
                        alt={shop.storeName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Shop'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white text-6xl font-bold">
                        {shop.storeName?.charAt(0) || 'S'}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-white text-2xl font-black leading-tight drop-shadow-md uppercase tracking-wide">
                        {shop.storeName}
                      </h2>
                      <div className="flex items-center text-emerald-400 text-xs font-bold mt-1">
                        <span className="mr-1">📍</span> {shop.city || 'Location'}
                      </div>
                    </div>

                    <div className="absolute top-4 right-4">
                      {shop.open ? (
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase">Open</span>
                      ) : (
                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase">Closed</span>
                      )}
                    </div>
                  </div>

                  {/* DETAILS SECTION */}
                  <div className="p-6 flex flex-col flex-grow bg-white">
                    <p className="text-gray-500 text-sm italic mb-4 line-clamp-1">
                      {shop.address || 'Address not available'}
                    </p>
                    
                    <p className="text-gray-600 text-sm line-clamp-2 mb-6 leading-relaxed">
                      {shop.description || 'Quality products and fresh groceries at your service.'}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-50">
                      {isApproved ? (
                        <button
                          onClick={() => navigate('/delivery/dashboard')}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                          🚚 Go to Dashboard
                        </button>
                      ) : isPending ? (
                        <button disabled className="w-full bg-amber-50 text-amber-600 border border-amber-200 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                          Waiting for Approval
                        </button>
                      ) : (
                        <button
                          onClick={() => sendRequest(shop.id, shop.storeName)}
                          disabled={isSending}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-black text-sm transition-all shadow-lg hover:shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          ) : isRejected ? 'Try Again' : 'REQUEST TO JOIN'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AvailableShops;