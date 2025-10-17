// src/components/CrearClienteModal.tsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../styles/acciones.css";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { IClientes } from "../../interfaces/IClientes";
import { useNavigate } from "react-router-dom";

interface Props {
  onClose: () => void;
  onCrear: (formData: IClientes) => void;
}

const CrearClienteModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Omit<IClientes, "IdClientes">>({
    NombreCompleto: "",
    TipoDocumento: "",
    NumDocumento: "",
    Correo: "",
    Celular: "",
    Departamento: "",
    Ciudad: "",
    Direccion: "",
    Estado: true,
  });

  const [departamentos, setDepartamentos] = useState<{ id: number; name: string }[]>([]);
  const [ciudades, setCiudades] = useState<{ id: number; name: string }[]>([]);
  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [direccionData, setDireccionData] = useState({
    municipio: "",
    barrio: "",
    calle: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Cargar departamentos
  useEffect(() => {
    fetch("https://api-colombia.com/api/v1/Department")
      .then((res) => res.json())
      .then((data: { id: number; name: string }[]) =>
        setDepartamentos(data.sort((a, b) => a.name.localeCompare(b.name)))
      )
      .catch(console.error);
  }, []);

  // 🔹 Cargar ciudades según departamento
  useEffect(() => {
    if (!formData.Departamento) {
      setCiudades([]);
      return;
    }
    const dep = departamentos.find((d) => d.name === formData.Departamento);
    if (!dep) return;

    fetch("https://api-colombia.com/api/v1/City/pagedList?page=1&pageSize=1000")
      .then((res) => res.json())
      .then((res: { data: { id: number; name: string; departmentId: number }[] }) => {
        const cityList = res.data
          .filter((c) => c.departmentId === dep.id)
          .map((c) => ({ id: c.id, name: c.name }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCiudades(cityList);
      })
      .catch(console.error);
  }, [formData.Departamento, departamentos]);

  // 🔹 Manejo de inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "Departamento" ? { Ciudad: "" } : {}),
    }));
  };

  // 🔹 Guardar dirección desde submodal
  const handleDireccionModalSave = () => {
    const { municipio, barrio, calle } = direccionData;

    if (municipio.trim() === "" || barrio.trim() === "" || calle.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa Municipio, Barrio y Calle/Carrera.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }

    if (/^\d+$/.test(calle.trim())) {
      Swal.fire({
        icon: "error",
        title: "Calle/Carrera inválida",
        text: "No puede ser solo números, agrega texto (ej: 'Calle 13 #12-34').",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }

    const direccionCompleta = `${municipio}, ${barrio}, ${calle}`;
    setFormData((prev) => ({ ...prev, Direccion: direccionCompleta }));
    setShowDireccionModal(false);
  };

  const generarPasswordAleatoria = (longitud = 12) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?";
  let pass = "";
  for (let i = 0; i < longitud; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};


const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (isSubmitting) return;
  setIsSubmitting(true);

  const REPEAT_THRESHOLD = 4;

  // 🔹 Funciones reutilizables
  const isAllSameChar = (s: string) => s.length > 1 && /^(.)(\1)+$/.test(s);
  const hasLongRepeatSequence = (s: string, n = REPEAT_THRESHOLD) =>
    new RegExp(`(.)\\1{${n - 1},}`).test(s);
  const isOnlySpecialChars = (s: string) => /^[^a-zA-Z0-9]+$/.test(s);
  const hasTooManySpecialChars = (s: string, maxPercent = 0.6) => {
    const specialCount = (s.match(/[^a-zA-Z0-9]/g) || []).length;
    return specialCount / s.length > maxPercent;
  };
  const hasLowVariety = (s: string, minUnique = 3) => new Set(s).size < minUnique;

  try {
    // ✅ Nombre
    const nombre = formData.NombreCompleto.trim();
    const nombreRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
    if (!nombre) {
      return Swal.fire({ icon: "error", title: "Nombre requerido", text: "El nombre completo es obligatorio.", confirmButtonColor: "#f78fb3" });
    }
    if (!nombreRegex.test(nombre)) {
      return Swal.fire({ icon: "error", title: "Nombre inválido", text: "El nombre solo puede contener letras y espacios.", confirmButtonColor: "#f78fb3" });
    }
    if (isAllSameChar(nombre) || hasLongRepeatSequence(nombre) || isOnlySpecialChars(nombre) || hasTooManySpecialChars(nombre) || hasLowVariety(nombre)) {
      return Swal.fire({ icon: "error", title: "Nombre inválido", text: "El nombre no puede ser repetitivo, de baja variedad ni solo caracteres especiales.", confirmButtonColor: "#f78fb3" });
    }
    if (nombre.length < 3 || nombre.length > 100) {
      return Swal.fire({ icon: "error", title: "Nombre inválido", text: "El nombre debe tener entre 3 y 100 caracteres.", confirmButtonColor: "#f78fb3" });
    }

    // ✅ Tipo documento
    if (!formData.TipoDocumento) {
      return Swal.fire({ icon: "error", title: "Tipo de documento", text: "Selecciona un tipo de documento.", confirmButtonColor: "#f78fb3" });
    }

    // ✅ Documento
    const numDoc = formData.NumDocumento.trim();
    if (!/^\d+$/.test(numDoc)) {
      return Swal.fire({ icon: "error", title: "Documento inválido", text: "Solo se permiten números.", confirmButtonColor: "#f78fb3" });
    }
    if (numDoc.length < 8 || numDoc.length > 11) {
      return Swal.fire({ icon: "error", title: "Documento inválido", text: "Debe tener entre 8 y 11 dígitos.", confirmButtonColor: "#f78fb3" });
    }
    if (isAllSameChar(numDoc) || hasLongRepeatSequence(numDoc) || hasLowVariety(numDoc)) {
      return Swal.fire({ icon: "error", title: "Documento inválido", text: "El número no puede ser repetitivo ni de baja variedad.", confirmButtonColor: "#f78fb3" });
    }

    // ✅ Celular
    const celular = formData.Celular.trim();
    if (!/^\d+$/.test(celular)) {
      return Swal.fire({ icon: "error", title: "Celular inválido", text: "Solo se permiten números.", confirmButtonColor: "#f78fb3" });
    }
    if (celular.length !== 10) {
      return Swal.fire({ icon: "error", title: "Celular inválido", text: "Debe tener 10 dígitos.", confirmButtonColor: "#f78fb3" });
    }
    if (isAllSameChar(celular) || hasLongRepeatSequence(celular) || hasLowVariety(celular)) {
      return Swal.fire({ icon: "error", title: "Celular inválido", text: "El celular no puede ser repetitivo ni de baja variedad.", confirmButtonColor: "#f78fb3" });
    }

    // ✅ Correo
    const correo = formData.Correo.trim();
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) {
      return Swal.fire({ icon: "error", title: "Correo inválido", text: "Por favor ingresa un correo válido.", confirmButtonColor: "#f78fb3" });
    }
    if (isAllSameChar(correo) || hasLongRepeatSequence(correo) || isOnlySpecialChars(correo) || hasTooManySpecialChars(correo) || hasLowVariety(correo)) {
      return Swal.fire({ icon: "error", title: "Correo inválido", text: "El correo no puede contener patrones repetitivos o demasiados caracteres especiales.", confirmButtonColor: "#f78fb3" });
    }

    // ✅ Dirección
    const direccion = formData.Direccion?.trim() || "";
    if (!direccion) {
      return Swal.fire({ icon: "error", title: "Dirección requerida", text: "La dirección es obligatoria.", confirmButtonColor: "#f78fb3" });
    }
    if (direccion.length < 5 || direccion.length > 100) {
      return Swal.fire({ icon: "error", title: "Dirección inválida", text: "La dirección debe tener entre 5 y 100 caracteres.", confirmButtonColor: "#f78fb3" });
    }
    if (isAllSameChar(direccion) || hasLongRepeatSequence(direccion) || isOnlySpecialChars(direccion) || hasTooManySpecialChars(direccion) || hasLowVariety(direccion)) {
      return Swal.fire({ icon: "error", title: "Dirección inválida", text: "La dirección no puede ser repetitiva, solo números o tener baja variedad.", confirmButtonColor: "#f78fb3" });
    }

    // ✅ Departamento / Ciudad
    if (!formData.Departamento) {
      return Swal.fire({ icon: "error", title: "Departamento requerido", text: "Seleccione un departamento.", confirmButtonColor: "#f78fb3" });
    }
    if (formData.Departamento && !formData.Ciudad) {
      return Swal.fire({ icon: "error", title: "Ciudad requerida", text: "Seleccione una ciudad.", confirmButtonColor: "#f78fb3" });
    }

    // ✅ Buscar si ya existe usuario o cliente
    const listaUsuarios = await (await fetch(`${APP_SETTINGS.apiUrl}Usuarios/Lista`)).json();
    const usuarioExiste = listaUsuarios.find(
      (u: any) =>
        u.Correo.toLowerCase() === formData.Correo.toLowerCase() ||
        u.NumDocumento === formData.NumDocumento
    );

    let clientePayload;

    if (!usuarioExiste) {
      // 🔹 Crear usuario básico con contraseña aleatoria
      const usuarioPayload = {
        TipoDocumento: formData.TipoDocumento,
        NumDocumento: formData.NumDocumento,
        NombreCompleto: formData.NombreCompleto,
        Celular: formData.Celular,
        Departamento: formData.Departamento,
        Ciudad: formData.Ciudad,
        Direccion: formData.Direccion,
        Correo: formData.Correo,
        Contrasena: generarPasswordAleatoria(12),
        Estado: true,
        IdRol: 4,
      };

      const crearUsuarioResp = await fetch(`${APP_SETTINGS.apiUrl}Usuarios/Crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuarioPayload),
      });

      if (!crearUsuarioResp.ok) {
        const data = await crearUsuarioResp.json().catch(() => ({}));
        throw new Error(data.message || "No se pudo crear el usuario: el correo o documento ya existen.");
      }

      clientePayload = { ...usuarioPayload };
    } else {
      clientePayload = { ...usuarioExiste, ...formData };
    }

    // ✅ Validar si ya existe el cliente
    const listaClientes = await (await fetch(`${APP_SETTINGS.apiUrl}Clientes/Lista`)).json();
    const clienteExiste = listaClientes.find(
      (c: any) =>
        c.Correo.toLowerCase() === clientePayload.Correo.toLowerCase() ||
        c.NumDocumento === clientePayload.NumDocumento
    );

    if (clienteExiste) {
      return Swal.fire({
        icon: "info",
        title: "Cliente ya registrado",
        text: "El cliente ya existe en el sistema, no es necesario crearlo de nuevo.",
        confirmButtonColor: "#f78fb3",
      });
    }

    // 🚀 Crear cliente
    const clienteResp = await fetch(`${APP_SETTINGS.apiUrl}Clientes/Crear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientePayload),
    });

    const clienteData = await clienteResp.json().catch(() => ({}));

    if (!clienteResp.ok) {
      throw new Error(clienteData.message || "No se pudo registrar el cliente: el correo o documento ya existen.");
    }

    Swal.fire({
      icon: "success",
      title: "Cliente creado correctamente",
      confirmButtonColor: "#f78fb3",
    });

    onCrear(clienteData);
    onClose();
    navigate("/clientes");

  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.message || "No se pudo completar la operación.",
      confirmButtonColor: "#f78fb3",
    });
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="modal d-block overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">🧑 Crear Cliente</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">
                    🧾 Tipo de Documento <span className="text-danger">*</span>
                  </label>
                  <select
                    name="TipoDocumento"
                    className="form-select"
                    value={formData.TipoDocumento}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                  </select>
                </div>

                <div className="col-md-6">
  <label className="form-label">🔢 Número Documento <span className="text-danger">*</span></label>
  <input
    name="NumDocumento"
    className="form-control"
    value={formData.NumDocumento}
    maxLength={11}
    onChange={(e) => {
      // ✅ Solo números, sin espacios
      e.target.value = e.target.value.replace(/\D/g, "");
      handleChange(e);
    }}
  />
</div>

                <div className="col-md-6">
                  <label className="form-label">
                    🙍 Nombre Completo <span className="text-danger">*</span>
                  </label>
                  <input
                    name="NombreCompleto"
                    className="form-control"
                    value={formData.NombreCompleto}
                    onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    handleChange(e);
                  }}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    📧 Correo Electrónico <span className="text-danger">*</span>
                  </label>
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
                    required
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
                  <label className="form-label">
                    🏞️ Departamento <span className="text-danger">*</span>
                  </label>
                  <select
                    name="Departamento"
                    className="form-select"
                    value={formData.Departamento}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un departamento</option>
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    🏙️ Ciudad <span className="text-danger">*</span>
                  </label>
                  <select
                    name="Ciudad"
                    className="form-select"
                    value={formData.Ciudad}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione una ciudad</option>
                    {ciudades.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    🏡 Dirección <span className="text-danger">*</span>
                  </label>
                  <input
                    name="Direccion"
                    className="form-control"
                    value={formData.Direccion}
                    onClick={() => setShowDireccionModal(true)}
                    readOnly
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn pastel-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Crear"}
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
                      <label>Municipio <span className="text-danger">*</span></label>
                      <input
                      className="form-control"
                      value={direccionData.municipio}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s+/g, "");
                        setDireccionData((prev) => ({ ...prev, municipio: value }));
                      }}
                      />
                    </div>
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

export default CrearClienteModal;
