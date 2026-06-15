// src/AdminComponent/AllManagers.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AllManagers = () => {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        const allUsers = response.data.data || [];
        const filteredManagers = allUsers.filter(user => user.role === 'MANAGER');
        setManagers(filteredManagers);
      } else {
        toast.error('Failed to fetch managers');
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
      toast.error('Failed to load managers');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-600">
            <h1 className="text-2xl font-bold text-white">All Managers</h1>
            <p className="text-blue-100 text-sm mt-1">Manage all manager accounts</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading managers...</span>
            </div>
          ) : managers.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">👨‍💼</div>
              <h3 className="text-lg font-medium text-gray-900">No Managers Found</h3>
              <p className="text-gray-500 text-sm mt-1">No manager accounts registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map((manager) => (
                    <tr key={manager.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {manager.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {manager.email || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {manager.phone || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(manager.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          manager.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {manager.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AllManagers;