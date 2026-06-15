// src/PageComponent/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-green-400">🛒 Grocery</span>
              <span className="text-white">Mart</span>
            </h3>
            <p className="text-gray-400 text-sm">
              Fresh groceries delivered to your doorstep. Quality products at best prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-green-400 transition">Home</Link></li>
              <li><Link to="/products" className="hover:text-green-400 transition">Products</Link></li>
              <li><Link to="/categories" className="hover:text-green-400 transition">Categories</Link></li>
              <li><Link to="/stores" className="hover:text-green-400 transition">Stores</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/faq" className="hover:text-green-400 transition">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-green-400 transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-green-400 transition">Terms & Conditions</Link></li>
              <li><Link to="/refund" className="hover:text-green-400 transition">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2">📞 +91 98765 43210</li>
              <li className="flex items-center gap-2">✉️ support@grocerymart.com</li>
              <li className="flex items-center gap-2">📍 Mumbai, India</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2024 GroceryMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;