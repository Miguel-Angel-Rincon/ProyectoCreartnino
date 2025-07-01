import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../styles/Navbar.css';
import { FaUserCircle } from 'react-icons/fa';
import logorina from '../../assets/Imagenes/logorina.png';
import Swal from 'sweetalert2';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const { usuario, isAuthenticated, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Cierra el menú de usuario si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
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
              <Link to="/Registrar" className="btn-filled">Registrarse</Link>
            </>
          ) : (
            <div className="usuario-logueado">
              <FaUserCircle
                size={30}
                onClick={() => setMostrarMenuUsuario(prev => !prev)}
                style={{ cursor: 'pointer' }}
              />
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
