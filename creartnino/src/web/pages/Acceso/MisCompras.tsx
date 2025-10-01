// src/pages/MisCompras.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext'; // Ajusta la ruta si hace falta
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaTimes,
  FaBoxOpen,
  FaEye,
} from 'react-icons/fa';
import '../../styles/miscompras.css';

const MySwal = withReactContent(Swal);
const ITEMS_POR_PAGINA = 6;

const MisCompras: React.FC = () => {
  const { usuario } = useAuth(); // Se espera que tenga NumDocumento
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [estadosMap, setEstadosMap] = useState<Record<number, any>>({});
  const [productosMap, setProductosMap] = useState<Record<number, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [noEsCliente, setNoEsCliente] = useState(false);
  

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);
  // 🟢 Mantenemos en memoria las imágenes


// 🔹 Cargar imágenes una sola vez



  /** =====================
   * HELPERS
   ====================== */
  const getKeyFrom = (obj: any, keys: string[]) => {
    for (const k of keys) {
      const val = obj?.[k];
      if (val !== undefined && val !== null) {
        const n = Number(val);
        if (!Number.isNaN(n)) return n;
      }
    }
    return 0;
  };

  const normalizeClients = (list: any[]) =>
    (list || []).map((c: any) => ({
      IdCliente: c.IdCliente ?? c.idCliente ?? c.Id ?? c.id,
      NumDocumento: String(
        c.NumDocumento ?? c.numDocumento ?? c.NumIdentificacion ?? ''
      ).trim(),
      raw: c,
    }));

  const findClient = (documento: string, normalized: any[]) =>
    normalized.find((c: any) => c.NumDocumento === documento)?.raw;

  /** =====================
   * FETCH DATA
   ====================== */
  const fetchAll = useCallback(async () => {
  setIsLoading(true);
  setNoEsCliente(false);
  try {
    const [pedRes, cliRes, estRes, prodRes, detRes] = await Promise.all([
      fetch('https://www.apicreartnino.somee.com/api/Pedidos/Lista'),
      fetch('https://www.apicreartnino.somee.com/api/Clientes/Lista'),
      fetch('https://www.apicreartnino.somee.com/api/Estados_Pedido/Lista'),
      fetch('https://www.apicreartnino.somee.com/api/Productos/Lista'),
      fetch('https://www.apicreartnino.somee.com/api/Detalles_Pedido/Lista'),
    ]);

    if (!pedRes.ok || !cliRes.ok || !estRes.ok || !prodRes.ok || !detRes.ok) {
      throw new Error('Error al obtener datos de la API');
    }

    const [pedData, cliData, estData, prodData, detData] = await Promise.all([
      pedRes.json(),
      cliRes.json(),
      estRes.json(),
      prodRes.json(),
      detRes.json(),
    ]);

    // Map estados
    const eMap: Record<number, any> = {};
    (Array.isArray(estData) ? estData : []).forEach((e: any) => {
      const k = getKeyFrom(e, [
        'IdEstadoPedidos',
        'IdEstado',
        'idEstado',
        'id',
      ]);
      if (k) eMap[k] = e;
    });
    setEstadosMap(eMap);

    // Map productos
    const pMap: Record<number, any> = {};
    (Array.isArray(prodData) ? prodData : []).forEach((p: any) => {
      const k = getKeyFrom(p, ['IdProducto', 'idProducto', 'id']);
      if (k) pMap[k] = p;
    });
    setProductosMap(pMap);

    // 🚀 Cruzar pedidos con sus detalles
    const pedidosConDetalles = (Array.isArray(pedData) ? pedData : []).map(
      (p: any) => {
        const idPedido = Number(p.IdPedido ?? p.idPedido ?? 0);
        const detalles = (detData || []).filter(
          (d: any) => Number(d.IdPedido ?? d.idPedido ?? 0) === idPedido
        );
        return { ...p, detalles };
      }
    );

    setPedidos(pedidosConDetalles);
    setClientes(Array.isArray(cliData) ? cliData : []);
  } catch (err) {
    console.error('Error cargando datos:', err);
  } finally {
    setIsLoading(false);
  }
}, []);


  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /** =====================
   * LOGICA DE NEGOCIO
   ====================== */
  const pedidosDelCliente = useMemo(() => {
    if (!usuario?.NumDocumento) return [];

    const cliente = findClient(
      String(usuario.NumDocumento).trim(),
      normalizeClients(clientes)
    );

    if (!cliente) {
      setNoEsCliente(true);
      return [];
    }

    setNoEsCliente(false);
    const idCliente = Number(
      cliente.IdCliente ?? cliente.idCliente ?? cliente.Id ?? 0
    );

    return (pedidos || []).filter(
      (p: any) => Number(p.IdCliente ?? p.idCliente ?? 0) === idCliente
    );
  }, [pedidos, clientes, usuario]);

  const pedidosFiltrados = useMemo(() => {
    const list = (pedidosDelCliente || []).filter((p: any) => {
      if (!desde && !hasta) return true;
      const fechaStr =
        p.FechaPedido ?? p.fechaPedido ?? p.fecha ?? null;
      const fecha = fechaStr ? new Date(fechaStr).getTime() : 0;
      const desdeDate = desde ? new Date(desde).getTime() : 0;
      const hastaDate = hasta
        ? new Date(hasta).getTime() + 86400000
        : Infinity;
      return fecha >= desdeDate && fecha <= hastaDate;
    });

    return list.sort(
  (a: any, b: any) =>
    Number(b.IdPedido ?? b.idPedido ?? 0) -
    Number(a.IdPedido ?? a.idPedido ?? 0)
);
  }, [pedidosDelCliente, desde, hasta]);

  const totalPaginas = Math.max(
    1,
    Math.ceil((pedidosFiltrados.length || 0) / ITEMS_POR_PAGINA)
  );
  const pedidosPaginados = pedidosFiltrados.slice(
    (pagina - 1) * ITEMS_POR_PAGINA,
    pagina * ITEMS_POR_PAGINA
  );

  const limpiarFiltro = () => {
    setDesde('');
    setHasta('');
    setPagina(1);
  };

  /** =====================
   * DETALLES Y ACCIONES
   ====================== */
  const fetchDetalles = async (idPedido: number): Promise<any[]> => {
    try {
      const res = await fetch(
        'https://www.apicreartnino.somee.com/api/Detalles_Pedido/Lista'
      );
      if (!res.ok) return [];
      const data = await res.json();
      return (data || []).filter(
        (d: any) =>
          Number(d.IdPedido ?? d.idPedido ?? 0) === Number(idPedido)
      );
    } catch {
      return [];
    }
  };

const mostrarDetalleProducto = async (idPedido: number) => {
  const detalles = await fetchDetalles(idPedido);
  if (!detalles.length) {
    MySwal.fire({
      title: "Detalle",
      html: `<div>No hay detalles del pedido.</div>`,
      background: "#fff8fc",
      confirmButtonText: "Cerrar",
      confirmButtonColor: "#d14fa2",
    });
    return;
  }

  let total = 0;
  const rowsHtml = await Promise.all(
    detalles.map(async (d: any) => {
      const idProd = Number(d.IdProducto ?? d.idProducto ?? 0);
      const producto = productosMap[idProd] ?? {};
      const nombre =
        producto.Nombre ?? producto.nombre ?? d.Nombre ?? `#${idProd}`;
      const precio = Number(
        producto.Precio ?? producto.precio ?? d.Precio ?? 0
      );
      const cantidad = Number(d.Cantidad ?? d.cantidad ?? 1);
      const subtotal = precio * cantidad;
      total += subtotal;

      // 🔑 Buscar imagen: el producto tiene un campo Imagen que apunta a un IdImagen
      let urlImagen = "/placeholder.png";
      try {
        if (producto.Imagen) {
          const resp = await fetch(
            "https://www.apicreartnino.somee.com/api/Imagenes_Productos/Lista"
          );
          if (resp.ok) {
            const data: any[] = await resp.json();
            const idImagen = Number(producto.Imagen);
            const img = data.find((img) => img.IdImagen === idImagen);
            if (img) {
              urlImagen = img.Url.startsWith("http")
                ? img.Url
                : `https://www.apicreartnino.somee.com/${img.Url}`;
            }
          }
        }
      } catch (e) {
        console.error("❌ Error cargando imagen:", e);
      }

      return `
        <div style="margin-bottom:12px; padding:0.5rem; border-radius:8px; background:#fff; display:flex; align-items:center; gap:10px;">
          <img src="${urlImagen}" alt="${nombre}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; border:1px solid #eee;" />
          <div>
            <div style="font-weight:600">${nombre}</div>
            <div>Cantidad: ${cantidad}</div>
            <div>Precio unit.: $${precio.toLocaleString()}</div>
            <div>Subtotal: $${subtotal.toLocaleString()}</div>
          </div>
        </div>
      `;
    })
  );

  MySwal.fire({
    title: `<div style="font-size:1.15rem; color:#b73a93;">🧸 Detalle del pedido</div>`,
    html: `
      <div style="text-align:left;">
        ${rowsHtml.join("")}
        <hr style="margin: 10px 0"/>
        <div style="font-size:1.1rem; font-weight:bold;">
          💰 Total del pedido: $${total.toLocaleString()}
        </div>
      </div>
    `,
    background: "#fff8fc",
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#d14fa2",
    width: 500,
  });
};



  const anularPedido = async (idPedido: number) => {
  const confirm = await Swal.fire({
    title: "Confirmar anulación",
    text: "¿Estás seguro de que deseas anular este pedido?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#aaa",
    confirmButtonText: "Anular",
  });

  if (!confirm.isConfirmed) return;

  const pedido = pedidos.find(
    (p) => Number(p.IdPedido ?? p.idPedido ?? 0) === Number(idPedido)
  );
  if (!pedido) {
    Swal.fire("Error", "Pedido no encontrado.", "error");
    return;
  }

  const body = {
    idPedido: pedido.IdPedido ?? pedido.idPedido,
    idCliente: pedido.IdCliente ?? pedido.idCliente,
    metodoPago: pedido.MetodoPago ?? pedido.metodoPago ?? null,
    fechaPedido: pedido.FechaPedido ?? pedido.fechaPedido ?? null,
    fechaEntrega: pedido.FechaEntrega ?? pedido.fechaEntrega ?? null,
    descripcion: pedido.Descripcion ?? pedido.descripcion ?? "",
    valorInicial: pedido.ValorInicial ?? pedido.valorInicial ?? 0,
    valorRestante: pedido.ValorRestante ?? pedido.valorRestante ?? 0,
    totalPedido: pedido.TotalPedido ?? pedido.totalPedido ?? 0,
    comprobantePago: pedido.ComprobantePago ?? pedido.comprobantePago ?? null,
    idEstado: 6, // ✅ estado anulado
  };

  try {
    // 1️⃣ Actualizar estado del pedido
    const res = await fetch(
      `https://www.apicreartnino.somee.com/api/Pedidos/Actualizar/${idPedido}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) throw new Error("No se pudo anular");
    
// 2️⃣ Obtener los detalles del pedido (filtrando de la lista)
const rDet = await fetch(
  "https://www.apicreartnino.somee.com/api/Detalles_Pedido/Lista"
);
if (!rDet.ok) throw new Error("No se pudieron obtener los detalles");

const allDetalles = await rDet.json();
const detalles = (allDetalles || []).filter(
  (d: any) => Number(d.IdPedido ?? d.idPedido ?? 0) === Number(idPedido)
);


    // 3️⃣ Aumentar stock de cada producto
    for (const det of detalles) {
      const rProd = await fetch(
        `https://www.apicreartnino.somee.com/api/Productos/Obtener/${det.IdProducto}`
      );
      if (!rProd.ok) continue;

      const producto = await rProd.json();

      const actualizado = {
        IdProducto: producto.IdProducto,
        CategoriaProducto: producto.CategoriaProducto,
        Nombre: producto.Nombre,
        Imagen: producto.Imagen,
        Cantidad: (producto.Cantidad || 0) + (det.Cantidad || 0), // ✅ sumamos stock
        Marca: producto.Marca,
        Precio: producto.Precio,
        Estado: producto.Estado,
      };

      const rUpd = await fetch(
        `https://www.apicreartnino.somee.com/api/Productos/Actualizar/${det.IdProducto}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(actualizado),
        }
      );

      if (!rUpd.ok) {
        console.error(
          "❌ Error al devolver stock del producto",
          det.IdProducto,
          await rUpd.text()
        );
      }
    }

    // 4️⃣ Refrescar lista de pedidos
    await fetchAll();

    Swal.fire("✅ Pedido anulado exitosamente", "Stock devuelto", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("❌ No se pudo anular el pedido", "", "error");
  }
};



  const claseEstado = (p: any) => {
  const idEstado = Number(p.IdEstado ?? p.idEstado ?? p.IdEstadoPedidos ?? 0);

  switch (idEstado) {
    case 1: return 'estado estado-primer-pago';
    case 2: return 'estado estado-en-proceso';
    case 3: return 'estado estado-en-produccion';
    case 4: return 'estado estado-en-proceso-de-entrega';
    case 5: return 'estado estado-entregado';
    case 6: return 'estado estado-anulado';
    case 7: return 'estado estado-venta-directa';
    default: return 'estado estado-otro';
  }
};




  /** =====================
   * RENDER
   ====================== */
  if (isLoading) {
    return (
      <div className="mis-compras-container">
        <h2>
          <FaBoxOpen /> Mis Pedidos
        </h2>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div className="loader">Cargando pedidos...</div>
        </div>
      </div>
    );
  }

  if (noEsCliente) {
    return (
      <div className="mis-compras-container">
        <h2>
          <FaBoxOpen /> Mis Pedidos
        </h2>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <p>📝 No estás registrado como cliente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-compras-container">
      <h2>
        <FaBoxOpen /> Mis Pedidos
      </h2>

      {/* filtros */}
      <div className="filtros-fecha">
        <div className="filtro-grupo">
          Desde:
          <input
            type="date"
            value={desde}
            onChange={(e) => {
              setDesde(e.target.value);
              setPagina(1);
            }}
          />
        </div>
        <div className="filtro-grupo">
          Hasta:
          <input
            type="date"
            value={hasta}
            onChange={(e) => {
              setHasta(e.target.value);
              setPagina(1);
            }}
          />
        </div>
        <button
          className="boton-limpiar"
          onClick={() => {
            limpiarFiltro();
            setPagina(1);
          }}
        >
          <FaTimes /> Limpiar filtro
        </button>
      </div>

      {/* pedidos */}
      {pedidosPaginados.length === 0 ? (
        <p style={{ textAlign: 'center', fontWeight: 500 }}>
          😕 No hay pedidos en ese rango.
        </p>
      ) : (
        <div className="compras-grid">
          {pedidosPaginados.map((p: any) => {
            const idPedido = p.IdPedido ?? p.idPedido;
            
            const idEstado = Number(
              p.IdEstado ?? p.idEstado ?? p.IdEstadoPedidos ?? 0
            );
            const estadoNombre =
              estadosMap[idEstado]?.NombreEstado ??
              estadosMap[idEstado]?.nombre ??
              'Desconocido';

            return (
              <div className="card-compra" key={idPedido}>
                <div className="card-info">
                  <div>
  <FaCalendarAlt style={{ color: "#28a745" }} /> <strong>Pedido:</strong>{" "}
  {p.FechaPedido
    ? new Date(p.FechaPedido ?? p.fechaPedido).toLocaleDateString()
    : "-"}
</div>
                  {/* 🚀 Nueva línea para fecha de entrega */}
<div>
  <FaCalendarAlt style={{ color: "#307ba6ff" }} /> <strong>Entrega:</strong>{" "}
  {p.FechaEntrega
    ? new Date(p.FechaEntrega ?? p.fechaEntrega).toLocaleDateString()
    : "Pendiente"}
</div>
                  <div>
                    <FaCreditCard style={{ color: "#cd3e3eff" }}/> <strong>Método:</strong>{' '}
                    {p.MetodoPago ?? p.metodoPago ?? '-'}
                  </div>
                  <div>
                    <FaMoneyBillWave style={{ color: "#bca650ff" }}/> <strong>Estado:</strong>
                    <span
  className={claseEstado(p)}
  style={{ marginLeft: 8 }}
>
  {estadoNombre}
</span>

                  </div>
                  <div>
                    <FaMoneyBillWave style={{ color: "#bd5baaff" }} /> <strong>Inicial:</strong> $
                    {Number(p.ValorInicial ?? p.valorInicial ?? 0).toLocaleString()}
                  </div>
                  <div>
                    <FaMoneyBillWave style={{ color: "#28a745" }}/> <strong>Total:</strong> $
                    {Number(
                      p.TotalPedido ?? p.totalPedido ?? 0
                    ).toLocaleString()}
                  </div>
                </div>

                <div>
  <div className="titulo-productos">
    <FaBoxOpen  style={{ color: "#17b3a9ff" }}/> Productos:
  </div>
  <ul className="lista-productos">
    <li>
      En este pedido hay {(p.detalles ?? []).length} productos.
      <FaEye
        className="icono-ojo"
        title="Ver detalle"
        onClick={() => mostrarDetalleProducto(idPedido)}
        style={{ cursor: 'pointer', marginLeft: 8, color: '#666' }}
      />
    </li>
  </ul>
</div>


                {![4, 5, 6,7].includes(idEstado) ? (
  <button
    className="btn-anular"
    onClick={() => anularPedido(idPedido)}
  >
    <FaTimes /> Anular pedido
  </button>
) : (
  <span style={{ color: "#999", fontStyle: "italic" }}>
    No se puede anular
  </span>
)}

              </div>
            );
          })}
        </div>
      )}

      {/* paginación */}
{totalPaginas > 1 && (
  <div className="paginacion">
    <button
      disabled={pagina === 1}
      onClick={() => setPagina(pagina - 1)}
    >
      ‹
    </button>
    <span>
      Página {pagina} de {totalPaginas}
    </span>
    <button
      disabled={pagina === totalPaginas}
      onClick={() => setPagina(pagina + 1)}
    >
      ›
    </button>
  </div>
)}
    </div>
  );
};

export default MisCompras;