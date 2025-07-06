// src/web/pages/Acceso/Perfil.tsx
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import Swal from "sweetalert2";
import "../../styles/perfil.css";
import avatarImg from "../../../assets/Imagenes/avatar-default.png";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock } from "react-icons/fa";

const Perfil = () => {
  const { usuario, iniciarSesion, setAvatar } = useAuth();
  const [editando, setEditando] = useState(false);
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);

  const imagenInicial = localStorage.getItem("avatarPerfil") || usuario?.imagen || avatarImg;
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
        setAvatar(nuevaImagen); // 🔁 actualiza en el contexto
      };
      reader.readAsDataURL(file);
    } else {
      Swal.fire("Archivo inválido", "Selecciona una imagen válida.", "error");
    }
  };

  const guardarCambios = () => {
    if (!usuario) return;

    iniciarSesion({
      ...usuario,
      ...datos,
      imagen: imagenPerfil,
    });

    setEditando(false);
    setMostrarCambioPassword(false);

    Swal.fire("Perfil actualizado", "", "success");

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
