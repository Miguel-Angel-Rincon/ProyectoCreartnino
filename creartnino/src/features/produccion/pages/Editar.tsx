// src/components/EditarProduccion.tsx
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [respProd, respDet, respProdList, respIns, respPedidos, respClientes] = await Promise.all([
          fetch(`${APP_SETTINGS.apiUrl}Produccion/Obtener/${idProduccion}`),
          fetch(`${APP_SETTINGS.apiUrl}Detalles_Produccion/Lista`),
          fetch(`${APP_SETTINGS.apiUrl}Productos/Lista`),
          fetch(`${APP_SETTINGS.apiUrl}Insumos/Lista`),
          fetch(`${APP_SETTINGS.apiUrl}Pedidos/Lista`),
          fetch(`${APP_SETTINGS.apiUrl}Clientes/Lista`),
        ]);

        if (!respProd.ok) throw new Error("Error obteniendo producción");
        const prod: IProduccion = await respProd.json();
        setProduccion(prod);

        const allDet: detalleProduccion[] = await respDet.json();
        setDetalles(allDet.filter((d) => d.IdProduccion === idProduccion));

        setProductos(await respProdList.json());
        setInsumos(await respIns.json());
        setPedidos(await respPedidos.json());
        setClientes(await respClientes.json());
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudieron cargar los datos.", "error");
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

      Swal.fire("✅ Actualizado", "La producción fue editada.", "success");
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

        <div className="col-md-6">
          <label className="form-label">📅 Fecha Inicio</label>
          <input type="date" className="form-control" value={produccion.FechaInicio ?? ""} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">📦 Fecha de Finalización</label>
          <input
            type="date"
            className="form-control"
            value={produccion.FechaFinal ?? ""}
            onChange={(e) => setProduccion({ ...produccion, FechaFinal: e.target.value })}
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
              <Modal
                show={mostrarSubmodal === index}
                onHide={() => setMostrarSubmodal(null)}
                centered
                className="pastel-modal"
              >
                <Modal.Header closeButton className="pastel-header">
                  <Modal.Title>🧪 Insumos del Producto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {ins.map((insumo, i) => (
                    <div key={i} className="row align-items-center mb-2">
                      <div className="col-md-6">
                        <input type="text" className="form-control" value={insumo.Nombre} disabled />
                      </div>
                      <div className="col-md-6">
                        <input type="number" className="form-control" value={d.CantidadInsumo ?? 0} min={0} disabled />
                      </div>
                    </div>
                  ))}
                  <div className="text-end mt-3">
                    <button
                      type="button"
                      className="btn btn-sm pastel-btn-primary"
                      onClick={() => setMostrarSubmodal(null)}
                    >
                      ✔ Listo
                    </button>
                  </div>
                </Modal.Body>
              </Modal>
            </div>
          );
        })}
      </div>

      <div className="text-end mt-4">
        <button className="btn pastel-btn-secondary me-2" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn pastel-btn-primary" onClick={handleSave}>
          Guardar
        </button>
      </div>
    </div>
  );
};

export default EditarProduccion;
