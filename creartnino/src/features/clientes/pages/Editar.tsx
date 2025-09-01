// src/components/EditarClienteModal.tsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../styles/acciones.css";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { IClientes } from "../../interfaces/IClientes";
import { useNavigate } from "react-router-dom";

interface Props {
  cliente: IClientes; // Cliente que vamos a editar
  onClose: () => void;
  onEditar: (formData: IClientes) => void;
}

const EditarClienteModal: React.FC<Props> = ({ cliente, onClose, onEditar }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<IClientes>(cliente);

  const [departamentos, setDepartamentos] = useState<{ id: number; name: string }[]>([]);
  const [ciudades, setCiudades] = useState<{ id: number; name: string }[]>([]);
  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [direccionData, setDireccionData] = useState({
    municipio: "",
    barrio: "",
    calle: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Inicializar dirección
  useEffect(() => {
    if (cliente.Direccion) {
      const partes = cliente.Direccion.split(",").map((p) => p.trim());
      setDireccionData({
        municipio: partes[0] || "",
        barrio: partes[1] || "",
        calle: partes[2] || "",
      });
    }
  }, [cliente]);

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

  // 🔹 Validaciones + PUT
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Validaciones (idénticas al CrearClienteModal)
      if (!/^\d{10}$/.test(formData.Celular)) {
        Swal.fire({
          icon: "error",
          title: "Celular inválido",
          text: "Debe contener exactamente 10 dígitos numéricos.",
          confirmButtonColor: "#f78fb3",
        });
        return;
      }

      if (!/^\d{6,15}$/.test(formData.NumDocumento)) {
        Swal.fire({
          icon: "error",
          title: "Documento inválido",
          text: "Debe tener entre 6 y 15 dígitos.",
          confirmButtonColor: "#f78fb3",
        });
        return;
      }

      const resp = await fetch(`${APP_SETTINGS.apiUrl}Clientes/Actualizar/${formData.IdCliente}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (resp.ok) {
        const actualizado = await resp.json().catch(() => null);
        onEditar(actualizado ?? formData);
        onClose();
        navigate("/clientes");
      } else {
        const msg = await resp.text();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: msg || "Error al actualizar el cliente",
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

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
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
                  <label className="form-label">🧾 Tipo de Documento</label>
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

                <div className="col-md-6">
                  <label className="form-label">🔢 Número de Documento</label>
                  <input
                    name="NumDocumento"
                    className="form-control"
                    value={formData.NumDocumento}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🙍 Nombre Completo</label>
                  <input
                    name="NombreCompleto"
                    className="form-control"
                    value={formData.NombreCompleto}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📧 Correo Electrónico</label>
                  <input
                    type="email"
                    name="Correo"
                    className="form-control"
                    value={formData.Correo}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">📱 Celular</label>
                  <input
                    name="Celular"
                    className="form-control"
                    value={formData.Celular}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🏞️ Departamento</label>
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
                  <label className="form-label">🏙️ Ciudad</label>
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
                  <label className="form-label">🏡 Dirección</label>
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
              <button type="submit" className="btn pastel-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Actualizar"}
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
                      onClick={() => setShowDireccionModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body px-4 py-3">
                    <div className="mb-3">
                      <label>Municipio</label>
                      <input
                        className="form-control"
                        value={direccionData.municipio}
                        onChange={(e) =>
                          setDireccionData((prev) => ({ ...prev, municipio: e.target.value }))
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label>Barrio</label>
                      <input
                        className="form-control"
                        value={direccionData.barrio}
                        onChange={(e) =>
                          setDireccionData((prev) => ({ ...prev, barrio: e.target.value }))
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label>Calle / Carrera</label>
                      <input
                        className="form-control"
                        value={direccionData.calle}
                        onChange={(e) =>
                          setDireccionData((prev) => ({ ...prev, calle: e.target.value }))
                        }
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

export default EditarClienteModal;
