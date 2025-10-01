import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../style/acciones.css';
import type { IRolPermiso } from '../../interfaces/IRoles';

export interface Rol {
  IdRol: number;
  Rol: string;
  Descripcion: string;
  Estado: boolean;
  Usuarios: any[];
  RolPermisos: IRolPermiso[];
}

interface Props {
  onClose: () => void;
  onCrear: (nuevoRol: Rol) => void; // ✅ se usará al crear
}

interface Permiso {
  id: number;
  nombre: string;
}

const CrearRolModal: React.FC<Props> = ({ onClose, onCrear }) => {
  const [permisosDisponibles, setPermisosDisponibles] = useState<Permiso[]>([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>([]);

  useEffect(() => {
    const fetchPermisos = async () => {
      try {
        const response = await fetch("https://apicreartnino.somee.com/api/permisos/Lista");
        if (!response.ok) throw new Error("Error al obtener permisos");

        const data = await response.json();

        const permisosOcultos = [
          "Ver productos",
          "Realizar pedidos",
          "Ver historial de pedidos",
          "Editar perfil"
        ];

        const permisosApi = data
          .map((p: any) => ({
            id: p.IdPermisos,
            nombre: p.RolPermisos
          }))
          .filter((p: any) => !permisosOcultos.includes(p.nombre));

        setPermisosDisponibles(permisosApi);
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "No se pudieron cargar los permisos", "error");
      }
    };

    fetchPermisos();
  }, []);

  const togglePermiso = (idPermiso: number) => {
    setPermisosSeleccionados((prev) =>
      prev.includes(idPermiso)
        ? prev.filter((id) => id !== idPermiso)
        : [...prev, idPermiso]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const rol = (form.nombre as HTMLInputElement).value.trim();
    const descripcion = (form.descripcion as HTMLInputElement).value.trim();

    if (!rol) {
      Swal.fire("Error", "El nombre del rol es obligatorio", "error");
      return;
    }

    if (permisosSeleccionados.length === 0) {
      Swal.fire("Advertencia", "Debe seleccionar al menos un permiso", "warning");
      return;
    }

    try {
      const response = await fetch("https://apicreartnino.somee.com/api/Roles/Crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IdRol: 0,
          Rol: rol,
          Descripcion: descripcion || "",
          Estado: true
        }),
      });

      if (!response.ok) throw new Error("Error al crear rol");

      const rolCreado = await response.json();
      const nuevoId = rolCreado.IdRol || rolCreado.idRol;

      for (const idPermiso of permisosSeleccionados) {
        await fetch("https://apicreartnino.somee.com/api/Rolpermisos/Crear", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            IdRol: nuevoId,
            IdPermisos: idPermiso
          }),
        });
      }

      Swal.fire("Éxito", `Rol creado con sus respectivos permisos`, "success");
      form.reset();
      setPermisosSeleccionados([]);

      // ✅ Notificar al padre para refrescar lista
      onCrear({
        IdRol: nuevoId,
        Rol: rol,
        Descripcion: descripcion,
        Estado: true,
        Usuarios: [],
        RolPermisos: [] // se pueden volver a cargar luego
      });

      onClose();

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo crear el rol", "error");
    }
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">🛡️ Crear Rol</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-3">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">
                    🏷️ Nombre del Rol <span className="text-danger">*</span>
                  </label>
                  <input className="form-control" name="nombre" required />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🧾 Descripción</label>
                  <input className="form-control" name="descripcion" />
                </div>

                <div className="col-md-12">
                  <label className="form-label">🔐 Permisos <span className="text-danger">*</span></label>
                  <div className="row">
                    {permisosDisponibles.map((permiso) => (
                      <div key={permiso.id} className="col-6 col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`permiso-${permiso.id}`}
                            checked={permisosSeleccionados.includes(permiso.id)}
                            onChange={() => togglePermiso(permiso.id)}
                          />
                          <label className="form-check-label" htmlFor={`permiso-${permiso.id}`}>
                            {permiso.nombre}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-12">
                  <small className="text-muted">
                    Los campos marcados con <span className="text-danger">*</span> son obligatorios.
                  </small>
                </div>
              </div>
            </div>

            <div className="modal-footer pastel-footer">
              <button type="button" className="btn pastel-btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn pastel-btn-primary">
                Crear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearRolModal;
