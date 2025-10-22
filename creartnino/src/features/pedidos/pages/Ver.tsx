import React, { useEffect, useState } from "react";
import { FaCalculator, FaWallet, FaCoins } from "react-icons/fa";
import "../styles/acciones.css";
import type { IPedido, detallePedido } from "../../interfaces/IPedidos";
import type { IClientes } from "../../interfaces/IClientes";
import type { IProductos } from "../../interfaces/IProductos";
import Swal from "sweetalert2";
import { APP_SETTINGS } from "../../../settings/appsettings";

interface VerPedidoProps {
  pedido: IPedido;
  onVolver: (actualizado?: boolean) => void;
}

// 🔧 Helpers
const formatISO = (d: Date) => d.toISOString().split("T")[0];

// 🔁 Saltar domingos
const siguienteNoDomingo = (fecha: Date) => {
  const f = new Date(fecha);
  while (f.getDay() === 0) f.setDate(f.getDate() + 1);
  return f;
};

// 📅 Sumar días hábiles (sin domingos)
const sumarDiasHabiles = (fechaStr: string, diasHabiles: number) => {
  if (!fechaStr) return ""; // Evita error si la fecha está vacía
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return ""; // También previene "Invalid time value"
  let sumados = 0;
  while (sumados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    if (fecha.getDay() !== 0) sumados++;
  }
  return fecha.toISOString().split("T")[0];
};


const VerPedido: React.FC<VerPedidoProps> = ({ pedido, onVolver }) => {
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteDireccion, setClienteDireccion] = useState("");
  const [clienteDocumento, setClienteDocumento] = useState("");
  const [detallesConInfo, setDetallesConInfo] = useState<
    (detallePedido & { NombreProducto?: string; Precio?: number; Subtotal?: number })[]
  >([]);
  const [valorAdicional, setValorAdicional] = useState(0);
const [mostrarAdicional, setMostrarAdicional] = useState(false);
const [_adicionalAplicado, setAdicionalAplicado] = useState(false);

  const [fechaServidor, setFechaServidor] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [fechaModificada, setFechaModificada] = useState(false);

  // 🕒 Obtener fecha del servidor
  useEffect(() => {
    const fetchFechaServidor = async () => {
      try {
        const res = await fetch(`${APP_SETTINGS.apiUrl}Utilidades/FechaServidor`);
        if (!res.ok) throw new Error("Error obteniendo fecha servidor");
        const data = await res.json();
        const fechaSrv = new Date(data.FechaServidor).toISOString().split("T")[0];
        setFechaServidor(fechaSrv);
        setFechaEntrega(pedido.FechaEntrega ? pedido.FechaEntrega.split("T")[0] : fechaSrv);
      } catch {
        const local = new Date().toISOString().split("T")[0];
        setFechaServidor(local);
        setFechaEntrega(local);
      }
    };
    fetchFechaServidor();
  }, [pedido]);

  // 🧾 Cargar cliente, productos y detalles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const rClientes = await fetch(`${APP_SETTINGS.apiUrl}Clientes/Lista`);
        const clientes: IClientes[] = await rClientes.json();
        const cliente = clientes.find((c) => c.IdCliente === pedido.IdCliente);
        if (cliente) {
          setClienteNombre(cliente.NombreCompleto);
          setClienteDireccion(cliente.Direccion);
          setClienteDocumento(cliente.NumDocumento);
        }

        const rProductos = await fetch(`${APP_SETTINGS.apiUrl}Productos/Lista`);
        const productos: IProductos[] = await rProductos.json();

        const rDetalles = await fetch(`${APP_SETTINGS.apiUrl}Detalles_Pedido/Lista`);
        const detalles: detallePedido[] = await rDetalles.json();
        const detallesPedido = detalles.filter((d) => d.IdPedido === pedido.IdPedido);

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
        console.error("Error cargando datos", err);
      }
    };

    fetchData();
  }, [pedido]);

  // ✅ Actualizar fecha en API
  // ✅ Solo mostrar botones si el estado permite cambios
const puedeEditarAdicional =
  pedido.IdEstado === 1 || pedido.IdEstado === 2; // Primer pago o En Proceso
  


  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">Detalles del Pedido # {pedido.IdPedido}</h2>

      {/* Cliente y Fechas */}
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

        {/* 📦 Fecha entrega editable con validaciones */}
        <div className="col-md-3">
          <label className="form-label">
            📦 Fecha de Entrega <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className="form-control"
            value={fechaEntrega}
            min={sumarDiasHabiles(fechaServidor, 3)}
            onChange={(e) => {
              const valor = e.target.value;
              if (!valor) return;

              const fechaSeleccionada = new Date(valor + "T00:00:00");
              const minStr = sumarDiasHabiles(fechaServidor, 3);
              const minDate = new Date(minStr + "T00:00:00");

              if (fechaSeleccionada < minDate) {
                Swal.fire({
                  icon: "warning",
                  title: "Fecha inválida",
                  text: `Debe ser al menos ${minStr}.`,
                  timer: 2000,
                  showConfirmButton: false,
                });
                setFechaEntrega(minStr);
                return;
              }

              if (fechaSeleccionada.getDay() === 0) {
                const corregida = siguienteNoDomingo(fechaSeleccionada);
                const corregidaIso = formatISO(corregida);
                Swal.fire({
                  icon: "warning",
                  title: "Domingo no permitido",
                  text: `Se cambió automáticamente al ${corregidaIso}.`,
                  timer: 3000,
                  showConfirmButton: false,
                });
                setFechaEntrega(corregidaIso);
                setFechaModificada(true);
                return;
              }

              setFechaEntrega(valor);
              setFechaModificada(true);
            }}
            onKeyDown={(e) => {
              const allowed = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
              if (!allowed.includes(e.key) && !/[\d-]/.test(e.key)) e.preventDefault();
            }}
            required
          />
        </div>
      </div>

      {/* Cliente adicional */}
      <div className="row mb-3">
        <div className="col-md-3">
          <label className="form-label">🪪 Documento del Cliente</label>
          <input className="form-control" value={clienteDocumento} disabled />
        </div>
        <div className="col-md-3">
          <label className="form-label">📍 Dirección del Cliente</label>
          <input className="form-control" value={clienteDireccion} disabled />
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
      {/* Descripción del pedido */}
<div className="row mb-4">
  <div className="col-md-12">
    <label className="form-label">🎨 Personalización</label>
    <textarea
      className="form-control"
      value={pedido.Descripcion || "Sin Personalización"}
      disabled
      rows={3}
      style={{ resize: "none" }}
    />
  </div>
</div>

{/* 💰 Adicional solo si el pedido viene de la web o la app móvil */}
{(pedido.Descripcion?.includes("Este pedido fue realizado desde la web.") ||
  pedido.Descripcion?.includes("Este pedido fue realizado desde la app móvil.")) &&
  puedeEditarAdicional && (

  <>
    {/* 🔍 Calcular si el total ya está modificado */}
    {(() => {
      const totalOriginal =
        (pedido.ValorInicial || 0) + (pedido.ValorRestante || 0);
      const esOriginal = pedido.TotalPedido === totalOriginal;

      return (
        <>
          {!mostrarAdicional && esOriginal ? (
            <div className="text-start mb-4 d-flex gap-2">
              {/* ➕ Añadir adicional */}
              <button
                className="btn pastel-btn-primary"
                onClick={() => {
                  setMostrarAdicional(true);
                  setValorAdicional(1000);
                }}
              >
                ➕ Añadir adicional
              </button>
            </div>
          ) : null}

          {/* 💰 Campo valor adicional */}
          {mostrarAdicional && esOriginal && (
            <div className="row mb-4 align-items-end">
              <div className="col-md-3 col-sm-6">
          <label className="form-label">💰 Valor adicional</label>
          <input
            type="text"
            className="form-control form-control-sm text-start"
            style={{ maxWidth: "300px" }}
            value={valorAdicional.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0,
            })}
            onChange={(e) => {
              const soloNumeros = e.target.value.replace(/[^\d]/g, "");
              const numero = Number(soloNumeros);
              if (isNaN(numero)) return;
              if (numero > 1000000) return;
              setValorAdicional(numero);
            }}
            onFocus={(e) => {
              e.target.value = valorAdicional ? valorAdicional.toString() : "";
            }}
            onBlur={(e) => {
  // 🧹 Eliminar todo excepto dígitos
  const soloNumeros = e.target.value.replace(/[^\d]/g, "");
  let valor = Number(soloNumeros);

  if (isNaN(valor) || valor < 1000) {
    Swal.fire({
      icon: "warning",
      title: "Valor mínimo permitido",
      text: "El valor no puede ser menor a $1.000 COP.",
      timer: 2000,
      showConfirmButton: false,
    });
    valor = 1000;
  }

  setValorAdicional(valor);
  e.target.value = valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  });
}}

            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setValorAdicional((prev) => Math.min(prev + 50, 1000000));
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setValorAdicional((prev) => Math.max(prev - 50, 1000));
              }
              if (
                !/[0-9]/.test(e.key) &&
                !["Backspace", "ArrowUp", "ArrowDown", "Tab", "Delete"].includes(e.key)
              ) {
                e.preventDefault();
              }
            }}
          />
        </div>

              {/* ❌ Botón cancelar */}
              <div className="col-md-2 d-flex align-items-end">
                <button
                  className="btn pastel-btn-secondary w-100"
                  onClick={() => {
                    setMostrarAdicional(false);
                    setValorAdicional(0);
                  }}
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          )}

          {/* ↩️ Botón Revertir solo si el total ha cambiado */}
          {!esOriginal && (
            <div className="text-start mb-4">
              <button
                className="btn pastel-btn-secondary"
                onClick={async () => {
                  const precioOriginal =
                    (pedido.ValorInicial || 0) + (pedido.ValorRestante || 0);

                  const confirm = await Swal.fire({
                    title: "¿Revertir a precio original?",
                    text: `El total volverá a ${precioOriginal.toLocaleString(
                      "es-CO",
                      {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                      }
                    )}.`,
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Sí, revertir",
                    cancelButtonText: "Cancelar",
                    confirmButtonColor: "#f073c8",
                    cancelButtonColor: "#aaa",
                  });

                  if (!confirm.isConfirmed) return;

                  try {
                    const payload = {
                      ...pedido,
                      TotalPedido: precioOriginal,
                    };
                    const res = await fetch(
                      `${APP_SETTINGS.apiUrl}Pedidos/Actualizar/${pedido.IdPedido}`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      }
                    );

                    if (!res.ok) throw new Error(await res.text());

                    Swal.fire({
                      icon: "success",
                      title: "Revertido correctamente",
                      text: `El pedido volvió al precio original de ${precioOriginal.toLocaleString(
                        "es-CO",
                        {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        }
                      )}.`,
                      timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false, 
                    });

                    setMostrarAdicional(false);
                    setValorAdicional(0);

                    setTimeout(() => onVolver(true), 1500);
                  } catch (err) {
                    Swal.fire({
                      icon: "error",
                      title: "Error al revertir",
                      text: "No se pudo actualizar el pedido.",
                    });
                  }
                }}
              >
                ↩️ Revertir a precio original
              </button>
            </div>
          )}
        </>
      );
    })()}
  </>
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
      {/* 💸 Mostrar excedente solo si el total cambió */}
{pedido.TotalPedido !== (pedido.ValorInicial ?? 0) + (pedido.ValorRestante ?? 0) && (
  <div className="row mb-4">
    <div className="col-md-6">
      <div className="pastel-card text-center">
        <FaCoins size={18} className="mb-1 text-success" />
        <small className="d-block">Excedente</small>
        <small>
          {(
            (pedido.TotalPedido ?? 0) -
            ((pedido.ValorInicial ?? 0) + (pedido.ValorRestante ?? 0))
          ).toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
          })}
        </small>
      </div>
    </div>

    <div className="col-md-6">
      <div className="pastel-card text-center">
        <FaWallet size={18} className="mb-1 text-warning" />
        <small className="d-block">Nuevo Valor Restante</small>
        <small>
          {(
            (pedido.ValorRestante ?? 0) +
            ((pedido.TotalPedido ?? 0) -
              ((pedido.ValorInicial ?? 0) + (pedido.ValorRestante ?? 0)))
          ).toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
          })}
        </small>
      </div>
    </div>
  </div>
)}

      <div className="text-end">
  {(fechaModificada || valorAdicional > 0) && (
    <button
      className="btn pastel-btn-primary me-2"
      onClick={async () => {
        try {
          // ⚠️ Confirmación antes de aplicar adicional
          if (valorAdicional > 0) {
            const confirm = await Swal.fire({
              title: "¿Seguro que deseas aplicar este valor adicional?",
              text: "Recuerda que una vez aplicado, no podrás volver al valor original.",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#87e5a9ff",
              cancelButtonColor: "rgba(227, 137, 179, 1)",
              confirmButtonText: "Sí, aplicar",
              cancelButtonText: "Cancelar",
            });

            if (!confirm.isConfirmed) return; // ⛔ Detiene si cancela
          }

          let nuevoTotal = pedido.TotalPedido ?? 0;
          let payload = { ...pedido };

          // 💰 Si hay valor adicional, actualiza el total
          if (valorAdicional > 0) {
            nuevoTotal += valorAdicional;
            payload.TotalPedido = nuevoTotal;
          }

          // 📅 Si cambió la fecha
          if (fechaModificada) {
            payload.FechaEntrega = fechaEntrega;
          }

          // 🔄 PUT al backend
          const res = await fetch(
            `${APP_SETTINGS.apiUrl}Pedidos/Actualizar/${pedido.IdPedido}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }
          );

          if (!res.ok) throw new Error(await res.text());

          // 🎉 Mensaje dinámico
          let mensaje = "";
          if (fechaModificada && valorAdicional > 0)
            mensaje = "Fecha y adicional actualizados correctamente.";
          else if (fechaModificada)
            mensaje = "Fecha de entrega actualizada correctamente.";
          else
            mensaje = "Valor adicional aplicado correctamente.";

          Swal.fire({
            icon: "success",
            title: "Éxito",
            text: mensaje,
            timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false, 
          });

          // 🔄 Refresca pantalla
          setAdicionalAplicado(true);
          setMostrarAdicional(false);
          setFechaModificada(false);
          setValorAdicional(0);
          setTimeout(() => onVolver(true), 1500);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudieron aplicar los cambios.",
          });
        }
      }}
    >
      {fechaModificada && valorAdicional > 0
        ? "💾 Actualizar fecha y aplicar adicional"
        : fechaModificada
        ? "💾 Actualizar fecha"
        : "💾 Aplicar adicional"}
    </button>
  )}

  <button
  className="btn pastel-btn-secondary"
  onClick={() => onVolver(true)} // 👈 ahora refresca siempre
>
  Cerrar
</button>

</div>

    </div>
  );
};

export default VerPedido;
