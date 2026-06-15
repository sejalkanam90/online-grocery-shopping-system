// src/CustomerComponent/ViewMyCart.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const ViewMyCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!userId) {
      toast.error('Please login to view cart');
      navigate('/login');
      return;
    }
    fetchCart();
    fetchAddresses();
    fetchWalletBalance();
  }, [userId, navigate]);

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      const res = await api.get(`/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const items = res.data?.data || res.data || [];
      setCartItems(Array.isArray(items) ? items : []);
    } catch (err) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await api.get(`/addresses/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) setAddresses(res.data.data || []);
    } catch (err) { console.log(err); }
  };

  const fetchWalletBalance = async () => {
    try {
      const res = await api.get(`/wallet/${userId}/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) setWalletBalance(res.data.data || 0);
    } catch (err) { console.log(err); }
  };

  const calculateTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      const price = item.price || item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    setTotalAmount(total);
  };

  const updateQuantity = async (id, qty) => {
    if (qty < 1) return;
    try {
      await api.put(`/cart/item/${id}?quantity=${qty}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch { toast.error('Update failed'); }
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/cart/item/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCartItems(prev => prev.filter(item => item.id !== id));
      toast.success('Removed from cart');
    } catch { toast.error('Delete failed'); }
  };

  const clearCart = async () => {
    try {
      await api.delete(`/cart/${userId}/clear`, { headers: { Authorization: `Bearer ${token}` } });
      setCartItems([]);
      toast.success('Cart cleared');
    } catch { toast.error('Failed'); }
  };

  const processPayment = async () => {
    if (!selectedAddressId) {
      toast.error('Please select delivery address');
      return;
    }

    // ✅ Wallet balance check - Only Toast Message
    if (walletBalance < totalAmount) {
      toast.error(`Insufficient fund in your wallet!!!`);
      return;
    }

    setProcessingPayment(true);
    try {
      const deductRes = await api.post(`/wallet/${userId}/deduct`, {
        amount: totalAmount,
        orderId: "ORD" + Date.now(),
        razorpayPaymentId: "WALLET_PAYMENT_" + Date.now()
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (deductRes.data?.success) {
        const orderRes = await api.post('/orders/create', {
          addressId: selectedAddressId,
          totalAmount: totalAmount,
          userId: userId?.toString(),
          razorpayPaymentId: "WALLET_PAYMENT_" + Date.now(),
          razorpayOrderId: "WALLET_ORDER_" + Date.now()
        }, { headers: { Authorization: `Bearer ${token}` } });

        if (orderRes.data?.success) {
          toast.success('Order placed successfully!');
          setShowAddressPopup(false);
          navigate('/customer/orders');
        } else {
          toast.error(orderRes.data?.message || 'Failed to create order');
        }
      } else {
        toast.error(deductRes.data?.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Internal Server Error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const getImageUrl = (image, product) => {
    const img = image || product?.image1;
    if (!img || img === '—') return 'https://via.placeholder.com/150';
    return img.startsWith('http') ? img : `http://localhost:8085/uploads/${img}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Cart 🛒</h1>

        <div className="bg-white rounded shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Product Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Grocery Shop</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Quantity</th>
                  <th className="p-3 text-left">Subtotal</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-5xl mb-3">🛒</span>
                        <h2 className="text-lg font-semibold text-gray-700">Your cart is empty</h2>
                        <Link to="/stores" className="text-green-600 mt-3 inline-block hover:underline">
                          Continue Shopping →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cartItems.map((item) => {
                    const product = item.product || {};
                    const name = item.productName || product.name || "Grocery Item";
                    const price = item.price || product.price || 0;
                    return (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <img src={getImageUrl(item.image1, product)} className="h-12 w-12 rounded object-cover border" alt="p" />
                        </td>
                        <td className="p-3 font-medium">{name}</td>
                        <td className="p-3 text-gray-600">{item.categoryName || product.category?.name || "General"}</td>
                        <td className="p-3 text-gray-600">{item.shopName || product.shop?.storeName || "Fresh Mart"}</td>
                        <td className="p-3 font-semibold text-green-600">₹{price}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-7 h-7 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50">-</button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 bg-gray-200 rounded-full hover:bg-gray-300">+</button>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-gray-800">₹{price * item.quantity}</td>
                        <td className="p-3">
                          <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">Delete</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {cartItems.length > 0 && (
            <>
              <div className="flex justify-between p-4 border-t">
                <button onClick={clearCart} className="text-red-500 hover:text-red-700">Clear Cart</button>
                <button onClick={() => setShowAddressPopup(true)} className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700">
                  Checkout →
                </button>
              </div>
              <div className="text-right p-4 border-t">
                <p className="text-gray-600">Total Price: <span className="text-xl font-bold text-green-600">₹{totalAmount}</span></p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Address Selection Popup */}
      {showAddressPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-4 bg-green-600 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Select Delivery Address</h2>
                <button onClick={() => setShowAddressPopup(false)} className="text-white text-xl">✕</button>
              </div>
            </div>

            <div className="p-5">
              <p className="font-semibold text-gray-700 mb-2">Delivery Address</p>
              
              <select
                value={selectedAddressId || ''}
                onChange={(e) => setSelectedAddressId(e.target.value ? Number(e.target.value) : null)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="">Select Delivery Address</option>
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.addressLine1} - {addr.city}
                  </option>
                ))}
              </select>

              {selectedAddressId && (
                <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200 mb-4">
                  {(() => {
                    const addr = addresses.find(a => a.id === selectedAddressId);
                    return addr ? (
                      <>
                        <p className="font-medium">{addr.receiverName}</p>
                        <p className="text-sm text-gray-600">{addr.addressLine1}</p>
                        <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-xs text-gray-400">📞 {addr.phoneNumber}</p>
                      </>
                    ) : null;
                  })()}
                </div>
              )}

              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-green-600">₹{totalAmount}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-5">
                <p className="text-yellow-800 text-sm text-center">
                  Note: Make sure you have sufficient balance in your WALLET!!!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddressPopup(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  disabled={processingPayment}
                >
                  Close
                </button>
                <button
                  onClick={processPayment}
                  disabled={processingPayment || !selectedAddressId}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                >
                  {processingPayment ? 'Processing...' : `Pay ₹${totalAmount}`}
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

export default ViewMyCart;