import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

import '../style/acciones.css';
import type { IUsuarios } from '../../interfaces/IUsuarios';
import axios from 'axios';

interface Props {
  onClose: () => void;
  onCrear: (nuevoUsuario: IUsuarios) => void;
}

const CrearUsuarioModal: React.FC<Props> = ({ onClose , onCrear }) => {
  const [formData, setFormData] = useState<Omit<IUsuarios, 'IdUsuarios' | 'IdRolNavigation'>>({
    NombreCompleto: '',
    TipoDocumento: '',
    NumDocumento: '',
    Celular: '',
    Departamento: '',
    Ciudad: '',
    Direccion: '',
    Correo: '',
    Contrasena: '',
    IdRol: 4, // Usuario por defecto
    Estado: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [departamentos, setDepartamentos] = useState<{ id: number; name: string }[]>([]);
  const [ciudades, setCiudades] = useState<{ id: number; name: string }[]>([]);
  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [direccionData, setDireccionData] = useState({ Complementos: '', barrio: '', calle: '' });
  const [existeDoc, setExisteDoc] = useState<null | boolean>(null);
const [existeCorreo, setExisteCorreo] = useState<null | boolean>(null);
const [loadingCheck, setLoadingCheck] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);



  // Roles desde API
  const [roles, setRoles] = useState<{ IdRol: number; Rol: string; Descripcion?: string }[]>([]);

  useEffect(() => {
  const controller = new AbortController();

  // Solo ejecutar si hay suficiente información
  if (formData.NumDocumento.length > 4 || formData.Correo.length > 5) {
    setLoadingCheck(true);

    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get("https://apicreartnino.somee.com/api/Usuarios/Lista", {
          signal: controller.signal,
        });

        const usuarios = res.data || [];

        // 🔍 Buscar coincidencias
        const docExiste = usuarios.some(
          (u: any) => String(u.NumDocumento) === formData.NumDocumento
        );
        const correoExiste = usuarios.some(
          (u: any) =>
            u.Correo?.trim().toLowerCase() === formData.Correo?.trim().toLowerCase()
        );

        setExisteDoc(docExiste);
        setExisteCorreo(correoExiste);
      } catch (err) {
        console.error("Error verificando duplicados:", err);
      } finally {
        setLoadingCheck(false);
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  } else {
    setExisteDoc(null);
    setExisteCorreo(null);
  }
}, [formData.NumDocumento, formData.Correo]);


  // Departamentos
  useEffect(() => {
    fetch('https://api-colombia.com/api/v1/Department')
      .then(res => res.json())
      .then((data: { id: number; name: string }[]) => {
        setDepartamentos(data.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(console.error);
  }, []);

  // Ciudades por departamento
  useEffect(() => {
    if (!formData.Departamento) {
      setCiudades([]);
      return;
    }
    const dep = departamentos.find(d => d.name === formData.Departamento);
    if (!dep) return;

    fetch('https://api-colombia.com/api/v1/City/pagedList?page=1&pageSize=1000')
      .then(res => res.json())
      .then((res: { data: { id: number; name: string; departmentId: number }[] }) => {
        const cities = res.data
          .filter(c => c.departmentId === dep.id)
          .map(c => ({ id: c.id, name: c.name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCiudades(cities);
      })
      .catch(console.error);
  }, [formData.Departamento, departamentos]);

  // Roles
  useEffect(() => {
    fetch("https://apicreartnino.somee.com/api/Roles/Lista")
      .then(res => res.json())
      .then((data) => setRoles(data))
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'Departamento' ? { Ciudad: '' } : {})
    }));
  };

  const handleDireccionModalSave = () => {
    const full = `${direccionData.barrio}, ${direccionData.calle}, ${direccionData.Complementos}`;
    setFormData(prev => ({ ...prev, Direccion: full }));
    setShowDireccionModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (isSubmitting) return;

  const REPEAT_THRESHOLD = 4; // 4 o más repeticiones consecutivas

  // 🔹 Funciones de validación reutilizables
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

  // ✅ Nombre
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

  // ✅ Tipo documento
  if (!formData.TipoDocumento) {
    return Swal.fire({ icon: "error", title: "Tipo de documento", text: "Selecciona un tipo de documento.", confirmButtonColor: "#e83e8c" });
  }

  // ✅ Documento
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

  // ✅ Celular
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

  // ✅ Correo
  const correo = formData.Correo.trim();
  const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correoRegex.test(correo)) {
    return Swal.fire({ icon: "error", title: "Correo inválido", text: "Por favor ingresa un correo válido.", confirmButtonColor: "#e83e8c" });
  }
  if (isAllSameChar(correo) || hasLongRepeatSequence(correo) || isOnlySpecialChars(correo) || hasTooManySpecialChars(correo) || hasLowVariety(correo)) {
    return Swal.fire({ icon: "error", title: "Correo inválido", text: "El correo no puede contener patrones repetitivos o demasiados caracteres especiales.", confirmButtonColor: "#e83e8c" });
  }

  // ✅ Dirección
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

  // ✅ Contraseña
  const pwd = formData.Contrasena.trim();
  if (!pwd) {
    return Swal.fire({ icon: "error", title: "Contraseña requerida", text: "La contraseña es obligatoria.", confirmButtonColor: "#e83e8c" });
  }
  
  if (isAllSameChar(pwd) || hasLongRepeatSequence(pwd) || hasLowVariety(pwd)) {
    return Swal.fire({ icon: "error", title: "Contraseña insegura", text: "La contraseña contiene patrones repetitivos o baja variedad.", confirmButtonColor: "#e83e8c" });
  }

  // ✅ Rol
  if (!formData.IdRol) {
    return Swal.fire({ icon: "error", title: "Rol requerido", text: "Selecciona un rol.", confirmButtonColor: "#e83e8c" });
  }

  // ✅ Departamento/Ciudad
  if (formData.Departamento && ciudades.length && !formData.Ciudad) {
    return Swal.fire({ icon: "error", title: "Ciudad no seleccionada", text: "Seleccione una ciudad.", confirmButtonColor: "#e83e8c" });
  }

  try {
    setIsSubmitting(true);
    const resp = await fetch("https://apicreartnino.somee.com/api/Usuarios/Crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await resp.json(); // 👈 para leer mensaje backend

    if (!resp.ok) {
      return Swal.fire({
        icon: "error",
        title: "Error",
        text: data.message || "No se pudo crear el usuario porque el numero de documento o el correo ya existen.",
        confirmButtonColor: "#e83e8c",
      });
    }

    // 👇 Si el rol es 4 también se crea cliente
    if (formData.IdRol === 4) {
      const clientePayload = {
        NombreCompleto: formData.NombreCompleto,
        TipoDocumento: formData.TipoDocumento,
        NumDocumento: formData.NumDocumento,
        Correo: formData.Correo,
        Celular: formData.Celular,
        Departamento: formData.Departamento,
        Ciudad: formData.Ciudad,
        Direccion: formData.Direccion,
        Estado: true,
      };

      const clienteResp = await fetch("https://apicreartnino.somee.com/api/Clientes/Crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientePayload),
      });

      const clienteData = await clienteResp.json();

      if (!clienteResp.ok) {
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: clienteData.message || "No se pudo crear el cliente porque numero de documento o correo ya existe.",
          confirmButtonColor: "#e83e8c",
        });
      }
    }
    

    await Swal.fire({
  icon: "success",
  title: "Éxito",
  text: "Usuario creado correctamente",
  timer: 2000, // 2 segundos
            timerProgressBar: true,
            showConfirmButton: false
});

// 🔹 Notifica al padre para refrescar la lista
onCrear(data);  

// 🔹 Cierra el modal
onClose();


  } catch (err) {
    console.error("crearUsuario:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error de conexión con el servidor.",
      confirmButtonColor: "#e83e8c",
    });
  } finally{
    setIsSubmitting(false); 
  }
};
  return (
    <div className="modal d-block overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">👤 Crear Usuario</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">🧾 Tipo Documento <span className="text-danger">*</span></label>
                  <select
                    name="TipoDocumento"
                    className="form-select"
                    value={formData.TipoDocumento}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione tipo</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cédula de Extranjería</option>
                  </select>
                </div>

                <div className="col-md-6">
  <label className="form-label">🔢 Número Documento <span className="text-danger">*</span></label>
  <input
    name="NumDocumento"
    className="form-control"
    value={formData.NumDocumento}
    maxLength={11}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
  // ✅ Solo números (elimina letras, símbolos y espacios)
  const soloNumeros = e.target.value.replace(/\D/g, "");
  e.target.value = soloNumeros;

  // ✅ Mantiene tu flujo original
  handleChange(e);

  // ✅ Actualiza automáticamente la contraseña (mismo número de documento)
  handleChange({
    target: {
      name: "Contrasena",
      value: soloNumeros,
    },
  } as React.ChangeEvent<HTMLInputElement>);
}}

  />
  {existeDoc && (
  <small className="text-danger">⚠️ Este número de documento ya está registrado.</small>
)}
{existeDoc === false && formData.NumDocumento && (
  <small className="text-success">✅ Documento disponible.</small>
)}

</div>


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

                <div className="col-md-6">
                  <label className="form-label">📱 Celular <span className="text-danger">*</span></label>
                  <input
                    name="Celular"
                    className="form-control"
                    value={formData.Celular}
                    max={10}
                    onChange={(e) => {
      // ✅ Solo números, sin espacios
      e.target.value = e.target.value.replace(/\D/g, "");
      handleChange(e);
    }}
                    maxLength={10}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📧 Correo Electrónico<span className="text-danger">*</span></label>
                  <input
                    type="email"
                    name="Correo"
                    className="form-control"
                    value={formData.Correo}
                    onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    handleChange(e);
                  }}
                  />
                  {existeCorreo && (
  <small className="text-danger">⚠️ Este correo ya está registrado.</small>
)}
{existeCorreo === false && formData.Correo && (
  <small className="text-success">✅ Correo disponible.</small>
)}

                </div>

                <div className="col-md-6">
                  <label className="form-label">🔐 Contraseña <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="Contrasena"
                      className="form-control"
                      disabled
                      value={formData.Contrasena}
                     onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    handleChange(e);
                  }}
                      placeholder="Mín. 8 caracteres, mayúscula, número y símbolo"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      tabIndex={-1}
                      onClick={() => setShowPassword(prev => !prev)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏞️ Departamento <span className="text-danger">*</span></label>
                  <select
                    name="Departamento"
                    className="form-select"
                    value={formData.Departamento}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione un departamento</option>
                    {departamentos.map(dep => (
                      <option key={dep.id} value={dep.name}>{dep.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏙️ Ciudad <span className="text-danger">*</span></label>
                  <select
                    name="Ciudad"
                    className="form-select"
                    value={formData.Ciudad}
                    onChange={handleChange}
                    disabled={!formData.Departamento || !ciudades.length}
                  >
                    <option value="">Seleccione una ciudad</option>
                    {ciudades.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏡 Dirección <span className="text-danger">*</span></label>
                  <input
                    name="Direccion"
                    className="form-control"
                    value={formData.Direccion}
                    readOnly
                    onClick={() => setShowDireccionModal(true)}
                    placeholder="Haz clic para ingresar la dirección"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🛡️ Rol <span className="text-danger">*</span></label>
                  <select
                    name="IdRol"
                    className="form-select"
                    value={formData.IdRol}
                    onChange={handleChange}
                    disabled={!roles.length}
                    title={roles.find(r => r.IdRol === formData.IdRol)?.Descripcion || ''}
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
                      <option key={rol.IdRol} value={rol.IdRol} title={rol.Descripcion}>
                        {rol.Rol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>Cancelar</button>
              <button
  type="submit"
  className="btn pastel-btn-primary"
  disabled={isSubmitting || loadingCheck || existeDoc === true}
>
  {loadingCheck ? "Verificando..." : isSubmitting ? "Creando..." : "Crear"}
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
                      type="button"
                      className="btn-close"
                      onClick={() => setShowDireccionModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body px-4 py-3">
                    <div className="mb-3">
                      <label>Barrio <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        value={direccionData.barrio}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s+/g, "");
                        setDireccionData((prev) => ({ ...prev, barrio: value }));
                      }}
                      />
                    </div>
                    <div className="mb-3">
                      <label>Calle / Carrera <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        value={direccionData.calle}
                        onChange={(e) => {
                        const value = e.target.value.replace(/\s+/g, "");
                        setDireccionData((prev) => ({ ...prev, calle: value }));
                      }}
                      />
                    </div>
                    <div className="mb-3">
                      <label>Complementos <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        value={direccionData.Complementos}
                        placeholder="Apartamento, edificio, referencia, etc."
                        onChange={(e) => {
                        const value = e.target.value.replace(/\s+/g, "");
                        setDireccionData((prev) => ({ ...prev, Complementos: value }));
                      }}
                      />
                    </div>
                  </div>
                  <div className="modal-footer pastel-footer">
                    <button
                      type="button"
                      className="btn pastel-btn-secondary"
                      onClick={() => setShowDireccionModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
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

export default CrearUsuarioModal;