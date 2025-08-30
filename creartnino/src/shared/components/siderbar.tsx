// src/shared/components/Sidebar.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaBars, FaUser, FaUsers, FaUserShield, FaTruck, FaCogs,
  FaBox, FaChartBar, FaBoxes, FaShoppingCart, FaTasks, FaChartLine,
  FaUserCircle, FaSignOutAlt, FaGlobe
} from "react-icons/fa";
import logo from '../../assets/Imagenes/logo.jpg';
import avatarImg from '../../assets/Imagenes/avatar-default.png';
import { useAuth } from '../../context/AuthContext';
import '../styles/siderbar.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { cerrarSesion } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedAvatar = localStorage.getItem('avatarPerfil');
    setAvatar(storedAvatar || avatarImg);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMostrarOpciones(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleSection = (section: string) =>
    setOpenSection(openSection === section ? null : section);

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/ingresar');
  };

  return (
    <>
      <button className="toggle-button" onClick={toggleSidebar}>
        <FaBars />
      </button>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="logo" />
          <h2>CREART NINO</h2>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
            <FaChartBar /> Dashboard
          </Link>

          <div className="sidebar-section" onClick={() => toggleSection("config")}>
            Configuración ▾
          </div>
          {openSection === "config" && (
            <>
              <Link to="/roles" className={location.pathname === "/roles" ? "active" : ""}>
                <FaUserShield /> Roles
              </Link>
              <Link to="/usuario" className={location.pathname === "/usuario" ? "active" : ""}>
                <FaUser /> Usuario
              </Link>
              <Link to="/clientes" className={location.pathname === "/clientes" ? "active" : ""}>
                <FaUsers /> Clientes
              </Link>
            </>
          )}

          <div className="sidebar-section" onClick={() => toggleSection("material")}>
            Gestión de Materiales ▾
          </div>
          {openSection === "material" && (
            <>
              <Link to="/proveedores" className={location.pathname === "/proveedores" ? "active" : ""}>
                <FaTruck /> Proveedores
              </Link>
              <Link to="/cate-insumo" className={location.pathname === "/cate-insumo" ? "active" : ""}>
                <FaCogs /> Categoría Insumo
              </Link>
              <Link to="/insumos" className={location.pathname === "/insumos" ? "active" : ""}>
                <FaBox /> Insumos
              </Link>
              <Link to="/compras" className={location.pathname === "/compras" ? "active" : ""}>
                <FaShoppingCart /> Compras
              </Link>
            </>
          )}

          <div className="sidebar-section" onClick={() => toggleSection("produccion")}>
            Gestión de Producción ▾
          </div>
          {openSection === "produccion" && (
            <>
              <Link to="/cat-productos" className={location.pathname === "/cat-productos" ? "active" : ""}>
                <FaBoxes />Categoría Productos
              </Link>
              <Link to="/productos" className={location.pathname === "/productos" ? "active" : ""}>
                <FaBox /> Productos
              </Link>
              <Link to="/produccion" className={location.pathname === "/produccion" ? "active" : ""}>
                <FaChartLine /> Producción
              </Link>
            </>
          )}

          <div className="sidebar-section" onClick={() => toggleSection("procesos")}>
            Gestión de Pedidos ▾
          </div>
          {openSection === "procesos" && (
            <Link to="/pedidos" className={location.pathname === "/pedidos" ? "active" : ""}>
              <FaTasks /> Pedidos
            </Link>
          )}
        </nav>

        {/* Parte inferior */}
        <div className="sidebar-user-container" ref={menuRef}>
          <div className="sidebar-user" onClick={() => setMostrarOpciones(prev => !prev)}>
            <img src={avatar!} alt="Avatar" className="sidebar-avatar" />
            {mostrarOpciones && (
              <div className="sidebar-user-menu">
                <p onClick={() => navigate('/')}>
                  <FaGlobe /> Volver a la web
                </p>
                <p onClick={() => navigate('/perfil')}>
                  <FaUserCircle /> Mi perfil
                </p>
              </div>
            )}
          </div>

          <div className="sidebar-logout" onClick={handleCerrarSesion} title="Cerrar sesión">
            <FaSignOutAlt size={22} />
          </div>
        </div>
      </aside>
    </>
  );
}
