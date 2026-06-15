// src/AdminComponent/AllDeliveries.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const AllDeliveries = () => {
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryPersons();
  }, []);

  const fetchDeliveryPersons = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("API Response:", res.data);

      const users = res.data?.data || res.data || [];
      const filtered = users.filter(
        u => u.role?.toUpperCase() === 'DELIVERY'
      );
      
      console.log("Filtered Delivery Persons:", filtered);
      setDeliveryPersons(filtered);
    } catch (err) {
      console.log("Error fetching delivery persons:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFirstLastName = (fullName) => {
    if (!fullName) return { firstName: '—', lastName: '—' };
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return { firstName: parts[0], lastName: '—' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
  };

  const getFullAddress = (user) => {
    let address = '';
    if (user.address && user.address !== 'null') address = user.address;
    if (user.city) address += address ? `, ${user.city}` : user.city;
    if (user.state) address += address ? `, ${user.state}` : user.state;
    if (user.pincode) address += address ? ` - ${user.pincode}` : `Pincode: ${user.pincode}`;
    return address || '—';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">All Delivery Persons</h1>
          </div>
          <p className="text-gray-600 text-sm ml-14">Manage all delivery persons</p>
        </div>

        {/* Delivery Persons Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-gray-600 text-sm">Loading delivery persons...</span>
            </div>
          ) : deliveryPersons.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🚚</div>
              <h3 className="text-lg font-medium text-gray-900">No Delivery Persons Found</h3>
              <p className="text-gray-500 text-sm mt-1">No delivery persons registered yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-orange-700">
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase">First Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase">Last Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase">Email Id</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase">Phone No</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase">Address</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase">GroceryShop</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryPersons.map((person, i) => {
                    const { firstName, lastName } = getFirstLastName(person.name);
                    return (
                      <tr key={person.id || i} className={`
                        ${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
                        hover:bg-orange-100 transition-colors duration-200
                      `}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm font-bold">
                              {firstName.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{firstName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{lastName}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate max-w-[200px] font-medium" title={person.email}>{person.email || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {person.phone || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate font-medium" title={getFullAddress(person)}>{getFullAddress(person)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {person.groceryShop || 'Not Assigned'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

export default AllDeliveries;