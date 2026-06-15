// src/AdminComponent/ViewCustomers.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from '../PageComponent/Footer';

const ViewCustomers = () => {

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {

    try {

      const token = localStorage.getItem('token');

      const res = await api.get('/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const users = res.data?.data || res.data || [];

      const filtered = users.filter(
        u => u.role?.toUpperCase() === 'CUSTOMER'
      );

      const customersWithAddress = filtered.map((customer) => {

        let addressParts = [];

        if (customer.address?.trim()) {
          addressParts.push(customer.address.trim());
        }

        if (customer.city?.trim()) {
          addressParts.push(customer.city.trim());
        }

        if (customer.state?.trim()) {
          addressParts.push(customer.state.trim());
        }

        if (customer.pincode?.trim()) {
          addressParts.push(customer.pincode.trim());
        }

        return {
          ...customer,
          displayAddress:
            addressParts.length > 0
              ? addressParts.join(', ')
              : 'Not provided'
        };
      });

      setCustomers(customersWithAddress);

    } catch (err) {

      console.error('Error fetching customers:', err);

    } finally {

      setLoading(false);
    }
  };

  const getFirstLastName = (fullName) => {

    if (!fullName) {
      return {
        firstName: '—',
        lastName: '—'
      };
    }

    const parts = fullName.trim().split(' ');

    if (parts.length === 1) {
      return {
        firstName: parts[0],
        lastName: '—'
      };
    }

    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' ')
    };
  };

  const filteredCustomers = customers.filter(customer => {

    const search = searchTerm.toLowerCase();

    return (
      (customer.name || '').toLowerCase().includes(search) ||
      (customer.email || '').toLowerCase().includes(search) ||
      (customer.phone || '').includes(search)
    );
  });

  if (loading) {

    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>

          <span className="ml-3 text-gray-600 text-sm">
            Loading customers...
          </span>
        </div>

        <Footer />
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              All Customers
            </h1>

            <p className="text-gray-600 text-sm mt-1">
              Manage all registered customers
            </p>
          </div>

          {/* Search */}
          <div className="relative">

            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-green-500 outline-none w-64"
            />

            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 
                7 7 0 0114 0z"
              />
            </svg>

          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">

          {customers.length === 0 ? (

            <div className="text-center py-16">
              <div className="text-5xl mb-3">👥</div>

              <h3 className="text-lg font-medium text-gray-900">
                No Customers Found
              </h3>
            </div>

          ) : filteredCustomers.length === 0 ? (

            <div className="text-center py-16">

              <div className="text-5xl mb-3">🔍</div>

              <h3 className="text-lg font-medium text-gray-900">
                No Matching Customers
              </h3>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="bg-green-700">

                    <th className="px-6 py-4 text-left text-white">
                      First Name
                    </th>

                    <th className="px-6 py-4 text-left text-white">
                      Last Name
                    </th>

                    <th className="px-6 py-4 text-left text-white">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-white">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-left text-white">
                      Address
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredCustomers.map((c, i) => {

                    const { firstName, lastName } =
                      getFirstLastName(c.name);

                    return (

                      <tr
                        key={c.id || i}
                        className={
                          i % 2 === 0
                            ? 'bg-white hover:bg-green-50'
                            : 'bg-gray-50 hover:bg-green-50'
                        }
                      >

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="h-9 w-9 rounded-full bg-green-600 
                            flex items-center justify-center text-white 
                            text-sm font-bold">

                              {firstName.charAt(0)}

                            </div>

                            <span className="font-semibold">
                              {firstName}
                            </span>

                          </div>

                        </td>

                        <td className="px-6 py-4">
                          {lastName}
                        </td>

                        <td className="px-6 py-4">
                          {c.email || '—'}
                        </td>

                        <td className="px-6 py-4">
                          {c.phone || '—'}
                        </td>

                        <td className="px-6 py-4">
                          {c.displayAddress}
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}
        </div>

        {/* Footer Stats */}
        {customers.length > 0 && (

          <div className="mt-4 text-right text-sm text-gray-500">

            Showing {filteredCustomers.length} of {customers.length} customers

          </div>
        )}

      </div>

      <Footer />

    </div>
  );
};

export default ViewCustomers;