import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCarrito } from "../../context/CarritoContext";
import { useCompras } from "../../context/CompraContext";
import "../styles/Navbar.css";
import {
  FaShoppingCart,
  FaClipboardList,
  FaTachometerAlt,
  FaUserCircle,
} from "react-icons/fa";
import logorina from "../../assets/Imagenes/logorina.png";
import Swal from "sweetalert2";

import type { ICatProductos } from "../../features/interfaces/ICatProductos";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [categorias, setCategorias] = useState<ICatProductos[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const { usuario, isAuthenticated, cerrarSesion } = useAuth();
  const { carrito } = useCarrito();
  const { compras } = useCompras();
  const navigate = useNavigate();

  const esAdmin = usuario?.IdRol === 1;
  const esCliente = usuario?.IdRol === 4;

  const comprasActivas = compras.filter((c) => c.estado !== "anulado").length;

  const handleCerrarSesion = async () => {
    await Swal.fire({
      title: "Sesión cerrada",
      text: "Tu sesión ha sido cerrada correctamente.",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#7d3cf0",
    });
    cerrarSesion();
    navigate("/ingresar");
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const resp = await fetch(
          "https://www.apicreartnino.somee.com/api/Categoria_productos/Lista"
        );
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const data: ICatProductos[] = await resp.json();

        // ✅ Guardar solo categorías activas
        setCategorias(data.filter((c) => c.Estado === true));
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    fetchCategorias();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMostrarMenuUsuario(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔧 función para generar URL amigable
  const generarSlug = (nombre: string) =>
    nombre
      .toLowerCase()
      .normalize("NFD") // elimina acentos
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-"); // reemplaza espacios por guiones

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

      <div className={`menu-content ${menuOpen ? "open" : ""}`}>
        <ul className="nav-center">
          <li>
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/nosotros">Quiénes Somos</Link>
          </li>

          {/* 🔄 Categorías dinámicas */}
          <li className="dropdown">
            <span className="dropdown-toggle">Categorías</span>
            <div className="mega-menu">
              <h4>Categorías Productos</h4>
              <div className="categories">
                {/* ✅ Solo mostrar "Todos los productos" si hay al menos 1 categoría activa */}
                {categorias.length > 0 && (
                  <Link to="/productos/todos">Todos los productos</Link>
                )}

                {categorias.length > 0 ? (
                  categorias.map((cat) => (
                    <Link
                      key={cat.IdCategoriaProducto}
                      to={`/productos/${generarSlug(cat.CategoriaProducto1)}`}
                    >
                      {cat.CategoriaProducto1}
                    </Link>
                  ))
                ) : (
                  <p>Cargando categorías...</p>
                )}
              </div>
            </div>
          </li>
        </ul>

        <div className="nav-right" ref={menuRef}>
          {!isAuthenticated ? (
            <>
              <Link to="/ingresar" className="btn-outline">
                Ingresar
              </Link>
              <Link to="/registrar" className="btn-filled">
                Registrarse
              </Link>
            </>
          ) : (
            <div className="usuario-logueado">
              <div className="iconos-usuario">
                {esCliente && (
                  <>
                    <Link to="/carrito" className="icono-nav">
                      <FaShoppingCart />
                      {carrito.length > 0 && (
                        <span className="cantidad">{carrito.length}</span>
                      )}
                    </Link>
                    <Link to="/miscompras" className="icono-nav">
                      <FaClipboardList />
                      {comprasActivas > 0 && (
                        <span className="cantidad">{comprasActivas}</span>
                      )}
                    </Link>
                  </>
                )}

                {esAdmin && (
                  <FaTachometerAlt
                    size={22}
                    title="Ir al panel"
                    className="icono-nav"
                    style={{ cursor: "pointer", marginRight: "8px" }}
                    onClick={() => navigate("/dashboard")}
                  />
                )}

                <FaUserCircle
                  size={28}
                  className="icono-nav"
                  style={{ cursor: "pointer", color: "#000000ff" }}
                  onClick={() => setMostrarMenuUsuario((prev) => !prev)}
                />
              </div>

              {mostrarMenuUsuario && (
                <div className="menu-usuario">
                  <p
                    onClick={() => {
                      navigate("/perfil");
                      setMostrarMenuUsuario(false);
                    }}
                  >
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
