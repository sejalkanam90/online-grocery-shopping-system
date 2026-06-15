import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../NavbarComponent/Navbar';
import Footer from './Footer';

const Login = () => {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!role) {
      toast.error('Please select a role');
      return;
    }
    
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      
      if (data.success) {
        // ✅ Fix: Trim token to remove any whitespace
        const token = data.data.token.trim();
        const user = data.data.user;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success('Login successful!');
        
        const userRole = user.role;
        
        // Force redirect with reload
        if (userRole === 'ADMIN') {
          window.location.href = '/admin';
        } else if (userRole === 'SHOP') {
          window.location.href = '/shop';
        } else {
          window.location.href = '/';
        }
      } else {
        toast.error(data.message || 'Login failed!');
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || 'Login failed!');
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
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-green-600">User Login</h2>
              <p className="text-gray-500 mt-2">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition text-gray-700"
                >
                  <option value="" disabled>Select Role</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="SHOP">Grocery Shop</option>
                  <option value="ADMIN">Admin</option>
                  <option value="DELIVERY">Delivery Person</option>
                </select>
              </div>

              <div className="mb-5">
                <label className="block text-gray-700 font-medium mb-2">Email Id</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition disabled:opacity-50 shadow-md"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <p className="text-center text-gray-600 mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-green-600 hover:underline font-medium">
                  Register
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

export default Login;