import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../style/acciones.css";
import type { IUsuarios } from "../../interfaces/IUsuarios";
import { useAuth } from "../../../context/AuthContext";

interface Props {
  usuario: IUsuarios; // Usuario a editar
  onClose: () => void;
  onEditar: (usuarioActualizado: IUsuarios) => void;
}

const EditarUsuarioModal: React.FC<Props> = ({ usuario, onClose, onEditar }) => {
  const [formData, setFormData] = useState<IUsuarios>(usuario);
  const [showPassword, setShowPassword] = useState(false);
  const [departamentos, setDepartamentos] = useState<{ id: number; name: string }[]>([]);
  const [ciudades, setCiudades] = useState<{ id: number; name: string }[]>([]);
  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [direccionData, setDireccionData] = useState({
    barrio: "",
  calle: "",
  Complementos: "",
  });
  const [existeDoc, setExisteDoc] = useState<null | boolean>(null);
const [existeCorreo, setExisteCorreo] = useState<null | boolean>(null);
const [loadingCheck, setLoadingCheck] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

  //  Estado para roles desde API
  const [roles, setRoles] = useState<{ IdRol: number; Rol: string }[]>([]);

  const navigate = useNavigate();
  const { refrescarUsuario } = useAuth(); // 🔑 USAR CONTEXTO PARA REFRESCAR

  //  Cargar roles desde la API
  useEffect(() => {
    fetch("https://apicreartnino.somee.com/api/Roles/Lista")
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch(console.error);
  }, []);
//  Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
//  Validar existencia de documento y correo
  useEffect(() => {
  const controller = new AbortController();

  // Si ambos campos están vacíos, no consultar
  if (!formData.NumDocumento && !formData.Correo) {
    setExisteDoc(null);
    setExisteCorreo(null);
    return;
  }

  setLoadingCheck(true);
  const timeout = setTimeout(async () => {
    try {
      const res = await fetch("https://apicreartnino.somee.com/api/Usuarios/Lista", {
        signal: controller.signal,
      });
      const data = await res.json();

      //  Verificar documento
      let docExiste = false;
      if (formData.NumDocumento !== usuario.NumDocumento) {
        docExiste = data.some(
          (u: any) =>
            u.NumDocumento === formData.NumDocumento &&
            u.IdUsuarios !== usuario.IdUsuarios
        );
      }
      setExisteDoc(docExiste ? true : false);

      //  Verificar correo
      let correoExiste = false;
      if (formData.Correo.toLowerCase() !== usuario.Correo.toLowerCase()) {
        correoExiste = data.some(
          (u: any) =>
            u.Correo.toLowerCase() === formData.Correo.toLowerCase() &&
            u.IdUsuarios !== usuario.IdUsuarios
        );
      }
      setExisteCorreo(correoExiste ? true : false);
    } catch (err) {
      console.error("Error validando datos:", err);
    } finally {
      setLoadingCheck(false);
    }
  }, 500);

  return () => {
    clearTimeout(timeout);
    controller.abort();
  };
}, [formData.NumDocumento, formData.Correo, usuario]);

//  Abrir modal dirección
const handleAbrirDireccionModal = () => {
  // Si la dirección viene como "Barrio, Calle, Complementos"
  const partes = formData.Direccion ? formData.Direccion.split(",") : [];

  setDireccionData({
    barrio: partes[0]?.trim() || "",
    calle: partes[1]?.trim() || "",
    Complementos: partes[2]?.trim() || "",
  });

  setShowDireccionModal(true);
};
//  Cargar departamentos
  useEffect(() => {
    fetch("https://api-colombia.com/api/v1/Department")
      .then((res) => res.json())
      .then((data: { id: number; name: string }[]) =>
        setDepartamentos(data.sort((a, b) => a.name.localeCompare(b.name)))
      )
      .catch(console.error);
  }, []);

  //  Cargar ciudades según departamento
  useEffect(() => {
    if (!formData.Departamento) {
      setCiudades([]);
      return;
    }
    const dep = departamentos.find((d) => d.name === formData.Departamento);
    if (!dep) return;

    fetch("https://api-colombia.com/api/v1/City/pagedList?page=1&pageSize=1000")
      .then((res) => res.json())
      .then(
        (res: { data: { id: number; name: string; departmentId: number }[] }) => {
          const cityList = res.data
            .filter((c) => c.departmentId === dep.id)
            .map((c) => ({ id: c.id, name: c.name }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setCiudades(cityList);
        }
      )
      .catch(console.error);
  }, [formData.Departamento, departamentos]);

  //  Guardar dirección
  const handleDireccionModalSave = () => {
    const full = `${direccionData.barrio}, ${direccionData.calle}, ${direccionData.Complementos}`;
    setFormData((prev: any) => ({ ...prev, Direccion: full }));
    setShowDireccionModal(false);
  };
//para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isSubmitting) return;

  const REPEAT_THRESHOLD = 4; // 4 o más repeticiones consecutivas

  //  Funciones de validación reutilizables
  const isAllSameChar = (s: string) => s.length > 1 && /^(.)(\1)+$/.test(s);
  const hasLongRepeatSequence = (s: string, n = REPEAT_THRESHOLD) =>
    new RegExp(`(.)\\1{${n - 1},}`).test(s);
  const isOnlySpecialChars = (s: string) => /^[^a-zA-Z0-9]+$/.test(s);
  const hasTooManySpecialChars = (s: string, maxPercent = 0.6) => {
    const specialCount = (s.match(/[^a-zA-Z0-9]/g) || []).length;
    return specialCount / s.length > maxPercent;
  };
  const hasLowVariety = (s: string, minUnique = 3) => {
    const uniqueChars = new Set(s).size;
    return uniqueChars < minUnique;
  };

  //  Nombre
  const nombre = formData.NombreCompleto.trim();
  const nombreRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
  if (!nombre) {
    return Swal.fire({ icon: "error", title: "Nombre requerido", text: "El nombre completo es obligatorio.", confirmButtonColor: "#e83e8c" });
  }
  if (!nombreRegex.test(nombre)) {
    return Swal.fire({ icon: "error", title: "Nombre inválido", text: "El nombre solo puede contener letras y espacios.", confirmButtonColor: "#e83e8c" });
  }
  if (isAllSameChar(nombre) || hasLongRepeatSequence(nombre) || isOnlySpecialChars(nombre) || hasTooManySpecialChars(nombre) || hasLowVariety(nombre)) {
    return Swal.fire({ icon: "error", title: "Nombre inválido", text: "El nombre no puede ser repetitivo, de baja variedad ni solo caracteres especiales.", confirmButtonColor: "#e83e8c" });
  }
  if (nombre.length < 3 || nombre.length > 100) {
    return Swal.fire({ icon: "error", title: "Nombre inválido", text: "El nombre debe tener entre 3 y 100 caracteres.", confirmButtonColor: "#e83e8c" });
  }

  //  Tipo documento
  if (!formData.TipoDocumento) {
    return Swal.fire({ icon: "error", title: "Tipo de documento", text: "Selecciona un tipo de documento.", confirmButtonColor: "#e83e8c" });
  }

  //  Documento
  const numDoc = formData.NumDocumento.trim();
  if (!/^\d+$/.test(numDoc)) {
    return Swal.fire({ icon: "error", title: "Documento inválido", text: "Solo se permiten números.", confirmButtonColor: "#e83e8c" });
  }
  if (numDoc.length < 8 || numDoc.length > 12) {
    return Swal.fire({ icon: "error", title: "Documento inválido", text: "Debe tener entre 8 y 11 dígitos.", confirmButtonColor: "#e83e8c" });
  }
  if (isAllSameChar(numDoc) || hasLongRepeatSequence(numDoc) || hasLowVariety(numDoc)) {
    return Swal.fire({ icon: "error", title: "Documento inválido", text: "El número no puede ser repetitivo ni de baja variedad.", confirmButtonColor: "#e83e8c" });
  }

  //  Celular
  const celular = formData.Celular.trim();
  if (!/^\d+$/.test(celular)) {
    return Swal.fire({ icon: "error", title: "Celular inválido", text: "Solo se permiten números.", confirmButtonColor: "#e83e8c" });
  }
  if (celular.length !== 10) {
    return Swal.fire({ icon: "error", title: "Celular inválido", text: "Debe tener 10 dígitos.", confirmButtonColor: "#e83e8c" });
  }
  if (isAllSameChar(celular) || hasLongRepeatSequence(celular) || hasLowVariety(celular)) {
    return Swal.fire({ icon: "error", title: "Celular inválido", text: "El celular no puede ser repetitivo ni de baja variedad.", confirmButtonColor: "#e83e8c" });
  }

  //  Correo
  const correo = formData.Correo.trim();
  const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correoRegex.test(correo)) {
    return Swal.fire({ icon: "error", title: "Correo inválido", text: "Por favor ingresa un correo válido.", confirmButtonColor: "#e83e8c" });
  }
  if (isAllSameChar(correo) || hasLongRepeatSequence(correo) || isOnlySpecialChars(correo) || hasTooManySpecialChars(correo) || hasLowVariety(correo)) {
    return Swal.fire({ icon: "error", title: "Correo inválido", text: "El correo no puede contener patrones repetitivos o demasiados caracteres especiales.", confirmButtonColor: "#e83e8c" });
  }

  //  Dirección
  const direccion = formData.Direccion?.trim() || "";
  if (!direccion) {
    return Swal.fire({ icon: "error", title: "Dirección requerida", text: "La dirección es obligatoria.", confirmButtonColor: "#e83e8c" });
  }
  if (direccion.length < 5 || direccion.length > 100) {
    return Swal.fire({ icon: "error", title: "Dirección inválida", text: "La dirección debe tener entre 5 y 100 caracteres.", confirmButtonColor: "#e83e8c" });
  }
  if (isAllSameChar(direccion) || hasLongRepeatSequence(direccion) || isOnlySpecialChars(direccion) || hasTooManySpecialChars(direccion) || hasLowVariety(direccion)) {
    return Swal.fire({ icon: "error", title: "Dirección inválida", text: "La dirección no puede ser repetitiva, solo números o tener baja variedad.", confirmButtonColor: "#e83e8c" });
  }

  //  Contraseña
  const pwd = formData.Contrasena.trim();
  if (!pwd) {
    return Swal.fire({ icon: "error", title: "Contraseña requerida", text: "La contraseña es obligatoria.", confirmButtonColor: "#e83e8c" });
  }
  
  if (isAllSameChar(pwd) || hasLongRepeatSequence(pwd) || hasLowVariety(pwd)) {
    return Swal.fire({ icon: "error", title: "Contraseña insegura", text: "La contraseña contiene patrones repetitivos o baja variedad.", confirmButtonColor: "#e83e8c" });
  }

  //  Rol
  if (!formData.IdRol) {
    return Swal.fire({ icon: "error", title: "Rol requerido", text: "Selecciona un rol.", confirmButtonColor: "#e83e8c" });
  }

  //  Departamento/Ciudad
  if (formData.Departamento && ciudades.length && !formData.Ciudad) {
    return Swal.fire({ icon: "error", title: "Ciudad no seleccionada", text: "Seleccione una ciudad.", confirmButtonColor: "#e83e8c" });
  }

  try {
    setIsSubmitting(true);
    const resp = await fetch(`https://apicreartnino.somee.com/api/Usuarios/Actualizar/${formData.IdUsuarios}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await resp.json(); // 👈 capturar mensaje backend

    if (!resp.ok) {
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: data.message || "No se pudo actualizar el usuario porque el numero de documento o el correo ya existen.",
        confirmButtonColor: "#e83e8c",
      });
    }

    await Swal.fire({
      icon: "success",
      title: "Éxito",
      text: "Usuario actualizado correctamente",
      timer: 2000, // 2 segundos
            timerProgressBar: true,
            showConfirmButton: false,
      allowEscapeKey: false,
    });

    onEditar(data);
    await refrescarUsuario();
    navigate("/usuario");

  } catch (err) {
    console.error("editarUsuario:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error de conexión con el servidor.",
      confirmButtonColor: "#e83e8c",
    });
  }finally{
    setIsSubmitting(false);
  }
};

  return (
    <div className="modal d-block overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">✏️ Editar Usuario</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                {/* Tipo Documento */}
                <div className="col-md-6">
                  <label className="form-label">🧾 Tipo Documento <span className="text-danger">*</span></label>
                  <select
                    name="TipoDocumento"
                    className="form-select"
                    value={formData.TipoDocumento}
                    onChange={handleChange}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cédula de Extranjería</option>
                  </select>
                </div>

                {/* Número Documento */}
                <div className="col-md-6">
  <label className="form-label">
    🔢 Número Documento <span className="text-danger">*</span>
  </label>
  <input
    name="NumDocumento"
    className={`form-control ${
      existeDoc === true ? "is-invalid" : existeDoc === false ? "is-valid" : ""
    }`}
    value={formData.NumDocumento}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
  //  Solo números (elimina letras, símbolos y espacios)
  const soloNumeros = e.target.value.replace(/\D/g, "");
  e.target.value = soloNumeros;

  //  Mantiene tu flujo original
  handleChange(e);

  //  Actualiza automáticamente la contraseña (mismo número de documento)
  handleChange({
    target: {
      name: "Contrasena",
      value: soloNumeros,
    },
  } as React.ChangeEvent<HTMLInputElement>);
}}
  />

  {/* Ya existe */}
  {existeDoc === true && (
    <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
      ⚠️ Este documento ya está registrado.
    </div>
  )}

  {/*  Es el actual */}
  {existeDoc === false && formData.NumDocumento === usuario.NumDocumento && (
    <div className="text-success mt-1" style={{ fontSize: "0.9em" }}>
      🟢 Es el actual que estás usando.
    </div>
  )}

  {/*  Disponible */}
  {existeDoc === false && formData.NumDocumento !== usuario.NumDocumento && (
    <div className="text-success mt-1" style={{ fontSize: "0.9em" }}>
      ✅ Disponible para usar.
    </div>
  )}
</div>


                {/* Nombre */}
                <div className="col-md-6">
                  <label className="form-label">🙍 Nombre Completo <span className="text-danger">*</span></label>
                  <input
                    name="NombreCompleto"
                    className="form-control"
                    value={formData.NombreCompleto}
                    onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    handleChange(e);
                  }}
                  />
                </div>

                {/* Celular */}
                <div className="col-md-6">
                  <label className="form-label">📱 Celular <span className="text-danger">*</span></label>
                  <input
                    name="Celular"
                    className="form-control"
                    value={formData.Celular}
                    onChange={(e) => {
      //  Solo números, sin espacios
      e.target.value = e.target.value.replace(/\D/g, "");
      handleChange(e);
    }}
                    maxLength={10}
                  />
                </div>

                {/* Correo */}
                <div className="col-md-6">
  <label className="form-label">
    📧 Correo Electrónico <span className="text-danger">*</span>
  </label>
  <input
    type="email"
    name="Correo"
    className={`form-control ${
      existeCorreo === true ? "is-invalid" : existeCorreo === false ? "is-valid" : ""
    }`}
    value={formData.Correo}
    onChange={handleChange}
  />

  {/*  Ya existe */}
  {existeCorreo === true && (
    <div className="text-danger mt-1" style={{ fontSize: "0.9em" }}>
      ⚠️ Este correo ya existe.
    </div>
  )}

  {/*  Es el actual */}
  {existeCorreo === false && formData.Correo === usuario.Correo && (
    <div className="text-success mt-1" style={{ fontSize: "0.9em" }}>
      🟢 Es el actual que estás usando.
    </div>
  )}

  {/* Disponible */}
  {existeCorreo === false && formData.Correo !== usuario.Correo && (
    <div className="text-success mt-1" style={{ fontSize: "0.9em" }}>
      ✅Disponible para usar.
    </div>
  )}
</div>


                {/* Contraseña */}
                <div className="col-md-6">
                  <label className="form-label">🔐 Contraseña<span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="Contrasena"
                      className="form-control"
                      disabled
                      value={formData.Contrasena}
                      onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    handleChange(e);
                  }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      tabIndex={-1}
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Departamento */}
                <div className="col-md-6">
                  <label className="form-label">🏞️ Departamento<span className="text-danger">*</span></label>
                  <select
                    name="Departamento"
                    className="form-select"
                    value={formData.Departamento}
                    onChange={handleChange}
                  >
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ciudad */}
                <div className="col-md-6">
                  <label className="form-label">🏙️ Ciudad<span className="text-danger">*</span></label>
                  <select
                    name="Ciudad"
                    className="form-select"
                    value={formData.Ciudad}
                    onChange={handleChange}
                  >
                    {ciudades.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dirección */}
                <div className="col-md-6">
                  <label className="form-label">🏡 Dirección<span className="text-danger">*</span></label>
                  <input
  name="Direccion"
  className="form-control"
  value={formData.Direccion}
  readOnly
  onClick={handleAbrirDireccionModal}
/>

                </div>

                {/* Rol dinámico */}
                <div className="col-md-6">
                  <label className="form-label">🛡️ Rol <span className="text-danger">*</span></label>
                  <select
                  name="IdRol"
                  className="form-select"
                  value={formData.IdRol}
                  onChange={handleChange}
                  >
                  <option value="">Seleccione un rol</option>
                  {roles
                    .filter((rol) => {
                    const r = rol as any;
                    // Si alguna propiedad de estado existe y es false, lo excluimos.
                    return r.Activo !== false &&
                         r.activo !== false &&
                         r.Estado !== false &&
                         r.estado !== false &&
                         r.IsActive !== false &&
                         r.isActive !== false;
                    })
                    .map((rol) => (
                    <option key={rol.IdRol} value={rol.IdRol}>
                      {rol.Rol}
                    </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer pastel-footer">
              <button
                type="button"
                className="btn pastel-btn-secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
  type="submit"
  className="btn pastel-btn-primary"
  disabled={isSubmitting || loadingCheck || existeDoc === true}
>
  {loadingCheck ? "Verificando..." : isSubmitting ? "Guardando..." : "Guardar Cambios"}
</button>
            </div>
          </form>

          {/* Submodal Dirección */}
          {showDireccionModal && (
            <div className="modal d-block pastel-overlay" tabIndex={-1}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content pastel-modal shadow">
                  <div className="modal-header pastel-header">
                    <h5 className="modal-title">🏠 Información de Dirección</h5>
                    <button
                      className="btn-close"
                      onClick={() => setShowDireccionModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body px-4 py-3">
                    <div className="mb-3">
                      <label>Barrio<span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        value={direccionData.barrio}
                         onChange={(e) => {
    let value = e.target.value;

    //  No permitir espacios al inicio
    value = value.replace(/^\s+/, "");

    //  Permitir máximo 2 espacios seguidos
    value = value.replace(/ {3,}/g, "  ");

    setDireccionData((prev) => ({
      ...prev,
      barrio: value
    }));
  }}
                      />
                    </div>
                    <div className="mb-3">
                      <label>Calle / Carrera<span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        value={direccionData.calle}
                         onChange={(e) => {
    let value = e.target.value;

    //  No permitir espacios al inicio
    value = value.replace(/^\s+/, "");

    //  Permitir máximo 2 espacios seguidos
    value = value.replace(/ {3,}/g, "  ");

    setDireccionData((prev) => ({
      ...prev,
      calle: value
    }));
  }}
                      />
                    </div>
                    <div className="mb-3">
                      <label>Complementos<span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        value={direccionData.Complementos}
                        placeholder="Apartamento, edificio, referencia, etc."
                         onChange={(e) => {
    let value = e.target.value;

    //  No permitir espacios al inicio
    value = value.replace(/^\s+/, "");

    //  Permitir máximo 2 espacios seguidos
    value = value.replace(/ {3,}/g, "  ");

    setDireccionData((prev) => ({
      ...prev,
      Complementos: value
    }));
  }}
                      />
                    </div>
                  </div>
                  <div className="modal-footer pastel-footer">
                    <button
                      className="btn pastel-btn-secondary"
                      onClick={() => setShowDireccionModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn pastel-btn-primary"
                      onClick={handleDireccionModalSave}
                    >
                      Guardar Dirección
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditarUsuarioModal;
