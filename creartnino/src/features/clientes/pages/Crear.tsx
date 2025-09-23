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

  try {
    // ✅ Validaciones obligatorias
    const camposObligatorios = [
      "TipoDocumento",
      "NumDocumento",
      "NombreCompleto",
      "Correo",
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

    // ✅ Buscar usuario en la lista
    const listaResp = await fetch(`${APP_SETTINGS.apiUrl}Usuarios/Lista`);
    if (!listaResp.ok) throw new Error("No se pudo obtener la lista de usuarios");

    const usuarios = await listaResp.json();
    const usuarioExiste = usuarios.find(
      (u: any) =>
        u.Correo.toLowerCase() === formData.Correo.toLowerCase() ||
        u.NumDocumento === formData.NumDocumento
    );

    let clientePayload;

    if (!usuarioExiste) {
      // 🚀 Usuario no existe → crear usuario con contraseña random
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
        const msg = await crearUsuarioResp.text();
        throw new Error(msg || "No se pudo crear el usuario");
      }

      clientePayload = { ...usuarioPayload };
    } else {
      // 🚀 Usuario ya existe → actualizar datos (mantener contraseña)
      const usuarioActualizado = {
        ...usuarioExiste,
        TipoDocumento: formData.TipoDocumento,
        NumDocumento: formData.NumDocumento,
        NombreCompleto: formData.NombreCompleto,
        Celular: formData.Celular,
        Departamento: formData.Departamento,
        Ciudad: formData.Ciudad,
        Direccion: formData.Direccion,
        Correo: formData.Correo,
        Contrasena: usuarioExiste.Contrasena,
        Estado: true,
        IdRol: 4,
      };

      const actualizarUsuarioResp = await fetch(
        `${APP_SETTINGS.apiUrl}Usuarios/Actualizar/${usuarioExiste.IdUsuarios}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(usuarioActualizado),
        }
      );

      if (!actualizarUsuarioResp.ok) {
        const msg = await actualizarUsuarioResp.text();
        throw new Error(msg || "No se pudo actualizar el usuario");
      }

      clientePayload = { ...usuarioActualizado };
    }

    // ✅ Antes de crear cliente → validar si ya existe
    const listaClientesResp = await fetch(`${APP_SETTINGS.apiUrl}Clientes/Lista`);
    if (!listaClientesResp.ok) throw new Error("No se pudo obtener la lista de clientes");

    const clientes = await listaClientesResp.json();
    const clienteExiste = clientes.find(
      (c: any) =>
        c.Correo.toLowerCase() === clientePayload.Correo.toLowerCase() ||
        c.NumDocumento === clientePayload.NumDocumento
    );

    if (clienteExiste) {
      Swal.fire({
        icon: "info",
        title: "Cliente ya registrado",
        text: "El cliente ya existe en el sistema, no es necesario crearlo de nuevo.",
        confirmButtonColor: "#f78fb3",
      });
    } else {
      // 🚀 Crear cliente
      const clienteResp = await fetch(`${APP_SETTINGS.apiUrl}Clientes/Crear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientePayload),
      });

      if (clienteResp.ok) {
        const creado = await clienteResp.json().catch(() => null);
        onCrear(creado ?? (clientePayload as IClientes));
        onClose();
        navigate("/clientes");
      } else {
        const msg = await clienteResp.text();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: msg || "Error al registrar el cliente",
          confirmButtonColor: "#f78fb3",
        });
      }
    }
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
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
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
                  <label className="form-label">
                    🔢 Número de Documento <span className="text-danger">*</span>
                  </label>
                  <input
                    name="NumDocumento"
                    className="form-control"
                    value={formData.NumDocumento}
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
                  <label className="form-label">
                    📱 Celular <span className="text-danger">*</span>
                  </label>
                  <input
                    name="Celular"
                    className="form-control"
                    value={formData.Celular}
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
                      <label>Municipio</label>
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
                      <label>Barrio</label>
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
                      <label>Calle / Carrera</label>
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
