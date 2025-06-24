import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import logorina from '../../assets/Imagenes/logorina.png';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="custom-navbar">
      <div className="nav-left">
        <Link to="/" className="logo-container">
          <img src={logorina} alt="Logo" className="logo-img" />
          <span className="logo-text">CreartNino</span>
        </Link>
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <div className={`menu-content ${menuOpen ? 'open' : ''}`}>
        <ul className="nav-center">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/nosotros">Quiénes Somos</Link></li>
          <li className="dropdown">
            <span className="dropdown-toggle">Categorías</span>
            <div className="mega-menu">
              <h4>Categorías Productos</h4>
              <div className="categories">
                <Link to="/productos/toppers">Toppers</Link>
                <Link to="/productos/tazas">Tazas</Link>
                <Link to="/productos/tarjetas">Tarjetas</Link>
                <Link to="/productos/cajas">Cajas</Link>
                <Link to="/productos/tablas">Tablas</Link>
                <Link to="/productos/luminosos">Luminosos</Link>
                <Link to="/productos/buzos-y-camisas">Buzos y camisas</Link>
                <Link to="/productos/scrunchies">Scrunchies</Link>
                <Link to="/productos/etiquetas-y-stikers">Etiquetas y Stikers</Link>
                <Link to="/productos/susypig">Susypig</Link>
                <Link to="/productos/calendario">Calendario</Link>
                <Link to="/productos/portales-belen">Portales belén</Link>
              </div>
            </div>
          </li>
        </ul>

        <div className="nav-right">
          <Link to="/ingresar" className="btn-outline">Ingresar</Link>
          <Link to="/registrarse" className="btn-filled">Registrarse</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
