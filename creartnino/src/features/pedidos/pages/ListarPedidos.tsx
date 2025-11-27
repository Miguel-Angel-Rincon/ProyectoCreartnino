import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaEye, FaFilePdf, FaBan } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import CrearPedido from "./Crear";
import VerPedido from "./Ver";
import "../styles/style.css";
import type { IPedido,detallePedido } from "../../interfaces/IPedidos";
import type { IProductos } from "../../interfaces/IProductos";
import type { IClientes } from "../../interfaces/IClientes";
import logo from "../../../assets/Imagenes/logo.jpg";

interface Pedidos extends IPedido {
  Cliente: string;
  Documento: string;
  Direccion: string;
  Estado: string;
  detallePedido?: {
    producto: string;
    cantidad: number;
    precio: number;
  }[];
}

const getColorClaseEstadoPedido = (estado: string) => {
  switch (estado) {
    case "primer pago":
      return "estado-primer-pago";
    case "en proceso":
      return "estado-en-proceso";
    case "en producción":
      return "estado-en-produccion";
    case "en proceso de entrega":
      return "estado-en-proceso-entrega";
    case "entregado":
      return "estado-entregado";
    case "venta directa":
      return "estado-venta-directa";
    case "anulado":
      return "estado-anulado";
    case "pedido pagado":
      return "estado-pedido-pagado";
    default:
      return "";
  }
};

const ListarPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedidos[]>([]);
  const [clientes, setClientes] = useState<IClientes[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [modoCrear, setModoCrear] = useState(false);
  const [productos, setProductos] = useState<IProductos[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<IPedido | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [mostrarAtrasados, setMostrarAtrasados] = useState(false);
  const [fechaServidor, setFechaServidor] = useState<Date | null>(null);
  const pedidosPorPagina = 6;
// Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      const resp = await fetch("https://www.apicreartnino.somee.com/api/Productos/Lista");
      const data: IProductos[] = await resp.json();
      setProductos(data);
    };
    fetchProductos();
  }, []);
// Obtener fecha del servidor
  const obtenerFechaServidor = async (): Promise<Date | null> => {
    try {
      const resp = await fetch("https://apicreartnino.somee.com/api/Utilidades/FechaServidor", {
        method: "GET"
      });
      
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.fechaActual) {
          return new Date(data.fechaActual);
        }
      }
      
      const dateHeader = resp.headers.get("date");
      if (dateHeader) {
        return new Date(dateHeader);
      }
      
      return new Date();
    } catch (error) {
      console.log("Error obteniendo fecha del servidor, usando fecha local:", error);
      return new Date();
    }
  };
// Refrescar pedidos después de crear o actualizar
  const refreshPedidos = async () => {
    try {
      const resp = await fetch(
        "https://apicreartnino.somee.com/api/Pedidos/Lista"
      );
      if (!resp.ok) throw new Error("Error al obtener pedidos");
      const data: IPedido[] = await resp.json();
      const pedidosMapeados: Pedidos[] = data.map((p) => {
        const cliente = clientes.find((c) => c.IdCliente === p.IdCliente);
        return {
          ...p,
          Cliente: cliente?.NombreCompleto || "Sin nombre",
          Documento: cliente
            ? `${cliente.TipoDocumento ?? "Sin tipo"} - ${cliente.NumDocumento ?? "Sin número"}`
            : "No tiene documento",
          Direccion: cliente?.Direccion || "No disponible",
          Estado:
            p.IdEstado === 1
              ? "primer pago"
              : p.IdEstado === 2
              ? "en proceso"
              : p.IdEstado === 3
              ? "en producción"
              : p.IdEstado === 4
              ? "en proceso de entrega"
              : p.IdEstado === 5
              ? "entregado"
              : p.IdEstado === 6
              ? "anulado"
              : p.IdEstado === 7
              ? "venta directa"
              : p.IdEstado === 1007
              ? "pedido pagado"
              : "desconocido",
          detallePedido: [],
        };
      });
      pedidosMapeados.sort((a, b) => (b.IdPedido ?? 0) - (a.IdPedido ?? 0));
      setPedidos(pedidosMapeados);
    } catch (err) {
      console.error("No se pudieron refrescar los pedidos", err);
    }
  };
// Cargar clientes
  const cargarClientes = async () => {
    try {
      const response = await fetch(
        "https://apicreartnino.somee.com/api/Clientes/Lista"
      );
      const data: IClientes[] = await response.json();
      setClientes(data);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los clientes",
      });
    }
  };
// Cargar pedidos
  const cargarPedidos = async () => {
    try {
      const response = await fetch(
        "https://apicreartnino.somee.com/api/Pedidos/Lista"
      );
      const data: IPedido[] = await response.json();
      const pedidosMapeados: Pedidos[] = data.map((p) => {
        const cliente = clientes.find((c) => c.IdCliente === p.IdCliente);
        return {
          ...p,
          Cliente: cliente?.NombreCompleto || "Sin nombre",
          Documento: cliente
            ? `${cliente.TipoDocumento ?? "Sin tipo"} - ${cliente.NumDocumento ?? "Sin número"}`
            : "No tiene documento",
          Direccion: cliente?.Direccion || "No disponible",
          Estado:
            p.IdEstado === 1
              ? "primer pago"
              : p.IdEstado === 2
              ? "en proceso"
              : p.IdEstado === 3
              ? "en producción"
              : p.IdEstado === 4
              ? "en proceso de entrega"
              : p.IdEstado === 5
              ? "entregado"
              : p.IdEstado === 6
              ? "anulado"
              : p.IdEstado === 7
              ? "venta directa"
              : p.IdEstado === 1007
              ? "pedido pagado"
              : "desconocido",
          detallePedido: [],
        };
      });
      pedidosMapeados.sort((a, b) => (b.IdPedido ?? 0) - (a.IdPedido ?? 0));
      setPedidos(pedidosMapeados);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los pedidos desde la API",
      });
    }
  };
// Cargar clientes y fecha del servidor al montar
  useEffect(() => {
    const cargarDatos = async () => {
      await cargarClientes();
      const fecha = await obtenerFechaServidor();
      setFechaServidor(fecha);
    };
    cargarDatos();
  }, []);
// Cargar pedidos cuando los clientes estén disponibles
  useEffect(() => {
    if (clientes.length > 0) cargarPedidos();
  }, [clientes]);
// Actualizar estado del pedido
  const actualizarEstadoAPI = async (pedido: Pedidos, nuevoEstado: string) => {
  if (updatingId !== null) return;

  setUpdatingId(pedido.IdPedido ?? null);

  const estadoId =
    nuevoEstado === "primer pago"
      ? 1
      : nuevoEstado === "en proceso"
      ? 2
      : nuevoEstado === "en producción"
      ? 3
      : nuevoEstado === "en proceso de entrega"
      ? 4
      : nuevoEstado === "entregado"
      ? 5
      : nuevoEstado === "anulado"
      ? 6
      : nuevoEstado === "venta directa"
      ? 7
      : nuevoEstado === "pedido pagado"
      ? 1007
      : pedido.IdEstado;

  try {
    let fechaServidor = pedido.FechaEntrega ?? null;

    //  SOLO si es entregado o venta directa
    if (nuevoEstado === "entregado" || nuevoEstado === "venta directa") {
      try {
        const resFecha = await fetch(
          `https://apicreartnino.somee.com/api/Utilidades/FechaServidor`
        );
        if (resFecha.ok) {
          const data = await resFecha.json();
          fechaServidor = data.FechaServidor; // <-- ESTA es la buena
        }
      } catch {
        console.warn("No se pudo obtener fecha del servidor");
      }
    }

    //  enviar objeto completo + FechaEntrega
    const body = {
      ...pedido,
      IdEstado: estadoId,
      FechaEntrega: fechaServidor,
    };

    const response = await fetch(
      `https://apicreartnino.somee.com/api/Pedidos/Actualizar/${pedido.IdPedido}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) throw new Error("Error al actualizar estado");

    //  actualizar en el front
    setPedidos((prev) =>
      prev.map((p) =>
        p.IdPedido === pedido.IdPedido
          ? {
              ...p,
              Estado: nuevoEstado,
              IdEstado: estadoId,
              FechaEntrega: fechaServidor ?? p.FechaEntrega,
            }
          : p
      )
    );

    Swal.fire({
      icon: "success",
      title: "Actualizado",
      text: "Estado actualizado correctamente",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Error actualizando estado:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo actualizar el estado en la API",
    });
  } finally {
    setUpdatingId(null);
  }
};

// Anular pedido y devolver productos al inventario
  const handleAnularPedido = async (pedido: Pedidos) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Este pedido se marcará como ANULADO y se devolverán los productos al inventario",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, Anular",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const resDetalles = await fetch(
            "https://apicreartnino.somee.com/api/Detalles_Pedido/Lista"
          );
          const detalles: Array<{
            IdDetallePedido: number;
            IdPedido: number;
            IdProducto: number;
            Cantidad: number;
          }> = await resDetalles.json();

          const detallesPedido = detalles.filter(
            (d) => d.IdPedido === pedido.IdPedido
          );

          const resProductos = await fetch(
            "https://apicreartnino.somee.com/api/Productos/Lista"
          );
          const productos: Array<{
            IdProducto: number;
            CategoriaProducto: number;
            Nombre: string;
            Imagen: string;
            Cantidad: number;
            Marca: string;
            Precio: number;
            Estado: boolean;
          }> = await resProductos.json();

          for (const d of detallesPedido) {
            const producto = productos.find((p) => p.IdProducto === d.IdProducto);
            if (!producto) continue;

            const actualizado = {
              ...producto,
              Cantidad: (producto.Cantidad ?? 0) + d.Cantidad,
            };

            await fetch(
              `https://apicreartnino.somee.com/api/Productos/Actualizar/${d.IdProducto}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(actualizado),
              }
            );
          }

          actualizarEstadoAPI(pedido, "anulado");

          Swal.fire(
            "✅ Pedido Anulado",
            "Los productos han sido devueltos al inventario",
            "success"
          );
        } catch (error) {
          console.error(error);
          Swal.fire("❌ Error", "No se pudo anular el pedido", "error");
        }
      }
    });
  };
// Manejar creación de pedido
  const handleCrearPedido = async () => {
    setModoCrear(false);
    await refreshPedidos();
  };
// Generar PDF del pedido
  const getCircularImage = (imgUrl: string, size = 60, scale = 4): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = size * scale;
      canvas.height = size * scale;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imgUrl;

      img.onload = () => {
        ctx.beginPath();
        ctx.arc((size * scale) / 2, (size * scale) / 2, (size * scale) / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, 0, 0, size * scale, size * scale);
        resolve(canvas.toDataURL("image/png", 1.0));
      };
    });
  };
// Generar PDF del pedido
  const generarPDF = async (pedido: Pedidos, productos: IProductos[]) => {
  try {
    const detallesRes = await fetch("https://www.apicreartnino.somee.com/api/Detalles_Pedido/Lista");
    if (!detallesRes.ok) throw new Error("Error al obtener detalles");
    const detallesAll: detallePedido[] = await detallesRes.json();
    const detalles = detallesAll.filter((d) => d.IdPedido === pedido.IdPedido);

    const doc = new jsPDF();

    //  Logo circular
    if (logo) {
      const circularLogo = await getCircularImage(logo, 60, 4);
      doc.addImage(circularLogo, "JPG", 80, 10, 50, 50);
    }

    //  Encabezado
    doc.setFontSize(20);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.text(`Pedido #${pedido.IdPedido}`, 105, 70, { align: "center" });

    doc.setFontSize(13);
    doc.setTextColor(120);
    doc.setFont("helvetica", "normal");
    doc.text("Resumen de pedido", 105, 80, { align: "center" });
    doc.line(20, 85, 190, 85);

    //  Información del pedido (sin descripción)
    const labels: [string, string | number | undefined][] = [
      ["Cliente", pedido.Cliente],
      ["Documento", pedido.Documento],
      ["Dirección", pedido.Direccion],
      ["Método de Pago", pedido.MetodoPago ?? "N/A"],
      [
        "Fecha del Pedido",
        pedido.FechaPedido
          ? new Date(pedido.FechaPedido).toLocaleDateString("es-CO")
          : "N/A",
      ],
      [
        "Fecha de Entrega",
        pedido.FechaEntrega
          ? new Date(pedido.FechaEntrega).toLocaleDateString("es-CO")
          : "N/A",
      ],
      ["Estado", pedido.Estado ?? "N/A"],
    ];

    let y = 95;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    labels.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 70, y);
      y += 8;
    });

    //  Tabla de productos
    autoTable(doc, {
      startY: y + 10,
      head: [["Producto", "Cantidad", "Precio Unitario", "Subtotal"]],
      body: (detalles && Array.isArray(detalles) ? detalles : []).map((d) => {
        const producto = productos.find((p) => p.IdProducto === d.IdProducto);

        return [
          producto?.Nombre || `Producto ${d.IdProducto}`,
          String(d.Cantidad),
          `$${producto?.Precio?.toLocaleString("es-CO") || "0"}`,
          `$${(d.Subtotal ?? 0).toLocaleString("es-CO")}`,
        ];
      }),
      styles: { halign: "center", fontSize: 10 },
      headStyles: { fillColor: [255, 182, 193], textColor: 40 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? y + 20;

    // Totales
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50);

    let totalesY = finalY + 15;
    doc.text(
      `Valor Inicial: $${pedido.ValorInicial?.toLocaleString("es-CO")}`,
      140,
      totalesY
    );
    doc.text(
      `Valor Restante: $${pedido.ValorRestante?.toLocaleString("es-CO")}`,
      140,
      totalesY + 10
    );

    doc.setFontSize(14);
    doc.setTextColor(200, 50, 100);
    doc.text(
      `TOTAL: $${pedido.TotalPedido?.toLocaleString("es-CO")}`,
      140,
      totalesY + 22
    );

    //  Pie de página
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`,
      20,
      totalesY + 40
    );

    doc.save(`Pedido-${pedido.IdPedido}.pdf`);
  } catch (err) {
    console.error("Error generando PDF:", err);
    Swal.fire("Error", "No se pudo generar el PDF del pedido", "error");
  }
};


  // Calcular pedidos atrasados
  const pedidosAtrasados = pedidos.filter((p) => {
    if (!p.FechaEntrega || !fechaServidor) return false;
    
    const fechaEntrega = new Date(p.FechaEntrega);
    fechaEntrega.setHours(0, 0, 0, 0);
    
    const hoy = new Date(fechaServidor);
    hoy.setHours(0, 0, 0, 0);
    
    const estaAtrasado = fechaEntrega < hoy;
    const noEstaFinalizadoOCancelado = 
      p.Estado !== "entregado" && 
      p.Estado !== "anulado" &&
      p.Estado !== "venta directa";
    
    return estaAtrasado && noEstaFinalizadoOCancelado;
  });

  const pedidosFiltrados = pedidos.filter((p) => {
    // Si está en modo atrasados, filtrar por fecha
    if (mostrarAtrasados) {
      if (!p.FechaEntrega || !fechaServidor) return false;
      
      const fechaEntrega = new Date(p.FechaEntrega);
      fechaEntrega.setHours(0, 0, 0, 0);
      
      const hoy = new Date(fechaServidor);
      hoy.setHours(0, 0, 0, 0);
      
      const estaAtrasado = fechaEntrega < hoy;
      const noEstaFinalizadoOCancelado = 
        p.Estado !== "entregado" && 
        p.Estado !== "anulado" &&
        p.Estado !== "venta directa";
      
      return estaAtrasado && noEstaFinalizadoOCancelado;
    }

    // Filtro normal
    const busquedaLower = busqueda.toLowerCase();
    const coincideBusqueda =
      (`#${p.IdPedido}`.includes(busqueda) ||
        p.IdPedido?.toString().includes(busqueda) ||
        p.MetodoPago?.toLowerCase().includes(busquedaLower) ||
        p.Cliente?.toLowerCase().includes(busquedaLower) ||
        (typeof p.FechaEntrega === "string" && p.FechaEntrega.toLowerCase().includes(busquedaLower)) ||
        p.ValorInicial?.toString().includes(busqueda) ||
        p.TotalPedido?.toString().includes(busqueda)
      );

    const coincideEstado =
      filtroEstado === "Todos" || p.Estado === filtroEstado;

    // Si el filtro es "Todos", excluir anulados, entregados y venta directa
    if (filtroEstado === "Todos") {
      const noEstaFinalizadoOCancelado = 
        p.Estado !== "entregado" && 
        p.Estado !== "anulado" &&
        p.Estado !== "venta directa";
      return coincideBusqueda && noEstaFinalizadoOCancelado;
    }

    return coincideBusqueda && coincideEstado;
  });

  const indexInicio = (paginaActual - 1) * pedidosPorPagina;
  const pedidosPagina = pedidosFiltrados.slice(
    indexInicio,
    indexInicio + pedidosPorPagina
  );
  const totalPaginas = Math.ceil(pedidosFiltrados.length / pedidosPorPagina);

  if (pedidoSeleccionado) {
    return (
      <VerPedido
        pedido={pedidoSeleccionado}
        onVolver={async (actualizado) => {
          if (actualizado) {
            await refreshPedidos();
          }
          setPedidoSeleccionado(null);
        }}
      />
    );
  }

  if (modoCrear) {
    return (
      <div className="container-fluid main-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
        </div>
        <CrearPedido onClose={() => setModoCrear(false)} onCrear={handleCrearPedido} />
      </div>
    );
  }

  return (
    <div className="container-fluid main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="titulo">Pedidos Registrados</h2>
        <button className="btn btn-pink" onClick={() => setModoCrear(true)}>
          Crear Pedido
        </button>
      </div>

      <div className="d-flex flex-column flex-md-row align-items-md-center gap-3 mb-3 filtros-container">
       <select
  className="form-select filtro-estado"
  value={filtroEstado}
  onChange={async (e) => {
    setFiltroEstado(e.target.value);
    setPaginaActual(1);
    await refreshPedidos(); //  Refrescar pedidos al cambiar filtro
  }}
  disabled={mostrarAtrasados}
>
  <option value="Todos">📋 Mostrar todos</option>

  {[
    { id: 1, nombre: "primer pago" },
    { id: 2, nombre: "en proceso" },
    { id: 3, nombre: "en producción" },
    { id: 4, nombre: "en proceso de entrega" },
    { id: 5, nombre: "entregado" },
    { id: 6, nombre: "anulado" },
    { id: 7, nombre: "venta directa" },
    { id: 1007, nombre: "pedido pagado" },
  ].map((estado) => (
    <option key={estado.id} value={estado.nombre}>
      {estado.nombre.charAt(0).toUpperCase() + estado.nombre.slice(1)}
    </option>
  ))}
</select>

        <input
          type="text"
          placeholder="🔍 Buscar por cliente, método o fecha y por el id con el #"
          className="form-control buscador"
          value={busqueda}
          onChange={(e) => {
            const value = e.target.value;
            if (value.trim() === "" && value !== "") return;
            setBusqueda(value);
            setPaginaActual(1);
          }}
          disabled={mostrarAtrasados}
        />

        <select
          className="form-select filtro-estado"
          style={{ paddingRight: "2.5rem" }}
          value={mostrarAtrasados ? "atrasados" : "todos"}
          onChange={(e) => {
            if (e.target.value === "atrasados") {
              setMostrarAtrasados(true);
              setPaginaActual(1);
              setBusqueda("");
              setFiltroEstado("Todos");
            } else {
              setMostrarAtrasados(false);
              setPaginaActual(1);
            }
          }}
        >
          <option value="todos">📋 Pedidos</option>
          <option value="atrasados">⏰ Ver Atrasados ({pedidosAtrasados.length})   </option>
        </select>
      </div>

      <div className="tabla-container">
        <table className="table tabla-proveedores">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Cliente</th>
              <th>Método de Pago</th>
              <th>Entrega</th>
              {mostrarAtrasados && <th>Días Atraso</th>}
              <th>Inicial</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosPagina.map((p, index) => (
              <tr
                key={p.IdPedido}
                className={index % 2 === 0 ? "fila-par" : "fila-impar"}
                style={mostrarAtrasados ? { backgroundColor: "#fff3cd" } : undefined}
              >
                <td>{p.Documento}</td>

                <td>{p.Cliente}</td>
                <td>{p.MetodoPago}</td>
                <td>
                  {p.FechaEntrega
                    ? new Date(p.FechaEntrega).toLocaleDateString("es-CO")
                    : ""}
                </td>
                {mostrarAtrasados && (
                  <td>
                    {p.FechaEntrega && fechaServidor ? (() => {
                      const fechaEntrega = new Date(p.FechaEntrega);
                      fechaEntrega.setHours(0, 0, 0, 0);
                      const hoy = new Date(fechaServidor);
                      hoy.setHours(0, 0, 0, 0);
                      const diasAtraso = Math.floor((hoy.getTime() - fechaEntrega.getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <span style={{ fontWeight: "bold", color: diasAtraso > 30 ? "#dc3545" : "#ff9800" }}>
                          {diasAtraso} días
                        </span>
                      );
                    })() : "N/A"}
                  </td>
                )}
                <td>${p.ValorInicial?.toLocaleString("es-CO")}</td>
                <td>${p.TotalPedido?.toLocaleString("es-CO")}</td>
                <td>
                  <select
  className={`form-select estado-select ${getColorClaseEstadoPedido(
    p.Estado
  )}`}
  value={p.Estado}
  onChange={async (e) => {
    const nuevo = e.target.value;
    if (nuevo === p.Estado) return;

    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se cambiará el estado de "${p.Estado}" a "${nuevo}". ¿Deseas continuar?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });
    if (!confirmacion.isConfirmed) return;

    actualizarEstadoAPI(p, nuevo);
  }}
  disabled={
    p.Estado === "anulado" ||
    p.Estado === "entregado" ||
    p.Estado === "en producción" ||
    p.Estado === "venta directa" ||
    updatingId === p.IdPedido
  }
  style={{
    cursor: updatingId === p.IdPedido ? "wait" : undefined,
    opacity: updatingId === p.IdPedido ? 0.6 : undefined,
    ...(p.Estado === "pedido pagado" && {
      backgroundColor: "#ADD8E6",
      color: "#004085",
      fontWeight: "600",
      borderColor: "#80D4FF",
    }),
  }}
>
  <option value={p.Estado}>
    {p.Estado.charAt(0).toUpperCase() + p.Estado.slice(1)}
  </option>
  {p.Estado === "en proceso de entrega"
    ? ["entregado", "venta directa"]
        .filter((opcion) => opcion !== p.Estado)
        .map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
          </option>
        ))
    : p.Estado === "pedido pagado"
    ? ["en proceso", "venta directa"]
        .filter((opcion) => opcion !== p.Estado)
        .map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
          </option>
        ))
    : p.Estado === "en proceso" && p.ValorRestante === 0
    ? ["venta directa", "pedido pagado"]
        .filter((opcion) => opcion !== p.Estado)
        .map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
          </option>
        ))
    : ["primer pago", "en proceso", "entregado", "venta directa", "pedido pagado"]
        .filter((opcion) => opcion !== p.Estado)
        .map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion.charAt(0).toUpperCase() + opcion.slice(1)}
          </option>
        ))}
</select>
                </td>
                <td>
                  <FaEye
                    className="icono text-info me-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => setPedidoSeleccionado(p)}
                  />
                  <FaBan
                    className={`icono me-2 ${
                      p.Estado === "anulado" ||
                      p.Estado === "entregado" ||
                      p.Estado === "venta directa" ||
                      p.Estado === "en producción"
                        ? "text-dark"
                        : "text-warning"
                    }`}
                    style={{
                      cursor:
                        p.Estado === "anulado" ||
                        p.Estado === "entregado" ||
                        p.Estado === "venta directa" ||
                        p.Estado === "en producción"
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onClick={() => {
                      if (
                        p.Estado !== "anulado" &&
                        p.Estado !== "entregado" &&
                        p.Estado !== "venta directa" &&
                        p.Estado !== "en producción"
                      ) {
                        handleAnularPedido(p);
                      }
                    }}
                    title={
                      p.Estado === "anulado"
                        ? "Ya está anulado"
                        : p.Estado === "entregado"
                        ? "No se puede anular entregado"
                        : p.Estado === "venta directa"
                        ? "No se puede anular venta directa"
                        : p.Estado === "en producción"
                        ? "No se puede anular en producción"
                        : "Anular pedido"
                    }
                  />
                  <FaFilePdf
                    className="icono text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => generarPDF(p, productos)}
                  />

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
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
  );
};

export default ListarPedidos;