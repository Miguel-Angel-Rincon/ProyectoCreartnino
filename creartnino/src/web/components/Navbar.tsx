// src/web/components/Navbar.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import { useCompras } from '../../context/CompraContext';
import '../styles/Navbar.css';
import { FaShoppingCart, FaClipboardList, FaTachometerAlt, FaUserCircle } from 'react-icons/fa';
import logorina from '../../assets/Imagenes/logorina.png';
import Swal from 'sweetalert2';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { usuario, isAuthenticated, cerrarSesion } = useAuth();
  const { carrito } = useCarrito();
  const { compras } = useCompras();
  const navigate = useNavigate();

  // ✅ Roles
  const esAdmin = usuario?.IdRol === 1;
  const esCliente = usuario?.IdRol === 4;

  const comprasActivas = compras.filter(c => c.estado !== 'anulado').length;

  const handleCerrarSesion = async () => {
    await Swal.fire({
      title: 'Sesión cerrada',
      text: 'Tu sesión ha sido cerrada correctamente.',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#7d3cf0',
    });
    cerrarSesion();
    navigate('/ingresar');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMostrarMenuUsuario(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="custom-navbar">
      <div className="nav-left">
        <Link to="/" className="logo-container">
          <img src={logorina} alt="Logo" className="logo-img" />
          <span className="logo-text">CreartNino</span>
        </Link>
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>

      <div className={`menu-content ${menuOpen ? 'open' : ''}`}>
        <ul className="nav-center">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/nosotros">Quiénes Somos</Link></li>
          <li className="dropdown">
            <span className="dropdown-toggle">Categorías</span>
            <div className="mega-menu">
              <h4>Categorías Productos</h4>
              <div className="categories">
                <Link to="/productos/todos">Todos los productos</Link>
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

        <div className="nav-right" ref={menuRef}>
          {!isAuthenticated ? (
            <>
              <Link to="/ingresar" className="btn-outline">Ingresar</Link>
              <Link to="/registrar" className="btn-filled">Registrarse</Link>
            </>
          ) : (
            <div className="usuario-logueado">
              <div className="iconos-usuario">
                {esCliente && (
                  <>
                    <Link to="/carrito" className="icono-nav">
                      <FaShoppingCart />
                      {carrito.length > 0 && <span className="cantidad">{carrito.length}</span>}
                    </Link>
                    <Link to="/miscompras" className="icono-nav">
                      <FaClipboardList />
                      {comprasActivas > 0 && <span className="cantidad">{comprasActivas}</span>}
                    </Link>
                  </>
                )}

                {esAdmin && (
                  <FaTachometerAlt
                    size={22}
                    title="Ir al panel"
                    className="icono-nav"
                    style={{ cursor: 'pointer', marginRight: '8px' }}
                    onClick={() => navigate('/dashboard')}
                  />
                )}

                {/* 🔄 Icono en vez de avatar */}
                <FaUserCircle
                  size={28}
                  className="icono-nav"
                  style={{ cursor: 'pointer', color: "#000000ff" }} // 👈 color del navbar
                  onClick={() => setMostrarMenuUsuario(prev => !prev)}
                />
              </div>

              {mostrarMenuUsuario && (
                <div className="menu-usuario">
                  <p onClick={() => { navigate('/perfil'); setMostrarMenuUsuario(false); }}>
                    Mi perfil
                  </p>
                  <p onClick={handleCerrarSesion}>Cerrar sesión</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
