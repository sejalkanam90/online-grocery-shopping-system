// src/ShopComponent/MyWallet.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const MyWallet = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [shop, setShop] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchShopAndWallet();
  }, []);

  const fetchShopAndWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!user?.id) {
        toast.error("Please login again");
        navigate('/login');
        return;
      }

      // GET SHOP DETAILS
      const shopResponse = await api.get(`/shops/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (shopResponse.data?.success) {
        const shopData = shopResponse.data.data;
        setShop(shopData);
        
        // ✅ FETCH SHOP WALLET BALANCE AND TRANSACTIONS (using shop-wallet endpoint)
        await Promise.all([
          fetchWalletBalance(shopData.id),
          fetchTransactions(shopData.id)
        ]);
      } else {
        toast.error("No shop found. Please register your shop first.");
        navigate('/shop/add');
      }
    } catch (error) {
      console.error('Error fetching shop:', error);
      
      if (error.response?.status === 403) {
        setError("Wallet access not configured. Please contact admin.");
        toast.error("Wallet access denied");
      } else {
        toast.error('Failed to load wallet details');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Use shop-wallet endpoint (not wallet)
  const fetchWalletBalance = async (shopId) => {
    try {
      const token = localStorage.getItem('token');
      console.log("💰 Fetching shop wallet balance for shopId:", shopId);
      
      const response = await api.get(`/shop-wallet/${shopId}/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("💰 Balance Response:", response.data);
      
      if (response.data?.success) {
        setWalletBalance(response.data.data || 0);
      } else {
        setWalletBalance(0);
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance(0);
      
      if (error.response?.status === 403) {
        setError("Wallet access denied for shop owner");
      }
    }
  };

  // ✅ FIXED: Use shop-wallet endpoint (not wallet)
  const fetchTransactions = async (shopId) => {
    try {
      const token = localStorage.getItem('token');
      console.log("📋 Fetching shop wallet transactions for shopId:", shopId);
      
      const response = await api.get(`/shop-wallet/${shopId}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📋 Transactions Response:", response.data);
      
      if (response.data?.success) {
        setTransactions(response.data.data || []);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'CREDIT':
        return 'bg-green-100 text-green-800';
      case 'DEBIT':
        return 'bg-red-100 text-red-800';
      case 'WITHDRAWAL':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-700 mb-2">Wallet Error</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go to Dashboard
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

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-500 text-sm mt-1">
            {shop?.storeName || 'Shop'} earnings from customer orders
          </p>
        </div>

        {/* BALANCE CARD */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium opacity-90 mb-2">Total Balance</p>
              <p className="text-5xl font-bold">
                ₹ {walletBalance.toLocaleString('en-IN')}
              </p>
              <p className="text-sm opacity-75 mt-2">
                Earnings from all customer orders
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </div>

        {/* TRANSACTIONS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
            <p className="text-sm text-gray-500">Payment received from customer orders</p>
          </div>

          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl">💰</span>
                <p className="text-lg">No transactions yet</p>
                <p className="text-sm">When customers place orders, payment will appear here</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction, index) => (
                    <tr key={transaction.id || index} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {transaction.order?.orderNumber || transaction.orderId || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {transaction.description || `${transaction.type} transaction`}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        <span className={transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'CREDIT' ? '+' : '-'} ₹{transaction.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                          {transaction.type || 'CREDIT'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* INFO BOX */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <span className="text-blue-500 text-xl">ℹ️</span>
            <div>
              <p className="text-sm font-medium text-blue-800">How it works?</p>
              <p className="text-xs text-blue-600 mt-1">
                When customers place orders and complete payment,
                the amount is automatically credited to your shop wallet.
              </p>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default MyWallet;