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
  Pedido?: IPedido | null; // opcional porque no todas las producciones vienen de pedido
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
  // Relación Producción-Pedido
const [produccionesPedidos, setProduccionesPedidos] = useState<IProduccionPedido[]>([]);



  const [estadosProduccion, setEstadosProduccion] = useState<EstadoNorm[]>([]);
  const [estadosPedido, setEstadosPedido] = useState<EstadoNorm[]>([]);

  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarCrearVista, setMostrarCrearVista] = useState(false);
  const [vistaEditar, setVistaEditar] = useState<IProduccion | null>(null);
  const [produccionSeleccionada, setProduccionSeleccionada] = useState<IProduccion | null>(null);

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

  // ✅ robusto
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

  // Vincula cada producción con su pedido si aplica
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

  // refrescar detalles desde API
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

// ⚡ define esta función en el mismo componente donde tienes pedidos
const refreshPedidos = async () => {
  try {
    const resp = await fetch(`${APP_SETTINGS.apiUrl}Pedidos/Lista`);
    if (!resp.ok) throw new Error("Error al obtener pedidos");
    const data: IPedido[] = await resp.json();
    setPedidos(data); // 👈 asegúrate que tienes useState([ ]) para pedidos
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




 // ✅ Cambiar estado de Producción y sincronizar Pedido si aplica
const handleActualizarEstado = async (p: IProduccion, nuevoIdEstado: number) => {
  try {
    const actualizado: IProduccion = { ...p, IdEstado: nuevoIdEstado };

    const estadoNombre = nombreEstadoProduccion(nuevoIdEstado).toLowerCase();
    const esCompletado = estadoNombre.includes("complet");

    // 🟢 Buscar pedido relacionado
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

    // 🟢 Si hay pedido relacionado y la producción pasa a completado
    if (pedidoId && esCompletado) {
      try {
        const pedidoResp = await fetch(api(`Pedidos/Obtener/${pedidoId}`));
        if (!pedidoResp.ok) throw new Error("No se pudo obtener el pedido");

        const pedido: IPedido = await pedidoResp.json();

        // ✨ Armamos un objeto limpio, sin propiedades extra
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
            )?.id ?? 4, // fallback
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

    // 🟢 Actualizar producción
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
    Swal.fire("Actualizado", "Estado actualizado correctamente.", "success");
  } catch (e) {
    console.error(e);
    Swal.fire("Error", "No se pudo actualizar el estado.", "error");
  }
};


// ✅ Anular Producción con devolución de insumos y ajuste de Pedido
const handleAnularProduccion = (p: IProduccion) => {
  const idAnulado = idEstadoPorNombre("anul");
  if (!idAnulado) {
    Swal.fire("Atención", "No encontré el estado 'Anulada' en el catálogo.", "info");
    return;
  }
  if (p.IdEstado === idAnulado) return;

  Swal.fire({
    title: "¿Anular producción?",
    text: "Se marcará como 'Anulada', devolviendo insumos y restando productos creados.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#aaa",
    confirmButtonText: "Sí, anular",
    cancelButtonText: "Cancelar",
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    try {
      // 1) Obtener detalles de producción
      const rDet = await fetch(api("Detalles_Produccion/Lista"));
      if (!rDet.ok) throw new Error("No se pudieron obtener los detalles de producción.");
      const allDetalles: detalleProduccion[] = await rDet.json();
      const detallesProd = allDetalles.filter(d => d.IdProduccion === p.IdProduccion);

      // 2) Devolver insumos usados (se acumulan por insumo)
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

      // 3) Restar productos si es producción directa
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

      // --- NUEVO: buscar IdPedido en los detalles (si existe) y actualizarlo a "En proceso" (IdEstado = 2) ---
      const detalleConPedido = detallesProd.find(d => typeof d.IdPedido === "number" && (d.IdPedido ?? 0) > 0);
      if (detalleConPedido) {
        const pedidoId = detalleConPedido.IdPedido!;
        try {
          // traer pedido completo
          const pedidoResp = await fetch(api(`Pedidos/Obtener/${pedidoId}`));
          if (!pedidoResp.ok) {
            console.warn("No se pudo obtener el pedido:", pedidoId, await pedidoResp.text());
          } else {
            const pedido: IPedido = await pedidoResp.json();

            // preparamos el objeto que enviará el PUT; partimos del pedido tal cual lo devolvió la API
            const pedidoAEnviar: any = { ...pedido, IdEstado: 2 }; // 2 = "En proceso" según tu nota

            // quitamos las propiedades de navegación para evitar problemas al serializar/ef
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
              console.log("Pedido actualizado a 'En proceso':", pedidoId);
            }
          }
        } catch (err) {
          console.warn("⚠️ Error actualizando pedido vinculado:", err);
        }
      } else {
        // fallback: si por alguna razón no hay IdPedido en Detalles, usa tu lógica anterior
        if (p.TipoProduccion?.toLowerCase() === "pedido") {
          const relacion = produccionesPedidos.find(pp => pp.Produccion.IdProduccion === p.IdProduccion);
          if (relacion) {
            await actualizarEstadoPedido(relacion.Pedido?.IdPedido ?? 0, 2); // 2 = "En proceso"
          }
        }
      }

      // 4) Actualizar producción -> anulada
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

      // 5) Refrescar datos
      await Promise.all([
        refreshInsumos(),
        refreshDetalles(),
        refreshProducciones(),
        refreshPedidos?.(),
      ]);

      Swal.fire("Anulado", "Producción anulada y pedido puesto en 'En proceso' (si aplica).", "success");
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
  const t = busqueda.toLowerCase().trim();

  // 🔽 Clonamos y ordenamos de forma descendente por IdProduccion
  const ordenadas = [...producciones].sort((a, b) => (b.IdProduccion ?? 0) - (a.IdProduccion ?? 0));

  if (!t) return ordenadas;

  return ordenadas.filter((p) => {
    const fi = formatearFecha(p.FechaInicio);
    const ff = formatearFecha(p.FechaFinal);
    const estadoNombre = nombreEstadoProduccion(p.IdEstado || 0);
    return (
      p.NombreProduccion?.toLowerCase().includes(t) ||
      p.TipoProduccion?.toLowerCase().includes(t) ||
      fi.toLowerCase().includes(t) ||
      ff.toLowerCase().includes(t) ||
      estadoNombre.includes(t)
    );
  });
}, [busqueda, producciones, estadosProduccion]);


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
  ); }


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
        <h2 className="titulo">Producciones</h2>
        <button className="btn btn-pink" onClick={() => setMostrarCrearVista(true)}>
          Crear Producción
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre, tipo, fecha o estado"
        className="form-control mb-3 buscador"
        value={busqueda}
        onChange={(e) => {
            const value = e.target.value;
            if (value.trim() === "" && value !== "") return;
            setBusqueda(value);
          setPaginaActual(1);
        }}
      />

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
  onChange={(e) => handleActualizarEstado(p, Number(e.target.value))}
  disabled={
    nombreEstadoProduccion(estadoActual).toLowerCase().includes("anul") ||
    nombreEstadoProduccion(estadoActual).toLowerCase().includes("complet")
  }
>
  {estadosProduccion
    .filter((e) => {
      const nombre = e.nombre.toLowerCase();
      const actual = nombreEstadoProduccion(estadoActual).toLowerCase();

      // ✅ Si la producción YA está anulada, solo mostrar "Anulada"
      if (actual.includes("anul")) return nombre.includes("anul");

      // ✅ Si la producción YA está completada, solo mostrar "Completado"
      if (actual.includes("complet")) return nombre.includes("complet");

      // 🚫 Si NO está anulada, ocultar la opción de anular
      return !nombre.includes("anul");
    })
    .map((e) => (
      <option key={e.id} value={e.id}>
        {e.nombre}
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
    nombreEstadoProduccion(estadoActual).toLowerCase().includes("anul") ||
    nombreEstadoProduccion(estadoActual).toLowerCase().includes("complet")
      ? "text-secondary"
      : "text-warning"
  }`}
  style={{
    cursor:
      nombreEstadoProduccion(estadoActual).toLowerCase().includes("anul") ||
      nombreEstadoProduccion(estadoActual).toLowerCase().includes("complet")
        ? "not-allowed"
        : "pointer",
    marginRight: 10,
  }}
  onClick={() => {
    if (
      !nombreEstadoProduccion(estadoActual).toLowerCase().includes("anul") &&
      !nombreEstadoProduccion(estadoActual).toLowerCase().includes("complet")
    ) {
      setVistaEditar(p);
    }
  }}
/>

<FaBan
  className={`icono ${
    nombreEstadoProduccion(estadoActual).toLowerCase().includes("anul") ||
    nombreEstadoProduccion(estadoActual).toLowerCase().includes("complet")
      ? "text-secondary"
      : "text-danger"
  }`}
  style={{
    cursor:
      nombreEstadoProduccion(estadoActual).toLowerCase().includes("anul") ||
      nombreEstadoProduccion(estadoActual).toLowerCase().includes("complet")
        ? "not-allowed"
        : "pointer",
  }}
  onClick={() => {
    if (
      !nombreEstadoProduccion(estadoActual).toLowerCase().includes("anul") &&
      !nombreEstadoProduccion(estadoActual).toLowerCase().includes("complet")
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

        <div className="paginacion text-end">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`btn me-2 ${paginaActual === n ? "btn-pink" : "btn-light"}`}
              onClick={() => setPaginaActual(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListarProduccion;
