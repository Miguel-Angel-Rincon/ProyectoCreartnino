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
import slider1 from '../../assets/Imagenes/slider1.png'; // Adjust the path as necessary
import slider2 from '../../assets/Imagenes/slider2.png'; 
import slider3 from '../../assets/Imagenes/slider3.png'; 
import Logo2 from '../../assets/Imagenes/Logo2.png'; 
import velas from '../../assets/Imagenes/velas.jpg'; 
import velasx2 from '../../assets/Imagenes/velasx2.jpg'; 
import topper from '../../assets/Imagenes/topper.jpg'; 
import cajita from '../../assets/Imagenes/cajita.jpg'; 
import topperCircular from '../../assets/Imagenes/topperCircular.jpg'; 
import tablasStitch from '../../assets/Imagenes/tablasStitch.jpg'; 
import tazaParaiso from '../../assets/Imagenes/tazaParaiso.jpg'; 
import Rina from '../../assets/Imagenes/Rina.png'; 
import slider1_2 from '../../assets/Imagenes/slider1_2.png'; 
import slider2_2 from '../../assets/Imagenes/slider2_2.png'; 
import slider3_2 from '../../assets/Imagenes/slider3_2.png'; 
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
          <img src={slider1} alt="slider1" className="slider1" />
          <img src={slider2} alt="slider2" className="slider2" />
          <img src={slider3} alt="slider3" className="slider3" />
          <img src={Logo2} alt="Logo2" className="Logo2" />
          <img src={velas} alt="velas" className="velas" />
          <img src={velasx2} alt="velasx2" className="velasx2" />
          <img src={topper} alt="topper" className="topper" />
          <img src={cajita} alt="cajita" className="cajita" />
          <img src={tablasStitch} alt="tablasStitch" className="tablasStitch" />
          <img src={topperCircular} alt="topperCircular" className="topperCircular" />
          <img src={tazaParaiso} alt="tazaParaiso" className="tazaParaiso" />
          <img src={Rina} alt="Rina" className="Rina" />
          <img src={slider1_2} alt="slider1_2" className="slider1_2" />
          <img src={slider2_2} alt="slider2_2" className="slider2_2" />
          <img src={slider3_2} alt="slider3_2" className="slider3_2" />
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
