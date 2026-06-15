import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ================= PUBLIC =================
import Home from './PageComponent/Home';
import Login from './PageComponent/Login';
import Register from './PageComponent/Register';

// ================= CATEGORY =================
import CategoryList from './CategoryComponent/CategoryList';
import CategoryProducts from './CategoryComponent/CategoryProducts';

// ================= STORE =================
import Stores from './LocationComponents/Stores';
import StoreDetails from './LocationComponents/StoreDetails';

// ================= ADMIN =================
import AdminDashboard from './AdminComponent/AdminDashboard';
import AdminGroceryShops from './AdminComponent/AdminGroceryShops';
import AdminPendingShops from './AdminComponent/AdminPendingShops';
import AdminApprovedShops from './AdminComponent/AdminApprovedShops';
import ViewCustomers from './AdminComponent/ViewCustomers';
import AllDeliveries from './AdminComponent/AllDeliveries';
import AdminAllProducts from './AdminComponent/AllProducts';
import AllOrders from './AdminComponent/AllOrders';
import AdminAllCategories from './AdminComponent/AllCategories';
import RegisterAdmin from './AdminComponent/RegisterAdmin';
import AllManagers from './AdminComponent/AllManagers';
import EditLocation from './AdminComponent/EditLocation';

// ================= LOCATION =================
import AddLocation from './LocationComponents/AddLocation';
import ViewAllLocations from './LocationComponents/ViewAllLocations';

// ================= SHOP =================
import RegisterGroceryShop from './ShopComponent/RegisterGroceryShop';
import AddGroceryShop from './ShopComponent/AddGroceryShop';
import ShopDashboard from './ShopComponent/ShopDashboard';
import ShopDetails from './ShopComponent/ShopDetails';
import EditShopDetails from './ShopComponent/EditShopDetails';
import ShopCategories from './ShopComponent/AllCategories';
import AddCategory from './ShopComponent/AddCategory';
import EditCategory from './ShopComponent/EditCategory';
import AllProducts from './ShopComponent/AllProducts';
import EditProduct from './ShopComponent/EditProduct';        // ✅ EditProduct ShopComponent मध्ये आहे
import ShopOrders from './ShopComponent/ShopOrders';
import MyWallet from './ShopComponent/MyWallet';
import AllDeliveryPersons from './ShopComponent/AllDeliveryPersons';
import DeliveryRequests from './ShopComponent/DeliveryRequests';
import AssignToOrders from './ShopComponent/AssignToOrders';

// ================= PRODUCT =================
import AddProductForm from './ProductComponent/AddProductForm';
import ProductDetails from './ProductComponent/ProductDetails';
import ViewAllProducts from './ProductComponent/ViewAllProducts';

// ================= CUSTOMER =================
import ViewMyCart from './CustomerComponent/ViewMyCart';
import CustomerMyOrders from './CustomerComponent/MyOrders';
import ViewAddress from './CustomerComponent/ViewAddress';
import AddAddress from './CustomerComponent/AddAddress';
import Wallet from './CustomerComponent/Wallet';
import TransactionHistory from './CustomerComponent/TransactionHistory';

// ================= DELIVERY =================
import DeliveryPersonRegister from './DeliveryComponent/DeliveryPersonRegister';
import AvailableShops from './DeliveryComponent/AvailableShops';
import DeliveryDashboard from './DeliveryComponent/DeliveryDashboard';
import DeliveryMap from './DeliveryComponent/DeliveryMap';
import DeliveryMyOrders from './DeliveryComponent/MyOrders';
import MyShops from './DeliveryComponent/MyShops';
import DeliveryProfile from './DeliveryComponent/DeliveryProfile';


// ================= ORDER =================
import OrderList from './OrderComponent/OrderList';
import OrderDetails from './OrderComponent/OrderDetails';

// ================= AUTH GUARD =================
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= CATEGORY ================= */}
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/category/:id" element={<CategoryProducts />} />

        {/* ================= STORE ================= */}
        <Route path="/stores" element={<Stores />} />
        <Route path="/store/:id" element={<StoreDetails />} />

        {/* ================= PRODUCT ================= */}
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/products/all" element={<ViewAllProducts />} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/shops" element={<PrivateRoute><AdminGroceryShops /></PrivateRoute>} />
        <Route path="/admin/shops/pending" element={<PrivateRoute><AdminPendingShops /></PrivateRoute>} />
        <Route path="/admin/shops/approved" element={<PrivateRoute><AdminApprovedShops /></PrivateRoute>} />
        <Route path="/admin/customers" element={<PrivateRoute><ViewCustomers /></PrivateRoute>} />
        <Route path="/admin/deliveries" element={<PrivateRoute><AllDeliveries /></PrivateRoute>} />
        <Route path="/admin/products/all" element={<PrivateRoute><AdminAllProducts /></PrivateRoute>} />
        <Route path="/admin/orders/all" element={<PrivateRoute><AllOrders /></PrivateRoute>} />
        <Route path="/admin/categories" element={<PrivateRoute><AdminAllCategories /></PrivateRoute>} />
        <Route path="/admin/register-admin" element={<PrivateRoute><RegisterAdmin /></PrivateRoute>} />
        <Route path="/admin/managers" element={<PrivateRoute><AllManagers /></PrivateRoute>} />
        <Route path="/admin/edit-location" element={<EditLocation />} />

        {/* ================= LOCATION ================= */}
        <Route path="/admin/add-location" element={<PrivateRoute><AddLocation /></PrivateRoute>} />
        <Route path="/admin/locations" element={<PrivateRoute><ViewAllLocations /></PrivateRoute>} />

        {/* ================= SHOP ================= */}
        <Route path="/shop" element={<PrivateRoute><ShopDashboard /></PrivateRoute>} />
        <Route path="/shop/add" element={<PrivateRoute><AddGroceryShop /></PrivateRoute>} />
        <Route path="/shop/details" element={<PrivateRoute><ShopDetails /></PrivateRoute>} />
        <Route path="/shop/edit" element={<PrivateRoute><EditShopDetails /></PrivateRoute>} />
        <Route path="/shop/categories" element={<PrivateRoute><ShopCategories /></PrivateRoute>} />
        <Route path="/shop/categories/add" element={<PrivateRoute><AddCategory /></PrivateRoute>} />
        <Route path="/shop/categories/edit/:id" element={<PrivateRoute><EditCategory /></PrivateRoute>} />
        <Route path="/shop/products" element={<PrivateRoute><AllProducts /></PrivateRoute>} />
        <Route path="/shop/products/add" element={<PrivateRoute><AddProductForm /></PrivateRoute>} />
        <Route path="/shop/products/edit/:id" element={<PrivateRoute><EditProduct /></PrivateRoute>} />
        <Route path="/shop/orders" element={<PrivateRoute><ShopOrders /></PrivateRoute>} />
        <Route path="/shop/wallet" element={<PrivateRoute><MyWallet /></PrivateRoute>} />
        <Route path="/shop/delivery/persons" element={<PrivateRoute><AllDeliveryPersons /></PrivateRoute>} />
        <Route path="/shop/delivery/requests" element={<PrivateRoute><DeliveryRequests /></PrivateRoute>} />
        <Route path="/shop/assign-orders" element={<PrivateRoute><AssignToOrders /></PrivateRoute>} />

        {/* ================= CUSTOMER ================= */}
        <Route path="/customer/cart" element={<PrivateRoute><ViewMyCart /></PrivateRoute>} />
        <Route path="/customer/orders" element={<PrivateRoute><CustomerMyOrders /></PrivateRoute>} />
        <Route path="/address/view" element={<PrivateRoute><ViewAddress /></PrivateRoute>} />
        <Route path="/address/add" element={<PrivateRoute><AddAddress /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
        <Route path="/wallet/transactions" element={<PrivateRoute><TransactionHistory /></PrivateRoute>} />
      
        {/* ================= DELIVERY ================= */}
        <Route path="/delivery/register" element={<DeliveryPersonRegister />} />
        <Route path="/delivery/shops" element={<PrivateRoute><AvailableShops /></PrivateRoute>} />
        <Route path="/delivery/dashboard" element={<PrivateRoute><DeliveryDashboard /></PrivateRoute>} />
        <Route path="/delivery/my-orders" element={<PrivateRoute><DeliveryMyOrders /></PrivateRoute>} />
        <Route path="/delivery/my-shops" element={<PrivateRoute><MyShops /></PrivateRoute>} />
        <Route path="/delivery/profile" element={<PrivateRoute><DeliveryProfile /></PrivateRoute>} />
        <Route path="/delivery/map" element={<DeliveryMap />} />

       
        {/* ================= ORDER ================= */}
        <Route path="/orders" element={<PrivateRoute><OrderList /></PrivateRoute>} />
        <Route path="/order/:orderId" element={<PrivateRoute><OrderDetails /></PrivateRoute>} />

        {/* ================= SHOP REGISTRATION (Public) ================= */}
        <Route path="/user/groceryShop/register" element={<RegisterGroceryShop />} />

        {/* ================= 404 ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;