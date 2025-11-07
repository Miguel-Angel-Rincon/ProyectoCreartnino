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
  const [colorDegradado, setColorDegradado] = useState<string>("");

  const location = useLocation();
  const navigate = useNavigate();
  const { cerrarSesion,usuario } = useAuth();
  const menuFiltrado = useMenuFiltrado(); // 🔑 Aquí usamos el hook
  const menuRef = useRef<HTMLDivElement>(null);

  const generarDegradadoSuave = () => {
  const degradados = [
    "linear-gradient(135deg, #2F4858, #486581)", // Azul petróleo
    "linear-gradient(135deg, #4B3F72, #7765E3)", // Morado medio
    "linear-gradient(135deg, #3B5360, #7B8794)", // Gris azulado
    "linear-gradient(135deg, #5C5470, #9A8C98)", // Púrpura grisáceo
    "linear-gradient(135deg, #3E4C59, #52606D)", // Azul gris oscuro
  ];
  return degradados[Math.floor(Math.random() * degradados.length)];
};

// 🟣 Mantener color fijo por sesión
useEffect(() => {
  const savedColor = localStorage.getItem("avatarColor");
  if (savedColor) {
    setColorDegradado(savedColor);
  } else {
    const nuevo = generarDegradadoSuave();
    setColorDegradado(nuevo);
    localStorage.setItem("avatarColor", nuevo);
  }
}, []);

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
    localStorage.removeItem("avatarColor"); // 🟣 Eliminar color al cerrar sesión
    cerrarSesion();
    navigate("/ingresar");
    Swal.fire({
      title: "Sesión cerrada",
      text: "Has cerrado sesión correctamente.",
      timer: 8000,
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
            <div
  className="sidebar-avatar"
  style={{
    background: colorDegradado,
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "18px",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    transition: "transform 0.2s ease",
  }}
  title={usuario?.NombreCompleto || "Usuario"}
  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
>
  {usuario?.NombreCompleto
    ? usuario.NombreCompleto.trim().charAt(0).toUpperCase()
    : "?"}
</div>


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
