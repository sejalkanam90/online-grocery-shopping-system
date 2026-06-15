// src/CustomerComponent/TransactionHistory.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!user?.id) {
        toast.error('Please login to view transactions');
        navigate('/login');
        return;
      }

      console.log("Fetching transactions for user:", user.id);

      const response = await api.get(`/wallet/${user.id}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Full Response:", response);
      console.log("Response Data:", response.data);

      // ✅ FIXED: Check response structure
      if (response.data?.success) {
        setTransactions(response.data.data || []);
        console.log("Transactions set:", response.data.data);
      } else {
        console.log("No transactions found");
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white mb-8">
          <h1 className="text-2xl font-bold">Transaction History 📜</h1>
          <p className="text-emerald-100 mt-1">All your wallet transactions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="text-5xl mb-3">💰</div>
                      <p className="text-gray-500">No transactions yet</p>
                      <p className="text-sm text-gray-400 mt-1">Add money to your wallet to see transactions</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {tx.type === 'CREDIT' ? '➕ CREDIT' : '➖ DEBIT'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-semibold ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'CREDIT' ? '+' : '-'} ₹{tx.amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tx.description || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {tx.status || 'SUCCESS'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        {transactions.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-gray-500 text-sm">Total Credits</p>
              <p className="text-2xl font-bold text-green-600">
                +₹{transactions.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-gray-500 text-sm">Total Debits</p>
              <p className="text-2xl font-bold text-red-600">
                -₹{transactions.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + t.amount, 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <p className="text-gray-500 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{transactions.length}</p>
            </div>
          </div>
        )}

        <button 
          onClick={() => navigate('/wallet')} 
          className="mt-6 text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
        >
          ← Back to Wallet
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default TransactionHistory;