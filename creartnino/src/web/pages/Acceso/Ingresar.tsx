// src/web/pages/Ingresar.tsx
import { useState } from "react";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../../styles/acceso.css";
import ImagenIngresar from "../../../assets/Imagenes/imagen-ingresar.png";
import { useAuth } from "../../../context/AuthContext";

const API = "http://www.apicreartnino.somee.com/api/Auth";

const Ingresar = () => {
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  // Estados principales
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [codigo, setCodigo] = useState("");

  // Recuperar contraseña
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [mostrarNuevaContrasena, setMostrarNuevaContrasena] = useState(false);
  const [nuevaPass, setNuevaPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  // Control de inputs
  const [mostrarCodigoInput, setMostrarCodigoInput] = useState(false); // (login)
  const [loading, setLoading] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(0);
  const [verNuevaPass, setVerNuevaPass] = useState(false);
  const [verConfirmPass, setVerConfirmPass] = useState(false);

  const showAlert = (title: string, text: string, icon: any = "info") => {
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: "OK",
      confirmButtonColor: "#7d3cf0",
    });
  };

  const esContrasenaSegura = (pass: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pass);
  };

  // ===== Login =====
  const handleLogin = async () => {
    if (!correo.trim() || !contrasena.trim()) {
      return showAlert("Campos vacíos", "Completa todos los campos.", "warning");
    }
    setLoading(true);
    try {
      const resp = await fetch(`${API}/LoginPaso1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      if (resp.ok) {
        showAlert("Verificación exitosa", "Ahora ingresa el código enviado a tu correo.", "success");
        setMostrarCodigoInput(true);
        iniciarTemporizador();
      } else {
        const data = await resp.json();
        showAlert("Error", data.mensaje || "Credenciales inválidas", "error");
      }
    } catch {
      showAlert("Error", "Hubo un problema con la conexión", "error");
    }
    setLoading(false);
  };

  const handleValidarCodigo = async () => {
    if (!codigo.trim()) {
      return showAlert("Campo vacío", "Ingresa el código de verificación.", "warning");
    }
    setLoading(true);
    try {
      const resp = await fetch(`${API}/LoginPaso2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo }),
      });

      const data = await resp.json();

      if (resp.ok) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("idRol", data.idRol);
  localStorage.setItem("correo", correo);
  localStorage.setItem("NumDocumento", data.usuario.numDocumento ?? "");

  // Ojo: mapeamos idRol → IdRol
  iniciarSesion({ ...data.usuario, IdRol: data.idRol }, data.token);

  showAlert("✅ Sesión iniciada", "Bienvenido", "success");

  if (data.idRol === 1) navigate("/dashboard");
  else if (data.idRol === 4) navigate("/");
  else showAlert("⚠️ Rol no reconocido", "", "warning");
}else {
        showAlert("Error", data.mensaje || "Código inválido", "error");
      }
    } catch {
      showAlert("Error", "No se pudo validar el código", "error");
    }
    setLoading(false);
  };

  const handleReenviarCodigo = async () => {
    setLoading(true);
    try {
      // IMPORTANTE: este endpoint espera el correo como STRING plano
      const resp = await fetch(`${API}/ReenviarCodigoLogin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(correo),
      });

      if (resp.ok) {
        setCodigo("");
        showAlert("📩 Código reenviado", "Revisa tu correo para el nuevo código.", "success");
        iniciarTemporizador();
      } else {
        const data = await resp.json();
        showAlert("Error", data.mensaje || "No se pudo reenviar", "error");
      }
    } catch {
      showAlert("Error", "Hubo un problema con la conexión", "error");
    }
    setLoading(false);
  };

  // ===== Recuperación de contraseña =====
  // Paso 1: Enviar código
  const handleRecuperar = async () => {
    if (!correo.includes("@")) {
      return showAlert("Correo inválido", "Ingresa un correo válido.", "error");
    }
    setLoading(true);
    try {
      // IMPORTANTE: este endpoint espera el correo como STRING plano
      const resp = await fetch(`${API}/RecuperarPaso1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(correo),
      });

      if (resp.ok) {
        setCodigoEnviado(true);
        setCodigo(""); // limpiar input
        showAlert("Código enviado", "Revisa tu correo.", "success");
        iniciarTemporizador();
      } else {
        const data = await resp.json();
        showAlert("Error", data.mensaje || "No se pudo enviar", "error");
      }
    } catch {
      showAlert("Error", "Problema de conexión", "error");
    }
    setLoading(false);
  };

  // Reenviar código de recuperación
  const handleReenviarCodigoRecuperacion = async () => {
    setLoading(true);
    try {
      // IMPORTANTE: también como STRING plano
      const resp = await fetch(`${API}/ReenviarCodigoRecuperacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(correo),
      });

      if (resp.ok) {
        showAlert("📩 Código reenviado", "Revisa tu correo nuevamente.", "success");
        iniciarTemporizador();
      } else {
        const data = await resp.json();
        showAlert("Error", data.mensaje || "No se pudo reenviar", "error");
      }
    } catch {
      showAlert("Error", "Problema de conexión", "error");
    }
    setLoading(false);
  };

  // Paso 2: Validar código
  const handleValidarCodigoRecuperacion = async () => {
    if (!codigo.trim()) {
      return showAlert("Campo vacío", "Ingresa el código.", "warning");
    }
    setLoading(true);
    try {
      const resp = await fetch(`${API}/ValidarCodigoRecuperacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo }),
      });

      if (resp.ok) {
        setMostrarNuevaContrasena(true);
        showAlert("Código válido", "Ingresa tu nueva contraseña.", "success");
      } else {
        const data = await resp.json();
        showAlert("Error", data.mensaje || "Código inválido", "error");
      }
    } catch {
      showAlert("Error", "Problema de conexión", "error");
    }
    setLoading(false);
  };

  // Paso 3: Cambiar contraseña
  const handleCambiarPass = async () => {
    if (!nuevaPass || !confirmPass)
      return showAlert("Campos requeridos", "Completa ambos campos.", "warning");
    if (nuevaPass !== confirmPass)
      return showAlert("Error", "Las contraseñas no coinciden.", "error");
    if (!esContrasenaSegura(nuevaPass))
      return showAlert(
        "Contraseña insegura",
        "Debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.",
        "error"
      );

    setLoading(true);
    try {
      const resp = await fetch(`${API}/RecuperarPaso2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo, nuevaContrasena: nuevaPass }),
      });

      if (resp.ok) {
        showAlert("¡Contraseña actualizada!", "Ya puedes iniciar sesión.", "success").then(() => {
          setMostrarNuevaContrasena(false);
          setMostrarRecuperar(false);
          setCodigoEnviado(false);
          setMostrarCodigoInput(false);
          setNuevaPass("");
          setConfirmPass("");
          setCodigo("");
        });
      } else {
        const data = await resp.json();
        showAlert("Error", data.mensaje || "No se pudo cambiar", "error");
      }
    } catch {
      showAlert("Error", "Problema de conexión", "error");
    }
    setLoading(false);
  };

  // Temporizador
  const iniciarTemporizador = () => {
    setSegundosRestantes(60);
    const interval = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="contenedor-general">
      <div className="contenedor-interior">
        <div className="lado-izquierdo">
          <p>
            <strong>
              ¡Bienvenido de nuevo! <br /> Inicia sesión para disfrutar de la
              experiencia CreatNino 🎨
            </strong>
          </p>
          <img src={ImagenIngresar} alt="Creatividad" className="imagen-lateral" />
        </div>

        <div className="formulario">
          {/* Recuperación */}
          {mostrarRecuperar ? (
            mostrarNuevaContrasena ? (
              <>
                <h3 className="titulo-form">Cambio de contraseña</h3>

                <label>Nueva contraseña</label>
                <div className="campo-password">
                  <input
                    type={verNuevaPass ? "text" : "password"}
                    className="input"
                    placeholder="Nueva contraseña"
                    value={nuevaPass}
                    onChange={(e) => setNuevaPass(e.target.value)}
                  />
                  <span className="toggle-password" onClick={() => setVerNuevaPass(!verNuevaPass)}>
                    {verNuevaPass ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <label>Confirmar contraseña</label>
                <div className="campo-password">
                  <input
                    type={verConfirmPass ? "text" : "password"}
                    className="input"
                    placeholder="Confirmar contraseña"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                  />
                  <span className="toggle-password" onClick={() => setVerConfirmPass(!verConfirmPass)}>
                    {verConfirmPass ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <button className="boton-principal" onClick={handleCambiarPass} disabled={loading}>
                  {loading ? "Cambiando..." : "Cambiar"}
                </button>
              </>
            ) : (
              <>
                <h3 className="titulo-form">Para cambio de contraseña</h3>

                <label>Correo electrónico</label>
                <input
                  type="email"
                  className="input"
                  placeholder="Correo electrónico"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />

                {!codigoEnviado ? (
                  <button className="boton-principal" onClick={handleRecuperar} disabled={loading}>
                    {loading ? "Enviando..." : "Enviar código"}
                  </button>
                ) : (
                  <>
                    <label style={{ marginTop: 12 }}>Código recibido</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Código de recuperación"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                    />
                    <button
                      className="boton-principal"
                      onClick={handleValidarCodigoRecuperacion}
                      disabled={loading}
                    >
                      {loading ? "Verificando..." : "Validar código"}
                    </button>

                    {segundosRestantes > 0 ? (
                      <p className="temporizador">Puedes reenviar en {segundosRestantes} segundos</p>
                    ) : (
                      <button
                        className="boton-regresar"
                        onClick={handleReenviarCodigoRecuperacion}
                        disabled={loading}
                      >
                        Reenviar código
                      </button>
                    )}

                    <button
                      className="boton-regresar"
                      onClick={() => {
                        setCodigoEnviado(false);
                        setCodigo("");
                      }}
                    >
                      Cambiar correo
                    </button>
                  </>
                )}

                <button
                  className="boton-regresar"
                  onClick={() => {
                    setMostrarRecuperar(false);
                    setCodigoEnviado(false);
                    setCodigo("");
                  }}
                >
                  Regresar
                </button>
              </>
            )
          ) : mostrarCodigoInput ? (
            <>
              <h3 className="titulo-form">Ingresa tu código</h3>
              <input
                type="text"
                className="input"
                placeholder="Código de verificación"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
              <button className="boton-principal" onClick={handleValidarCodigo} disabled={loading}>
                {loading ? "Verificando..." : "Enviar"}
              </button>

              {segundosRestantes > 0 ? (
                <p className="temporizador">Puedes reenviar en {segundosRestantes} segundos</p>
              ) : (
                <button className="boton-regresar" onClick={handleReenviarCodigo} disabled={loading}>
                  Reenviar código
                </button>
              )}

              <button
                className="boton-regresar"
                onClick={() => {
                  setMostrarCodigoInput(false);
                  setCodigo("");
                  setContrasena("");
                }}
              >
                Regresar
              </button>
            </>
          ) : (
            <>
              <h2 className="titulo-form">Iniciar Sesión</h2>
              <label>Correo</label>
              <input
                type="email"
                className="input"
                placeholder="Correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
              <label>Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="Contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
              />
              <button className="boton-principal" onClick={handleLogin} disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </button>

              <div className="acciones-form">
                <span className="link-recuperar" onClick={() => setMostrarRecuperar(true)}>
                  ¿Olvidaste tu contraseña?
                </span>
                <Link to="/Registrar" className="link-crear">
                  Registrar
                </Link>
              </div>
              <div className="volver-inicio">
                <Link to="/">← Regresar</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ingresar;
