// src/components/EditarRolModal.tsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../style/acciones.css";
import type { IRol, IPermiso, IRolPermiso } from "../../interfaces/IRoles";

interface Props {
  rol: IRol;
  onClose: () => void;
  onEditar: (rolActualizado: IRol) => void;
}

const EditarRolModal: React.FC<Props> = ({ rol, onClose, onEditar }) => {
  const [nombre, setNombre] = useState<string>(rol.Rol ?? "");
  const [descripcion, setDescripcion] = useState<string>(rol.Descripcion ?? "");
  const [permisosDisponibles, setPermisosDisponibles] = useState<IPermiso[]>([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<IPermiso[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [cargandoPermisos, setCargandoPermisos] = useState<boolean>(true);

  useEffect(() => {
    const fetchRolCompleto = async () => {
      setCargandoPermisos(true);
      try {
        const [resRoles, resPermisos, resRolPermisos] = await Promise.all([
          fetch("https://apicreartnino.somee.com/api/Roles/Lista"),
          fetch("https://apicreartnino.somee.com/api/permisos/Lista"),
          fetch("https://apicreartnino.somee.com/api/Rolpermisos/Lista"),
        ]);

        if (!resRoles.ok || !resPermisos.ok || !resRolPermisos.ok) {
          throw new Error("Error en alguna de las llamadas a la API");
        }

        const rolesData: IRol[] = await resRoles.json();
        const permisosData: IPermiso[] = await resPermisos.json();
        const rolPermisosData: IRolPermiso[] = await resRolPermisos.json();

        const rolData = rolesData.find((r) => r.IdRol === rol.IdRol);
        if (!rolData) {
          Swal.fire("Error", "Rol no encontrado", "error");
          return;
        }

        setNombre(rolData.Rol ?? "");
        setDescripcion(rolData.Descripcion ?? "");
        setPermisosDisponibles(permisosData);

        const permisosIdsAsignados = new Set(
          rolPermisosData.filter((rp) => rp.IdRol === rol.IdRol).map((rp) => rp.IdPermisos)
        );

        const permisosRol = permisosData.filter((p) => permisosIdsAsignados.has(p.IdPermisos));
        setPermisosSeleccionados(permisosRol);
      } catch (error) {
        console.error("❌ Error al traer rol/permisos:", error);
        Swal.fire("Error", "No se pudieron cargar los datos del rol", "error");
      } finally {
        setCargandoPermisos(false);
      }
    };

    if (rol?.IdRol) fetchRolCompleto();
  }, [rol?.IdRol]);

  const togglePermiso = (permiso: IPermiso) => {
    setPermisosSeleccionados((prev) =>
      prev.some((p) => p.IdPermisos === permiso.IdPermisos)
        ? prev.filter((p) => p.IdPermisos !== permiso.IdPermisos)
        : [...prev, permiso]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nombre.trim()) {
      await Swal.fire("Error", "El nombre del rol es obligatorio", "error");
      return;
    }

    if (permisosSeleccionados.length === 0) {
      await Swal.fire("Advertencia", "Debe seleccionar al menos un permiso", "warning");
      return;
    }

    setLoading(true);
    try {
      // 1) Actualizar rol
      const rolBody = {
        IdRol: rol.IdRol,
        Rol: nombre,
        Descripcion: descripcion ?? "",
        Estado: true,
      };

      const resRol = await fetch(
        `https://apicreartnino.somee.com/api/Roles/Actualizar/${rol.IdRol}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rolBody),
        }
      );
      if (!resRol.ok) throw new Error("Error al actualizar el rol");

      // 2) Reemplazar permisos
      const permisosIds = permisosSeleccionados.map((p) => p.IdPermisos);
      const resPermisos = await fetch(
        `https://apicreartnino.somee.com/api/RolPermisos/ReemplazarPermisos/${rol.IdRol}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(permisosIds),
        }
      );
      if (!resPermisos.ok) throw new Error("Error al reemplazar permisos");

      // 3) Todo OK → Swal éxito
      await Swal.fire("Éxito", "Rol actualizado correctamente", "success");

      // 4) Actualizar lista en padre
      onEditar({
        ...rol,
        Rol: nombre,
        Descripcion: descripcion ?? "",
        RolPermisos: permisosSeleccionados.map((p) => ({
          IdRol: rol.IdRol,
          IdPermisos: p.IdPermisos,
        })),
      });

      onClose();
    } catch (err: any) {
      console.error("❌ Error en actualización:", err);
      await Swal.fire("Error", err?.message ?? "No se pudo actualizar el rol", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal d-block pastel-overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header pastel-header">
              <h5 className="modal-title">✏️ Editar Rol</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body px-4 py-3">
              {/* Campos de edición */}
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label">🏷️ Nombre del Rol *</label>
                  <input
                    className="form-control"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={loading || cargandoPermisos}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🧾 Descripción</label>
                  <input
                    className="form-control"
                    value={descripcion ?? ""}
                    onChange={(e) => setDescripcion(e.target.value)}
                    disabled={loading || cargandoPermisos}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label">🔐 Permisos *</label>
                  {cargandoPermisos ? (
                    <small className="text-muted">Cargando permisos...</small>
                  ) : (
                    <div className="row">
                      {permisosDisponibles.map((permiso) => (
                        <div key={permiso.IdPermisos} className="col-6 col-md-4">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`permiso-${permiso.IdPermisos}`}
                              checked={permisosSeleccionados.some(
                                (p) => p.IdPermisos === permiso.IdPermisos
                              )}
                              onChange={() => togglePermiso(permiso)}
                              disabled={loading}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`permiso-${permiso.IdPermisos}`}
                            >
                              {permiso.RolPermisos}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer pastel-footer">
              <button
                type="button"
                className="btn pastel-btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn pastel-btn-primary"
                disabled={loading || cargandoPermisos}
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarRolModal;
