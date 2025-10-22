// src/components/EditarProduccion.tsx
import React, { useEffect, useState } from "react";

import Swal from "sweetalert2";
import "../styles/style.css";
import { APP_SETTINGS } from "../../../settings/appsettings";

import type { IProduccion, detalleProduccion } from "../../interfaces/IProduccion";
import type { IProductos } from "../../interfaces/IProductos";
import type { IInsumos } from "../../interfaces/IInsumos";
import type { IPedido} from "../../interfaces/IPedidos";
import type { IClientes } from "../../interfaces/IClientes";

interface Props {
  idProduccion: number;
  onClose: () => void;
  onEdit: (produccion: IProduccion) => void;
}

const EditarProduccion: React.FC<Props> = ({ idProduccion, onClose, onEdit }) => {
  const [produccion, setProduccion] = useState<IProduccion | null>(null);
  const [detalles, setDetalles] = useState<detalleProduccion[]>([]);
  const [productos, setProductos] = useState<IProductos[]>([]);
  const [insumos, setInsumos] = useState<IInsumos[]>([]);
  const [pedidos, setPedidos] = useState<IPedido[]>([]);
  const [clientes, setClientes] = useState<IClientes[]>([]);
  const [mostrarSubmodal, setMostrarSubmodal] = useState<number | null>(null);
  const [fechaServidor, setFechaServidor] = useState<string>("");

  useEffect(() => {
  const fetchData = async () => {
    try {
      // 📦 Carga en paralelo de todos los datos requeridos
      const [
        respProd,
        respDet,
        respProdList,
        respIns,
        respPedidos,
        respClientes,
        respFecha,
      ] = await Promise.all([
        fetch(`${APP_SETTINGS.apiUrl}Produccion/Obtener/${idProduccion}`),
        fetch(`${APP_SETTINGS.apiUrl}Detalles_Produccion/Lista`),
        fetch(`${APP_SETTINGS.apiUrl}Productos/Lista`),
        fetch(`${APP_SETTINGS.apiUrl}Insumos/Lista`),
        fetch(`${APP_SETTINGS.apiUrl}Pedidos/Lista`),
        fetch(`${APP_SETTINGS.apiUrl}Clientes/Lista`),
        fetch(`${APP_SETTINGS.apiUrl}Utilidades/FechaServidor`),
      ]);

      // 🧩 Validar respuestas
      if (!respProd.ok) throw new Error("❌ Error obteniendo producción");
      if (!respFecha.ok) throw new Error("❌ Error obteniendo fecha del servidor");

      // 🧠 Convertir todas las respuestas a JSON (orden correcto)
      const [
        prod,
        allDet,
        dataProdList,
        dataIns,
        dataPedidos,
        dataClientes,
        dataFecha,
      ] = await Promise.all([
        respProd.json(),
        respDet.json(),
        respProdList.json(),
        respIns.json(),
        respPedidos.json(),
        respClientes.json(),
        respFecha.json(),
      ]);

      // ✅ Setear producción
      setProduccion(prod);

      // ✅ Filtrar detalles asociados a esta producción
      const detallesFiltrados = (allDet as detalleProduccion[]).filter(
        (d: detalleProduccion) => d.IdProduccion === idProduccion
      );
      setDetalles(detallesFiltrados);

      // ✅ Setear listas generales
      setProductos(dataProdList || []);
      setInsumos(dataIns || []);
      setPedidos(dataPedidos || []);
      setClientes(dataClientes || []);

      // 🕒 Establecer fecha del servidor
      const fechaSrv = new Date(dataFecha.FechaServidor);
      const fechaISO = fechaSrv.toISOString().split("T")[0];
      setFechaServidor(fechaISO);

    } catch (err) {
      console.error("⚠️ Error al cargar datos:", err);
      Swal.fire("Error", "No se pudieron cargar los datos del servidor.", "error");
    }
  };

  fetchData();
}, [idProduccion]);



  const getClienteName = (idCliente?: number) => {
    if (!idCliente) return "";
    const c = clientes.find((x) => x.IdCliente === idCliente);
    return c ? c.NombreCompleto : `Cliente #${idCliente}`;
  };

  const handleSave = async () => {
    if (!produccion) return;

    try {
      const resp = await fetch(`${APP_SETTINGS.apiUrl}Produccion/Actualizar/${produccion.IdProduccion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produccion),
      });

      if (!resp.ok) throw new Error("No se pudo actualizar");

      Swal.fire({
            icon: "success",
            title: "Éxito",
            text: "Producción actualizada correctamente.",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false, 
          });
      onEdit(produccion);
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo editar la producción.", "error");
    }
  };

  if (!produccion) return <p>Cargando...</p>;

  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">✏️ Editar Producción</h2>

      {/* Campos generales */}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">🏷️ Nombre</label>
          <input type="text" className="form-control" value={produccion.NombreProduccion ?? ""} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">⚙️ Tipo de Producción</label>
          <input type="text" className="form-control" value={produccion.TipoProduccion ?? ""} disabled />
        </div>

        {produccion.TipoProduccion === "Pedido" && (
          <div className="col-md-12">
            <label className="form-label">📋 Pedido</label>
            <input
              type="text"
              className="form-control"
              value={
                pedidos.find((p) => p.IdPedido === produccion.IdPedido)
                  ? `Pedido #${produccion.IdPedido} - Cliente: ${getClienteName(
                      pedidos.find((p) => p.IdPedido === produccion.IdPedido)?.IdCliente
                    )}`
                  : "No encontrado"
              }
              disabled
            />
          </div>
        )}

        {/* 📅 Fecha de Inicio */}
<div className="col-md-6">
  <label className="form-label">📅 Fecha de Inicio *</label>
  <input
    type="date"
    className="form-control"
    value={produccion.FechaInicio ?? ""}
    min={fechaServidor} // 🔹 No puede ser antes de la fecha del servidor
    
    onChange={(e) => {
      const nuevaFecha = e.target.value;

      if (new Date(nuevaFecha) < new Date(fechaServidor)) {
        Swal.fire({
          icon: "warning",
          title: "Fecha inválida",
          text: "La fecha de inicio no puede ser anterior a hoy.",
          timer: 2000,
          showConfirmButton: false,
        });
        setProduccion({ ...produccion, FechaInicio: fechaServidor });
      } else {
        setProduccion({ ...produccion, FechaInicio: nuevaFecha });

        // Si la fecha final es anterior a la nueva fecha de inicio, la ajustamos
        if (produccion.FechaFinal && new Date(produccion.FechaFinal) < new Date(nuevaFecha)) {
          setProduccion({ ...produccion, FechaInicio: nuevaFecha, FechaFinal: nuevaFecha });
        }
      }
    }}
  />
</div>

{/* 📦 Fecha de Finalización */}
<div className="col-md-6">
  <label className="form-label">📦 Fecha de Finalización *</label>
  <input
    type="date"
    className="form-control"
    value={produccion.FechaFinal ?? ""}
    min={produccion.FechaInicio ?? fechaServidor} // 🔹 No puede ser antes de la fecha de inicio
    onChange={(e) => {
      const nuevaFechaFin = e.target.value;

      if (new Date(nuevaFechaFin) < new Date(produccion.FechaInicio ?? fechaServidor)) {
        Swal.fire({
          icon: "warning",
          title: "Fecha inválida",
          text: "La fecha final no puede ser anterior a la fecha de inicio.",
          timer: 2000,
          showConfirmButton: false,
        });
        setProduccion({ ...produccion, FechaFinal: produccion.FechaInicio ?? fechaServidor });
      } else {
        setProduccion({ ...produccion, FechaFinal: nuevaFechaFin });
      }
    }}
  />
</div>

      </div>

      {/* Detalles */}
      <div className="mt-4">
        <h5 className="mb-2">📦 Detalle de la Producción</h5>
        <div className="row fw-bold text-secondary mb-2">
          <div className="col-md-5">Producto</div>
          <div className="col-md-4">Cantidad</div>
          <div className="col-md-3">Acciones</div>
        </div>

        {detalles.map((d, index) => {
          const prod = productos.find((p) => p.IdProducto === d.IdProducto);
          const ins = insumos.filter((i) => i.IdInsumo === d.IdInsumo);

          return (
            <div key={index} className="row align-items-center mb-2">
              <div className="col-md-5">
                <input type="text" className="form-control" value={prod?.Nombre ?? ""} disabled />
              </div>
              <div className="col-md-4">
                <input type="number" className="form-control" value={d.CantidadProducir ?? 0} disabled />
              </div>
              <div className="col-md-3 d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setMostrarSubmodal(index)}
                >
                  Gasto Insumos🧪
                </button>
              </div>

              {/* Submodal insumos */}
              {mostrarSubmodal === index && (
  <div className="modal-overlay" onClick={() => setMostrarSubmodal(null)}>
    <div className="modal-box-pastel" onClick={(e) => e.stopPropagation()}>
      {/* Encabezado del modal */}
      <div className="modal-header-pastel">
        <h5>Gasto Insumos 🧪</h5>
        <button className="close-btn" onClick={() => setMostrarSubmodal(null)}>✖</button>
      </div>

      {/* Cuerpo del modal */}
      <div className="modal-body">
        {ins.length > 0 ? (
          <>
            {ins.map((insumo, i) => (
              <div key={i} className="row align-items-center mb-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control pastel-input"
                    value={insumo.Nombre}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="number"
                    className="form-control pastel-input"
                    value={d.CantidadInsumo ?? 0}
                    min={0}
                    disabled
                  />
                </div>
              </div>
            ))}

            {/* Resumen de insumos */}
            <div className="mt-3">
              <h6 className="text-secondary fw-semibold mb-2">Resumen de Insumos:</h6>
              <ul className="mb-0 ps-3">
                {ins.map((insumo, i) => (
                  <li key={i}>
                    {insumo.Nombre}: Usado {d.CantidadInsumo ?? 0}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-muted">Sin insumos registrados.</p>
        )}

        {/* Botón de cerrar */}
        <div className="text-end mt-4">
          <button
            type="button"
            className="pastel-btn-listo"
            onClick={() => setMostrarSubmodal(null)}
          >
            ✓ Listo
          </button>
        </div>
      </div>
    </div>
  </div>
)}

            </div>
          );
        })}
      </div>

      <div className="text-end mt-4">
        <button className="btn pastel-btn-secondary me-2" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn pastel-btn-primary" onClick={handleSave}>
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default EditarProduccion;
