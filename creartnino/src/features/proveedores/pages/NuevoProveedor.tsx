// src/components/CrearProveedorModal.tsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../style/acciones.css";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { IProveedores } from "../../interfaces/IProveedores";
import { useNavigate } from "react-router-dom";

interface Props {
  onClose: () => void;
  onCrear: (formData: IProveedores) => void;
}

const CrearProveedorModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<IProveedores>({
    TipoPersona: "",
    TipoDocumento: "",
    NombreCompleto: "",
    NumDocumento: "",
    Departamento: "",
    Ciudad: "",
    Direccion: "",
    Celular: "",
    Estado: true,
  });

  const [departamentos, setDepartamentos] = useState<{ id: number; name: string }[]>([]);
  const [ciudades, setCiudades] = useState<{ id: number; name: string }[]>([]);
  const [showDireccionModal, setShowDireccionModal] = useState(false);

  // 🔧 Dirección (correcto mapeo de campos)
  const [direccionData, setDireccionData] = useState({
    municipio: "",
    barrio: "",
    calle: "",
  });

  // ----- NUEVO: estado para bloquear doble submit -----
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Departamentos (API Colombia)
  useEffect(() => {
    fetch("https://api-colombia.com/api/v1/Department")
      .then((res) => res.json())
      .then((data: { id: number; name: string }[]) =>
        setDepartamentos(data.sort((a, b) => a.name.localeCompare(b.name)))
      )
      .catch(console.error);
  }, []);

  // 🔹 Ciudades por departamento
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

  // 🔹 Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "TipoPersona") {
      const nuevaPersona = value;
      setFormData((prev) => ({
        ...prev,
        TipoPersona: nuevaPersona,
        TipoDocumento: nuevaPersona === "Jurídica" ? "NIT" : "CC",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "Departamento" ? { Ciudad: "" } : {}),
      }));
    }
  };

  // 🔹 Submodal Dirección
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

    // Calle/Carrera no puede ser solo números
    if (/^\d+$/.test(calle.trim())) {
      Swal.fire({
        icon: "error",
        title: "Calle/Carrera inválida",
        text: "La Calle/Carrera no puede ser solo números. Agrega texto (ej: 'Calle 13 #12-34').",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }

    const direccionCompleta = `${municipio}, ${barrio}, ${calle}`;
    setFormData((prev) => ({ ...prev, Direccion: direccionCompleta }));
    setShowDireccionModal(false);
  };

  // 🔹 Submit + Backend
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Evitar doble submit
  if (isSubmitting) return;
  setIsSubmitting(true);

  // 🔹 Funciones auxiliares de validación
  const isAllSameChar = (s: string) => s.length > 1 && /^(.)(\1)+$/.test(s);
  const hasLongRepeatSequence = (s: string, n = 4) =>
    new RegExp(`(.)\\1{${n - 1},}`).test(s);
  const isOnlySpecialChars = (s: string) => /^[^a-zA-Z0-9]+$/.test(s);
  const hasTooManySpecialChars = (s: string, maxPercent = 0.6) => {
    const specialCount = (s.match(/[^a-zA-Z0-9]/g) || []).length;
    return specialCount / s.length > maxPercent;
  };
  const hasLowVariety = (s: string, minUnique = 3) => new Set(s).size < minUnique;

  try {
    // ✅ Validar campos obligatorios
    const camposObligatorios = [
      "TipoPersona",
      "TipoDocumento",
      "NumDocumento",
      "NombreCompleto",
      "Celular",
      "Departamento",
      "Ciudad",
      "Direccion",
    ];

    for (const campo of camposObligatorios) {
      if (
        !formData[campo as keyof typeof formData] ||
        (formData[campo as keyof typeof formData] as string).trim() === ""
      ) {
        Swal.fire({
          icon: "warning",
          title: "Campo obligatorio faltante",
          text: `Por favor completa el campo: ${campo}.`,
          confirmButtonColor: "#f78fb3",
        });
        return;
      }
    }

    // ✅ Validar nombre
    const nombre = formData.NombreCompleto.trim();
    const nombreRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/;
    if (!nombreRegex.test(nombre)) {
      Swal.fire({
        icon: "error",
        title: "Nombre inválido",
        text: "Solo se permiten letras y espacios.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }
    if (
      nombre.length < 3 ||
      nombre.length > 100 ||
      isAllSameChar(nombre) ||
      hasLongRepeatSequence(nombre) ||
      isOnlySpecialChars(nombre) ||
      hasTooManySpecialChars(nombre) ||
      hasLowVariety(nombre)
    ) {
      Swal.fire({
        icon: "error",
        title: "Nombre inválido",
        text: "Debe tener entre 3 y 100 caracteres y no contener patrones repetitivos o poca variedad.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }

    // ✅ Validar número de documento
    const numDoc = formData.NumDocumento.trim();
    if (!/^\d+$/.test(numDoc)) {
      Swal.fire({
        icon: "error",
        title: "Documento inválido",
        text: "Solo se permiten números.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }
    if (
      numDoc.length < 8 ||
      numDoc.length > 12 ||
      isAllSameChar(numDoc) ||
      hasLongRepeatSequence(numDoc) ||
      hasLowVariety(numDoc)
    ) {
      Swal.fire({
        icon: "error",
        title: "Documento inválido",
        text: "Debe tener entre 8 y 11 dígitos y no ser repetitivo ni de baja variedad.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }

    // ✅ Validar celular
    const celular = formData.Celular.trim();
    if (!/^\d{10}$/.test(celular)) {
      Swal.fire({
        icon: "error",
        title: "Celular inválido",
        text: "Debe contener exactamente 10 dígitos numéricos.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }
    if (isAllSameChar(celular) || hasLongRepeatSequence(celular) || hasLowVariety(celular)) {
      Swal.fire({
        icon: "error",
        title: "Celular inválido",
        text: "No puede contener dígitos repetitivos o baja variedad.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }

    // ✅ Validar ciudad
    const ciudad = formData.Ciudad.trim();
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(ciudad)) {
      Swal.fire({
        icon: "error",
        title: "Ciudad inválida",
        text: "Solo se permiten letras y espacios.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }
    if (
      ciudad.length < 2 ||
      ciudad.length > 60 ||
      isAllSameChar(ciudad) ||
      hasLongRepeatSequence(ciudad) ||
      hasLowVariety(ciudad)
    ) {
      Swal.fire({
        icon: "error",
        title: "Ciudad inválida",
        text: "Debe tener entre 2 y 60 caracteres, sin repeticiones ni patrones raros.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }

    // ✅ Dirección (desde submodal)
    const direccion = formData.Direccion.trim();
    const partesDireccion = direccion.split(",").map((p) => p.trim()).filter(Boolean);
    if (partesDireccion.length < 3) {
      Swal.fire({
        icon: "error",
        title: "Dirección inválida",
        text: "Ingresa la dirección desde el submodal (Municipio, Barrio y Calle/Carrera).",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }
    if (
      direccion.length < 5 ||
      direccion.length > 100 ||
      isAllSameChar(direccion) ||
      hasLongRepeatSequence(direccion) ||
      isOnlySpecialChars(direccion) ||
      hasTooManySpecialChars(direccion) ||
      hasLowVariety(direccion)
    ) {
      Swal.fire({
        icon: "error",
        title: "Dirección inválida",
        text: "Debe tener entre 5 y 100 caracteres y no ser repetitiva ni solo símbolos.",
        confirmButtonColor: "#f78fb3",
      });
      return;
    }

    // 🚀 Enviar datos al backend
    const resp = await fetch(`${APP_SETTINGS.apiUrl}Proveedores/Crear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (resp.ok) {
      const creado = await resp.json().catch(() => null);
      onCrear(creado ?? formData);
      onClose();
      navigate("/proveedores");
    } else {
      const msg = await resp.text();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg || "Error al registrar el proveedor",
        confirmButtonColor: "#f78fb3",
      });
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor.",
      confirmButtonColor: "#f78fb3",
    });
  } finally {
    setIsSubmitting(false);
  }
};


  const esJuridica = formData.TipoPersona === "Jurídica";

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">📦 Crear Proveedor</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">
                    👤 Tipo de Persona <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="TipoPersona"
                    value={formData.TipoPersona}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    <option value="Natural">Natural</option>
                    <option value="Jurídica">Jurídica</option>
                  </select>
                </div>

                <div className="col-md-6">
  <label className="form-label">
    🧾 Tipo de Documento <span className="text-danger">*</span>
  </label>
  <select
    className="form-select"
    name="TipoDocumento"
    value={formData.TipoDocumento}
    onChange={handleChange}
    required
  >
    <option value="">Seleccione...</option>

    {esJuridica ? (
      <option value="NIT">NIT</option>
    ) : (
      <>
        <option value="CC">Cédula de Ciudadanía</option>
        <option value="CE">Cédula de Extranjería</option>
        <option value="TI">Tarjeta de Identidad</option>
      </>
    )}
  </select>
</div>


                <div className="col-md-6">
                  <label className="form-label">
                    {esJuridica ? "🔢 Número NIT" : "🔢 Número de Documento"}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    name="NumDocumento"
                    value={formData.NumDocumento}
                    onChange={(e) => {
      // ✅ Solo números, sin espacios
      e.target.value = e.target.value.replace(/\D/g, "");
      handleChange(e);
    }}
                    maxLength={11}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    {esJuridica ? "🏢 Nombre de la Empresa" : "🙍 Nombre Completo"}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    name="NombreCompleto"
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
                    📱 Celular <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    name="Celular"
                    value={formData.Celular}
                    maxLength={10}
                    onChange={(e) => {
      // ✅ Solo números, sin espacios
      e.target.value = e.target.value.replace(/\D/g, "");
      handleChange(e);
    }}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    🏞️ Departamento <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="Departamento"
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
                    className="form-select"
                    name="Ciudad"
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
                    className="form-control"
                    name="Direccion"
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

          {showDireccionModal && (
            <div className="modal d-block pastel-overlay" tabIndex={-1}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content pastel-modal shadow">
                  <div className="modal-header pastel-header">
                    <h5 className="modal-title">🏠 Información de Dirección</h5>
                    {/* ----- IMPORTANTE: type="button" para que no dispare el submit del formulario padre ----- */}
                    <button type="button" className="btn-close" onClick={() => setShowDireccionModal(false)}></button>
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
                    {/* ----- type="button" para evitar submit accidental ----- */}
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
      </div>
    </div>
  );
};

export default CrearProveedorModal;
