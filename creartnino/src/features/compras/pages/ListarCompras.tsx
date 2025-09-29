import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEye, FaBan, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import CrearCompra from "./Crear";
import VerCompra from "./Ver";
import "../styles/style.css";
import { APP_SETTINGS } from "../../../settings/appsettings";

import type { ICompras, IDetalleCompra } from "../../interfaces/ICompras";
import type { IProveedores } from "../../interfaces/IProveedores";
import type { IInsumos } from "../../interfaces/IInsumos";

// 👇 importa el logo como imagen
import logo from "../../../assets/Imagenes/logo.jpg";

const COMPRAS_POR_PAGINA = 6;

const getColorClaseEstadoCompra = (nombreEstado: string) => {
  switch (nombreEstado) {
    case "Solicitada":
      return "estado-solicitada";
    case "Anulada":
      return "estado-anulado";
    case "Recibida":
      return "estado-recibida";
    case "Completado":
      return "estado-completado";
    default:
      return "";
  }
};

const ListarCompras: React.FC = () => {
  const [compras, setCompras] = useState<ICompras[]>([]);
  const [proveedores, setProveedores] = useState<IProveedores[]>([]);
  const [insumos, setInsumos] = useState<IInsumos[]>([]);
  const [estadosCompra, setEstadosCompra] = useState<
    { IdEstado: number; NombreEstado: string }[]
  >([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [mostrarVer, setMostrarVer] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState<ICompras | null>(
    null
  );

  const apiBase = (APP_SETTINGS.apiUrl || "").replace(/\/+$/, "");
  const buildUrl = (path: string) => `${apiBase}/${path.replace(/^\/+/, "")}`;

  // --- Cargar datos ---
  const cargarDatos = async () => {
    try {
      const [comprasRes, proveedoresRes, insumosRes] = await Promise.all([
        fetch(buildUrl("Compras/Lista")),
        fetch(buildUrl("Proveedores/Lista")),
        fetch(buildUrl("Insumos/Lista")),
      ]);

      if (!comprasRes.ok || !proveedoresRes.ok || !insumosRes.ok)
        throw new Error("Error HTTP");

      const comprasData: ICompras[] = await comprasRes.json();

      // 🔽 Ordenar por IdCompra (última creada primero)
      const comprasOrdenadas = comprasData.sort((a, b) => b.IdCompra - a.IdCompra);

      setCompras(comprasOrdenadas);
      setProveedores(await proveedoresRes.json());
      setInsumos(await insumosRes.json());
    } catch (err) {
      console.error("Error cargando datos:", err);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    }
  };

  const cargarEstados = async () => {
    try {
      const estadosRes = await fetch(buildUrl("Estados_Compra/Lista"));
      if (!estadosRes.ok) throw new Error("Error al cargar estados");
      setEstadosCompra(await estadosRes.json());
    } catch (err) {
      console.error("Error cargando estados:", err);
      Swal.fire("Error", "No se pudieron cargar los estados de compra", "error");
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarEstados();
  }, []);

  // --- Ver compra con detalles ---
  const handleVerCompra = async (compra: ICompras) => {
    try {
      const response = await fetch(buildUrl(`Compras/Obtener/${compra.IdCompra}`));
      if (!response.ok) throw new Error("No se pudo obtener la compra");
      const compraBase = await response.json();

      const detallesRes = await fetch(buildUrl("Detalles_Compra/Lista"));
      if (!detallesRes.ok) throw new Error("Error al obtener detalles");
      const detallesAll: IDetalleCompra[] = await detallesRes.json();

      const detallesCompra = detallesAll.filter(
        (d) => d.IdCompra === compra.IdCompra
      );

      setCompraSeleccionada({
        ...compraBase,
        Detalle: detallesCompra,
      });

      setMostrarVer(true);
    } catch (error) {
      console.error("Error al cargar la compra:", error);
      Swal.fire("Error", "La compra no ha sido encontrada.", "error");
    }
  };

  // --- Anular compra ---
  const confirmarAnulacion = (compra: ICompras) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "La compra será marcada como Anulada y se restará el stock",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, Anular",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const detalleRes = await fetch(buildUrl("Detalles_Compra/Lista"));
        if (!detalleRes.ok)
          throw new Error("No se pudo obtener los detalles de compras");
        const todosDetalles: IDetalleCompra[] = await detalleRes.json();
        const detalle = todosDetalles.filter(
          (d) => d.IdCompra === compra.IdCompra
        );

        const insumosRes = await fetch(buildUrl("Insumos/Lista"));
        if (!insumosRes.ok) throw new Error("Error al cargar insumos");
        const insumosActuales: IInsumos[] = await insumosRes.json();

        if (detalle.length > 0) {
          await Promise.all(
            detalle.map(async (d) => {
              const insumo = insumosActuales.find(
                (i) => i.IdInsumo === d.IdInsumo
              );
              if (!insumo) return;

              const nuevoStock = Math.max(insumo.Cantidad - d.Cantidad, 0);

              await fetch(buildUrl(`Insumos/Actualizar/${d.IdInsumo}`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...insumo, Cantidad: nuevoStock }),
              });
            })
          );
        }

        const estadoAnulado = estadosCompra.find(
          (e) => e.NombreEstado === "Anulada"
        );

        const resp = await fetch(buildUrl(`Compras/Actualizar/${compra.IdCompra}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...compra,
            IdEstado: estadoAnulado ? estadoAnulado.IdEstado : 2,
          }),
        });
        if (!resp.ok) throw new Error("Error al anular compra");

        setCompras((prev) =>
          prev.map((c) =>
            c.IdCompra === compra.IdCompra
              ? { ...c, IdEstado: estadoAnulado ? estadoAnulado.IdEstado : 2 }
              : c
          )
        );

        Swal.fire(
          "Anulado",
          "La compra fue anulada y el stock actualizado.",
          "success"
        );
      } catch (err) {
        console.error("Error anulando compra:", err);
        Swal.fire("Error", "No se pudo anular la compra", "error");
      }
    });
  };

  // --- Cambiar estado ---
  const cambiarEstado = async (compra: ICompras, nuevoEstadoNombre: string) => {
    const nuevoEstado = estadosCompra.find(
      (est) => est.NombreEstado === nuevoEstadoNombre
    );
    if (!nuevoEstado) return;

    try {
      const resp = await fetch(buildUrl(`Compras/Actualizar/${compra.IdCompra}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...compra,
          IdEstado: nuevoEstado.IdEstado,
        }),
      });

      if (!resp.ok) throw new Error("Error al actualizar el estado");

      setCompras((prev) =>
        prev.map((c) =>
          c.IdCompra === compra.IdCompra
            ? { ...c, IdEstado: nuevoEstado.IdEstado }
            : c
        )
      );

      Swal.fire(
        "Actualizado",
        `Estado actualizado correctamente`,
        "success"
      );
    } catch (err) {
      console.error("Error cambiando estado:", err);
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  };

 // Función auxiliar para crear imagen circular
// Función auxiliar para crear imagen circular en alta resolución
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
      resolve(canvas.toDataURL("image/png", 1.0)); // calidad máxima
    };
  });
};


const generarPDF = async (
  compra: ICompras,
  insumos: IInsumos[],
  proveedores: IProveedores[],
  estadosCompra: { IdEstado: number; NombreEstado: string }[],
  buildUrl: (path: string) => string
) => {
  try {
    // 🔽 Cargar detalles de la compra desde API
    const detallesRes = await fetch(buildUrl("Detalles_Compra/Lista"));
    if (!detallesRes.ok) throw new Error("Error al obtener detalles");
    const detallesAll: IDetalleCompra[] = await detallesRes.json();
    const detalles = detallesAll.filter((d) => d.IdCompra === compra.IdCompra);

    const doc = new jsPDF();

    // Logo circular en el centro
    if (logo) {
  const circularLogo = await getCircularImage(logo, 60, 4); // renderiza x4
  doc.addImage(circularLogo, "JPG", 80, 10, 50, 50); // lo insertas reducido
}


    // 🔽 Título
    doc.setFontSize(20);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.text(`Compra #${compra.IdCompra}`, 105, 70, { align: "center" });

    doc.setFontSize(13);
    doc.setTextColor(120);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte de compra", 105, 80, { align: "center" });
    doc.line(20, 85, 190, 85);

    // 🔽 Datos principales
    const proveedor =
      proveedores.find((p) => p.IdProveedor === compra.IdProveedor)?.NombreCompleto ||
      "Desconocido";

    const estadoObj = estadosCompra.find((e) => e.IdEstado === compra.IdEstado);
    const nombreEstado = estadoObj ? estadoObj.NombreEstado : "Desconocido";

    const labels: [string, string][] = [
      ["Proveedor", proveedor],
      ["Método de Pago", compra.MetodoPago ?? "N/A"],
      ["Fecha", new Date(compra.FechaCompra).toLocaleDateString("es-CO")],
      ["Estado", nombreEstado],
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

    // 🔽 Tabla de detalles
    autoTable(doc, {
      startY: y + 10,
      head: [["Insumo", "Cantidad", "Precio Unitario", "Subtotal"]],
      body: detalles.map((d) => [
        insumos.find((i) => i.IdInsumo === d.IdInsumo)?.Nombre ||
          `Insumo ${d.IdInsumo}`,
        d.Cantidad,
        `$${d.PrecioUnitario.toLocaleString("es-CO")}`,
        `$${d.Subtotal.toLocaleString("es-CO")}`,
      ]),
      styles: { halign: "center", fontSize: 10 },
      headStyles: { fillColor: [255, 182, 193], textColor: 40 }, // 🌸 Rosa pastel
      alternateRowStyles: { fillColor: [250, 250, 250] },
    });

    // 🔽 Totales
    const finalY = (doc as any).lastAutoTable?.finalY ?? y + 20;
    const subtotal = compra.Total / 1.19;
    const iva = compra.Total - subtotal;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50);

    let totalesY = finalY + 15;
    doc.text(`Subtotal: $${subtotal.toLocaleString("es-CO")}`, 140, totalesY);
    doc.text(`IVA (19%): $${iva.toLocaleString("es-CO")}`, 140, totalesY + 10);

    doc.setFontSize(14);
    doc.setTextColor(200, 50, 100);
    doc.text(`TOTAL: $${compra.Total.toLocaleString("es-CO")}`, 140, totalesY + 22);

    // Guardar
    doc.save(`Compra-${compra.IdCompra}.pdf`);
  } catch (err) {
    console.error("Error generando PDF:", err);
    Swal.fire("Error", "No se pudo generar el PDF de la compra", "error");
  }
};



  // --- Filtrar ---
  const comprasFiltradas = compras.filter((c) => {
    const proveedor =
      proveedores.find((p) => p.IdProveedor === c.IdProveedor)?.NombreCompleto ||
      "";
    const estadoObj = estadosCompra.find((e) => e.IdEstado === c.IdEstado);
    const nombreEstado = estadoObj ? estadoObj.NombreEstado.toLowerCase() : "";
    return (
      proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.MetodoPago.toLowerCase().includes(busqueda.toLowerCase()) ||
      new Date(c.FechaCompra).toLocaleDateString().includes(busqueda) ||
      nombreEstado.includes(busqueda.toLowerCase())
    );
  });

  const indexInicio = (paginaActual - 1) * COMPRAS_POR_PAGINA;
  const comprasPagina = comprasFiltradas.slice(
    indexInicio,
    indexInicio + COMPRAS_POR_PAGINA
  );
  const totalPaginas = Math.max(
    1,
    Math.ceil(comprasFiltradas.length / COMPRAS_POR_PAGINA)
  );

  return (
    <div className="container-fluid main-content">
      {mostrarCrear ? (
        <CrearCompra
          onClose={() => setMostrarCrear(false)}
          onCrear={() => {
            cargarDatos();
            cargarEstados();
          }}
        />
      ) : mostrarVer && compraSeleccionada ? (
        <VerCompra
          compra={compraSeleccionada}
          proveedores={proveedores}
          insumos={insumos}
          detalles={compraSeleccionada.Detalle}
          onClose={() => setMostrarVer(false)}
        />
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="titulo">Compras Registradas</h2>
            <button className="btn btn-pink" onClick={() => setMostrarCrear(true)}>
              Crear Compra
            </button>
          </div>

          <input
            type="text"
            placeholder="Buscar por proveedor, método, fecha o estado"
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
                  <th>Proveedor</th>
                  <th>Método</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {comprasPagina.map((c, index) => {
                  const proveedor =
                    proveedores.find((p) => p.IdProveedor === c.IdProveedor)
                      ?.NombreCompleto || "Desconocido";

                  const estadoObj = estadosCompra.find(
                    (e) => e.IdEstado === c.IdEstado
                  );
                  const nombreEstado = estadoObj
                    ? estadoObj.NombreEstado
                    : "Desconocido";

                  return (
                    <tr
                      key={c.IdCompra}
                      className={index % 2 === 0 ? "fila-par" : "fila-impar"}
                    >
                      <td>{proveedor}</td>
                      <td>{c.MetodoPago}</td>
                      <td>{new Date(c.FechaCompra).toLocaleDateString()}</td>
                     <td>{c.Total.toLocaleString()}</td>
<td>
  {nombreEstado === "Anulada" || nombreEstado === "Recibida" ? (
    <select
      className={`form-select estado-select ${getColorClaseEstadoCompra(
        nombreEstado
      )}`}
      value={nombreEstado}
      disabled
    >
      <option value={nombreEstado}>{nombreEstado}</option>
    </select>
  ) : (
    <select
      className={`form-select estado-select ${getColorClaseEstadoCompra(
        nombreEstado
      )}`}
      value={nombreEstado}
      onChange={(e) => cambiarEstado(c, e.target.value)}
    >
      {estadosCompra
        .filter((e) => e.NombreEstado !== "Anulada") // no mostrar anulada como opción
        .map((e) => (
          <option key={e.IdEstado} value={e.NombreEstado}>
            {e.NombreEstado}
          </option>
        ))}
    </select>
  )}
</td>

                      <td>
                        <FaEye
                          className="icono text-info me-2"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleVerCompra(c)}
                          title="Ver compra"
                        />

                        <FaBan
  className={`icono me-2 ${
    nombreEstado === "Anulada" || nombreEstado === "Recibida"
      ? "text-dark"
      : "text-warning"
  }`}
  style={{
    cursor:
      nombreEstado === "Anulada" || nombreEstado === "Recibida"
        ? "not-allowed"
        : "pointer",
  }}
  onClick={() =>
    nombreEstado !== "Anulada" &&
    nombreEstado !== "Recibida" &&
    confirmarAnulacion(c)
  }
  title={
    nombreEstado === "Anulada"
      ? "Ya está anulado"
      : nombreEstado === "Recibida"
      ? "No se puede anular"
      : "Anular compra"
  }
/>


                       <FaFilePdf
  className="icono text-danger"
  style={{ cursor: "pointer" }}
  title="Generar PDF"
  onClick={() =>
    generarPDF(c, insumos, proveedores, estadosCompra, buildUrl)
  }
/>


                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* 🔽 Paginación */}
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
        </>
      )}
    </div>
  );
};

export default ListarCompras;
