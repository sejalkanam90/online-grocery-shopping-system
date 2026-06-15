// src/PageComponent/Home.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Truck, Wallet, Star, Clock, Shield } from 'lucide-react';
import Navbar from '../NavbarComponent/Navbar';
import Footer from './Footer';

const Home = () => {
  const navigate = useNavigate();

  const handleStartShopping = () => {
    navigate('/stores');
  };

  const features = [
    { icon: <ShoppingBag className="w-8 h-8" />, title: 'Wide Selection', desc: '1000+ grocery products', color: 'from-green-500 to-green-600' },
    { icon: <Truck className="w-8 h-8" />, title: 'Fast Delivery', desc: '30 min delivery', color: 'from-blue-500 to-blue-600' },
    { icon: <Wallet className="w-8 h-8" />, title: 'Digital Wallet', desc: 'Secure payments', color: 'from-purple-500 to-purple-600' },
    { icon: <Star className="w-8 h-8" />, title: 'Quality Assured', desc: '100% fresh products', color: 'from-orange-500 to-orange-600' },
  ];

  const categories = [
    { name: 'Vegetables', icon: '🥬', items: '200+ items', bg: 'from-green-400 to-green-600' },
    { name: 'Fruits', icon: '🍎', items: '150+ items', bg: 'from-red-400 to-red-600' },
    { name: 'Dairy', icon: '🥛', items: '100+ items', bg: 'from-blue-400 to-blue-600' },
    { name: 'Beverages', icon: '🥤', items: '120+ items', bg: 'from-orange-400 to-orange-600' },
    { name: 'Snacks', icon: '🍪', items: '300+ items', bg: 'from-yellow-400 to-yellow-600' },
    { name: 'Household', icon: '🧼', items: '80+ items', bg: 'from-purple-400 to-purple-600' },
  ];

  const stats = [
    { value: '50k+', label: 'Happy Customers', icon: '😊' },
    { value: '200+', label: 'Local Shops', icon: '🏪' },
    { value: '30min', label: 'Avg Delivery', icon: '⏱️' },
    { value: '4.8', label: 'Rating', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                <span className="text-green-700 text-sm font-semibold">Fresh & Fast Delivery</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="text-gray-800">Grocery-Mart</span>
                <br />
                <span className="text-green-600">Shop for Groceries Online</span>
              </h1>
              
              <p className="text-gray-600 text-lg mb-8 max-w-lg">
                Explore a wide range of products from multiple stores, all in one convenient place.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <button
                  onClick={handleStartShopping}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-semibold hover:from-green-600 hover:to-green-700 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  Start Shopping →
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop"
                  alt="Grocery Shopping"
                  className="rounded-3xl shadow-2xl w-full object-cover"
                />
                {/* Floating Card 1 */}
                <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 animate-bounce">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                    ⏱️
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">30 Min Delivery</p>
                    <p className="text-sm text-gray-500">Fast & Reliable</p>
                  </div>
                </div>
                {/* Floating Card 2 */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                    ✅
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">100% Fresh</p>
                    <p className="text-sm text-gray-500">Quality Guaranteed</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold mb-4">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Makes Us <span className="text-green-600">Different?</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We make grocery shopping easy, fast, and convenient for you</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold mb-4">Shop by Category</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by <span className="text-green-600">Categories</span></h2>
            <p className="text-gray-600">Find exactly what you're looking for</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gradient-to-br ${category.bg} rounded-xl p-6 text-center text-white cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1`}
              >
                <span className="text-5xl mb-3 block">{category.icon}</span>
                <p className="font-semibold text-lg">{category.name}</p>
                <p className="text-sm text-white/80">{category.items}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Start Shopping?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">Join thousands of happy customers who shop with us daily</p>
            <button
              onClick={handleStartShopping}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-green-600 rounded-full font-semibold hover:shadow-lg transition-all hover:-translate-y-1"
            >
              Start Shopping →
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;