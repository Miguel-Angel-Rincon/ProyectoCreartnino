// src/components/EditarProveedorModal.tsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../style/acciones.css";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { IProveedores } from "../../interfaces/IProveedores";

interface Props {
  proveedor: IProveedores;
  onClose: () => void;
  onEditar: (formData: IProveedores) => void; // el padre recibe el objeto actualizado y decide mostrar swal
}

const EditarProveedorModal: React.FC<Props> = ({ proveedor, onClose, onEditar }) => {
  const [formData, setFormData] = useState<IProveedores>({
    IdProveedor: proveedor?.IdProveedor ?? 0,
    TipoPersona: proveedor?.TipoPersona ?? "",
    TipoDocumento: proveedor?.TipoDocumento ?? "",
    NombreCompleto: proveedor?.NombreCompleto ?? "",
    NumDocumento: proveedor?.NumDocumento ?? "",
    Departamento: proveedor?.Departamento ?? "",
    Ciudad: proveedor?.Ciudad ?? "",
    Direccion: proveedor?.Direccion ?? "",
    Celular: proveedor?.Celular ?? "",
    Estado: proveedor?.Estado ?? true, // mantenido internamente pero NO se muestra en el form
  });

  const [departamentos, setDepartamentos] = useState<{ id: number; name: string }[]>([]);
  const [ciudades, setCiudades] = useState<{ id: number; name: string }[]>([]);
  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [existeDoc, setExisteDoc] = useState<null | boolean>(null);
const [loadingCheck, setLoadingCheck] = useState(false);


  // ahora direccionData usa municipio, barrio, calle (coherente con CrearProveedorModal)
  const [direccionData, setDireccionData] = useState({
    barrio: "",
    calle: "",
    Complementos: "",
  });

  // sincronizar cuando cambia la prop proveedor
  useEffect(() => {
    if (proveedor) {
      setFormData({
        IdProveedor: proveedor.IdProveedor,
        TipoPersona: proveedor.TipoPersona ?? "",
        TipoDocumento: proveedor.TipoDocumento ?? "",
        NombreCompleto: proveedor.NombreCompleto ?? "",
        NumDocumento: proveedor.NumDocumento ?? "",
        Departamento: proveedor.Departamento ?? "",
        Ciudad: proveedor.Ciudad ?? "",
        Direccion: proveedor.Direccion ?? "",
        Celular: proveedor.Celular ?? "",
        Estado: proveedor.Estado ?? true,
      });
    }
  }, [proveedor]);

  useEffect(() => {
  const controller = new AbortController();

  if (formData.NumDocumento.trim().length >= 5) {
    setLoadingCheck(true);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("https://apicreartnino.somee.com/api/Proveedores/Lista", {
          signal: controller.signal,
        });
        const proveedores = await res.json();

        const docExiste = proveedores.some(
          (p: any) =>
            String(p.NumDocumento) === formData.NumDocumento.trim() &&
            p.IdProveedor !== formData.IdProveedor // 👈 permite su propio documento
        );

        setExisteDoc(docExiste);
      } catch (err) {
        console.error("Error verificando documento del proveedor:", err);
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
  }
}, [formData.NumDocumento, formData.IdProveedor]);


  // cargar departamentos (API Colombia)
  useEffect(() => {
    fetch("https://api-colombia.com/api/v1/Department")
      .then((res) => res.json())
      .then((data: { id: number; name: string }[]) =>
        setDepartamentos(data.sort((a, b) => a.name.localeCompare(b.name)))
      )
      .catch(console.error);
  }, []);

  // cargar ciudades cuando cambia departamento
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

  // manejo de inputs (manteniendo nombres idénticos al CrearProveedorModal)
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

  // guardar dirección desde submodal (sin codigo postal)
  const handleDireccionModalSave = () => {
    const {barrio ,calle, Complementos } = direccionData;

    if ( barrio.trim() === "" || calle.trim() === "" || Complementos.trim() === "" ) {
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

    const direccionCompleta = `${barrio}, ${calle},${Complementos}`;
    setFormData((prev) => ({ ...prev, Direccion: direccionCompleta }));
    setShowDireccionModal(false);
  };

  // validaciones (adaptadas: ya no se requiere CP)
  const validarCamposObligatorios = (): boolean => {
  // 🔹 Funciones auxiliares de validación
  const isAllSameChar = (s: string) => s.length > 1 && /^(.)(\1)+$/.test(s);
  const hasLongRepeatSequence = (s: string, n = 4) => new RegExp(`(.)\\1{${n - 1},}`).test(s);
  const isOnlySpecialChars = (s: string) => /^[^a-zA-Z0-9]+$/.test(s);
  const hasTooManySpecialChars = (s: string, maxPercent = 0.6) => {
    const specialCount = (s.match(/[^a-zA-Z0-9]/g) || []).length;
    return specialCount / s.length > maxPercent;
  };
  const hasLowVariety = (s: string, minUnique = 3) => new Set(s).size < minUnique;

  // 🔸 Campos obligatorios
  const camposObligatorios =
    formData.TipoPersona === "Jurídica"
      ? ["TipoPersona", "TipoDocumento", "NumDocumento", "NombreCompleto", "Celular", "Departamento", "Ciudad", "Direccion"]
      : ["TipoPersona", "TipoDocumento", "NumDocumento", "NombreCompleto", "Celular", "Departamento", "Ciudad", "Direccion"];

  for (const campo of camposObligatorios) {
    const valor = (formData as any)[campo];
    if (valor === undefined || valor === null || (typeof valor === "string" && valor.trim() === "")) {
      Swal.fire({
        icon: "warning",
        title: "Campo obligatorio faltante",
        text: `Por favor completa el campo: ${campo}.`,
        confirmButtonColor: "#f78fb3",
      });
      return false;
    }
  }

  // ✅ Validar celular
  const celular = formData.Celular?.trim() ?? "";
  if (!/^\d{10}$/.test(celular)) {
    Swal.fire({
      icon: "error",
      title: "Celular inválido",
      text: "Debe contener exactamente 10 dígitos numéricos.",
      confirmButtonColor: "#f78fb3",
    });
    return false;
  }
  if (isAllSameChar(celular) || hasLongRepeatSequence(celular) || hasLowVariety(celular)) {
    Swal.fire({
      icon: "error",
      title: "Celular inválido",
      text: "No puede contener dígitos repetitivos o baja variedad.",
      confirmButtonColor: "#f78fb3",
    });
    return false;
  }

  // ✅ Validar número de documento
  const numDoc = formData.NumDocumento?.trim() ?? "";
  if (!/^\d+$/.test(numDoc)) {
    Swal.fire({
      icon: "error",
      title: "Documento inválido",
      text: "Solo se permiten números.",
      confirmButtonColor: "#f78fb3",
    });
    return false;
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
    return false;
  }

  // ✅ Validar nombre completo
  const nombre = formData.NombreCompleto?.trim() ?? "";
  const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  if (!nombreRegex.test(nombre)) {
    Swal.fire({
      icon: "error",
      title: "Nombre inválido",
      text: "Solo letras y espacios.",
      confirmButtonColor: "#f78fb3",
    });
    return false;
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
      text: "Debe tener entre 3 y 100 caracteres, sin repeticiones ni símbolos excesivos.",
      confirmButtonColor: "#f78fb3",
    });
    return false;
  }

  // ✅ Validar ciudad
  const ciudad = formData.Ciudad?.trim() ?? "";
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(ciudad)) {
    Swal.fire({
      icon: "error",
      title: "Ciudad inválida",
      text: "Solo letras y espacios.",
      confirmButtonColor: "#f78fb3",
    });
    return false;
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
      text: "Debe tener entre 2 y 60 caracteres, sin repeticiones ni baja variedad.",
      confirmButtonColor: "#f78fb3",
    });
    return false;
  }

  // ✅ Validar dirección (debe venir del submodal)
  const direccion = formData.Direccion?.trim() ?? "";
  const partesDireccion = direccion.split(",").map((p) => p.trim()).filter(Boolean);
  if (partesDireccion.length < 3) {
    Swal.fire({
      icon: "error",
      title: "Dirección inválida",
      text: "Ingresa la dirección desde el submodal (Municipio, Barrio y Calle/Carrera).",
      confirmButtonColor: "#f78fb3",
    });
    return false;
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
      text: "Debe tener entre 5 y 100 caracteres, sin repeticiones ni símbolos excesivos.",
      confirmButtonColor: "#f78fb3",
    });
    return false;
  }

  return true;
};


  // submit -> PUT a Proveedores/Actualizar/{id}
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validarCamposObligatorios()) return;

    try {
      const resp = await fetch(`${APP_SETTINGS.apiUrl}Proveedores/Actualizar/${formData.IdProveedor}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (resp.ok) {
        // obtener objeto actualizado (si el backend lo devuelve)
        const actualizado = await resp.json().catch(() => null);
        // NOTA: NO mostramos Swal aquí para evitar duplicados; el padre (Listar) puede mostrarlo
        onEditar(actualizado ?? formData);
        onClose();
      } else {
        const msg = await resp.text();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: msg || "No se pudo actualizar el proveedor.",
          confirmButtonColor: "#f78fb3",
        });
      }
    } catch (err) {
      console.error("EditarProveedorModal - error:", err);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
        confirmButtonColor: "#f78fb3",
      });
    }
  };

  const esJuridica = formData.TipoPersona === "Jurídica";

  // parsear dirección existente y abrir submodal (ahora municipio, barrio, calle)
  const openDireccionModalFromDireccion = () => {
    const partes = (formData.Direccion ?? "").split(",").map((p) => p.trim());
    const barrio = partes[0] ?? "";
    const calle = partes[1] ?? "";
    const Complementos = partes[2] ?? "";
    setDireccionData({  barrio, calle,Complementos });
    setShowDireccionModal(true);
  };

  return (
    <div className="modal d-block overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">✏️ Editar Proveedor</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">👤 Tipo de Persona <span className="text-danger">*</span></label>
                  <select className="form-select" name="TipoPersona" value={formData.TipoPersona} onChange={handleChange} required>
                    <option value="">Seleccione...</option>
                    <option value="Natural">Natural</option>
                    <option value="Jurídica">Jurídica</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🧾 Tipo de Documento <span className="text-danger">*</span></label>
                  <select className="form-select" name="TipoDocumento" value={formData.TipoDocumento} onChange={handleChange} required disabled={esJuridica}>
                    <option value="">Seleccione...</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="NIT">NIT</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">{esJuridica ? "🔢 Número NIT" : "🔢 Número de Documento"} <span className="text-danger">*</span></label>
                  <input className="form-control" name="NumDocumento" value={formData.NumDocumento} maxLength={11} onChange={(e) => {
      // ✅ Solo números, sin espacios
      e.target.value = e.target.value.replace(/\D/g, "");
      handleChange(e);
    }} required />
    {existeDoc && (
  <small className="text-danger">⚠️ Este número de documento ya está registrado por otro proveedor.</small>
)}
{existeDoc === false && formData.NumDocumento && (
  <small className="text-success">✅ Documento disponible.</small>
)}

                </div>

                <div className="col-md-6">
                  <label className="form-label">{esJuridica ? "🏢 Nombre de la Empresa" : "🙍 Nombre Completo"} <span className="text-danger">*</span></label>
                  <input className="form-control" name="NombreCompleto" value={formData.NombreCompleto} onChange={(e) => {
                    const value = e.target.value;
                    if (value.trim() === "" && value !== "") return;
                    handleChange(e);
                  }} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📱 Celular <span className="text-danger">*</span></label>
                  <input className="form-control" name="Celular" value={formData.Celular} maxLength={10} onChange={(e) => {
      // ✅ Solo números, sin espacios
      e.target.value = e.target.value.replace(/\D/g, "");
      handleChange(e);
    }} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏞️ Departamento <span className="text-danger">*</span></label>
                  <select className="form-select" name="Departamento" value={formData.Departamento} onChange={handleChange} required>
                    <option value="">Seleccione un departamento</option>
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏙️ Ciudad <span className="text-danger">*</span></label>
                  <select className="form-select" name="Ciudad" value={formData.Ciudad} onChange={handleChange} required>
                    <option value="">Seleccione una ciudad</option>
                    {ciudades.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏡 Dirección <span className="text-danger">*</span></label>
                  <input className="form-control" name="Direccion" value={formData.Direccion} onClick={openDireccionModalFromDireccion} readOnly required />
                </div>

                {/* NO se muestra control de Estado en el modal; lo gestiona ListarProveedores */}

              </div>
            </div>

            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>Cancelar</button>
              <button
  type="submit"
  className="btn pastel-btn-primary"
  disabled={loadingCheck || existeDoc === true}
>
  {loadingCheck ? "Verificando..." : "Guardar Cambios"}
</button>

            </div>
          </form>

          {showDireccionModal && (
            <div className="modal d-block pastel-overlay" tabIndex={-1}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content pastel-modal shadow">
                  <div className="modal-header pastel-header">
                    <h5 className="modal-title">🏠 Información de Dirección</h5>
                    <button className="btn-close" onClick={() => setShowDireccionModal(false)}></button>
                  </div>
                  <div className="modal-body px-4 py-3">
                    <div className="mb-3">
                      <label>Barrio <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        value={direccionData.barrio}
                        onChange={(e) => setDireccionData(prev => ({ ...prev, barrio: e.target.value.replace(/\s+/g, "") }))}
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
                        onChange={(e) => setDireccionData(prev => ({ ...prev, Complementos: e.target.value.replace(/\s+/g, "") }))}
                      />
                    </div>
                  </div>
                  <div className="modal-footer pastel-footer">
                    <button className="btn pastel-btn-secondary" onClick={() => setShowDireccionModal(false)}>Cancelar</button>
                    <button className="btn pastel-btn-primary" onClick={handleDireccionModalSave}>Guardar Dirección</button>
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

export default EditarProveedorModal;
