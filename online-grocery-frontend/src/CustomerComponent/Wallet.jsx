import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';
import { loadRazorpayScript } from '../utils/razorpay';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const scriptLoadedRef = useRef(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id;
  const token = localStorage.getItem('token');

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/wallet/${userId}/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setBalance(response.data.data || 0);
      }
    } catch (error) {
      console.error('Balance fetch error:', error);
      toast.error('Failed to load balance');
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  // Load Razorpay script once
  useEffect(() => {
    fetchBalance();
    
    const loadScript = async () => {
      if (scriptLoadedRef.current) return;
      
      const loaded = await loadRazorpayScript();
      scriptLoadedRef.current = loaded;
      setIsScriptLoaded(loaded);
      
      if (!loaded) {
        toast.error('Payment gateway failed to load');
      }
    };
    
    loadScript();
  }, [fetchBalance]);

  // Validate amount (all edge cases covered)
  const validateAmount = (amountNum) => {
    // NaN check
    if (isNaN(amountNum)) {
      toast.error('Please enter a valid number');
      return false;
    }
    // Zero or negative check
    if (amountNum <= 0) {
      toast.error('Please enter an amount greater than 0');
      return false;
    }
    // Minimum amount check
    if (amountNum < 10) {
      toast.error('Minimum amount is ₹10');
      return false;
    }
    // Maximum amount check
    if (amountNum > 50000) {
      toast.error('Maximum amount is ₹50,000 per transaction');
      return false;
    }
    return true;
  };

  // Handle payment success
  const handlePaymentSuccess = async (order, paymentResponse, amountNum) => {
    const userIdStr = userId?.toString();
    
    try {
      // Verify payment
      const verifyResponse = await api.post('/payment/verify', {
        orderId: order.id,
        paymentId: paymentResponse.razorpay_payment_id,
        signature: paymentResponse.razorpay_signature,
        type: 'wallet',
        userId: userIdStr,
        amount: amountNum.toString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!verifyResponse.data?.success) {
        toast.error('Payment verification failed');
        return false;
      }

      // Add money to wallet
      const topupResponse = await api.post(`/wallet/${userIdStr}/razorpay-topup`, {
        amount: amountNum,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpayOrderId: order.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (topupResponse.data?.success) {
        toast.success(`₹${amountNum} added successfully!`);
        setAmount('');
        await fetchBalance();
        return true;
      } else {
        toast.error('Failed to add money to wallet');
        return false;
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error(error.response?.data?.message || 'Payment verification failed');
      return false;
    }
  };

  // Add money to wallet
  const addMoney = async () => {
    const amountNum = parseFloat(amount);
    
    // Validate amount (handles NaN, 0, negative, min, max)
    if (!validateAmount(amountNum)) return;
    
    if (!isScriptLoaded && !scriptLoadedRef.current) {
      toast.error('Payment gateway not loaded. Please refresh.');
      return;
    }

    if (!userId) {
      toast.error('User not found. Please login again.');
      return;
    }

    setAdding(true);

    try {
      const userIdStr = userId?.toString();

      // Create Razorpay order
      const orderResponse = await api.post('/payment/create-order', {
        amount: amountNum * 100,
        userId: userIdStr,
        type: 'wallet'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const order = orderResponse.data;

      // Prepare Razorpay options
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'GroceryMart',
        description: `Wallet Topup ₹${amountNum}`,
        order_id: order.id,
        prefill: {
          name: user.name || 'User',
          email: user.email || '',
          contact: user.phone?.replace(/\D/g, '').slice(0, 10) || '9999999999'
        },
        theme: {
          color: '#059669'
        },
        modal: {
          ondismiss: () => {
            setAdding(false);
            toast.error('Payment cancelled');
          }
        },
        handler: async (paymentResponse) => {
          await handlePaymentSuccess(order, paymentResponse, amountNum);
          setAdding(false);
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Payment initialization failed';
      toast.error(errorMsg);
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-12">
        {/* Wallet Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4">
            <h1 className="text-xl font-bold text-white">My Wallet</h1>
          </div>

          <div className="p-6">
            {/* Balance Display */}
            <div className="text-center mb-8">
              <p className="text-gray-500 text-sm mb-1">Wallet Balance</p>
              <p className="text-4xl font-bold text-emerald-600">
                ₹ {balance.toFixed(2)}
              </p>
            </div>

            {/* Add Money Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Add Money to Wallet
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className="py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={addMoney}
                disabled={adding}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </div>
                ) : (
                  'Add Money via Razorpay'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* View Transactions Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/wallet/transactions')}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition"
          >
            View All Transactions →
          </button>
        </div>

        {/* Quick Actions - Updated paths */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <button
            onClick={() => navigate('/cart')}
            className="bg-white rounded-xl shadow-sm p-3 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-xl">🛒</span>
            <p className="text-xs font-medium text-gray-700 mt-1">My Cart</p>
          </button>
          <button
            onClick={() => navigate('/customer/orders')}
            className="bg-white rounded-xl shadow-sm p-3 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-xl">📦</span>
            <p className="text-xs font-medium text-gray-700 mt-1">My Orders</p>
          </button>
          <button
            onClick={() => navigate('/address/view')}
            className="bg-white rounded-xl shadow-sm p-3 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-xl">📍</span>
            <p className="text-xs font-medium text-gray-700 mt-1">Address</p>
          </button>
          <button
            onClick={() => navigate('/wallet')}
            className="bg-white rounded-xl shadow-sm p-3 text-center hover:shadow-md transition border border-gray-100"
          >
            <span className="text-xl">👛</span>
            <p className="text-xs font-medium text-gray-700 mt-1">Wallet</p>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Wallet;