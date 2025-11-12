// src/web/pages/Acceso/Perfil.tsx
import { useAuth } from "../../../context/AuthContext";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../../styles/perfil.css";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaIdCard,
  FaCity,
  FaLock,
} from "react-icons/fa";
import type { IUsuarios } from "../../../features/interfaces/IUsuarios";

type Dep = { id: number; nombre: string };
type Ciudad = { id: number; nombre: string; depId: number };

const Perfil = () => {
  const { usuario, token, iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const [editando, setEditando] = useState(false);
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);

  const [departamentos, setDepartamentos] = useState<Dep[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);

  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [errorContrasena, setErrorContrasena] = useState("");
  const [errorConfirmar, setErrorConfirmar] = useState("");

  const [datos, setDatos] = useState<IUsuarios>({
    IdUsuarios: usuario?.IdUsuarios ?? 0,
    NombreCompleto: usuario?.NombreCompleto ?? "",
    TipoDocumento: usuario?.TipoDocumento ?? "",
    NumDocumento: usuario?.NumDocumento ?? "",
    Celular: usuario?.Celular ?? "",
    Departamento: usuario?.Departamento ?? "",
    Ciudad: usuario?.Ciudad ?? "",
    Direccion: usuario?.Direccion ?? "",
    Correo: usuario?.Correo ?? "",
    Contrasena: "",
    IdRol: usuario?.IdRol ?? 0,
    Estado: usuario?.Estado ?? true,
    IdRolNavigation: usuario?.IdRolNavigation,
  });

  // ✅ Validación de seguridad de contraseña
  const esContrasenaSegura = (pass: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pass);
  };

  // 🔹 Cargar perfil
  useEffect(() => {
    const fetchPerfil = async () => {
      if (!token) {
        Swal.fire("Sesión expirada", "Inicia sesión nuevamente", "warning");
        navigate("/ingresar");
        return;
      }

      try {
        const res = await fetch(
          "https://www.apicreartnino.somee.com/api/Usuarios/perfil",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("No se pudo cargar el perfil");

        const data = await res.json();

        setDatos({
          IdUsuarios: data.idUsuarios,
          NombreCompleto: data.nombreCompleto ?? "",
          TipoDocumento: data.tipoDocumento ?? "",
          NumDocumento: data.numDocumento ?? "",
          Celular: data.celular ?? "",
          Departamento: data.departamento ?? "",
          Ciudad: data.ciudad ?? "",
          Direccion: data.direccion ?? "",
          Correo: data.correo ?? "",
          IdRol: data.idRol,
          Estado: data.estado,
          Contrasena: "",
          IdRolNavigation: data.idRolNavigation ?? null,
        });
      } catch (err: any) {
        Swal.fire("Error", err.message, "error");
      }
    };

    fetchPerfil();
  }, [navigate, token]);

  // 🔹 Cargar departamentos y ciudades ordenados
  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const res = await fetch("https://api-colombia.com/api/v1/Department");
        const data = await res.json();
        const deps: Dep[] = data
          .map((d: any) => ({ id: d.id, nombre: d.name }))
          .sort((a: Dep, b: Dep) => a.nombre.localeCompare(b.nombre));
        setDepartamentos(deps);
      } catch (err) {
        console.error("Error cargando departamentos:", err);
      }
    };

    const fetchCiudades = async () => {
      try {
        const res = await fetch(
          "https://api-colombia.com/api/v1/City/pagedList?page=1&pageSize=1000"
        );
        const data = await res.json();
        const ciuds: Ciudad[] = data.data
          .map((c: any) => ({
            id: c.id,
            nombre: c.name,
            depId:
              c.departmentId ??
              c.departmentID ??
              c.department_id ??
              c.department?.id ??
              0,
          }))
          .sort((a: Ciudad, b: Ciudad) => a.nombre.localeCompare(b.nombre));
        setCiudades(ciuds);
      } catch (err) {
        console.error("Error cargando ciudades:", err);
      }
    };

    fetchDepartamentos();
    fetchCiudades();
  }, []);

  // 🔹 Ciudades visibles: solo filtra por departamento cuando estás editando
  const ciudadesVisibles = useMemo(() => {
    if (!editando) return ciudades; // en vista, no filtramos
    if (!datos.Departamento) return [];
    const dep = departamentos.find((d) => d.nombre === datos.Departamento);
    if (!dep) return [];
    return ciudades.filter((c) => c.depId === dep.id);
  }, [editando, datos.Departamento, ciudades, departamentos]);

  // 🔹 Inputs
  const handleCambiar = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Si cambia el departamento mientras edita, limpia la ciudad
    if (name === "Departamento") {
      setDatos((prev) => ({
        ...prev,
        Departamento: value,
        Ciudad: editando ? "" : prev.Ciudad,
      }));
      return;
    }

    // Validaciones de contraseña en vivo
    if (name === "Contrasena") {
      setErrorContrasena(
        value && !esContrasenaSegura(value)
          ? "Debe tener 8+ caracteres, incluir mayúscula, minúscula, número y símbolo."
          : ""
      );
      setErrorConfirmar(
        confirmarContrasena && value !== confirmarContrasena
          ? "Las contraseñas no coinciden"
          : ""
      );
    }

    setDatos({ ...datos, [name]: value });
  };

  // Mantener error de confirmación sincronizado
  useEffect(() => {
    if (!datos.Contrasena && !confirmarContrasena) {
      setErrorConfirmar("");
      return;
    }
    setErrorConfirmar(
      confirmarContrasena && datos.Contrasena !== confirmarContrasena
        ? "Las contraseñas no coinciden"
        : ""
    );
  }, [datos.Contrasena, confirmarContrasena]);

  // 🔹 Guardar cambios
  const guardarCambios = async () => {
    if (!token) return;

    // Validaciones de contraseña
    if (datos.Contrasena) {
      if (!esContrasenaSegura(datos.Contrasena)) {
        Swal.fire(
          "Error",
          "La contraseña no es segura: mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.",
          "error"
        );
        return;
      }
      if (datos.Contrasena !== confirmarContrasena) {
        Swal.fire("Error", "Las contraseñas no coinciden", "error");
        return;
      }
    }

    try {
      const body: any = { ...datos };
      if (!datos.Contrasena) delete body.Contrasena; // envía pass solo si la cambió

      const res = await fetch(
        `https://www.apicreartnino.somee.com/api/Usuarios/Actualizar/${datos.IdUsuarios}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      let actualizado: any = {};
      try {
        actualizado = await res.json();
      } catch {
        actualizado = { ...body, mensaje: "Perfil actualizado correctamente" };
      }

      iniciarSesion(actualizado, token);

      Swal.fire("Éxito", "Perfil actualizado correctamente", "success");
      setEditando(false);
      setMostrarCambioPassword(false);
      setDatos((prev) => ({ ...prev, Contrasena: "" }));
      setConfirmarContrasena("");
      setErrorContrasena("");
      setErrorConfirmar("");
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="perfil-contenedor">
      <h2 className="perfil-titulo">Información del Perfil</h2>

      <div className="perfil-grid">
        {/* Tipo Documento */}
        <div className="perfil-item">
          <label><FaIdCard /> Tipo Documento</label>
          <select
            name="TipoDocumento"
            value={datos.TipoDocumento}
            onChange={handleCambiar}
            disabled={!editando}
          >
            <option value="">Seleccione...</option>
            <option value="RC">Registro Civil</option>
            <option value="TI">Tarjeta de Identidad</option>
            <option value="CC">Cédula de Ciudadanía</option>
            <option value="CE">Cédula de Extranjería</option>
            <option value="NIT">NIT</option>
          </select>
        </div>

        {/* Número Documento */}
        <div className="perfil-item">
          <label><FaIdCard /> Número Documento</label>
          <input
            name="NumDocumento"
            value={datos.NumDocumento}
            onChange={handleCambiar}
            disabled={!editando}
          />
        </div>

        {/* Nombre Completo */}
        <div className="perfil-item">
          <label><FaUser /> Nombre Completo</label>
          <input
            name="NombreCompleto"
            value={datos.NombreCompleto}
            onChange={handleCambiar}
            disabled={!editando}
          />
        </div>

        {/* Celular */}
        <div className="perfil-item">
          <label><FaPhone /> Celular</label>
          <input
            name="Celular"
            value={datos.Celular}
            onChange={handleCambiar}
            disabled={!editando}
          />
        </div>

        {/* Departamento */}
        <div className="perfil-item">
          <label><FaMapMarkerAlt /> Departamento</label>
          <select
            name="Departamento"
            value={datos.Departamento}
            onChange={handleCambiar}
            disabled={!editando}
          >
            <option value="">Seleccione...</option>
            {departamentos.map((dep) => (
              <option key={dep.id} value={dep.nombre}>
                {dep.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Ciudad */}
        <div className="perfil-item">
          <label><FaCity /> Ciudad</label>
          <select
            name="Ciudad"
            value={datos.Ciudad}
            onChange={handleCambiar}
            disabled={!editando || !datos.Departamento}
          >
            <option value="">
              {editando && !datos.Departamento
                ? "Seleccione un departamento primero"
                : "Seleccione..."}
            </option>
            {ciudadesVisibles.map((c) => (
              <option key={c.id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Dirección */}
        <div className="perfil-item full">
          <label><FaMapMarkerAlt /> Dirección</label>
          <input
            name="Direccion"
            value={datos.Direccion}
            onChange={handleCambiar}
            disabled={!editando}
          />
        </div>

        {/* Correo */}
        <div className="perfil-item full">
          <label><FaEnvelope /> Correo</label>
          <input
            name="Correo"
            value={datos.Correo}
            onChange={handleCambiar}
            disabled={!editando}
          />
        </div>
      </div>

      {/* Cambio de contraseña */}
      {editando && mostrarCambioPassword && (
        <>
          <div className="perfil-item full">
            <label><FaLock /> Nueva Contraseña</label>
            <input
              type="password"
              name="Contrasena"
              value={datos.Contrasena}
              onChange={handleCambiar}
              placeholder="Mín. 8 caracteres y compleja"
            />
            {errorContrasena && <p className="error-text">{errorContrasena}</p>}
          </div>

          <div className="perfil-item full">
            <label><FaLock /> Confirmar Contraseña</label>
            <input
              type="password"
              name="ConfirmarContrasena"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
            />
            {errorConfirmar && <p className="error-text">{errorConfirmar}</p>}
          </div>
        </>
      )}

      {/* Botones */}
      <div className="perfil-botones">
        {editando ? (
          <>
            <button className="btn-primario" onClick={guardarCambios}>
              Guardar cambios
            </button>
            {!mostrarCambioPassword && (
              <button
                className="btn-secundario"
                onClick={() => setMostrarCambioPassword(true)}
              >
                Cambiar contraseña
              </button>
            )}
          </>
        ) : (
          <button className="btn-primario" onClick={() => setEditando(true)}>
            Editar perfil
          </button>
        )}
      </div>
    </div>
  );
};

export default Perfil;
