// src/NavbarComponent/Navbar.jsx (Full Code with GroceryShop)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isShopsOpen, setIsShopsOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [hasShop, setHasShop] = useState(false);
  const [loadingShop, setLoadingShop] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user has a shop
  const checkUserShop = async (userData) => {
    if (!userData || userData.role !== 'SHOP') {
      setHasShop(false);
      setLoadingShop(false);
      return;
    }

    // First check localStorage
    if (userData.hasShop === true) {
      setHasShop(true);
      setLoadingShop(false);
      return;
    }

    // If not in localStorage, check API
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/shops/my-shop', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success && response.data.data) {
        setHasShop(true);
        userData.hasShop = true;
        userData.shopId = response.data.data.id;
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setHasShop(false);
      }
    } catch (error) {
      console.log('No shop found:', error);
      setHasShop(false);
    } finally {
      setLoadingShop(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      checkUserShop(parsedUser);
    } else {
      setUser(null);
      setLoadingShop(false);
    }
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        checkUserShop(parsedUser);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully!');
    navigate('/');
    window.location.reload();
  };

  const handleRegisterSelect = (type) => {
    setIsRegisterOpen(false);
    
    if (type === 'CUSTOMER') {
      navigate('/register', { state: { userType: 'CUSTOMER' } });
    } else if (type === 'GROCERY_SHOP') {
      navigate('/user/groceryShop/register');
    } else if (type === 'DELIVERY') {
      navigate('/delivery/register');
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-green-600' : 'text-gray-700 hover:text-green-600';
  };

  const getNavLinks = () => {
    if (!user) return [];

    if (user.role === 'ADMIN') {
      return [
        { name: 'Dashboard', path: '/admin', isDropdown: false },
      ];
    }

    if (user.role === 'SHOP') {
      return [
        { name: 'Dashboard', path: '/shop', isDropdown: false },
      ];
    }

    if (user.role === 'CUSTOMER') {
      return [
        { name: 'My Cart', path: '/customer/cart', isDropdown: false },
        { name: 'My Order', path: '/customer/orders', isDropdown: false },
        { name: 'Wallet', path: '/wallet', isDropdown: false },
        { 
          name: 'Address', 
          isDropdown: true, 
          items: [
            { name: '➕ Add Address', path: '/address/add' },
            { name: '📍 View Address', path: '/address/view' }
          ] 
        },
      ];
    }

    if (user.role === 'DELIVERY') {
      return [
        { name: 'Dashboard', path: '/delivery/dashboard', isDropdown: false },
        { name: 'My Orders', path: '/delivery/my-orders', isDropdown: false },
        { name: 'Available Shops', path: '/delivery/shops', isDropdown: false },
        { name: 'Profile', path: '/delivery/profile', isDropdown: false },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            <span className="text-green-600">🛒 Grocery</span>
            <span className="text-gray-800">Mart</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link, index) => (
              !link.isDropdown ? (
                <Link
                  key={index}
                  to={link.path}
                  className={`transition text-sm font-medium ${isActive(link.path)}`}
                >
                  {link.name}
                </Link>
              ) : (
                <div key={index} className="relative">
                  <button
                    onClick={() => setIsAddressOpen(!isAddressOpen)}
                    className={`transition text-sm font-medium flex items-center gap-1 ${isActive('#')}`}
                  >
                    Address
                    <span className="text-xs transform transition-transform duration-200" style={{ transform: isAddressOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      ▼
                    </span>
                  </button>
                  {isAddressOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                      {link.items.map((item, idx) => (
                        <Link
                          key={idx}
                          to={item.path}
                          className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-150 text-sm"
                          onClick={() => setIsAddressOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}

            {/* ✅ GROCERY SHOP DROPDOWN - येथे add करा */}
            {user?.role === 'SHOP' && !loadingShop && (
              <div className="relative">
                <button
                  onClick={() => setIsShopsOpen(!isShopsOpen)}
                  className="text-gray-700 hover:text-green-600 transition text-sm font-medium flex items-center gap-1"
                >
                  GroceryShop
                  <span className="text-xs transform transition-transform duration-200" style={{ transform: isShopsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </button>
                {isShopsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    {!hasShop ? (
                      <Link
                        to="/shop/add"
                        className="block w-full text-left px-4 py-2.5 text-green-600 hover:bg-green-50 font-medium"
                        onClick={() => setIsShopsOpen(false)}
                      >
                        🏪 Add GroceryShop
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/shop/details"
                          className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600"
                          onClick={() => setIsShopsOpen(false)}
                        >
                          👁️ View Details
                        </Link>
                        <Link
                          to="/shop/edit"
                          className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600 border-t border-gray-100"
                          onClick={() => setIsShopsOpen(false)}
                        >
                          ✏️ Edit Shop
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Delivery Dropdown for SHOP */}
            {user?.role === 'SHOP' && (
              <div className="relative">
                <button
                  onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
                  className="text-gray-700 hover:text-green-600 transition text-sm font-medium flex items-center gap-1"
                >
                  Delivery
                  <span className="text-xs transform transition-transform duration-200" style={{ transform: isDeliveryOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </button>
                {isDeliveryOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <Link
                      to="/shop/delivery/persons"
                      className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600"
                      onClick={() => setIsDeliveryOpen(false)}
                    >
                      🚚 All Delivery Persons
                    </Link>
                    <Link
                      to="/shop/delivery/requests"
                      className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600 border-t border-gray-100"
                      onClick={() => setIsDeliveryOpen(false)}
                    >
                      📋 Delivery Requests
                    </Link>
                    <Link
                      to="/shop/assign-orders"
                      className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600 border-t border-gray-100"
                      onClick={() => setIsDeliveryOpen(false)}
                    >
                      📋 Assign to Orders
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Wallet Dropdown for SHOP */}
            {user?.role === 'SHOP' && (
              <div className="relative">
                <button
                  onClick={() => setIsWalletOpen(!isWalletOpen)}
                  className="text-gray-700 hover:text-green-600 transition text-sm font-medium flex items-center gap-1"
                >
                  Wallet
                  <span className="text-xs transform transition-transform duration-200" style={{ transform: isWalletOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </button>
                {isWalletOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <Link
                      to="/shop/wallet"
                      className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-150 text-sm"
                      onClick={() => setIsWalletOpen(false)}
                    >
                      💰 My Wallet
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Orders Dropdown for SHOP */}
            {user?.role === 'SHOP' && (
              <div className="relative">
                <button
                  onClick={() => setIsOrdersOpen(!isOrdersOpen)}
                  className="text-gray-700 hover:text-green-600 transition text-sm font-medium flex items-center gap-1"
                >
                  Orders
                  <span className="text-xs transform transition-transform duration-200" style={{ transform: isOrdersOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </button>
                {isOrdersOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <Link
                      to="/shop/orders"
                      className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-150 text-sm"
                      onClick={() => setIsOrdersOpen(false)}
                    >
                      📋 Shop Orders
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Categories Dropdown for SHOP */}
            {user?.role === 'SHOP' && (
              <div className="relative">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="text-gray-700 hover:text-green-600 transition text-sm font-medium flex items-center gap-1"
                >
                  Categories
                  <span className="text-xs transform transition-transform duration-200" style={{ transform: isCategoriesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </button>
                {isCategoriesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <Link
                      to="/shop/categories"
                      className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      📋 All Categories
                    </Link>
                    <Link
                      to="/shop/categories/add"
                      className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600 border-t border-gray-100"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      ➕ Add Category
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Products Dropdown for SHOP */}
            {user?.role === 'SHOP' && (
              <div className="relative">
                <button
                  onClick={() => setIsProductsOpen(!isProductsOpen)}
                  className="text-gray-700 hover:text-green-600 transition text-sm font-medium flex items-center gap-1"
                >
                  Products
                  <span className="text-xs transform transition-transform duration-200" style={{ transform: isProductsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </button>
                {isProductsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <Link
                      to="/shop/products/add"
                      className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      ➕ Add Product
                    </Link>
                    <Link
                      to="/shop/products"
                      className="block w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600 border-t border-gray-100"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      👁️ View My Products
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Orders Dropdown (Admin) */}
            {user?.role === 'ADMIN' && (
              <div className="relative">
                <button
                  onClick={() => setIsOrdersOpen(!isOrdersOpen)}
                  className="text-gray-700 hover:text-green-600 transition text-sm font-medium flex items-center gap-1"
                >
                  Orders
                  <span className="text-xs">▼</span>
                </button>
                {isOrdersOpen && (
                  <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-50">
                    <Link
                      to="/admin/orders/all"
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                      onClick={() => setIsOrdersOpen(false)}
                    >
                      📋 All Orders
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Products Dropdown (Admin) */}
            {user?.role === 'ADMIN' && (
              <div className="relative">
                <button
                  onClick={() => setIsProductsOpen(!isProductsOpen)}
                  className="text-gray-700 hover:text-green-600 transition text-sm font-medium flex items-center gap-1"
                >
                  Products
                  <span className="text-xs">▼</span>
                </button>
                {isProductsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-50">
                    <Link
                      to="/admin/products/all"
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                      onClick={() => setIsProductsOpen(false)}
                    >
                      📦 All Products
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Product Categories Dropdown (Admin) */}
            {user?.role === 'ADMIN' && (
              <div className="relative">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="text-gray-700 hover:text-green-600 transition text-sm font-medium flex items-center gap-1"
                >
                  Product Categories
                  <span className="text-xs">▼</span>
                </button>
                {isCategoriesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-50">
                    <Link
                      to="/admin/categories"
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      📋 All Categories
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* User Dropdown (Admin) */}
            {user?.role === 'ADMIN' && (
              <div className="relative">
                <button
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className="text-gray-700 hover:text-green-600 transition text-sm font-medium flex items-center gap-1"
                >
                  Users
                  <span className="text-xs">▼</span>
                </button>
                {isUserOpen && (
                  <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-50">
                    <Link to="/admin/customers" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600">👥 View Customers</Link>
                    <Link to="/admin/deliveries" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600">🚚 All Deliveries</Link>
                    <Link to="/admin/managers" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600">👨‍💼 All Managers</Link>
                    <Link to="/admin/register-admin" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600">➕ Register Admin</Link>
                  </div>
                )}
              </div>
            )}

            {/* Grocery Shops Dropdown (Admin) */}
            {user?.role === 'ADMIN' && (
              <div className="relative">
                <button
                  onClick={() => setIsShopsOpen(!isShopsOpen)}
                  className="text-gray-700 hover:text-green-600 transition text-sm font-medium flex items-center gap-1"
                >
                  Grocery Shops
                  <span className="text-xs">▼</span>
                </button>
                {isShopsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <Link to="/admin/shops" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600">🏪 All Shops</Link>
                    <Link to="/admin/shops/pending" className="block px-4 py-2 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600">⏳ Pending Approval</Link>
                    <Link to="/admin/shops/approved" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600">✅ Approved Shops</Link>
                  </div>
                )}
              </div>
            )}

            {/* Location Dropdown (Admin) */}
            {user?.role === 'ADMIN' && (
              <div className="relative">
                <button
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  className="text-gray-700 hover:text-green-600 transition text-sm font-medium flex items-center gap-1"
                >
                  Location
                  <span className="text-xs">▼</span>
                </button>
                {isLocationOpen && (
                  <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-50">
                    <Link to="/admin/add-location" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600">+ Add Location</Link>
                    <Link to="/admin/locations" className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600">📍 All Locations</Link>
                  </div>
                )}
              </div>
            )}

            {/* Logout Button */}
            {user && (
              <button onClick={handleLogout} className="text-red-600 hover:text-red-700 transition text-sm font-medium ml-2">
                Logout
              </button>
            )}

            {!user && (
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <button onClick={() => setIsRegisterOpen(!isRegisterOpen)} className="text-gray-700 hover:text-green-600 transition text-sm font-medium flex items-center gap-1">
                    Register User
                    <span className="text-xs">▼</span>
                  </button>
                  {isRegisterOpen && (
                    <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border z-50">
                      <button
                        onClick={() => handleRegisterSelect('CUSTOMER')}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
                      >
                        🛒 Customer
                      </button>
                      <button
                        onClick={() => handleRegisterSelect('GROCERY_SHOP')}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 border-t border-gray-100"
                      >
                        🏪 Grocery Shop
                      </button>
                      <button
                        onClick={() => handleRegisterSelect('DELIVERY')}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 border-t border-gray-100"
                      >
                        🚚 Delivery Person
                      </button>
                    </div>
                  )}
                </div>
                <Link to="/login" className="text-gray-700 hover:text-green-600 transition text-sm font-medium">
                  Login User
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <span className="text-2xl">{isOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-3">
            {/* Mobile menu items here... (same as before) */}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;