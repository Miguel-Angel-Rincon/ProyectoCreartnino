// src/shared/components/Sidebar.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaUserCircle, FaSignOutAlt, FaGlobe } from "react-icons/fa";
import logo from "../../assets/Imagenes/logo.jpg";
import { useAuth } from "../../context/AuthContext";
import { useMenuFiltrado } from "../hooks/useMenuFiltrado";
import Swal from "sweetalert2";
import "../styles/siderbar.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [mostrarOpciones, setMostrarOpciones] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { cerrarSesion } = useAuth();
  const menuFiltrado = useMenuFiltrado(); // 🔑 Aquí usamos el hook
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú de usuario si clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMostrarOpciones(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const toggleSection = (section: string) =>
    setOpenSection(openSection === section ? null : section);

  const handleCerrarSesion = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Tu sesión se cerrará y volverás a la página de ingreso.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f48fb1",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      cerrarSesion();
      navigate("/ingresar");
      Swal.fire({
        title: "Sesión cerrada",
        text: "Has cerrado sesión correctamente.",
        timer: 80000,
        icon: "success",
        confirmButtonColor: "#ff8feeff",
      });
    }
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

        {/* 🔑 Menú dinámico */}
        <nav className="sidebar-nav">
          {menuFiltrado.map((item) => (
            <div key={item.key}>
              {item.children ? (
                <>
                  <div
                    className="sidebar-section"
                    onClick={() => toggleSection(item.key)}
                  >
                    {item.label} ▾
                  </div>
                  {openSection === item.key &&
                    item.children.map((child) => (
                      <Link
                        key={child.key}
                        to={child.path!}
                        className={location.pathname === child.path ? "active" : ""}
                      >
                        {child.icon} {child.label}
                      </Link>
                    ))}
                </>
              ) : (
                <Link
                  to={item.path!}
                  className={location.pathname === item.path ? "active" : ""}
                >
                  {item.icon} {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Parte inferior */}
        <div className="sidebar-user-container" ref={menuRef}>
          <div
            className="sidebar-user"
            onClick={() => setMostrarOpciones((prev) => !prev)}
            style={{ cursor: "pointer" }}
          >
            <FaUserCircle size={28} className="sidebar-user-icon" />
            {mostrarOpciones && (
              <div className="sidebar-user-menu">
                <p onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                  <FaGlobe /> Volver a la web
                </p>
                <p onClick={() => navigate("/perfil")} style={{ cursor: "pointer" }}>
                  <FaUserCircle /> Mi perfil
                </p>
              </div>
            )}
          </div>

          <div
  className="sidebar-logout"
  onClick={handleCerrarSesion}
  style={{ cursor: "pointer", color: "#fa80deff", position: "relative" }}
>
  <FaSignOutAlt size={22} />

  {/* Tooltip pastel */}
  <span className="tooltip">Cerrar sesión</span>
</div>

        </div>
      </aside>
    </>
  );
}
