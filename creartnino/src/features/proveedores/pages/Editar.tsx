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

  // ahora direccionData usa municipio, barrio, calle (coherente con CrearProveedorModal)
  const [direccionData, setDireccionData] = useState({
    municipio: "",
    barrio: "",
    calle: "",
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

  // validaciones (adaptadas: ya no se requiere CP)
  const validarCamposObligatorios = (): boolean => {
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

    if (!/^\d{10}$/.test(formData.Celular)) {
      Swal.fire({
        icon: "error",
        title: "Celular inválido",
        text: "Debe contener exactamente 10 dígitos numéricos.",
        confirmButtonColor: "#f78fb3",
      });
      return false;
    }

    if (!/^\d{6,15}$/.test(formData.NumDocumento)) {
      Swal.fire({
        icon: "error",
        title: "Documento inválido",
        text: "Debe tener entre 6 y 15 dígitos.",
        confirmButtonColor: "#f78fb3",
      });
      return false;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.NombreCompleto)) {
      Swal.fire({
        icon: "error",
        title: "Nombre inválido",
        text: "Solo letras y espacios.",
        confirmButtonColor: "#f78fb3",
      });
      return false;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.Ciudad)) {
      Swal.fire({
        icon: "error",
        title: "Ciudad inválida",
        text: "Solo letras.",
        confirmButtonColor: "#f78fb3",
      });
      return false;
    }

    // La dirección debe venir del submodal (3 partes separadas por coma)
    const partesDireccion = (formData.Direccion ?? "").split(",").map((p) => p.trim()).filter(Boolean);
    if (partesDireccion.length < 3) {
      Swal.fire({
        icon: "error",
        title: "Dirección inválida",
        text: "Ingresa la dirección desde el submodal (Municipio, Barrio y Calle/Carrera).",
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
    const municipio = partes[0] ?? "";
    const barrio = partes[1] ?? "";
    const calle = partes[2] ?? "";
    setDireccionData({ municipio, barrio, calle });
    setShowDireccionModal(true);
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
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
                  <input className="form-control" name="NumDocumento" value={formData.NumDocumento} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">{esJuridica ? "🏢 Nombre de la Empresa" : "🙍 Nombre Completo"} <span className="text-danger">*</span></label>
                  <input className="form-control" name="NombreCompleto" value={formData.NombreCompleto} onChange={handleChange} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📱 Celular <span className="text-danger">*</span></label>
                  <input className="form-control" name="Celular" value={formData.Celular} onChange={handleChange} required />
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
              <button type="submit" className="btn pastel-btn-primary">Guardar Cambios</button>
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
                      <label>Municipio</label>
                      <input
                        className="form-control"
                        value={direccionData.municipio}
                        onChange={(e) => setDireccionData(prev => ({ ...prev, municipio: e.target.value.replace(/\s+/g, "") }))}
                      />
                    </div>
                    <div className="mb-3">
                      <label>Barrio</label>
                      <input
                        className="form-control"
                        value={direccionData.barrio}
                        onChange={(e) => setDireccionData(prev => ({ ...prev, barrio: e.target.value.replace(/\s+/g, "") }))}
                      />
                    </div>
                    <div className="mb-3">
                      <label>Calle / Carrera</label>
                      <input
                        className="form-control"
                        value={direccionData.calle}
                        onChange={(e) => setDireccionData(prev => ({ ...prev, calle: e.target.value.replace(/\s+/g, "") }))}
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
