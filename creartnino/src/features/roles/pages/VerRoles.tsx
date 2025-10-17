import React, { useEffect, useState } from "react";
import "../style/acciones.css";
import type { IRol, IRolPermiso, IPermiso } from "../../interfaces/IRoles";

interface Props {
  rol: IRol;
  onClose: () => void;
}

const VerRolModal: React.FC<Props> = ({ rol, onClose }) => {
  const [permisosAsignados, setPermisosAsignados] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPermisos = async () => {
      try {
        // 1️⃣ obtener todos los RolPermisos
        const resRolPermisos = await fetch(
          "https://apicreartnino.somee.com/api/Rolpermisos/Lista"
        );
        const rolPermisos: IRolPermiso[] = await resRolPermisos.json();

        // Filtrar solo los del rol actual
        const permisosIds = rolPermisos
          .filter((rp) => rp.IdRol === rol.IdRol)
          .map((rp) => rp.IdPermisos);

        // 2️⃣ obtener todos los permisos
        const resPermisos = await fetch(
          "https://apicreartnino.somee.com/api/permisos/Lista"
        );
        const permisos: IPermiso[] = await resPermisos.json();

        // 3️⃣ mapear IdPermisos -> Nombre
        const nombres = permisos
          .filter((p) => permisosIds.includes(p.IdPermisos))
          .map((p) => p.RolPermisos);

        setPermisosAsignados(nombres);
      } catch (error) {
        console.error("Error cargando permisos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermisos();
  }, [rol.IdRol]);

  return (
    <div className="modal d-block overlay" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content pastel-modal shadow-lg">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">👁️ Ver Rol</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body px-4 py-3">
            <div className="row g-4">
              {/* Nombre */}
              <div className="col-md-6">
                <label className="form-label">🏷️ Nombre</label>
                <input className="form-control" value={rol.Rol} disabled />
              </div>

              {/* Descripción */}
              <div className="col-md-6">
                <label className="form-label">🧾 Descripción</label>
                <input className="form-control" value={rol.Descripcion} disabled />
              </div>

              {/* Permisos */}
              <div className="col-md-12">
                <label className="form-label">🔐 Permisos Asignados</label>
                <div className="row">
                  {loading ? (
                    <p className="text-muted px-2">Cargando permisos...</p>
                  ) : permisosAsignados.length > 0 ? (
                    permisosAsignados.map((permiso, idx) => (
                      <div key={idx} className="col-6 col-md-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked
                            disabled
                          />
                          <label className="form-check-label">{permiso}</label>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted px-2">
                      Este rol no tiene permisos asignados.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer pastel-footer">
            <button
              type="button"
              className="btn pastel-btn-secondary"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerRolModal;
