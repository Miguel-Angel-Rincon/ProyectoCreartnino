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
  const [detallesBackup, setDetallesBackup] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [detallesOriginales, setDetallesOriginales] = useState<detalleProduccion[]>([]);


  // 🔎 Estados para buscador de insumos en el modal
  const [insumoQuery, setInsumoQuery] = useState<{ [key: number]: string }>({});

  // 📝 Estado para rastrear detalles eliminados
  const [detallesEliminados, setDetallesEliminados] = useState<number[]>([]);

  // Función auxiliar para normalizar espacios
  const normalizarTexto = (valor: string) => {
    return valor.replace(/^\s+/, "").replace(/\s{2,}/g, " ");
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
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

      if (!respProd.ok) throw new Error("❌ Error obteniendo producción");
      if (!respFecha.ok) throw new Error("❌ Error obteniendo fecha del servidor");

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

      setProduccion(prod);

      const detallesFiltrados = (allDet as detalleProduccion[]).filter(
        (d: detalleProduccion) => d.IdProduccion === idProduccion
      );
      setDetalles(detallesFiltrados);
      setDetallesOriginales(JSON.parse(JSON.stringify(detallesFiltrados))); // 👈 LÍNEA AGREGADA

      setProductos(dataProdList || []);
      setInsumos(dataIns || []);
      setPedidos(dataPedidos || []);
      setClientes(dataClientes || []);

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

// Función para detectar si hubo cambios
const hayaCambiosEnDetalles = () => {
  if (detalles.length !== detallesBackup.length) return true;
  
  return detalles.some((det, idx) => {
    const backup = (detallesBackup as any[])[idx];
    return (
      det.IdInsumo !== backup?.IdInsumo ||
      det.CantidadInsumo !== backup?.CantidadInsumo
    );
  });
};

  const handleSave = async () => {
  if (!produccion) return;
  setGuardando(true);

  try {
    // 1️⃣ Actualizar datos básicos de la producción
    const resp = await fetch(`${APP_SETTINGS.apiUrl}Produccion/Actualizar/${produccion.IdProduccion}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produccion),
    });

    if (!resp.ok) throw new Error("No se pudo actualizar");

    // 2️⃣ Calcular cambios totales por insumo (agrupado)
    const cambiosPorInsumo: Record<number, number> = {};
    const cambiosPorProducto: Record<number, number> = {};

    // Crear un mapa de los detalles originales para comparación rápida
    const detallesOriginalesMap = new Map<number, detalleProduccion>();
    detallesOriginales.forEach(det => {
      if (det.IdDetalleProduccion) {
        detallesOriginalesMap.set(det.IdDetalleProduccion, det);
      }
    });

    // Procesar eliminaciones
    for (const idDetalle of detallesEliminados) {
      const detalleOriginal = detallesOriginalesMap.get(idDetalle);
      
      if (detalleOriginal) {
        const cantidadADevolver = detalleOriginal.CantidadInsumo || 0;
        const idInsumo = detalleOriginal.IdInsumo;

        if (idInsumo) {
          // Devolver al inventario (suma)
          cambiosPorInsumo[idInsumo] = (cambiosPorInsumo[idInsumo] || 0) + cantidadADevolver;
        }
      }

      await fetch(`${APP_SETTINGS.apiUrl}Detalles_Produccion/Eliminar/${idDetalle}`, {
        method: "DELETE",
      });
    }

    // Procesar actualizaciones y creaciones
    for (const detalle of detalles) {
      if (detalle.IdInsumo === 0) continue;

      const nuevoUso = detalle.CantidadInsumo || 0;

      if (detalle.IdDetalleProduccion) {
        // Es una actualización - comparar con el original
        const detalleOriginal = detallesOriginalesMap.get(detalle.IdDetalleProduccion);
        const cantidadAnterior = detalleOriginal?.CantidadInsumo ?? 0;
        const cantidadProducirAnterior = detalleOriginal?.CantidadProducir ?? 0;
const cantidadProducirNueva = detalle.CantidadProducir || 0;

        // Calcular diferencia: positivo = más uso (restar stock), negativo = menos uso (sumar stock)
        const diferenciaUso = nuevoUso - cantidadAnterior;

        if (diferenciaUso !== 0) {
          // Restar del inventario si aumentó el uso, sumar si disminuyó
          cambiosPorInsumo[detalle.IdInsumo] = (cambiosPorInsumo[detalle.IdInsumo] || 0) - diferenciaUso;
        }

        // Calcular cambios en cantidad a producir
const diferenciaProducir = cantidadProducirNueva - cantidadProducirAnterior;
if (diferenciaProducir !== 0 && !cambiosPorProducto[detalle.IdProducto]) {
  cambiosPorProducto[detalle.IdProducto] = diferenciaProducir;
}

        // Actualizar el detalle
        await fetch(`${APP_SETTINGS.apiUrl}Detalles_Produccion/Actualizar/${detalle.IdDetalleProduccion}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detalle),
        });
      } else {
        // Es un nuevo detalle - restar todo del inventario
        cambiosPorInsumo[detalle.IdInsumo] = (cambiosPorInsumo[detalle.IdInsumo] || 0) - nuevoUso;
        // Para nuevos detalles, sumar a productos
const cantidadProducir = detalle.CantidadProducir || 0;
if (cantidadProducir > 0 && !cambiosPorProducto[detalle.IdProducto]) {
  cambiosPorProducto[detalle.IdProducto] = cantidadProducir;
}

        // Crear el detalle
        await fetch(`${APP_SETTINGS.apiUrl}Detalles_Produccion/Crear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detalle),
        });
      }
    }

    // 3️⃣ Aplicar todos los cambios de stock agrupados
    for (const [idInsumoStr, cambioTotal] of Object.entries(cambiosPorInsumo)) {
      if (cambioTotal === 0) continue;

      const idInsumo = Number(idInsumoStr);
      const respInsumo = await fetch(`${APP_SETTINGS.apiUrl}Insumos/Obtener/${idInsumo}`);
      
      if (respInsumo.ok) {
        const insumoActual = await respInsumo.json();
        const nuevoStock = insumoActual.Cantidad + cambioTotal;

        if (nuevoStock < 0) {
          Swal.fire(
            "⚠️ Stock insuficiente",
            `El insumo "${insumoActual.Nombre}" no tiene suficiente stock. Disponible: ${insumoActual.Cantidad}, Se necesita: ${Math.abs(cambioTotal)}`,
            "warning"
          );
          setGuardando(false);
          return;
        }

        const insumoActualizado: IInsumos = {
          ...insumoActual,
          Cantidad: nuevoStock,
        };

        await fetch(`${APP_SETTINGS.apiUrl}Insumos/Actualizar/${idInsumo}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(insumoActualizado),
        });
      }
    }
    // 4️⃣ Aplicar cambios de stock en productos
for (const [idProductoStr, cambioTotal] of Object.entries(cambiosPorProducto)) {
  if (cambioTotal === 0) continue;

  const idProducto = Number(idProductoStr);
  const respProducto = await fetch(`${APP_SETTINGS.apiUrl}Productos/Obtener/${idProducto}`);
  
  if (respProducto.ok) {
    const productoActual = await respProducto.json();
    const nuevoStockProducto = productoActual.Cantidad + cambioTotal;

    const productoActualizado: IProductos = {
      ...productoActual,
      Cantidad: nuevoStockProducto,
    };

    await fetch(`${APP_SETTINGS.apiUrl}Productos/Actualizar/${idProducto}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productoActualizado),
    });
  }
}
    Swal.fire("Éxito", "Producción actualizada correctamente.", "success");
    onEdit(produccion);
    onClose();
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "No se pudo editar la producción.", "error");
  } finally {
    setGuardando(false);
  }
};
  const detallesAgrupados = detalles.reduce((acc, det) => {
  const key = det.IdProducto;
  if (!acc[key]) {
    // Buscar la CantidadProducir correcta desde detallesOriginales
    const detalleOriginalProducto = detallesOriginales.find(
      d => d.IdProducto === det.IdProducto && d.CantidadProducir > 0
    );
    
    // Si no se encuentra en originales, buscar en los detalles actuales
    const cantidadCorrecta = detalleOriginalProducto?.CantidadProducir || 
                            detalles.find(d => d.IdProducto === det.IdProducto && d.CantidadProducir > 0)?.CantidadProducir || 
                            det.CantidadProducir;
    
    acc[key] = { ...det, CantidadProducir: cantidadCorrecta };
  }
  return acc;
}, {} as Record<number, detalleProduccion>);

const detallesFinales = Object.values(detallesAgrupados);

  const handleChangeCantidadInsumo = (
  idProducto: number,
  idInsumo: number,
  nuevaCantidad: number
) => {
  setDetalles((prevDetalles) =>
    prevDetalles.map((det) => {
      if (det.IdProducto === idProducto && det.IdInsumo === idInsumo) {
        const insumoActual = insumos.find((ins) => ins.IdInsumo === idInsumo);
        
        // Buscar la cantidad original desde detallesOriginales
        const detalleOriginal = detallesOriginales.find(
          (detOrig) => detOrig.IdDetalleProduccion === det.IdDetalleProduccion
        );
        const cantidadOriginal = detalleOriginal?.CantidadInsumo ?? 0;
        const cantidadActualDetalle = det.CantidadInsumo ?? 0;

        // Calcular cuánto hemos liberado/usado respecto al original
        const diferenciaActual = cantidadActualDetalle - cantidadOriginal;
        
        // Stock virtual = stock real en inventario - lo que hemos usado extra (o + lo que hemos liberado)
        const disponibleInventario = insumoActual?.Cantidad ?? 0;
        const stockVirtual = disponibleInventario - diferenciaActual;

        // El máximo permitido es el stock virtual + la cantidad actual del detalle
        // Esto permite volver al valor original sin problemas
        const maximoPermitido = stockVirtual + cantidadActualDetalle;

        if (nuevaCantidad > maximoPermitido) {
          Swal.fire(
            "⚠️ Stock insuficiente",
            `El máximo disponible para "${insumoActual?.Nombre || 'este insumo'}" es ${maximoPermitido}.`,
            "warning"
          );
          return det;
        }
        
        return { ...det, CantidadInsumo: nuevaCantidad };
      }
      return det;
    })
  );
};
// Función para cambiar la cantidad a producir (solo para producción directa)
const handleChangeCantidadProducir = (idProducto: number, nuevaCantidad: number) => {
  if (produccion?.TipoProduccion !== "Directa") return;

  // Actualizar TODOS los detalles de ese producto con la nueva cantidad
  setDetalles((prevDetalles) =>
    prevDetalles.map((det) => {
      if (det.IdProducto === idProducto) {
        return { ...det, CantidadProducir: nuevaCantidad };
      }
      return det;
    })
  );
};
  // 🆕 Agregar nuevo insumo al producto
const agregarInsumo = (idProducto: number) => {
  setDetalles((prev) => {
    // Buscar la CantidadProducir correcta para este producto
    const detalleExistente = prev.find(d => d.IdProducto === idProducto);
    const detalleOriginal = detallesOriginales.find(d => d.IdProducto === idProducto && d.CantidadProducir > 0);
    
    // Prioridad: 1) detalle existente con cantidad > 0, 2) detalle original, 3) valor por defecto
    const cantidadProducir = (detalleExistente && detalleExistente.CantidadProducir > 0) 
      ? detalleExistente.CantidadProducir 
      : (detalleOriginal?.CantidadProducir || 0);

    const nuevoDetalle: detalleProduccion = {
      IdProduccion: idProduccion,
      IdProducto: idProducto,
      IdInsumo: 0,
      CantidadProducir: cantidadProducir, // 👈 USAR LA CANTIDAD CORRECTA
      CantidadInsumo: 1,
      IdPedido: produccion?.IdPedido || null,
    };

    const nuevosDetalles = [...prev, nuevoDetalle];
    
    const insumosDelProducto = nuevosDetalles.filter(d => d.IdProducto === idProducto);
    setInsumoQuery((prevQuery) => ({
      ...prevQuery,
      [insumosDelProducto.length - 1]: ""
    }));

    return nuevosDetalles;
  });
};

  // 🆕 Manejar cambio en el buscador de insumos
  const handleInsumoQueryChange = (index: number, value: string) => {
    const valorNormalizado = normalizarTexto(value);
    setInsumoQuery((prev) => ({
      ...prev,
      [index]: valorNormalizado
    }));
  };

  // 🆕 Seleccionar insumo de las sugerencias
  const seleccionarInsumo = (index: number, insumo: IInsumos, idProducto: number) => {
    setDetalles((prev) => {
      const copia = [...prev];
      const detallesProducto = copia.filter(d => d.IdProducto === idProducto);
      
      if (detallesProducto[index]) {
        const idx = copia.findIndex((d) => 
          d.IdProducto === idProducto && 
          detallesProducto.indexOf(d) === index
        );
        
        if (idx !== -1) {
          copia[idx] = {
            ...copia[idx],
            IdInsumo: insumo.IdInsumo,
            CantidadInsumo: 1
          };
        }
      }
      
      return copia;
    });

    setInsumoQuery((prev) => ({
      ...prev,
      [index]: ""
    }));
  };

  // 🆕 Eliminar insumo (marca para eliminación si tiene ID)
  const eliminarInsumo = (idDetalleProduccion: number | undefined, idProducto: number, idInsumo: number) => {
    // Si tiene ID, marcarlo para eliminación posterior
    if (idDetalleProduccion) {
      setDetallesEliminados(prev => [...prev, idDetalleProduccion]);
    }

    // Remover del estado local
    setDetalles((prev) => 
      prev.filter(d => 
        !(d.IdProducto === idProducto && d.IdInsumo === idInsumo)
      )
    );
  };

  if (!produccion) return <p>Cargando...</p>;

  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">✏️ Editar Producción</h2>

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
      value={(() => {
        // Obtener el IdPedido desde los detalles (no desde produccion directamente)
        const idPedidoReal = detalles.length > 0 ? detalles[0].IdPedido : null;
        
        if (!idPedidoReal) {
          return "No se encontró información del pedido";
        }
        
        // Buscar el pedido
        const pedido = pedidos.find((p) => p.IdPedido === idPedidoReal);
        
        if (!pedido) {
          return `Pedido #${idPedidoReal} - No encontrado`;
        }
        
        // Buscar el cliente
        const cliente = clientes.find((c) => c.IdCliente === pedido.IdCliente);
        
        if (!cliente) {
          return `Pedido #${idPedidoReal} - Cliente no encontrado`;
        }
        
        // Construir el texto completo
        const nombreCliente = cliente.NombreCompleto || "Sin nombre";
        const documento = cliente.NumDocumento || "Sin documento";
        
        return `Pedido #${idPedidoReal} - ${nombreCliente} (Doc: ${documento})`;
      })()}
      disabled
    />
  </div>
)}

        <div className="col-md-6">
          <label className="form-label">📅 Fecha de Inicio *</label>
          <input
            type="date"
            className="form-control"
            value={produccion.FechaInicio ?? ""}
            min={fechaServidor}
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

                if (produccion.FechaFinal && new Date(produccion.FechaFinal) < new Date(nuevaFecha)) {
                  setProduccion({ ...produccion, FechaInicio: nuevaFecha, FechaFinal: nuevaFecha });
                }
              }
            }}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">📦 Fecha de Finalización *</label>
          <input
            type="date"
            className="form-control"
            value={produccion.FechaFinal ?? ""}
            min={produccion.FechaInicio ?? fechaServidor}
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

      <div className="mt-4">
        <h5 className="mb-2">📦 Detalle de la Producción</h5>
  <div className="row fw-bold text-secondary mb-2">
    <div className="col-md-5">Producto</div>
    <div className="col-md-4">Cantidad</div>
    <div className="col-md-3">Acciones</div>
  </div>

  {detallesFinales.map((d, index) => {
    const prod = productos.find((p) => p.IdProducto === d.IdProducto);
    const esProduccionDirecta = produccion?.TipoProduccion === "Directa";

    return (
      <div key={index} className="row align-items-center mb-2">
        <div className="col-md-5">
          <input type="text" className="form-control" value={prod?.Nombre ?? ""} disabled />
        </div>
       <div className="col-md-4">
  <input 
    type="number" 
    className="form-control" 
    value={(() => {
      // Buscar la cantidad actual en detalles (no en detallesFinales)
      const detalleActual = detalles.find(det => det.IdProducto === d.IdProducto);
      return detalleActual?.CantidadProducir ?? 0;
    })()}
    disabled={!esProduccionDirecta}
    min={1}
    onChange={(e) => {
      const valor = parseInt(e.target.value);
      if (isNaN(valor) || valor < 1) {
        Swal.fire({
          icon: "warning",
          title: "Cantidad inválida",
          text: "La cantidad mínima a producir es 1.",
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }
      handleChangeCantidadProducir(d.IdProducto, valor);
    }}
  />
</div>
        <div className="col-md-3 d-flex gap-2">
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={() => {
              setDetallesBackup(JSON.parse(JSON.stringify(detalles)));
              setMostrarSubmodal(index);
            }}
          >
            Insumos agregados🧪
          </button>
        </div>

              {/* 🌸 MODAL DE GASTO DE INSUMOS */}
              {mostrarSubmodal === index && (
                <div
                  className="modal-overlay"
                  onClick={() => {
                    setDetalles(JSON.parse(JSON.stringify(detallesBackup)));
                    setMostrarSubmodal(null);
                  }}
                >
                  <div
                    className="modal-box-pastel"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modal-header-pastel">
                      <h5>🧪 Insumos agregados</h5>
                      <button
                        className="close-btn"
                        onClick={() => {
                          const insumosDelProducto = detalles.filter(
                            (det) => det.IdProducto === d.IdProducto
                          );

                          if (insumosDelProducto.length === 0) {
                            Swal.fire({
                              icon: "warning",
                              title: "No puedes salir",
                              text: "Debes tener al menos un insumo registrado.",
                              timer: 1800,
                              showConfirmButton: false,
                            });
                            return;
                          }

                          setDetalles(JSON.parse(JSON.stringify(detallesBackup)));
                          setMostrarSubmodal(null);
                        }}
                      >
                        ✖
                      </button>
                    </div>

                    <div className="modal-body">
                      {(() => {
                        const insumosDelProducto = detalles.filter(
                          (det) => det.IdProducto === d.IdProducto
                        );

                        return insumosDelProducto.length > 0 ? (
                          <>
                            {insumosDelProducto.map((detalle, i) => {
                              const insumo = insumos.find((ins) => ins.IdInsumo === detalle.IdInsumo);
                              const esNuevo = detalle.IdInsumo === 0;

                              const qI = insumoQuery[i] ?? "";
                              const sugerenciasIns =
                                qI.length > 0
                                  ? insumos.filter((ins) =>
                                      ins.Nombre.toLowerCase().includes(qI.toLowerCase()) &&
                                      !insumosDelProducto.some(
                                        (iSel, ii) => iSel.IdInsumo === ins.IdInsumo && ii !== i
                                      )
                                    )
                                  : [];

                              // Calcular stock disponible considerando uso en TODA la producción
                              // Calcular stock disponible considerando uso en TODA la producción
const detalleOriginalReal = detallesOriginales.find(
  (det: any) => det.IdDetalleProduccion === detalle.IdDetalleProduccion
);
const cantidadOriginalReal = detalleOriginalReal?.CantidadInsumo ?? 0;

const disponible = insumo?.Cantidad ?? 0;
const cantidadUsada = detalle.CantidadInsumo ?? 0;

// Para detalles existentes: disponible + lo que tenía originalmente
// Para detalles nuevos: solo el disponible
const maximoPermitido = detalle.IdDetalleProduccion 
  ? disponible + cantidadOriginalReal
  : disponible;

                              return (
                                <div key={i} className="row align-items-center mb-3 position-relative">
                                  <div className="col-md-5 position-relative">
                                    <input
                                      type="text"
                                      className="pastel-input w-100"
                                      placeholder="Buscar insumo..."
                                      value={qI !== "" ? qI : (insumo?.Nombre || "")}
                                      onChange={(e) => {
                                        let valor = e.target.value.trimStart().replace(/\s{2,}/g, " ");
                                        if (/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/.test(valor)) {
                                          Swal.fire({
                                            icon: "warning",
                                            title: "Caracter inválido",
                                            text: "Solo se permiten letras, números y espacios.",
                                            timer: 1500,
                                            showConfirmButton: false,
                                          });
                                          valor = valor.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");
                                        }
                                        if (/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])\1{3,}/.test(valor)) {
                                          Swal.fire({
                                            icon: "warning",
                                            title: "Repetición excesiva",
                                            text: "No repitas el mismo carácter más de 3 veces consecutivas.",
                                            timer: 1500,
                                            showConfirmButton: false,
                                          });
                                          valor = valor.replace(/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])\1{3,}/g, "$1$1$1");
                                        }
                                        handleInsumoQueryChange(i, valor);
                                      }}
                                      disabled={!esNuevo}
                                    />
                                    {qI && sugerenciasIns.length > 0 && esNuevo && (
                                      <ul
                                        className="list-group position-absolute w-100"
                                        style={{ zIndex: 1200, top: "38px" }}
                                      >
                                        {sugerenciasIns.map((ins) => (
                                          <li
                                            key={ins.IdInsumo}
                                            className="list-group-item list-group-item-action"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => seleccionarInsumo(i, ins, d.IdProducto)}
                                          >
                                            {ins.Nombre} - Disponible: {ins.Cantidad}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>

                                  <div className="col-md-4">
                                    <input
                                      type="number"
                                      className="pastel-input w-100"
                                      value={cantidadUsada}
                                      min={1}
                                      max={maximoPermitido}
                                      onChange={(e) => {
                                        const valor = parseFloat(e.target.value) || 0;
                                        if (valor < 1) {
                                          Swal.fire({
                                            icon: "warning",
                                            title: "Cantidad inválida",
                                            text: "La cantidad mínima es 1.",
                                            timer: 1500,
                                            showConfirmButton: false,
                                          });
                                          return;
                                        }

                                        if (valor > maximoPermitido) {
                                          Swal.fire(
                                            "⚠️ Stock insuficiente",
                                            `El máximo disponible para "${insumo?.Nombre || 'este insumo'}" es ${maximoPermitido}.`,
                                            "warning"
                                          );
                                          return;
                                        }

                                        handleChangeCantidadInsumo(d.IdProducto, detalle.IdInsumo, valor);
                                      }}
                                      disabled={esNuevo}
                                    />
                                  </div>
                                  <div className="col-md-1 text-end">
                                    {detalles.filter(det => det.IdProducto === d.IdProducto).length > 1 && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        style={{ color: "white", filter: "brightness(1.1)" }}
                                        onClick={() => {
                                          if (esNuevo) {
                                            setDetalles((prev) =>
                                              prev.filter(
                                                (_, idx) =>
                                                  !(
                                                    prev[idx].IdProducto === d.IdProducto &&
                                                    prev
                                                      .filter((p) => p.IdProducto === d.IdProducto)
                                                      .indexOf(prev[idx]) === i
                                                  )
                                              )
                                            );
                                          } else {
                                            eliminarInsumo(detalle.IdDetalleProduccion, d.IdProducto, detalle.IdInsumo);
                                          }
                                        }}
                                      >
                                        <span style={{ color: "white", fontWeight: "bold" }}>X</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            <div className="mt-3">
                              <h6 className="text-secondary fw-semibold mb-2">Resumen de Insumos:</h6>
                              <ul className="mb-0 ps-3">
                                {insumosDelProducto
                                  .filter(det => det.IdInsumo > 0)
                                  .map((detalle, i) => {
                                  const insumo = insumos.find((ins) => ins.IdInsumo === detalle.IdInsumo);
                                  if (!insumo) return null;

                                  const disponibleReal = insumo?.Cantidad ?? 0;

                                  return (
                                    <li key={i}>
                                      {insumo.Nombre}: Usado {detalle.CantidadInsumo} / disponible en inventario {disponibleReal}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </>
                        ) : (
                          <p className="text-muted">Sin insumos registrados.</p>
                        );
                      })()}

                      <div className="text-end mt-4 d-flex justify-content-end align-items-center gap-2">
                        <button
                          type="button"
                          className="btn pastel-btn-guardar"
                          onClick={(e) => {
                            e.stopPropagation();
                            agregarInsumo(d.IdProducto);
                          }}
                        >
                          + Agregar Insumo
                        </button>

                        <button
  type="button"
  className={hayaCambiosEnDetalles() ? "pastel-btn-cerrar" : "pastel-btn-cerrar"}
  onClick={() => {
    const insumosDelProducto = detalles.filter(det => det.IdProducto === d.IdProducto);
    const hayInsumosSinSeleccionar = insumosDelProducto.some(det => det.IdInsumo === 0);
    
    // Si hay cambios, validar antes de guardar
    if (hayaCambiosEnDetalles()) {
      if (hayInsumosSinSeleccionar) {
        Swal.fire({
          icon: "warning",
          title: "Insumos incompletos",
          text: "Debes seleccionar todos los insumos antes de guardar.",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }

      setDetallesBackup(JSON.parse(JSON.stringify(detalles)));
      setMostrarSubmodal(null);
      
      Swal.fire({
        icon: "success",
        title: "Cambios guardados",
        text: "Los cambios se aplicarán al actualizar la producción.",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      // Si no hay cambios, simplemente cerrar
      setMostrarSubmodal(null);
    }
  }}
>
  {hayaCambiosEnDetalles() ? "💾 Guardar" : "Cerrar"}
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
        <button
          className="btn pastel-btn-primary"
          onClick={handleSave}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
};

export default EditarProduccion;