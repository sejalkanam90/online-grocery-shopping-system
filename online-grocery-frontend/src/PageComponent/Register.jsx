// src/PageComponent/Register.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from './Footer';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    role: 'CUSTOMER'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.pincode && formData.pincode.length !== 6) {
      toast.error('Pincode must be 6 digits');
      return;
    }

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const fullAddress = formData.street || '';
    const fullCity = formData.city || '';
    const fullState = formData.state || '';
    const fullPincode = formData.pincode || '';

    setLoading(true);
    try {
      const payload = {
        name: fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: fullAddress,
        city: fullCity,
        state: fullState,
        pincode: fullPincode,
        role: 'CUSTOMER'
      };
      
      console.log("📦 Register Payload:", payload);
      
      const response = await api.post('/auth/register', payload);
      if (response.data.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.response?.data?.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-green-600">Register Customer</h2>
              <p className="text-gray-500 mt-2">Create your account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Email Id *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 pr-10"
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Contact Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Street / Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  placeholder="Enter your street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="Enter your city"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  >
                    <option value="">Select State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="Enter pincode"
                    maxLength="6"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 shadow-md mt-4"
              >
                {loading ? 'Registering...' : 'Register User'}
              </button>

              <p className="text-center text-gray-600 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-green-600 hover:underline font-medium">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;