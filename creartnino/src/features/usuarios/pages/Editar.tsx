import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "../style/acciones.css";
import type { IUsuarios } from "../../interfaces/IUsuarios";

interface Props {
  usuario: IUsuarios; // Usuario a editar
  onClose: () => void;
  onEditar: (usuarioActualizado: IUsuarios) => void;
}

const EditarUsuarioModal: React.FC<Props> = ({ usuario, onClose, onEditar }) => {
  const [formData, setFormData] = useState<IUsuarios>(usuario);
  const [showPassword, setShowPassword] = useState(false);
  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [direccionData] = useState({
    municipio: "",
    barrio: "",
    calle: "",
    codigoPostal: "",
  });

  // 🔹 Estado para roles desde API
  const [roles, setRoles] = useState<{ IdRol: number; Rol: string }[]>([]);

  const navigate = useNavigate();

  // 🔹 Cargar roles desde la API
  useEffect(() => {
    fetch("https://apicreartnino.somee.com/api/Roles/Lista")
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch(console.error);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDireccionModalSave = () => {
    const full = `${direccionData.barrio}, ${direccionData.calle}, ${direccionData.codigoPostal}`;
    setFormData((prev: any) => ({ ...prev, Direccion: full }));
    setShowDireccionModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.NombreCompleto.trim()) {
      return Swal.fire({
        icon: "error",
        title: "Nombre requerido",
        text: "El nombre completo es obligatorio.",
        confirmButtonColor: "#e83e8c",
      });
    }

    try {
      const resp = await fetch(
        `https://apicreartnino.somee.com/api/Usuarios/Actualizar/${formData.IdUsuarios}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const actualizado = await resp.json();

      const result = await Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "El usuario fue actualizado correctamente",
        confirmButtonColor: "#e83e8c",
        timer: 3000,
        timerProgressBar: true,
      });

      if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
        onEditar(actualizado);
        navigate("/usuario");
      }
    } catch (err) {
      console.error("editarUsuario:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar el usuario.",
        confirmButtonColor: "#e83e8c",
      });
    }
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">✏️ Editar Usuario</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                {/* Tipo Documento */}
                <div className="col-md-6">
                  <label className="form-label">🧾 Tipo Documento</label>
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
                  <label className="form-label">🔢 Número Documento</label>
                  <input
                    name="NumDocumento"
                    className="form-control"
                    value={formData.NumDocumento}
                    onChange={handleChange}
                    maxLength={11}
                  />
                </div>

                {/* Nombre */}
                <div className="col-md-12">
                  <label className="form-label">🙍 Nombre Completo</label>
                  <input
                    name="NombreCompleto"
                    className="form-control"
                    value={formData.NombreCompleto}
                    onChange={handleChange}
                  />
                </div>

                {/* Celular */}
                <div className="col-md-6">
                  <label className="form-label">📱 Celular</label>
                  <input
                    name="Celular"
                    className="form-control"
                    value={formData.Celular}
                    onChange={handleChange}
                    maxLength={11}
                  />
                </div>

                {/* Correo */}
                <div className="col-md-6">
                  <label className="form-label">📧 Correo</label>
                  <input
                    type="email"
                    name="Correo"
                    className="form-control"
                    value={formData.Correo}
                    onChange={handleChange}
                  />
                </div>

                {/* Contraseña */}
                <div className="col-md-6">
                  <label className="form-label">🔐 Contraseña</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="Contrasena"
                      className="form-control"
                      value={formData.Contrasena}
                      onChange={handleChange}
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

                {/* Dirección */}
                <div className="col-md-6">
                  <label className="form-label">🏡 Dirección</label>
                  <input
                    name="Direccion"
                    className="form-control"
                    value={formData.Direccion}
                    readOnly
                    onClick={() => setShowDireccionModal(true)}
                  />
                </div>

                {/* Rol dinámico */}
                <div className="col-md-6">
                  <label className="form-label">🛡️ Rol</label>
                  <select
                    name="IdRol"
                    className="form-select"
                    value={formData.IdRol}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.map((rol) => (
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
              <button type="submit" className="btn pastel-btn-primary">
                Guardar Cambios
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
                      <label>Barrio</label>
                      <input
                        className="form-control"
                        value={direccionData.barrio}
                        onChange={(e) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            Direccion: `${e.target.value}, ${direccionData.calle}, ${direccionData.codigoPostal}`,
                          }))
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label>Calle / Carrera</label>
                      <input
                        className="form-control"
                        value={direccionData.calle}
                        onChange={(e) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            Direccion: `${direccionData.barrio}, ${e.target.value}, ${direccionData.codigoPostal}`,
                          }))
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

export default EditarUsuarioModal;
