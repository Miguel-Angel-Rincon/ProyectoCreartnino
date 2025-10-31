import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { FaEye, FaEdit, FaBan } from "react-icons/fa";

// Estilos
import "../styles/style.css";

// APP SETTINGS
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { IPedido } from "../../interfaces/IPedidos";

// Componentes
import CrearProduccion from "./Crear";
import VerProduccionVista from "./Ver";
import EditarProduccionModal from "./Editar";

// Interfaces
import type { IProduccion, detalleProduccion } from "../../interfaces/IProduccion";
import type { IProductos } from "../../interfaces/IProductos";
import type { IInsumos } from "../../interfaces/IInsumos";

export interface IProduccionPedido {
  Produccion: IProduccion;
  Pedido?: IPedido | null;
}

/** Catálogo normalizado de estados */
type EstadoNorm = { id: number; nombre: string };

/* ============================
   FECHAS: parseo y formateo
   ============================ */
const parseDateFlexible = (valor: any): Date | null => {
  if (!valor) return null;
  if (valor instanceof Date) return isNaN(valor.getTime()) ? null : valor;

  const s = String(valor).trim();
  if (!s) return null;

  const mTicks = s.match(/\/Date\((\d+)\)\//);
  if (mTicks) {
    const ms = parseInt(mTicks[1], 10);
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  const mDMY = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (mDMY) {
    const [_, dd, mm, yyyy] = mDMY;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

const isFechaSentinela = (d: Date | null) => {
  if (!d) return true;
  const y = d.getFullYear();
  return y <= 1901;
};

const formatearFecha = (valor: any) => {
  const d = parseDateFlexible(valor);
  if (!d || isFechaSentinela(d)) return "—";
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" });
};

/* ============================
   COMPONENTE
   ============================ */
const ListarProduccion: React.FC = () => {
  const [producciones, setProducciones] = useState<IProduccion[]>([]);
  const [_detalles, setDetalles] = useState<detalleProduccion[]>([]);
  const [_productos, setProductos] = useState<IProductos[]>([]);
  const [_insumos, setInsumos] = useState<IInsumos[]>([]);
  const [pedidos, setPedidos] = useState<IPedido[]>([]);
  const [produccionesPedidos, setProduccionesPedidos] = useState<IProduccionPedido[]>([]);

  const [estadosProduccion, setEstadosProduccion] = useState<EstadoNorm[]>([]);
  const [estadosPedido, setEstadosPedido] = useState<EstadoNorm[]>([]);

  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarCrearVista, setMostrarCrearVista] = useState(false);
  const [vistaEditar, setVistaEditar] = useState<IProduccion | null>(null);
  const [produccionSeleccionada, setProduccionSeleccionada] = useState<IProduccion | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");

  const porPagina = 6;

  const api = (segment: string) =>
    `${APP_SETTINGS.apiUrl.replace(/\/?$/, "/")}${segment}`;

  const normalizarEstados = (raw: any[], idKeys: string[], nameKeys: string[]): EstadoNorm[] =>
    raw.map((r) => {
      const id = idKeys.reduce<number | undefined>((acc, k) => (acc ?? r[k]), undefined) ?? 0;
      const nombre = nameKeys.reduce<string | undefined>((acc, k) => (acc ?? r[k]), undefined) ?? "";
      return { id: Number(id), nombre: String(nombre).toLowerCase() };
    });

  const nombreEstadoProduccion = (id: number) =>
    estadosProduccion.find((e) => e.id === id)?.nombre ?? "";

  const idEstadoPorNombre = (nombre: string) => {
    const needle = nombre.trim().toLowerCase();
    if (needle.startsWith("anul"))
      return estadosProduccion.find((e) => e.nombre.includes("anul"))?.id;
    if (needle.startsWith("complet"))
      return estadosProduccion.find((e) => e.nombre.includes("complet"))?.id;
    if (needle.includes("proceso"))
      return estadosProduccion.find((e) => e.nombre.includes("proceso"))?.id;
    return estadosProduccion.find((e) => e.nombre.includes(needle))?.id;
  };

  const claseEstado = (idEstado: number) => {
    const n = nombreEstadoProduccion(idEstado);
    if (n.includes("proceso")) return "estado-produccion-en-proceso";
    if (n.includes("complet")) return "estado-produccion-completado";
    if (n.includes("anul")) return "estado-produccion-anulado";
    return "";
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);

        const [
          rProducciones,
          rDetalles,
          rProductos,
          rInsumos,
          rEstadosProd,
          rEstadosPedido,
          rPedidos
        ] = await Promise.all([
          fetch(api("Produccion/Lista")),
          fetch(api("Detalles_Produccion/Lista")),
          fetch(api("Productos/Lista")),
          fetch(api("Insumos/Lista")),
          fetch(api("Estados_Produccion/Lista")),
          fetch(api("Estados_Pedido/Lista")),
          fetch(api("Pedidos/Lista"))
        ]);

        const [
          dataProducciones,
          dataDetalles,
          dataProductos,
          dataInsumos,
          dataEstadosProd,
          dataEstadosPedido,
          dataPedidos,   
        ] = await Promise.all([
          rProducciones.json(),
          rDetalles.json(),
          rProductos.json(),
          rInsumos.json(),
          rEstadosProd.json(),
          rEstadosPedido.json(),
          rPedidos.json()
        ]);

        setProducciones(dataProducciones as IProduccion[]);
        setDetalles(dataDetalles as detalleProduccion[]);
        setProductos(dataProductos as IProductos[]);
        setInsumos(dataInsumos as IInsumos[]);
        setPedidos(dataPedidos as IPedido[]); 
        setEstadosProduccion(
          normalizarEstados(
            dataEstadosProd,
            ["IdEstado", "IdEstadoProduccion", "Id", "id"],
            ["Nombre", "Estado", "NombreEstado", "EstadoProduccion", "Descripcion", "descripcion"]
          )
        );
        setEstadosPedido(
          normalizarEstados(
            dataEstadosPedido,
            ["Id", "IdEstadoPedido", "IdEstado", "id"],
            ["Nombre", "Estado", "NombreEstado", "Descripcion", "descripcion"]
          )
        );
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "No se pudieron cargar los datos de producción.", "error");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  useEffect(() => {
    if (!producciones.length) return;

    const combinados: IProduccionPedido[] = producciones.map((p) => {
      const pedido = p.IdPedido
        ? pedidos.find((pd) => pd.IdPedido === p.IdPedido) || null
        : null;
      return { Produccion: p, Pedido: pedido };
    });

    setProduccionesPedidos(combinados);
  }, [producciones, pedidos]);

  const refreshProducciones = async () => {
    const r = await fetch(api("Produccion/Lista"));
    if (r.ok) {
      const data = (await r.json()) as IProduccion[];
      setProducciones(data);
    }
  };

  const refreshInsumos = async () => {
    try {
      const r = await fetch(api("Insumos/Lista"));
      if (r.ok) {
        const data = await r.json();
        setInsumos(data as IInsumos[]);
      }
    } catch (e) {
      console.warn("No se pudo refrescar insumos:", e);
    }
  };

  const refreshDetalles = async () => {
    try {
      const r = await fetch(api("Detalles_Produccion/Lista"));
      if (r.ok) {
        const data = await r.json();
        setDetalles(data as detalleProduccion[]);
      }
    } catch (e) {
      console.warn("No se pudo refrescar detalles:", e);
    }
  };

  const refreshPedidos = async () => {
    try {
      const resp = await fetch(`${APP_SETTINGS.apiUrl}Pedidos/Lista`);
      if (!resp.ok) throw new Error("Error al obtener pedidos");
      const data: IPedido[] = await resp.json();
      setPedidos(data);
    } catch (err) {
      console.error("No se pudieron refrescar los pedidos", err);
    }
  };

  const actualizarEstadoPedido = async (idPedido: number, nuevoEstado: number) => {
    try {
      const pedidoActualizado: IPedido = {
        IdPedido: idPedido,
        IdEstado: nuevoEstado,
      };

      const resp = await fetch(`${APP_SETTINGS.apiUrl}Pedidos/Actualizar/${idPedido}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoActualizado),
      });

      if (!resp.ok) throw new Error("No se pudo actualizar el pedido.");
      console.log(`✅ Pedido ${idPedido} actualizado a estado ${nuevoEstado}`);
    } catch (err) {
      console.error("❌ Error actualizando pedido:", err);
    }
  };

  const handleActualizarEstado = async (p: IProduccion, nuevoIdEstado: number) => {
    try {
      const actualizado: IProduccion = { ...p, IdEstado: nuevoIdEstado };

      const estadoNombre = nombreEstadoProduccion(nuevoIdEstado).toLowerCase();
      const esCompletado = estadoNombre.includes("complet");

      let pedidoId: number | null = null;
      try {
        const respDet = await fetch(api("Detalles_Produccion/Lista"));
        if (respDet.ok) {
          const detalles: detalleProduccion[] = await respDet.json();
          const detalleRelacionado = detalles.find(
            (d) => d.IdProduccion === p.IdProduccion && d.IdPedido
          );
          if (detalleRelacionado) pedidoId = detalleRelacionado.IdPedido ?? null;
        }
      } catch (err) {
        console.warn("⚠️ No se pudo obtener detalles de producción:", err);
      }

      if (pedidoId && esCompletado) {
        try {
          const pedidoResp = await fetch(api(`Pedidos/Obtener/${pedidoId}`));
          if (!pedidoResp.ok) throw new Error("No se pudo obtener el pedido");

          const pedido: IPedido = await pedidoResp.json();

          const pedidoActualizado: IPedido = {
            IdPedido: pedido.IdPedido,
            IdCliente: pedido.IdCliente,
            MetodoPago: pedido.MetodoPago,
            FechaPedido: pedido.FechaPedido,
            FechaEntrega: pedido.FechaEntrega,
            Descripcion: pedido.Descripcion,
            ValorInicial: pedido.ValorInicial,
            ValorRestante: pedido.ValorRestante,
            ComprobantePago: pedido.ComprobantePago,
            TotalPedido: pedido.TotalPedido,
            IdEstado:
              estadosPedido.find((e) =>
                e.nombre.toLowerCase().includes("En proceso de entrega")
              )?.id ?? 4,
          };

          console.log("📤 PUT Pedido ->", pedidoActualizado);

          const respPedido = await fetch(api(`Pedidos/Actualizar/${pedidoId}`), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pedidoActualizado),
          });

          if (!respPedido.ok) {
            const msg = await respPedido.text();
            console.error("❌ Error al actualizar pedido:", msg);
            throw new Error("Falló la actualización del pedido");
          }
        } catch (err) {
          console.warn("⚠️ No se pudo actualizar el pedido vinculado:", err);
        }
      }

      console.log("📤 PUT Producción ->", actualizado);

      const resp = await fetch(api(`Produccion/Actualizar/${p.IdProduccion}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actualizado),
      });

      if (!resp.ok) {
        const msg = await resp.text();
        console.error("❌ Error en Producción:", msg);
        throw new Error("Error al actualizar Producción");
      }

      await Promise.all([refreshProducciones(), refreshPedidos()]);
      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: `Estado actualizado correctamente`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false, 
      });
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo actualizar el estado.", "error");
    }
  };

  const handleAnularProduccion = (p: IProduccion) => {
    const idAnulado = idEstadoPorNombre("anul");
    if (!idAnulado) {
      Swal.fire("Atención", "No encontré el estado 'Anulada' en el catálogo.", "info");
      return;
    }
    if (p.IdEstado === idAnulado) return;

    Swal.fire({
      title: "¿Estás Seguro?",
      text: "Se marcará como 'Anulada', devolviendo insumos y restando productos creados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, Anular",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const rDet = await fetch(api("Detalles_Produccion/Lista"));
        if (!rDet.ok) throw new Error("No se pudieron obtener los detalles de producción.");
        const allDetalles: detalleProduccion[] = await rDet.json();
        const detallesProd = allDetalles.filter(d => d.IdProduccion === p.IdProduccion);

        const acumuladosInsumos: Record<number, number> = {};
        for (const d of detallesProd) {
          const qty = d.CantidadInsumo ?? d.CantidadProducir ?? 0;
          if (!d.IdInsumo) continue;
          acumuladosInsumos[d.IdInsumo] = (acumuladosInsumos[d.IdInsumo] || 0) + qty;
        }

        const rInsumos = await fetch(api("Insumos/Lista"));
        const insumosActuales: IInsumos[] = rInsumos.ok ? await rInsumos.json() : [];

        for (const [idStr, cantidadDevolver] of Object.entries(acumuladosInsumos)) {
          const idInsumo = Number(idStr);
          const ins = insumosActuales.find(i => i.IdInsumo === idInsumo);
          if (!ins) continue;

          const actualizado: IInsumos = { ...ins, Cantidad: (ins.Cantidad || 0) + cantidadDevolver };
          const rUpd = await fetch(api(`Insumos/Actualizar/${idInsumo}`), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(actualizado),
          });
          if (!rUpd.ok) {
            console.error("Error actualizando insumo", idInsumo, await rUpd.text());
          }
        }

        if (p.TipoProduccion?.toLowerCase() === "directa") {
          const rProd = await fetch(api("Productos/Lista"));
          const productos: IProductos[] = rProd.ok ? await rProd.json() : [];

          for (const d of detallesProd) {
            const producto = productos.find(pr => pr.IdProducto === d.IdProducto);
            if (!producto) continue;

            const actualizado: IProductos = {
              ...producto,
              Cantidad: Math.max(0, (producto.Cantidad || 0) - (d.CantidadProducir || 0)),
            };

            const rUpd = await fetch(api(`Productos/Actualizar/${producto.IdProducto}`), {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(actualizado),
            });
            if (!rUpd.ok) {
              console.error("Error actualizando producto", producto.IdProducto, await rUpd.text());
            }
          }
        }

        // Lógica mejorada para actualizar el pedido vinculado
        const detalleConPedido = detallesProd.find(d => typeof d.IdPedido === "number" && (d.IdPedido ?? 0) > 0);
        if (detalleConPedido) {
          const pedidoId = detalleConPedido.IdPedido!;
          try {
            const pedidoResp = await fetch(api(`Pedidos/Obtener/${pedidoId}`));
            if (!pedidoResp.ok) {
              console.warn("No se pudo obtener el pedido:", pedidoId, await pedidoResp.text());
            } else {
              const pedido: IPedido = await pedidoResp.json();

              let nuevoEstado: number;

              // Determinar el estado según las reglas
              const valorRestante = pedido.ValorRestante ?? 0;
              const valorTotal = pedido.TotalPedido ?? 0;
              const valorInicial = pedido.ValorInicial ?? 0;

              if (valorRestante === 0) {
                nuevoEstado = 1007; // Restante 0
              } else if (valorRestante > 0) {
                const mitadDelTotal = valorTotal / 2;
                const sumaTotal = valorInicial + valorRestante;
                
                // Si la suma no coincide con el total, hay un pago intermedio
                if (sumaTotal !== valorTotal) {
                  nuevoEstado = 2; // En proceso (hay pagos intermedios)
                } else if (valorInicial === mitadDelTotal) {
                  nuevoEstado = 1; // Primer pago (valor inicial es exactamente la mitad)
                } else {
                  nuevoEstado = 1; // Por defecto primer pago si la suma coincide
                }
              } else {
                nuevoEstado = 2; // Por defecto en proceso
              }

              const pedidoAEnviar: any = { ...pedido, IdEstado: nuevoEstado };

              delete pedidoAEnviar.IdClienteNavigation;
              delete pedidoAEnviar.IdEstadoNavigation;
              delete pedidoAEnviar.DetallePedidos;

              const respPedido = await fetch(api(`Pedidos/Actualizar/${pedidoId}`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pedidoAEnviar),
              });

              if (!respPedido.ok) {
                console.error("Error actualizando pedido vinculado:", await respPedido.text());
              } else {
                console.log(`Pedido actualizado a estado ${nuevoEstado}:`, pedidoId);
              }
            }
          } catch (err) {
            console.warn("⚠️ Error actualizando pedido vinculado:", err);
          }
        } else {
          if (p.TipoProduccion?.toLowerCase() === "pedido") {
            const relacion = produccionesPedidos.find(pp => pp.Produccion.IdProduccion === p.IdProduccion);
            if (relacion && relacion.Pedido?.IdPedido) {
              // Aplicar la misma lógica para este caso
              const pedidoId = relacion.Pedido.IdPedido;
              try {
                const pedidoResp = await fetch(api(`Pedidos/Obtener/${pedidoId}`));
                if (pedidoResp.ok) {
                  const pedido: IPedido = await pedidoResp.json();

                  let nuevoEstado: number;

                  const valorRestante = pedido.ValorRestante ?? 0;
                  const valorTotal = pedido.TotalPedido ?? 0;
                  const valorInicial = pedido.ValorInicial ?? 0;

                  if (valorRestante === 0) {
                    nuevoEstado = 1007;
                  } else if (valorRestante > 0) {
                    const mitadDelTotal = valorTotal / 2;
                    const sumaTotal = valorInicial + valorRestante;
                    
                    if (sumaTotal !== valorTotal) {
                      nuevoEstado = 2; // En proceso (hay pagos intermedios)
                    } else if (valorInicial === mitadDelTotal) {
                      nuevoEstado = 1; // Primer pago
                    } else {
                      nuevoEstado = 1; // Por defecto primer pago si la suma coincide
                    }
                  } else {
                    nuevoEstado = 2;
                  }

                  await actualizarEstadoPedido(pedidoId, nuevoEstado);
                }
              } catch (err) {
                console.warn("⚠️ Error actualizando pedido desde relación:", err);
              }
            }
          }
        }

        const produccionActualizada: IProduccion = { ...p, IdEstado: idAnulado };
        const resp = await fetch(api(`Produccion/Actualizar/${p.IdProduccion}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(produccionActualizada),
        });
        if (!resp.ok) {
          console.error("Error actualizando producción:", await resp.text());
          throw new Error("Error al actualizar producción");
        }

        await Promise.all([
          refreshInsumos(),
          refreshDetalles(),
          refreshProducciones(),
          refreshPedidos?.(),
        ]);

        Swal.fire({
          icon: "success",
          title: "Anulada",
          text: "Producción anulada y pedido actualizado según su estado de pago.",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false, 
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Ocurrió un problema al anular. Revisa consola.", "error");
      }
    });
  };

  const handleGuardarEdicion = async (produccionActualizada: IProduccion) => {
    try {
      const resp = await fetch(api(`Produccion/Actualizar/${produccionActualizada.IdProduccion}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(produccionActualizada),
      });
      if (!resp.ok) throw new Error("Error al actualizar producción");
      await refreshProducciones();
      setVistaEditar(null);
      
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo actualizar la producción.", "error");
    }
  };

  const produccionesFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();
    const filtro = filtroEstado.toLowerCase();

    const ordenadas = [...producciones].sort((a, b) => (b.IdProduccion ?? 0) - (a.IdProduccion ?? 0));

    return ordenadas.filter((p) => {
      const fi = formatearFecha(p.FechaInicio);
      const ff = formatearFecha(p.FechaFinal);
      const estadoNombre = nombreEstadoProduccion(p.IdEstado || 0).toLowerCase();

      const coincideTexto =
        !texto ||
        p.NombreProduccion?.toLowerCase().includes(texto) ||
        p.TipoProduccion?.toLowerCase().includes(texto) ||
        fi.toLowerCase().includes(texto) ||
        ff.toLowerCase().includes(texto) ||
        estadoNombre.includes(texto);

      const coincideEstado =
        filtro === "todos" || estadoNombre.includes(filtro);

      return coincideTexto && coincideEstado;
    });
  }, [busqueda, filtroEstado, producciones, estadosProduccion]);

  const totalPaginas = Math.ceil(produccionesFiltradas.length / porPagina);
  const items = produccionesFiltradas.slice(
    (paginaActual - 1) * porPagina,
    (paginaActual - 1) * porPagina + porPagina
  );

  if (cargando) {
    return (
      <div className="container-fluid main-content">
        <p>Cargando producciones...</p>
      </div>
    );
  }

  if (mostrarCrearVista) { 
    return ( 
      <CrearProduccion 
        onClose={() => setMostrarCrearVista(false)}
        onCrear={async () => { 
          await refreshProducciones();
        }}
      /> 
    ); 
  }

  if (vistaEditar) {
    return (
      <EditarProduccionModal
        idProduccion={vistaEditar.IdProduccion ?? 0}
        onClose={() => setVistaEditar(null)}
        onEdit={handleGuardarEdicion}
      />
    );
  }

  if (produccionSeleccionada) {
    return (
      <VerProduccionVista
        idProduccion={produccionSeleccionada.IdProduccion ?? 0}
        onClose={() => setProduccionSeleccionada(null)}
      />
    );
  }

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Producciones Registradas</h2>
        <button className="btn btn-pink" onClick={() => setMostrarCrearVista(true)}>
          Crear Producción
        </button>
      </div>

      <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 mb-3 filtros-container">
        <select
          className="form-select filtro-estado"
          value={filtroEstado}
          onChange={(e) => {
            setFiltroEstado(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="Todos">📋 Mostrar todos</option>
          {estadosProduccion.map((estado) => (
            <option key={estado.id} value={estado.nombre}>
              {estado.nombre ? estado.nombre.charAt(0).toUpperCase() + estado.nombre.slice(1).toLowerCase() : ""}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="🔍 Buscar por nombre, tipo, fecha"
          className="form-control buscador"
          value={busqueda}
          onChange={(e) => {
            const value = e.target.value;
            if (value.trim() === "" && value !== "") return;
            setBusqueda(value);
            setPaginaActual(1);
          }}
        />
      </div>

      <div className="tabla-container">
        <table className="table tabla-proveedores">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th style={{ width: 160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p, idx) => {
              const estadoActual = p.IdEstado ?? 0;
              const estadoNombreActual = nombreEstadoProduccion(estadoActual);
              return (
                <tr key={p.IdProduccion} className={idx % 2 === 0 ? "fila-par" : "fila-impar"}>
                  <td>{p.NombreProduccion}</td>
                  <td>{p.TipoProduccion}</td>
                  <td>{formatearFecha(p.FechaInicio)}</td>
                  <td>{formatearFecha(p.FechaFinal)}</td>
                  <td>
                    <select
                      className={`form-select estado-select ${claseEstado(estadoActual)}`}
                      value={estadoActual}
                      onChange={async (e) => {
                        const nuevoId = Number(e.target.value);
                        if (nuevoId === estadoActual) return;

                        const nombreActual = estadoNombreActual 
                          ? estadoNombreActual.charAt(0).toUpperCase() + estadoNombreActual.slice(1).toLowerCase() 
                          : "Desconocido";
                        const estadoNuevo = nombreEstadoProduccion(nuevoId);
                        const nombreNuevo = estadoNuevo 
                          ? estadoNuevo.charAt(0).toUpperCase() + estadoNuevo.slice(1).toLowerCase() 
                          : "Desconocido";

                        const confirmacion = await Swal.fire({
                          title: "¿Estás seguro?",
                          text: `Se cambiará el estado de "${nombreActual}" a "${nombreNuevo}". ¿Deseas continuar?`,
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "Sí, cambiar",
                          cancelButtonText: "Cancelar",
                          confirmButtonColor: "#d33",
                        });
                        if (!confirmacion.isConfirmed) return;

                        await handleActualizarEstado(p, nuevoId);
                      }}
                      disabled={
                        estadoNombreActual.toLowerCase().includes("anul") ||
                        estadoNombreActual.toLowerCase().includes("complet")
                      }
                    >
                      {estadosProduccion
                        .filter((e) => {
                          const nombre = e.nombre.toLowerCase();
                          const actual = estadoNombreActual.toLowerCase();

                          if (actual.includes("anul")) return nombre.includes("anul");
                          if (actual.includes("complet")) return nombre.includes("complet");
                          return !nombre.includes("anul");
                        })
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.nombre ? e.nombre.charAt(0).toUpperCase() + e.nombre.slice(1).toLowerCase() : ""}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td>
                    <FaEye
                      className="icono text-info"
                      style={{ cursor: "pointer", marginRight: 10 }}
                      onClick={() => setProduccionSeleccionada(p)}
                    />

                    <FaEdit
                      className={`icono ${
                        estadoNombreActual.toLowerCase().includes("anul") ||
                        estadoNombreActual.toLowerCase().includes("complet")
                          ? "text-secondary"
                          : "text-warning"
                      }`}
                      style={{
                        cursor:
                          estadoNombreActual.toLowerCase().includes("anul") ||
                          estadoNombreActual.toLowerCase().includes("complet")
                            ? "not-allowed"
                            : "pointer",
                        marginRight: 10,
                      }}
                      onClick={() => {
                        if (
                          !estadoNombreActual.toLowerCase().includes("anul") &&
                          !estadoNombreActual.toLowerCase().includes("complet")
                        ) {
                          setVistaEditar(p);
                        }
                      }}
                    />

                    <FaBan
                      className={`icono ${
                        estadoNombreActual.toLowerCase().includes("anul") ||
                        estadoNombreActual.toLowerCase().includes("complet")
                          ? "text-secondary"
                          : "text-danger"
                      }`}
                      style={{
                        cursor:
                          estadoNombreActual.toLowerCase().includes("anul") ||
                          estadoNombreActual.toLowerCase().includes("complet")
                            ? "not-allowed"
                            : "pointer",
                      }}
                      onClick={() => {
                        if (
                          !estadoNombreActual.toLowerCase().includes("anul") &&
                          !estadoNombreActual.toLowerCase().includes("complet")
                        ) {
                          handleAnularProduccion(p);
                        }
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="d-flex justify-content-center align-items-center mt-4 mb-3">
          <button
            className="btn btn-light me-2"
            onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
            disabled={paginaActual === 1}
          >
            «
          </button>

          {paginaActual > 1 && (
            <button
              className="btn btn-light me-2"
              onClick={() => setPaginaActual(paginaActual - 1)}
            >
              {paginaActual - 1}
            </button>
          )}

          <button className="btn btn-pink me-2">{paginaActual}</button>

          {paginaActual < totalPaginas && (
            <button
              className="btn btn-light me-2"
              onClick={() => setPaginaActual(paginaActual + 1)}
            >
              {paginaActual + 1}
            </button>
          )}

          <button
            className="btn btn-light"
            onClick={() =>
              setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
            }
            disabled={paginaActual === totalPaginas}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListarProduccion;