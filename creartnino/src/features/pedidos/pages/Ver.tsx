import React, { useEffect, useState } from "react";
import { FaCalculator, FaWallet, FaCoins } from "react-icons/fa";
import "../styles/acciones.css";
import type { IPedido, detallePedido } from "../../interfaces/IPedidos";

interface VerPedidoProps {
  pedido: IPedido;
  onVolver: () => void;
}

interface ICliente {
  IdCliente: number;
  NombreCompleto: string;
  Direccion: string;
}

interface IProducto {
  IdProducto: number;
  Nombre: string;
  Precio: number;
}

const VerPedido: React.FC<VerPedidoProps> = ({ pedido, onVolver }) => {
  const [clienteNombre, setClienteNombre] = useState<string>("");
  const [clienteDireccion, setClienteDireccion] = useState<string>("");
  const [detallesConInfo, setDetallesConInfo] = useState<
    (detallePedido & { NombreProducto?: string; Precio?: number; Subtotal?: number })[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Obtener clientes
        const rClientes = await fetch("https://apicreartnino.somee.com/api/Clientes/Lista");
        const clientes: ICliente[] = await rClientes.json();
        const cliente = clientes.find((c) => c.IdCliente === pedido.IdCliente);
        if (cliente) {
          setClienteNombre(cliente.NombreCompleto);
          setClienteDireccion(cliente.Direccion);
        }

        // 2) Obtener productos
        const rProductos = await fetch("https://apicreartnino.somee.com/api/Productos/Lista");
        const productos: IProducto[] = await rProductos.json();

        // 3) Obtener detalles del pedido
        const rDetalles = await fetch("https://apicreartnino.somee.com/api/Detalles_Pedido/Lista");
        const detalles: detallePedido[] = await rDetalles.json();
        const detallesPedido = detalles.filter((d) => d.IdPedido === pedido.IdPedido);

        // 4) Mapear detalles con nombre y precio
        const detallesFinal = detallesPedido.map((det) => {
          const producto = productos.find((p) => p.IdProducto === det.IdProducto);
          return {
            ...det,
            NombreProducto: producto?.Nombre || `ID ${det.IdProducto}`,
            Precio: producto?.Precio || 0,
            Subtotal: (det.Cantidad ?? 0) * (producto?.Precio ?? 0),
          };
        });

        setDetallesConInfo(detallesFinal);
      } catch (err) {
        console.error("Error cargando cliente/productos/detalles", err);
      }
    };

    fetchData();
  }, [pedido]);

  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">Visualizar el Pedido</h2>

      {/* Cliente, Método de Pago, Fechas */}
      <div className="row mb-3">
        <div className="col-md-3">
          <label className="form-label">👤 Cliente</label>
          <input className="form-control" value={clienteNombre} disabled />
        </div>
        <div className="col-md-3">
          <label className="form-label">💳 Método de Pago</label>
          <input className="form-control" value={pedido.MetodoPago || ""} disabled />
        </div>
        <div className="col-md-3">
          <label className="form-label">📅 Fecha Pedido</label>
          <input
            className="form-control"
            value={
              pedido.FechaPedido
                ? new Date(pedido.FechaPedido).toLocaleDateString("es-CO")
                : ""
            }
            disabled
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">📦 Fecha Entrega</label>
          <input
            className="form-control"
            value={
              pedido.FechaEntrega
                ? new Date(pedido.FechaEntrega).toLocaleDateString("es-CO")
                : ""
            }
            disabled
          />
        </div>
      </div>

      {/* Detalles */}
      <div className="mb-3">
        <h5 className="mb-3">🧾 Detalle del Pedido</h5>
        {detallesConInfo.length > 0 ? (
          <>
            <div className="row fw-bold text-secondary mb-1">
              <div className="col-md-4">Producto</div>
              <div className="col-md-2">Cantidad</div>
              <div className="col-md-3">Precio</div>
              <div className="col-md-3">Subtotal</div>
            </div>

            {detallesConInfo.map((item, index) => (
              <div key={index} className="row align-items-center mb-2">
                <div className="col-md-4">
                  <input
                    className="form-control form-control-sm"
                    value={item.NombreProducto || ""}
                    disabled
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control form-control-sm"
                    value={item.Cantidad ?? ""}
                    disabled
                  />
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control form-control-sm"
                    value={`$${(item.Precio ?? 0).toLocaleString("es-CO")}`}
                    disabled
                  />
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control form-control-sm"
                    value={`$${(item.Subtotal ?? 0).toLocaleString("es-CO")}`}
                    disabled
                  />
                </div>
              </div>
            ))}
          </>
        ) : (
          <p>No hay detalles para este pedido.</p>
        )}
      </div>

      {/* Personalización y Dirección */}
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">🎨 Personalización</label>
          <textarea
            className="form-control"
            rows={2}
            value={pedido.Descripcion || ""}
            disabled
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">📍 Dirección del Cliente</label>
          <input className="form-control" value={clienteDireccion} disabled />
        </div>
      </div>

      {/* Comprobante si aplica */}
      {pedido.MetodoPago === "Transferencia" && pedido.ComprobantePago && (
        <div className="col-md-6 mb-4">
          <label className="form-label">📎 Comprobante de Pago</label>
          <input className="form-control" value={pedido.ComprobantePago} disabled />
        </div>
      )}

      {/* Totales */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="pastel-card text-center">
            <FaWallet size={18} className="mb-1 text-info" />
            <small className="d-block">Valor Inicial</small>
            <small>${(pedido.ValorInicial ?? 0).toLocaleString("es-CO")}</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="pastel-card text-center">
            <FaCoins size={18} className="mb-1 text-danger" />
            <small className="d-block">Valor Restante</small>
            <small>${(pedido.ValorRestante ?? 0).toLocaleString("es-CO")}</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="pastel-card text-center">
            <FaCalculator size={18} className="mb-1 text-primary" />
            <small className="d-block">Total</small>
            <small>${(pedido.TotalPedido ?? 0).toLocaleString("es-CO")}</small>
          </div>
        </div>
      </div>

      {/* Botón */}
      <div className="text-end">
        <button className="btn pastel-btn-secondary" onClick={onVolver}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default VerPedido;
