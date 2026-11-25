import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { StoreProvider, useStore } from './components/StoreContext.jsx';
import { AdminLayout, StoreLayout } from './components/Layout.jsx';
import { Home, Products, ProductDetail, Categories, Offers, Register, Login, About, Blogs, BlogDetail, Contact, Cart, Checkout, PurchaseResult } from './pages/PublicPages.jsx';
import { AdminDashboard, AdminProducts, AdminProductDetail, AdminProductForm, AdminCategories, AdminOrders, AdminOrderDetail, AdminUsers, AdminUserForm, AdminReports, AdminProfile } from './pages/AdminPages.jsx';

function Guard({ children }) {
  const { session } = useStore();
  return session?.tipo === 'Administrador' ? children : <Navigate to="/login" replace />;
}

function RoutesView() {
  const store = useStore();
  const navigate = useNavigate();
  return <Routes>
    <Route element={<StoreLayout />}>
      <Route index element={<Home />} />
      <Route path="productos" element={<Products />} />
      <Route path="productos/:id" element={<ProductDetail />} />
      <Route path="categorias" element={<Categories />} />
      <Route path="ofertas" element={<Offers />} />
      <Route path="registro" element={<Register />} />
      <Route path="login" element={<Login />} />
      <Route path="nosotros" element={<About />} />
      <Route path="blogs" element={<Blogs />} />
      <Route path="blogs/:id" element={<BlogDetail />} />
      <Route path="contacto" element={<Contact />} />
      <Route path="carrito" element={<Cart />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="compra/:result/:id" element={<PurchaseResult />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
    <Route path="admin" element={<Guard><AdminLayout /></Guard>}>
      <Route index element={<AdminDashboard />} />
      <Route path="productos" element={<AdminProducts />} />
      <Route path="productos/nuevo" element={<AdminProductForm />} />
      <Route path="productos/:id" element={<AdminProductDetail />} />
      <Route path="productos/:id/editar" element={<AdminProductForm />} />
      <Route path="categorias" element={<AdminCategories />} />
      <Route path="ordenes" element={<AdminOrders />} />
      <Route path="ordenes/:id" element={<AdminOrderDetail />} />
      <Route path="usuarios" element={<AdminUsers />} />
      <Route path="usuarios/nuevo" element={<AdminUserForm />} />
      <Route path="usuarios/:run" element={<AdminUserForm />} />
      <Route path="reportes" element={<AdminReports />} />
      <Route path="perfil" element={<AdminProfile />} />
    </Route>
  </Routes>;
}

export default function App() {
  return <StoreProvider><RoutesView /></StoreProvider>;
}