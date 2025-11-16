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
  rolesExistentes: Rol[]; 
}

interface Permiso {
  id: number;
  nombre: string;
}

const CrearRolModal: React.FC<Props> = ({ onClose, onCrear,rolesExistentes }) => {
  const [permisosDisponibles, setPermisosDisponibles] = useState<Permiso[]>([]);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar permisos desde la API al montar el componente
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
  if (isSubmitting) return;
  const form = e.currentTarget;

  const rol = (form.nombre as HTMLInputElement).value.trim();
  const descripcion = (form.descripcion as HTMLInputElement).value.trim();

  // ---------- Reglas básicas ----------
  if (!rol) {
    Swal.fire("Error", "El nombre del rol es obligatorio", "error");
    return;
  }

  // longitud
  if (rol.length < 3 || rol.length > 50) {
    Swal.fire("Error", "El rol debe tener entre 3 y 50 caracteres", "error");
    return;
  }

  // no permitir un solo carácter
  if (rol.length === 1) {
    Swal.fire("Error", "El nombre del rol no puede ser un solo carácter", "error");
    return;
  }

  // regex: sólo letras, números y espacios (acentos y ñ permitidos)
  const regex = /^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑ]+$/;
  if (!regex.test(rol)) {
    Swal.fire("Error", "El rol solo puede contener letras, números y espacios", "error");
    return;
  }

  // ---------- Reglas anti-abuso / basura ----------
  // 1) No puede ser sólo números (ej: "123456")
  const regexSoloNumeros = /^\d+$/;
  if (regexSoloNumeros.test(rol)) {
    Swal.fire("Error", "El nombre del rol no puede ser solo números", "error");
    return;
  }

  // 2) No puede ser sólo caracteres especiales (ej: "+++","@@@")
  const regexSoloEspeciales = /^[^a-zA-Z0-9]+$/;
  if (regexSoloEspeciales.test(rol)) {
    Swal.fire("Error", "El nombre del rol no puede ser solo caracteres especiales", "error");
    return;
  }

  // 3) No puede ser todo el mismo carácter repetido (ej: "aaaaaaaa","11111111","+++++")
  const regexMismoCaracterRepetido = /^(.)(\1)+$/; // coincide si toda la cadena es el mismo carácter repetido al menos 2 veces
  if (regexMismoCaracterRepetido.test(rol)) {
    Swal.fire("Error", "El nombre del rol no puede estar formado por el mismo carácter repetido", "error");
    return;
  }

  // ---------- Validaciones para descripción (si fue escrita) ----------
  if (descripcion) {
    if (descripcion.length < 5) {
      Swal.fire("Error", "La descripción debe tener al menos 5 caracteres", "error");
      return;
    }

    // no permitir un solo carácter especial en descripción
    if (descripcion.trim().length === 1 && regexSoloEspeciales.test(descripcion.trim())) {
      Swal.fire("Error", "La descripción no puede ser un solo carácter especial", "error");
      return;
    }

    // no permitir descripción solo números
    if (regexSoloNumeros.test(descripcion)) {
      Swal.fire("Error", "La descripción no puede ser solo números", "error");
      return;
    }

    // no permitir descripción formada por el mismo carácter repetido
    if (regexMismoCaracterRepetido.test(descripcion)) {
      Swal.fire("Error", "La descripción no puede estar formada por el mismo carácter repetido", "error");
      return;
    }
  }

  // ---------- Permisos ----------
  if (permisosSeleccionados.length === 0) {
    Swal.fire("Advertencia", "Debe seleccionar al menos un permiso", "warning");
    return;
  }

  // ---------- Duplicados ----------
  const existe = rolesExistentes.some(
    (r) => r.Rol.trim().toLowerCase() === rol.toLowerCase()
  );
  if (existe) {
    Swal.fire("Error", `El rol "${rol}" ya existe`, "error");
    return;
  }

  // ---------- Si pasa todo: envío al backend ----------
  try {
    setIsSubmitting(true);
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

    
    form.reset();
    setPermisosSeleccionados([]);

    onCrear({
      IdRol: nuevoId,
      Rol: rol,
      Descripcion: descripcion,
      Estado: true,
      Usuarios: [],
      RolPermisos: []
    });

    onClose();

  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo crear el rol", "error");
  } finally{
    setIsSubmitting(false);
  }
};

  return (
    <div className="modal d-block overlay" tabIndex={-1}>
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
                  <input className="form-control" name="nombre" required  onInput={(e) => {
    e.currentTarget.value = e.currentTarget.value.trimStart();
  }} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">🧾 Descripción</label>
                  <input className="form-control" name="descripcion"  onInput={(e) => {
    e.currentTarget.value = e.currentTarget.value.trimStart();
  }} />
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
               <button
                type="submit"
                className="btn pastel-btn-primary d-flex align-items-center justify-content-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    Creando...
                  </>
                ) : (
                  "Crear"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearRolModal;
