import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import '../style/acciones.css';
import type { IUsuarios } from '../../interfaces/IUsuarios';

interface Props {
  onClose: () => void;
  onCrear: (nuevoUsuario: IUsuarios) => void;
}

const CrearUsuarioModal: React.FC<Props> = ({ onClose /*, onCrear*/ }) => {
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
  const [direccionData, setDireccionData] = useState({ municipio: '', barrio: '', calle: '' });

  // Roles desde API
  const [roles, setRoles] = useState<{ IdRol: number; Rol: string; Descripcion?: string }[]>([]);

  const navigate = useNavigate();

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
    const full = `${direccionData.barrio}, ${direccionData.calle}, ${direccionData.municipio}`;
    setFormData(prev => ({ ...prev, Direccion: full }));
    setShowDireccionModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validaciones
    if (!formData.NombreCompleto.trim()) {
      return Swal.fire({ icon: 'error', title: 'Nombre requerido', text: 'El nombre completo es obligatorio.', confirmButtonColor: '#e83e8c' });
    }
    if (!formData.TipoDocumento) {
      return Swal.fire({ icon: 'error', title: 'Tipo de documento', text: 'Selecciona un tipo de documento.', confirmButtonColor: '#e83e8c' });
    }
    if (!/^\d+$/.test(formData.NumDocumento)) {
      return Swal.fire({ icon: 'error', title: 'Documento inválido', text: 'Solo se permiten números.', confirmButtonColor: '#e83e8c' });
    }
    if (!/^\d+$/.test(formData.Celular)) {
      return Swal.fire({ icon: 'error', title: 'Celular inválido', text: 'Solo se permiten números.', confirmButtonColor: '#e83e8c' });
    }
    if (!formData.Correo.includes('@')) {
      return Swal.fire({ icon: 'error', title: 'Correo inválido', text: 'Por favor ingresa un correo válido.', confirmButtonColor: '#e83e8c' });
    }
    if (!formData.Contrasena.trim()) {
      return Swal.fire({ icon: 'error', title: 'Contraseña requerida', text: 'La contraseña es obligatoria.', confirmButtonColor: '#e83e8c' });
    }

    // 🔒 Validación de contraseña segura
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(formData.Contrasena)) {
      return Swal.fire({
        icon: 'error',
        title: 'Contraseña inválida',
        html: 'La contraseña debe tener:<br>• Mínimo 8 caracteres<br>• Una mayúscula<br>• Una minúscula<br>• Un número<br>• Un carácter especial',
        confirmButtonColor: '#e83e8c'
      });
    }

    if (!formData.IdRol) {
      return Swal.fire({ icon: 'error', title: 'Rol requerido', text: 'Selecciona un rol.', confirmButtonColor: '#e83e8c' });
    }
    if (formData.Departamento && ciudades.length && !formData.Ciudad) {
      return Swal.fire({ icon: 'error', title: 'Ciudad no seleccionada', text: 'Seleccione una ciudad.', confirmButtonColor: '#e83e8c' });
    }

    try {
      // Crear usuario
      const resp = await fetch("https://apicreartnino.somee.com/api/Usuarios/Crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

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

        if (!clienteResp.ok) throw new Error("Error al crear el cliente");
      }

      // ✅ mensaje de éxito
      await Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Usuario creado correctamente",
        confirmButtonColor: "#e83e8c",
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      onClose();
      navigate("/usuario");

    } catch (err) {
      console.error("crearUsuario:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear el usuario/cliente.",
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
              <h5 className="modal-title">👤 Crear Usuario</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">🧾 Tipo Documento</label>
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
                  <label className="form-label">🔢 Número Documento</label>
                  <input
                    name="NumDocumento"
                    className="form-control"
                    value={formData.NumDocumento}
                    onChange={handleChange}
                    maxLength={11}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label">🙍 Nombre Completo</label>
                  <input
                    name="NombreCompleto"
                    className="form-control"
                    value={formData.NombreCompleto}
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
                    maxLength={11}
                  />
                </div>

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

                <div className="col-md-6">
                  <label className="form-label">🔐 Contraseña</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="Contrasena"
                      className="form-control"
                      value={formData.Contrasena}
                      onChange={handleChange}
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
                  <label className="form-label">🏞️ Departamento</label>
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
                  <label className="form-label">🏙️ Ciudad</label>
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
                  <label className="form-label">🏡 Dirección</label>
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
                  <label className="form-label">🛡️ Rol</label>
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
              <button type="submit" className="btn pastel-btn-primary">Crear</button>
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
                      <label>Municipio</label>
                      <input
                        className="form-control"
                        value={direccionData.municipio}
                        onChange={(e) => setDireccionData(prev => ({ ...prev, municipio: e.target.value }))}
                      />
                    </div>
                    <div className="mb-3">
                      <label>Barrio</label>
                      <input
                        className="form-control"
                        value={direccionData.barrio}
                        onChange={(e) => setDireccionData(prev => ({ ...prev, barrio: e.target.value }))}
                      />
                    </div>
                    <div className="mb-3">
                      <label>Calle / Carrera</label>
                      <input
                        className="form-control"
                        value={direccionData.calle}
                        onChange={(e) => setDireccionData(prev => ({ ...prev, calle: e.target.value }))}
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