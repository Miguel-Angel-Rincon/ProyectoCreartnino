import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaUser,
  FaUsers,
  FaUserShield,
  FaTruck,
  FaCogs,
  FaBox,
  FaChartBar,
  FaBoxes,
  FaShoppingCart,

  FaTasks,
  FaChartLine,
  
} from "react-icons/fa";
import logo from '../../assets/Imagenes/logo.jpg'; // Adjust the path as necessary
import '../styles/siderbar.css'; // Adjust the path as necessary

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleSection = (section: string) =>
    setOpenSection(openSection === section ? null : section);

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

          <div
            className="sidebar-section"
            onClick={() => toggleSection("config")}
          >
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

          <div
            className="sidebar-section"
            onClick={() => toggleSection("material")}
          >
            Gestion de Materiales ▾
          </div>
          {openSection === "material" && (
            <>
              <Link to="/proveedores" className={location.pathname === "/proveedores" ? "active" : ""}>
                <FaTruck /> Proveedores
              </Link>
              <Link to="/cate-insumo" className={location.pathname === "/cate-insumo" ? "active" : ""}>
                <FaCogs /> Categoria Insumo
              </Link>
              <Link to="/insumos" className={location.pathname === "/insumos" ? "active" : ""}>
                <FaBox /> Insumos
              </Link>
              <Link to="/compras" className={location.pathname === "/compras" ? "active" : ""}>
                <FaShoppingCart /> Compras
              </Link>
            </>
          )}

          <div
            className="sidebar-section"
            onClick={() => toggleSection("produccion")}
          >
            Gestionar la producción ▾
          </div>
          {openSection === "produccion" && (
            <>
              <Link to="/produccion" className={location.pathname === "/produccion" ? "active" : ""}>
                <FaChartLine /> Producción
              </Link>
              <Link to="/cat-productos" className={location.pathname === "/cat-productos" ? "active" : ""}>
                <FaBoxes /> Categoria Productos
              </Link>
              <Link to="/productos" className={location.pathname === "/productos" ? "active" : ""}>
                <FaBox /> Productos
              </Link>
            </>
          )}

          <div
            className="sidebar-section"
            onClick={() => toggleSection("procesos")}
          >
            Procesos ▾
          </div>
          {openSection === "procesos" && (
            <Link to="/pedidos" className={location.pathname === "/pedidos" ? "active" : ""}>
              <FaTasks /> Pedidos
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}
