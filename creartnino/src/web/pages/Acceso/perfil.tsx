import { useAuth } from "../../../context/AuthContext";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../../styles/perfil.css";
import avatarImg from "../../../assets/Imagenes/avatar-default.png";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock } from "react-icons/fa";

const Perfil = () => {
  const { usuario, iniciarSesion } = useAuth();
  const [editando, setEditando] = useState(false);
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);

  // Imagen desde localStorage o imagen por defecto
  const imagenInicial = localStorage.getItem("avatarPerfil") || avatarImg;
  const [imagenPerfil, setImagenPerfil] = useState<string>(imagenInicial);

  const [datos, setDatos] = useState({
    nombreCompleto: usuario?.nombreCompleto || "",
    correo: usuario?.correo || "",
    celular: usuario?.celular || "",
    direccion: usuario?.direccion || "",
    actual: "",
    nueva: "",
    confirmar: "",
  });

  const handleCambiar = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const nuevaImagen = reader.result as string;
        setImagenPerfil(nuevaImagen);
        localStorage.setItem("avatarPerfil", nuevaImagen);
      };
      reader.readAsDataURL(file);
    } else {
      Swal.fire("Archivo inválido", "Selecciona una imagen válida.", "error");
    }
  };

  const validarCampos = () => {
    if (datos.nombreCompleto.trim().split(" ").length < 2) {
      Swal.fire("Nombre inválido", "Debe tener al menos nombre y apellido.", "error");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
      Swal.fire("Correo inválido", "Introduce un correo válido.", "error");
      return false;
    }
    if (!/^\d{10}$/.test(datos.celular)) {
      Swal.fire("Celular inválido", "Debe tener exactamente 10 dígitos.", "error");
      return false;
    }
    if (datos.direccion && datos.direccion.trim().length < 5) {
      Swal.fire("Dirección inválida", "Dirección demasiado corta.", "error");
      return false;
    }
    return true;
  };

  const validarContraseñaActual = () => {
    if (datos.actual !== "1234") {
      Swal.fire("Contraseña incorrecta", "La contraseña actual no es válida.", "error");
      return false;
    }
    return true;
  };

  const validarNuevaContraseña = () => {
    if (datos.nueva.length < 6) {
      Swal.fire("Nueva contraseña inválida", "Debe tener mínimo 6 caracteres.", "error");
      return false;
    }
    if (datos.nueva !== datos.confirmar) {
      Swal.fire("No coinciden", "La nueva contraseña no coincide con la confirmación.", "error");
      return false;
    }
    return true;
  };

  const guardarCambios = () => {
    if (!validarCampos()) return;

    if (mostrarCambioPassword) {
      if (!validarContraseñaActual()) return;
      if (!validarNuevaContraseña()) return;
    }

    iniciarSesion({
      ...datos
    });

    setEditando(false);
    setMostrarCambioPassword(false);

    Swal.fire("Perfil actualizado", "", "success");

    // Limpiar campos de contraseña
    setDatos((prev) => ({
      ...prev,
      actual: "",
      nueva: "",
      confirmar: "",
    }));
  };

  return (
    <div className="perfil-layout tarjeta">
      <div className="perfil-avatar">
        <img src={imagenPerfil} alt="Avatar" />
        <h3>{datos.nombreCompleto}</h3>
        {editando && (
          <div className="cambiar-avatar">
            <label className="btn pastel">
              Cambiar imagen
              <input type="file" accept="image/*" onChange={handleImagenChange} hidden />
            </label>
          </div>
        )}
      </div>

      <div className="perfil-form-grid">
        <div className="perfil-dato">
          <label><FaUser /> Nombre Completo</label>
          <input name="nombreCompleto" value={datos.nombreCompleto} onChange={handleCambiar} disabled={!editando} />
        </div>
        <div className="perfil-dato">
          <label><FaEnvelope /> Correo</label>
          <input name="correo" value={datos.correo} onChange={handleCambiar} disabled={!editando} />
        </div>
        <div className="perfil-dato">
          <label><FaPhone /> Celular</label>
          <input name="celular" value={datos.celular} onChange={handleCambiar} disabled={!editando} />
        </div>
        <div className="perfil-dato">
          <label><FaMapMarkerAlt /> Dirección</label>
          <input name="direccion" value={datos.direccion} onChange={handleCambiar} disabled={!editando} />
        </div>
      </div>

      {editando && mostrarCambioPassword && (
        <div className="perfil-form-grid">
          <div className="perfil-dato">
            <label><FaLock /> Contraseña actual</label>
            <input type="password" name="actual" value={datos.actual} onChange={handleCambiar} />
          </div>
          <div className="perfil-dato">
            <label><FaLock /> Nueva contraseña</label>
            <input type="password" name="nueva" value={datos.nueva} onChange={handleCambiar} />
          </div>
          <div className="perfil-dato">
            <label><FaLock /> Confirmar nueva</label>
            <input type="password" name="confirmar" value={datos.confirmar} onChange={handleCambiar} />
          </div>
        </div>
      )}

      <div className="perfil-boton-visual">
        {editando ? (
          <>
            <button className="btn pastel" onClick={guardarCambios}>Guardar cambios</button>
            {!mostrarCambioPassword && (
              <button className="btn pastel" onClick={() => setMostrarCambioPassword(true)}>Cambiar contraseña</button>
            )}
          </>
        ) : (
          <button className="btn pastel" onClick={() => setEditando(true)}>Editar perfil</button>
        )}
      </div>
    </div>
  );
};

export default Perfil;
