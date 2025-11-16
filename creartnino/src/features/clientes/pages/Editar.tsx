// src/components/EditarClienteModal.tsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../styles/acciones.css";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { IClientes } from "../../interfaces/IClientes";
import { useNavigate } from "react-router-dom";



interface Props {
  cliente: IClientes;
  onClose: () => void;
  onEditar: (formData: IClientes) => void;
}

const EditarClienteModal: React.FC<Props> = ({ cliente, onClose, onEditar }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<IClientes>(cliente);
const [existeDocumento, setExisteDocumento] = useState<true | false | "actual" | null>(null);
const [existeCorreo, setExisteCorreo] = useState<true | false | "actual" | null>(null);
const [loading, setLoading] = useState(false);
  const [departamentos, setDepartamentos] = useState<{ id: number; name: string }[]>([]);
  const [ciudades, setCiudades] = useState<{ id: number; name: string }[]>([]);
  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [direccionData, setDireccionData] = useState({
    Complementos: "",
    barrio: "",
    calle: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  //  Verificar existencia de documento y correo

  useEffect(() => {
  const controller = new AbortController();
  const { NumDocumento, Correo, IdCliente } = formData;

  const validarDocumento = NumDocumento && NumDocumento.length > 4;
  const validarCorreo = Correo && Correo.length > 5 && Correo.includes("@");

  if (!validarDocumento && !validarCorreo) {
    setExisteDocumento(null);
    setExisteCorreo(null);
    return;
  }

  setLoading(true);

  const timeout = setTimeout(async () => {
    try {
      const res = await fetch("https://www.apicreartnino.somee.com/api/Clientes/Lista", {
        signal: controller.signal,
      });
      const clientes = await res.json();

      // 🧾 Buscar cliente actual
      

      //  DOCUMENTO
      if (validarDocumento) {
        const clienteConMismoDoc = clientes.find(
          (c: any) => String(c.NumDocumento) === String(NumDocumento)
        );

        if (!clienteConMismoDoc) {
          setExisteDocumento(false); // no existe
        } else if (clienteConMismoDoc.IdCliente === IdCliente) {
          setExisteDocumento("actual"); // es su propio documento
        } else {
          setExisteDocumento(true); // existe en otro cliente
        }
      } else {
        setExisteDocumento(null);
      }

      //  CORREO
      if (validarCorreo) {
        const clienteConMismoCorreo = clientes.find(
          (c: any) => c.Correo?.toLowerCase() === Correo.toLowerCase()
        );

        if (!clienteConMismoCorreo) {
          setExisteCorreo(false);
        } else if (clienteConMismoCorreo.IdCliente === IdCliente) {
          setExisteCorreo("actual");
        } else {
          setExisteCorreo(true);
        }
      } else {
        setExisteCorreo(null);
      }
    } catch (err) {
      console.error("Error al verificar cliente:", err);
    } finally {
      setLoading(false);
    }
  }, 500);

  return () => {
    clearTimeout(timeout);
    controller.abort();
  };
}, [formData.NumDocumento, formData.Correo]);

const botonDeshabilitado =
  isSubmitting || loading || existeDocumento === true || existeCorreo === true;

  //  Inicializar dirección
  useEffect(() => {
    if (cliente.Direccion) {
      const partes = cliente.Direccion.split(",").map((p) => p.trim());
      setDireccionData({
        Complementos: partes[0] || "",
        barrio: partes[1] || "",
        calle: partes[2] || "",
      });
    }
  }, [cliente]);

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

  //  Guardar dirección desde submodal
  const handleDireccionModalSave = () => {
    const { Complementos, barrio, calle } = direccionData;

    if (Complementos.trim() === "" || barrio.trim() === "" || calle.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa Complementos, Barrio y Calle/Carrera.",
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

    const direccionCompleta = `${Complementos}, ${barrio}, ${calle}`;
    setFormData((prev) => ({ ...prev, Direccion: direccionCompleta }));
    setShowDireccionModal(false);
  };

  //  Validaciones + PUT
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (isSubmitting) return;
  setIsSubmitting(true);

  const REPEAT_THRESHOLD = 4;

  //  Funciones de validación reutilizables
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
    // Validaciones Nombre
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
      return Swal.fire({ icon: "error", title: "Nombre inválido", text: "Debe tener entre 3 y 100 caracteres.", confirmButtonColor: "#f78fb3" });
    }

    // Validaciones Tipo documento
    if (!formData.TipoDocumento) {
      return Swal.fire({ icon: "error", title: "Tipo de documento requerido", text: "Selecciona un tipo de documento.", confirmButtonColor: "#f78fb3" });
    }

    // Validaciones Documento
    const numDoc = formData.NumDocumento.trim();
    if (!/^\d+$/.test(numDoc)) {
      return Swal.fire({ icon: "error", title: "Documento inválido", text: "Solo se permiten números.", confirmButtonColor: "#f78fb3" });
    }
    if (numDoc.length < 6 || numDoc.length > 15) {
      return Swal.fire({ icon: "error", title: "Documento inválido", text: "Debe tener entre 6 y 15 dígitos.", confirmButtonColor: "#f78fb3" });
    }
    if (isAllSameChar(numDoc) || hasLongRepeatSequence(numDoc) || hasLowVariety(numDoc)) {
      return Swal.fire({ icon: "error", title: "Documento inválido", text: "El número no puede ser repetitivo ni de baja variedad.", confirmButtonColor: "#f78fb3" });
    }

    // Validaciones Celular
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

    // Validaciones Correo
    const correo = formData.Correo.trim();
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) {
      return Swal.fire({ icon: "error", title: "Correo inválido", text: "Por favor ingresa un correo válido.", confirmButtonColor: "#f78fb3" });
    }
    if (isAllSameChar(correo) || hasLongRepeatSequence(correo) || isOnlySpecialChars(correo) || hasTooManySpecialChars(correo) || hasLowVariety(correo)) {
      return Swal.fire({ icon: "error", title: "Correo inválido", text: "El correo no puede contener patrones repetitivos o demasiados caracteres especiales.", confirmButtonColor: "#f78fb3" });
    }

    // Validaciones Dirección
    const direccion = formData.Direccion?.trim() || "";
    if (!direccion) {
      return Swal.fire({ icon: "error", title: "Dirección requerida", text: "La dirección es obligatoria.", confirmButtonColor: "#f78fb3" });
    }
    if (direccion.length < 5 || direccion.length > 100) {
      return Swal.fire({ icon: "error", title: "Dirección inválida", text: "Debe tener entre 5 y 100 caracteres.", confirmButtonColor: "#f78fb3" });
    }
    if (isAllSameChar(direccion) || hasLongRepeatSequence(direccion) || isOnlySpecialChars(direccion) || hasTooManySpecialChars(direccion) || hasLowVariety(direccion)) {
      return Swal.fire({ icon: "error", title: "Dirección inválida", text: "La dirección no puede ser repetitiva, solo números o tener baja variedad.", confirmButtonColor: "#f78fb3" });
    }

    // Validaciones Departamento y ciudad
    if (!formData.Departamento) {
      return Swal.fire({ icon: "error", title: "Departamento requerido", text: "Seleccione un departamento.", confirmButtonColor: "#f78fb3" });
    }
    if (!formData.Ciudad) {
      return Swal.fire({ icon: "error", title: "Ciudad requerida", text: "Seleccione una ciudad.", confirmButtonColor: "#f78fb3" });
    }

    // Actualizar cliente
    const resp = await fetch(`${APP_SETTINGS.apiUrl}Clientes/Actualizar/${formData.IdCliente}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (resp.ok) {
      const actualizado = await resp.json().catch(() => null);
      Swal.fire({
        icon: "success",
        title: "Cliente actualizado correctamente",
        timer: 2000, // 2 segundos
            timerProgressBar: true,
            showConfirmButton: false
      });
      onEditar(actualizado ?? formData);
      onClose();
      navigate("/clientes");
    } else {
      const data = await resp.json().catch(() => ({}));
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: data.message || "No se pudo actualizar el cliente. Verifique los datos.",
        timer: 2000, 
            timerProgressBar: true,
            showConfirmButton: false
      });
    }
  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor.",
      timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
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
              <h5 className="modal-title">✏️ Editar Cliente</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                {/* Campos iguales que en CrearClienteModal */}
                <div className="col-md-6">
                  <label className="form-label">🧾 Tipo de Documento <span className="text-danger">*</span></label>
                  <select
                    name="TipoDocumento"
                    className="form-select"
                    value={formData.TipoDocumento}
                    onChange={handleChange}
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                  </select>
                </div>

                {/* Número Documento */}
<div className="col-md-6">
  <label className="form-label">
    🔢 Número Documento <span className="text-danger">*</span>
  </label>
  <input
    name="NumDocumento"
    className="form-control"
    value={formData.NumDocumento}
    maxLength={11}
    onChange={(e) => {
      e.target.value = e.target.value.replace(/\D/g, "");
      handleChange(e);
    }}
  />
  {loading && <p className="text-info mt-1">🔍 Verificando...</p>}
{existeDocumento === true && !loading && (
  <p className="text-danger mt-1">⚠️ Este documento ya pertenece a otro cliente</p>
)}
{existeDocumento === false && !loading && formData.NumDocumento && (
  <p className="text-success mt-1">✅ Documento disponible</p>
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

                {/*  Correo Electrónico */}
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
  />
  {loading && <p className="text-info mt-1">🔍 Verificando...</p>}
{existeCorreo === true && !loading && (
  <p className="text-danger mt-1">⚠️ Este correo ya pertenece a otro cliente</p>
)}
{existeCorreo === false && !loading && formData.Correo && (
  <p className="text-success mt-1">✅ Correo disponible</p>
)}
</div>

                <div className="col-md-6">
                  <label className="form-label">📱 Celular <span className="text-danger">*</span></label>
                  <input
                    name="Celular"
                    className="form-control"
                    value={formData.Celular}
                    max={10}
                    onChange={(e) => {
      // Solo números, sin espacios
      e.target.value = e.target.value.replace(/\D/g, "");
      handleChange(e);
    }}
                    maxLength={10}
                  />
                </div>


                <div className="col-md-6">
                  <label className="form-label">🏞️ Departamento <span className="text-danger">*</span></label>
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

                <div className="col-md-6">
                  <label className="form-label">🏙️ Ciudad <span className="text-danger">*</span></label>
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

                <div className="col-md-6">
                  <label className="form-label">🏡 Dirección <span className="text-danger">*</span></label>
                  <input
                    name="Direccion"
                    className="form-control"
                    value={formData.Direccion}
                    onClick={() => setShowDireccionModal(true)}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button
  type="submit"
  className="btn pastel-btn-primary"
  disabled={botonDeshabilitado}
>
  {isSubmitting
    ? "Guardando..."
    : loading
    ? "Verificando..."
    : existeDocumento === true || existeCorreo === true
    ? "Corrige los datos"
    : "Guardar Cambios"}
</button>
            </div>
          </form>

          {/* Submodal Dirección */}
          {showDireccionModal && (
            <div className="modal d-block pastel-overlay" tabIndex={-1}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content pastel-modal shadow">
                  <div className="modal-header pastel-header">
                    <h5 className="modal-title">🏠 Editar Dirección</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => {
                        // Restaurar datos originales al cancelar
                        if (cliente.Direccion) {
                          const partes = cliente.Direccion.split(",").map((p) => p.trim());
                          setDireccionData({
                            Complementos: partes[0] || "",
                            barrio: partes[1] || "",
                            calle: partes[2] || "",
                          });
                        }
                        setShowDireccionModal(false);
                      }}
                    ></button>
                  </div>
                  <div className="modal-body px-4 py-3">
                    <div className="mb-3">
                      <label>Barrio <span className="text-danger">*</span></label>
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
                      <label>Calle / Carrera <span className="text-danger">*</span></label>
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
                      <label>Complementos <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        value={direccionData.Complementos}
                        placeholder="Apartamento, edificio, referencia, etc."
                        onChange={(e) => {
    let value = e.target.value;

    // ❌ No permitir espacios al inicio
    value = value.replace(/^\s+/, "");

    // ✔ Permitir máximo 2 espacios seguidos
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
                      type="button"
                      className="btn pastel-btn-secondary"
                      onClick={() => {
                        // Restaurar datos originales al cancelar
                        if (cliente.Direccion) {
                          const partes = cliente.Direccion.split(",").map((p) => p.trim());
                          setDireccionData({
                            Complementos: partes[0] || "",
                            barrio: partes[1] || "",
                            calle: partes[2] || "",
                          });
                        }
                        setShowDireccionModal(false);
                      }}
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

export default EditarClienteModal;
