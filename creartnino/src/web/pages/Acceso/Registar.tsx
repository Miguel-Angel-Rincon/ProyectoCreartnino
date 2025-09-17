// Registrar.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import registroImage from "../../../assets/Imagenes/RegistrerCreartnino.jpg";
import "../../styles/Registrar.css";

const API_BASE = "https://apicreartnino.somee.com/api";

const Registrar: React.FC = () => {
  const navigate = useNavigate();

  // formulario
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [documento, setDocumento] = useState("");
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");

  // departamento -> usamos id como value
  const [departamentoId, setDepartamentoId] = useState<string>("");
  const [departamentoNombre, setDepartamentoNombre] = useState<string>("");
  const [ciudad, setCiudad] = useState("");

  // direcciones (submodal)
  const [direccion, setDireccion] = useState("");
  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [direccionData, setDireccionData] = useState({ municipio: "", barrio: "", calle: "" });

  // departamentos / ciudades
  const [departamentos, setDepartamentos] = useState<{ id: number; name: string }[]>([]);
  const [todasCiudades, setTodasCiudades] = useState<
    { id: number; name: string; departmentId: number }[]
  >([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState<{ id: number; name: string }[]>([]);

  // UI states
  const [verContrasena, setVerContrasena] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [mostrarCodigoInput, setMostrarCodigoInput] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0); // ⏳ contador de espera
  

  // validaciones
  const esCorreoValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const esContrasenaSegura = (pass: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pass);

  // fetch departamentos y todas las ciudades (una vez)
  useEffect(() => {
    fetch("https://api-colombia.com/api/v1/Department")
      .then((r) => r.json())
      .then((data) => {
        const sorted = Array.isArray(data)
          ? data.sort((a: any, b: any) => a.name.localeCompare(b.name))
          : [];
        setDepartamentos(sorted);
      })
      .catch((e) => console.error("departamentos:", e));

    fetch("https://api-colombia.com/api/v1/City/pagedList?page=1&pageSize=1000")
      .then((r) => r.json())
      .then((res) => {
        const items = res?.data ?? [];
        setTodasCiudades(items);
      })
      .catch((e) => console.error("ciudades:", e));
  }, []);

  // filtrar ciudades cuando cambia departamentoId
  useEffect(() => {
    if (!departamentoId) {
      setCiudadesFiltradas([]);
      setCiudad("");
      setDepartamentoNombre("");
      return;
    }
    const dep = departamentos.find((d) => d.id.toString() === departamentoId);
    if (!dep) {
      setCiudadesFiltradas([]);
      setCiudad("");
      setDepartamentoNombre("");
      return;
    }
    setDepartamentoNombre(dep.name);
    const filt = todasCiudades
      .filter((c) => c.departmentId === dep.id)
      .map((c) => ({ id: c.id, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    setCiudadesFiltradas(filt);
    setCiudad("");
  }, [departamentoId, departamentos, todasCiudades]);

  // Guardar dirección desde submodal
  const handleDireccionModalSave = () => {
    const full = `${direccionData.barrio}, ${direccionData.calle}, ${direccionData.municipio}`;
    setDireccion(full);
    setShowDireccionModal(false);
  };

  // mostrar alert
  const showAlert = (title: string, text: string, icon: "success" | "warning" | "error") =>
    Swal.fire({ title, text, icon, confirmButtonColor: "#e83e8c" });

  // enviar registro
  // ... (tus imports y estados quedan igual)

const enviarRegistro = async () => {
  if (
    !tipoDocumento ||
    !documento ||
    !nombre ||
    !celular ||
    !correo ||
    !contrasena ||
    !confirmar ||
    !departamentoId ||
    !ciudad ||
    !direccion
  ) {
    return showAlert("Campos vacíos", "Completa todos los campos obligatorios.", "warning");
  }
  if (!esCorreoValido(correo)) {
    return showAlert("Correo inválido", "Ingresa un correo electrónico válido.", "error");
  }
  if (contrasena !== confirmar) {
    return showAlert("Error", "Las contraseñas no coinciden.", "error");
  }
  if (!esContrasenaSegura(contrasena)) {
    return showAlert(
      "Contraseña insegura",
      "Debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.",
      "error"
    );
  }

  // 1) Solo enviamos código, no creamos usuario todavía
  setLoading(true);
  try {
    const resp = await fetch(`${API_BASE}/Usuarios/EnviarCodigoCorreo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(correo),
    });

    setLoading(false);
    if (!resp.ok) throw new Error(await resp.text());

    await Swal.fire({
      icon: "success",
      title: "Código enviado",
      text: "Revisa tu correo e ingresa el código para confirmar el registro.",
      confirmButtonColor: "#e83e8c",
    });

    setMostrarCodigoInput(true);
  } catch (err: any) {
    setLoading(false);
    showAlert("Error", err.message || "No se pudo enviar el código.", "error");
  }
};

const validarCodigo = async () => {
  if (!codigo)
    return showAlert("Código requerido", "Ingresa el código de verificación.", "warning");

  setLoading(true);
  try {
    const resp = await fetch(`${API_BASE}/Usuarios/VerificarCodigoCorreo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, codigo }),
    });

    if (!resp.ok) {
      setLoading(false);
      return showAlert("Código inválido", await resp.text(), "error");
    }

    // 2) Si el código es válido, ahora sí creamos usuario y cliente
    const usuarioPayload = {
      tipoDocumento,
      numDocumento: documento,
      nombreCompleto: nombre,
      celular,
      departamento: departamentoNombre,
      ciudad,
      direccion,
      correo,
      contrasena,
      estado: true,
      idRol: 4,
    };
    const clientePayload = {
      nombreCompleto: nombre,
      tipoDocumento,
      numDocumento: documento,
      correo,
      celular,
      departamento: departamentoNombre,
      ciudad,
      direccion,
      estado: true,
    };

    const usuarioResp = await fetch(`${API_BASE}/Usuarios/Crear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuarioPayload),
    });
    if (!usuarioResp.ok) throw new Error(await usuarioResp.text());

    const clienteResp = await fetch(`${API_BASE}/Clientes/Crear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientePayload),
    });
    if (!clienteResp.ok) throw new Error(await clienteResp.text());

    setLoading(false);
    await Swal.fire({
      icon: "success",
      title: "Registro completado",
      text: "Correo verificado y cuenta creada correctamente.",
      confirmButtonColor: "#e83e8c",
    });

    navigate("/ingresar");
  } catch (err: any) {
    setLoading(false);
    showAlert("Error", err.message || "Hubo un problema al completar el registro.", "error");
  }
};


  

  // reenviar código
 


useEffect(() => {
  let timer: ReturnType<typeof setInterval>;
  if (cooldown > 0) {
    timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
  }
  return () => clearInterval(timer);
}, [cooldown]);

const reenviarCodigo = async () => {
  try {
    setSendingCode(true);
    // Aquí haces el fetch o la lógica para reenviar el código
    await fetch(`${API_BASE}/Usuarios/ReenviarCodigo`, { method: "POST" });
    Swal.fire("Código reenviado", "Revisa tu correo nuevamente", "success");
    setCooldown(60); // ⏱️ inicia cuenta regresiva de 60s
  } catch (error) {
    Swal.fire("Error", "No se pudo reenviar el código", "error");
  } finally {
    setSendingCode(false);
  }
};

  return (
    <div className="registro-container">
      <div className="registro-card shadow-lg">
        {/* Panel izquierdo */}
        <div className="registro-left">
          <h2 className="slogan">🎨 ¡Crea tu cuenta y dale vida a tus ideas!</h2>
          <img src={registroImage} alt="Registro CreartNino" className="registro-img" />
        </div>

        {/* Panel derecho */}
        <div className="registro-right p-4">
          {!mostrarCodigoInput ? (
            <>
              <h3 className="form-title mb-3">📝 Registro</h3>
              {/* FORMULARIO */}
              <div className="row g-3">
                {/* tipo doc */}
                <div className="col-md-6">
                  <label className="form-label">Tipo de documento <span className="text-danger">*</span></label>
                  <select className="form-select" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
                    <option value="">Seleccione...</option>
                    <option value="TI">Tarjeta de identidad</option>
                    <option value="CC">Cédula de ciudadania</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PP">Permiso de Protección Temporal</option>
                    
                  </select>
                </div>
                {/* doc */}
                <div className="col-md-6">
                  <label className="form-label">Número Documento <span className="text-danger">*</span></label>
                  <input
                  className="form-control"
                  value={documento}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    setDocumento(value);
                  }}
                  />
                </div>
                {/* nombre */}
                <div className="col-md-12">
                  <label className="form-label">Nombre Completo <span className="text-danger">*</span></label>
                  <input 
                  className="form-control"
                  value={nombre} 
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    setNombre(value)}} />
                </div>
                {/* celular/correo */}
                <div className="col-md-6">
                  <label className="form-label">Celular <span className="text-danger">*</span></label>
                  <input 
                  className="form-control"
                  value={celular} 
                  onChange={(e) =>{
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    setCelular(value)}} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Correo electrónico <span className="text-danger">*</span></label>
                  <input type="email" 
                  className="form-control" 
                  value={correo} 
                  onChange={(e) =>{
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    setCorreo(value)}} />
                </div>
                {/* dep/ciudad */}
                <div className="col-md-6">
                  <label className="form-label">Departamento <span className="text-danger">*</span></label>
                  <select className="form-select" value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)}>
                    <option value="">Seleccione departamento</option>
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id.toString()}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Ciudad <span className="text-danger">*</span></label>
                  <select className="form-select" value={ciudad} onChange={(e) => setCiudad(e.target.value)} disabled={!departamentoId || !ciudadesFiltradas.length}>
                    <option value="">Seleccione ciudad</option>
                    {ciudadesFiltradas.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-12">
                  <label className="form-label">Dirección <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={direccion}
                    readOnly
                    onClick={() => setShowDireccionModal(true)}
                    placeholder="Haz clic para ingresar la dirección"
                  />
                </div>
                {/* pass */}
                <div className="col-md-6">
                  <label className="form-label">Contraseña <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input type={verContrasena ? "text" : "password"} className="form-control" value={contrasena} onChange={(e) =>{
                      const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                      setContrasena(value)}} />
                    <span className="input-group-text clickable" onClick={() => setVerContrasena((v) => !v)}>
                      {verContrasena ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Confirmar contraseña <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input type={verConfirmar ? "text" : "password"} className="form-control" value={confirmar} onChange={(e) => {
                      const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                      setConfirmar(value)}} />
                    <span className="input-group-text clickable" onClick={() => setVerConfirmar((v) => !v)}>
                      {verConfirmar ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
                
                {/* dirección */}
                
              </div>
              {/* botones */}
              <div className="acciones mt-4">
                <button className="btn pastel-btn-primary" onClick={enviarRegistro} disabled={loading}>
                  {loading ? "Registrando..." : "Registrarse"}
                </button>
                <Link to="/ingresar" className="btn pastel-btn-secondary">
                  Iniciar sesión
                </Link>
              </div>
              <div className="volver mt-3">
                <Link to="/">&larr; Regresar</Link>
              </div>
            </>
          ) : (
            // VERIFICACIÓN
            <>
              <div className="verificacion-codigo-container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "350px" }}>
                <h3 className="form-title mb-3 text-center">🔒 Verificar Código</h3>
                <p className="text-center">Se envió un código de verificación a:</p>
                <p className="correo fw-bold text-center">{correo}</p>
                <div className="mb-3 w-100" style={{ maxWidth: "350px" }}>
                  <label className="form-label">Código</label>
                  <input
                    className="form-control text-center"
                    value={codigo}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.trim() === "" && value !== "") return;
                      setCodigo(value);
                    }}
                  />
                </div>
                <div className="acciones gap-2 d-flex flex-column align-items-center w-100" style={{ maxWidth: "350px" }}>
                  <button className="btn pastel-btn-primary w-100 mb-2" onClick={validarCodigo} disabled={loading}>
                    {loading ? "Verificando..." : "Validar código"}
                  </button>
                  <button
                    className="btn pastel-btn-secondary w-100"
                    onClick={reenviarCodigo}
                    disabled={sendingCode || cooldown > 0}
                  >
                    {sendingCode
                      ? "Reenviando..."
                      : cooldown > 0
                      ? `Reintenta en ${cooldown}s`
                      : "Reenviar código"}
                  </button>
                </div>
              </div>

                
              
            </>
          )}
        </div>
      </div>

      {/* Submodal Dirección */}
      {showDireccionModal && (
        <div className="modal d-block pastel-overlay" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content pastel-modal shadow">
              <div className="modal-header pastel-header">
                <h5 className="modal-title">🏠 Información de Dirección</h5>
                <button type="button" className="btn-close" onClick={() => setShowDireccionModal(false)}></button>
              </div>
              <div className="modal-body px-4 py-3">
                <div className="mb-3">
                  <label>Municipio</label>
                  <input className="form-control"
                  value={direccionData.municipio} 
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    setDireccionData((p) => ({ ...p, municipio: value }))}} />
                </div>
                <div className="mb-3">
                  <label>Barrio</label>
                  <input className="form-control" 
                  value={direccionData.barrio} 
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    setDireccionData((p) => ({ ...p, barrio: value }))}} />
                </div>
                <div className="mb-3">
                  <label>Calle / Carrera</label>
                  <input className="form-control" 
                  value={direccionData.calle} 
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    setDireccionData((p) => ({ ...p, calle: value }))}} />
                </div>
              </div>
              <div className="modal-footer pastel-footer">
                <button type="button" className="btn pastel-btn-secondary" onClick={() => setShowDireccionModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn pastel-btn-primary" onClick={handleDireccionModalSave}>
                  Guardar Dirección
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registrar;
