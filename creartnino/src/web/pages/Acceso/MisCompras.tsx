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
  
  const [mostrarSoloModificados, setMostrarSoloModificados] = useState(false);

  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);
  // 🔹 Estado global para guardar el mapa de imágenes
const [, setImagenes] = useState<string[]>([]);
const [, setImagenUrl] = useState("/placeholder.png");
const [imagenesMap, setImagenesMap] = useState<Record<number, string>>({});

// 🔹 Cargar todas las imágenes solo una vez
useEffect(() => {
  const cargarImagenes = async () => {
    try {
      const resp = await fetch("https://www.apicreartnino.somee.com/api/Imagenes_Productos/Lista");
      if (!resp.ok) throw new Error("No se pudieron cargar las imágenes");
      const data: any[] = await resp.json();

      // Crear mapa: { IdImagen: URLCompleta }
      const mapa: Record<number, string> = {};
      data.forEach((img) => {
        const id = Number(img.IdImagen);
        const url = img.Url.startsWith("http")
          ? img.Url
          : `https://www.apicreartnino.somee.com/${img.Url}`;
        mapa[id] = url;
      });

      setImagenesMap(mapa);
    } catch (err) {
      console.error("❌ Error al cargar imágenes:", err);
    }
  };

  cargarImagenes();
}, []);

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

    // 🧩 Map estados
    const eMap: Record<number, any> = {};
    (Array.isArray(estData) ? estData : []).forEach((e: any) => {
      const k = getKeyFrom(e, ['IdEstadoPedidos', 'IdEstado', 'idEstado', 'id']);
      if (k) eMap[k] = e;
    });
    setEstadosMap(eMap);

    // 🧩 Map productos (solo primera imagen válida)
    const pMap: Record<number, any> = {};
    (Array.isArray(prodData) ? prodData : []).forEach((p: any) => {
      const k = getKeyFrom(p, ['IdProducto', 'idProducto', 'id']);
      if (!k) return;

      let imagenFinal = '/placeholder.png';

      if (p.Imagen && typeof p.Imagen === 'string') {
  const partes = p.Imagen.split('|||').map((x: string) => x.trim());
  const valida = partes.find(
    (url: string) => url.startsWith('http') && url.includes('cloudinary')
  );
  if (valida) imagenFinal = valida;
}


      pMap[k] = {
        ...p,
        ImagenUrl: imagenFinal, // 👈 usamos esta propiedad para mostrar la imagen
      };
    });
    setProductosMap(pMap);

    // 🚀 Cruzar pedidos con sus detalles
    const pedidosConDetalles = (Array.isArray(pedData) ? pedData : []).map((p: any) => {
      const idPedido = Number(p.IdPedido ?? p.idPedido ?? 0);
      const detalles = (detData || []).filter(
        (d: any) => Number(d.IdPedido ?? d.idPedido ?? 0) === idPedido
      );
      return { ...p, detalles };
    });

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

  useEffect(() => {
  if (!pedidos || pedidos.length === 0) return;

  // 🔹 Solo pedidos con estado 1 o 2
  const pedidosFiltrados = pedidos.filter(
    (p) => p.IdEstado === 1 || p.IdEstado === 2
  );

  // 🔹 Detectar los modificados (total > inicial + restante)
  const modificados = pedidosFiltrados.filter((p) => {
    const inicial = Number(p.ValorInicial ?? p.valorInicial ?? 0);
    const restante = Number(p.ValorRestante ?? p.valorRestante ?? 0);
    const total = Number(p.TotalPedido ?? p.totalPedido ?? 0);
    return total > inicial + restante;
  });

  if (modificados.length === 0) return;

  // 🔹 Recuperar los IDs que ya se mostraron antes
  const vistos = JSON.parse(localStorage.getItem("pedidosModificadosMostrados") || "[]");

  // 🔹 Filtrar los nuevos modificados (no vistos antes)
  const nuevos = modificados.filter(
    (p) => !vistos.includes(p.IdPedido ?? p.idPedido)
  );

  if (nuevos.length === 0) return; // No hay nuevos, no mostrar alerta

  // 🔹 Actualizar localStorage con todos los modificados vistos
  const nuevosIds = modificados.map((p) => p.IdPedido ?? p.idPedido);
  localStorage.setItem("pedidosModificadosMostrados", JSON.stringify(nuevosIds));

  // 🔹 Crear lista de todos los modificados (no solo los nuevos)
  const listaHtml = modificados
    .map((p) => {
      const id = p.IdPedido ?? p.idPedido;
      const fechaPedido = p.FechaPedido
        ? new Date(p.FechaPedido).toLocaleDateString()
        : "-";
      const fechaEntrega = p.FechaEntrega
        ? new Date(p.FechaEntrega).toLocaleDateString()
        : "Pendiente";
      const inicial = Number(p.ValorInicial ?? p.valorInicial ?? 0);
      const restante = Number(p.ValorRestante ?? p.valorRestante ?? 0);
      const total = Number(p.TotalPedido ?? p.totalPedido ?? 0);
      const excedente = total - (inicial + restante);

      return `
        <li style="margin-bottom:6px">
          <strong>Pedido #${id}</strong> del ${fechaPedido}, entrega ${fechaEntrega}<br/>
          <span style="color:#666">Excedente: <strong>$${excedente.toLocaleString()}</strong> → Nuevo total: <strong>$${total.toLocaleString()}</strong></span>
        </li>`;
    })
    .join("");

  // 🔹 Mostrar alerta con lista completa
  MySwal.fire({
    title: "🔔 Actualización en tus pedidos",
    html: `
      <div style="text-align:left; font-size:16px;">
        <p>Se detectaron ${modificados.length} pedido(s) ajustado(s):</p>
        <ul style="padding-left:20px; margin-top:8px">${listaHtml}</ul>
        <hr/>
        <div style="text-align:center; margin-top:10px;">
          <button id="btnFiltrarModificados"
            style="background:#d14fa2; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;">
            🔍 Filtrar pedidos modificados
          </button>
        </div>
      </div>
    `,
    showConfirmButton: false,
    background: "#fff8fc",
    color: "#333",
    didOpen: () => {
      document
        .getElementById("btnFiltrarModificados")
        ?.addEventListener("click", () => {
          setMostrarSoloModificados(true);
          MySwal.close();
        });
    },
  });
}, [pedidos]);



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

  const pedidosModificados = useMemo(() => {
  return pedidosFiltrados.filter((p) => {
    const inicial = Number(p.ValorInicial ?? p.valorInicial ?? 0);
    const restante = Number(p.ValorRestante ?? p.valorRestante ?? 0);
    const total = Number(p.TotalPedido ?? p.totalPedido ?? 0);
    return total > (inicial + restante);
  });
}, [pedidosFiltrados]);


  // 🔹 Calcular total de páginas según la lista que realmente se muestra


  // 🔹 Determinar la lista que se está mostrando
// 🔹 Determinar la lista que se está mostrando
const listaFinal = mostrarSoloModificados ? pedidosModificados : pedidosFiltrados;

// 🔹 Calcular total de páginas (mínimo 1)
const totalPaginas = Math.max(1, Math.ceil(listaFinal.length / ITEMS_POR_PAGINA));

// 🔹 Obtener los pedidos a mostrar en la página actual
const pedidosPaginados = listaFinal.slice(
  (pagina - 1) * ITEMS_POR_PAGINA,
  pagina * ITEMS_POR_PAGINA
);

// 🔹 Si cambian los datos o el filtro, y la página actual se sale del rango, volver a la 1
useEffect(() => {
  if (pagina > totalPaginas) {
    setPagina(1);
  }
}, [listaFinal, totalPaginas]);


  
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

  // 🔹 Reinicia la paginación cuando cambia el filtro de modificados
useEffect(() => {
  setPagina(1);
}, [mostrarSoloModificados]);


const mostrarDetalleProducto = async (idPedido: number, descripcionPedido: string) => {
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
      const nombre = producto.Nombre ?? producto.nombre ?? d.Nombre ?? `#${idProd}`;
      const precio = Number(producto.Precio ?? producto.precio ?? d.Precio ?? 0);
      const cantidad = Number(d.Cantidad ?? d.cantidad ?? 1);
      const subtotal = precio * cantidad;
      total += subtotal;

      // 🩷 Buscar descripción real del producto dentro del texto completo del pedido
      let descripcionFinal = "Sin personalización disponible.";

if (descripcionPedido) {
  const descCompleta = descripcionPedido.trim();

  // 🏬 Si es un pedido hecho desde el administrador (una sola palabra o texto corto)
  if (!descCompleta.includes("(") && !descCompleta.includes("-") && descCompleta.length <= 50) {
    descripcionFinal = `
      <div style='text-align:left;'>
        <div style='font-weight:600; color:#b73a93; margin-bottom:5px;'>🏬 Este pedido fue realizado desde administrador.</div>
        <div style='margin-bottom:8px;'>Realizaste este pedido en el punto físico de la empresa.</div>
        <div style='font-weight:600; color:#b73a93; margin-top:10px;'>🖌 Esto fue lo que personalizaste:</div>
        <div style='background:#fff; padding:8px 10px; border-radius:6px; border:1px solid #eee;'>${descCompleta}</div>
      </div>
    `;
  } else {
    // 📱 Si el pedido viene desde la app móvil
    if (descCompleta.toLowerCase().includes("app móvil")) {
      const regexProducto = new RegExp(`${nombre}\\s*\\([^)]*\\)\\s*-\\s*([^,\n]+)`, "i");
      const match = descCompleta.match(regexProducto);

      if (match) {
        const texto = match[1].trim();

        if (texto.includes("Sin personalización")) {
          descripcionFinal = "Este producto no lo personalizaste.";
        } else if (texto.startsWith('"') && texto.endsWith('"')) {
          descripcionFinal = texto.slice(1, -1);
        } else {
          descripcionFinal = texto;
        }

        // Agregar mensaje informativo
        descripcionFinal = `
          <div style='text-align:left;'>
            <div style='font-weight:600; color:#b73a93; margin-top:10px;'>🖌 Personalización del producto:</div>
            <div style='background:#fff; padding:8px 10px; border-radius:6px; border:1px solid #eee;'>${descripcionFinal}</div>
          </div>
        `;
      }
    } else {
      // 🔍 Buscar bloque que corresponde a este producto (pedidos hechos desde la web)
      const regexProducto = new RegExp(`${nombre}\\s*\\([^)]*\\)\\s*-\\s*([^,\n]+)`, "i");
      const match = descCompleta.match(regexProducto);

      if (match) {
        const texto = match[1].trim();

        // 🎨 Nuevo formato de personalización con varios campos
        if (texto.includes("Nombres personalizados:")) {
          const partes = texto.split("|").map((p) => p.trim());
          let htmlTabla = `
            <table style="width:100%; border-collapse:collapse; font-size:14px;">
              <tbody>
          `;

          partes.forEach((parte) => {
            const [campoRaw, valorRaw] = parte.split(":").map((x: string) => x?.trim() || "");
            if (!campoRaw || !valorRaw) return;

            let valorHtml = valorRaw;

            // 🎨 Mostrar colores
            if (campoRaw.toLowerCase().includes("color")) {
              const colores = valorRaw.split("-").map((c: string) => c.trim());
              valorHtml = colores
                .map(
                  (c: string) =>
                    `<span style="display:inline-block;width:20px;height:20px;background:${c};border-radius:4px;border:1px solid #ccc;margin-right:6px;" title="${c}"></span>`
                )
                .join("");
            }

            // 🖼️ Mostrar imágenes
            else if (campoRaw.toLowerCase().includes("imagen")) {
              const urls = valorRaw.split("-").map((u: string) => u.trim());
              valorHtml = urls
                .map(
                  (url: string) =>
                    `<img src="${url}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;border:1px solid #eee;margin-right:6px;" />`
                )
                .join("");
            }

            htmlTabla += `
              <tr>
                <td style="padding:6px 4px; font-weight:600; color:#b73a93; width:45%;">${campoRaw}</td>
                <td style="padding:6px 4px;">${valorHtml}</td>
              </tr>
            `;
          });

          htmlTabla += `
              </tbody>
            </table>
          `;

          descripcionFinal = `
            <div style='text-align:left;'>
              <div style='font-weight:600; color:#b73a93; margin-top:10px;'>🖌 Personalización del producto:</div>
              <div style='background:#fff; padding:10px 12px; border-radius:8px; border:1px solid #eee;'>${htmlTabla}</div>
            </div>
          `;
        } else if (texto.includes("Sin personalización")) {
          descripcionFinal = "Este producto no lo personalizaste.";
        } else {
          descripcionFinal = texto;
        }
      }
    }
  }
}



     let urlImagen = "/placeholder.png";

if (producto.Imagen && imagenesMap[producto.Imagen]) {
  urlImagen = imagenesMap[producto.Imagen];
}

// 🧠 Si la cadena tiene múltiples URLs separadas por "|||", tomar la primera válida
if (urlImagen.includes("|||")) {
  urlImagen = urlImagen.split("|||")[0].trim();
}

// ✅ Aplicar valores finales
setImagenes([urlImagen]);
setImagenUrl(urlImagen);


      // 🩷 Construir fila HTML
      return `
        <div style="margin-bottom:12px; padding:0.5rem; border-radius:8px; background:#fff; display:flex; align-items:center; justify-content:space-between; gap:10px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${urlImagen}" alt="${nombre}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; border:1px solid #eee;" />
            <div>
              <div style="font-weight:600">${nombre}</div>
              <div>Cantidad: ${cantidad}</div>
              <div>Precio unit.: $${precio.toLocaleString()}</div>
              <div>Subtotal: $${subtotal.toLocaleString()}</div>
            </div>
          </div>
          <div 
            class="ver-descripcion"
            data-nombre="${encodeURIComponent(nombre)}"
            data-descripcion="${encodeURIComponent(descripcionFinal)}"
            style="cursor:pointer; font-size:20px; color:#b73a93;"
            title="Ver personalización del producto"
          >
            👁‍🗨
          </div>
        </div>
      `;
    })
  );

  // 🩷 Modal principal
  MySwal.fire({
    title: `<div style="font-size:1.15rem; color:#b73a93;">🧸 Detalle del pedido</div>`,
    html: `
      <div id="detalle-pedido" style="text-align:left;">
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
    didOpen: () => {
      document.querySelectorAll(".ver-descripcion").forEach((el) => {
        el.addEventListener("click", async () => {
          const nombre = decodeURIComponent(el.getAttribute("data-nombre") || "");
          const descripcion = decodeURIComponent(el.getAttribute("data-descripcion") || "");

          await MySwal.fire({
            title: `<div style='color:#b73a93;'>🖌 Personalización</div>`,
            html: `
              <div style='font-size:16px; font-weight:600; margin-bottom:5px; color:#b73a93;'>${nombre}</div>
              <div style='text-align:left; font-size:15px;'>${descripcion}</div>`,
            confirmButtonText: "Cerrar",
            confirmButtonColor: "#d14fa2",
            background: "#fff8fc",
            width: 450,
          });
        });
      });
    },
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
    case 1007: return 'estado estado-pedido-pagado';
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
      <div style={{ marginBottom: "10px" }}>
  <button
    className="boton-filtrar-modificados"
    onClick={() => setMostrarSoloModificados(!mostrarSoloModificados)}
    style={{
      backgroundColor: mostrarSoloModificados ? "#f7b8e4" : "#d14fa2",
      color: "#fff",
      border: "none",
      padding: "8px 14px",
      borderRadius: "8px",
      cursor: "pointer",
      marginLeft: "10px",
      transition: "all 0.3s ease",
    }}
  >
    {mostrarSoloModificados
      ? "🔁 Ver todos los pedidos"
      : "🔍 Ver pedidos modificados"}
  </button>

  {/* 🔹 Mostrar mensaje si no hay pedidos modificados */}
  {mostrarSoloModificados && pedidos.filter((p) => {
      const inicial = Number(p.ValorInicial ?? p.valorInicial ?? 0);
      const restante = Number(p.ValorRestante ?? p.valorRestante ?? 0);
      const total = Number(p.TotalPedido ?? p.totalPedido ?? 0);
      return total > (inicial + restante);
    }).length === 0 && (
      <p
        style={{
          marginTop: "10px",
          fontSize: "15px",
          color: "#888",
          background: "#fff8fc",
          padding: "10px 15px",
          borderRadius: "8px",
          border: "1px solid #f3cce6",
          display: "inline-block",
        }}
      >
        ❌ No hay pedidos modificados
      </p>
    )}
</div>

      {/* pedidos */}
      {pedidosPaginados.length === 0 ? (
        <p style={{ textAlign: 'center', fontWeight: 500 }}>
          😕 No hay pedidos .
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
                <div className="card-info"><br />
                  <div>
                    <FaCalendarAlt style={{ color: "#cd3e3eff" }}/> <strong>Numero de pedido:</strong>{' #'}
                    {p.IdPedido ?? p.IdPedido ?? '-'}
                  </div>
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
                  {/* 💰 Valores del pedido */}
<div>
  <FaMoneyBillWave style={{ color: "#bd5baaff" }} /> <strong>Inicial:</strong> $
  {Number(p.ValorInicial ?? p.valorInicial ?? 0).toLocaleString()}
</div>

{(() => {
  const inicial = Number(p.ValorInicial ?? p.valorInicial ?? 0);
  const restante = Number(p.ValorRestante ?? p.valorRestante ?? 0);
  const total = Number(p.TotalPedido ?? p.totalPedido ?? 0);
  const totalOriginal = inicial + restante;

  // 🟢 Si fue modificado, mostramos nuevo restante y omitimos el original
  if (total > totalOriginal) {
    const excedente = total - totalOriginal;
    const nuevoRestante = restante + excedente;
    return (
      <div
        style={{
          marginTop: "4px",
          color: "#000000ff",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <FaMoneyBillWave style={{ color: "#fc4783ff" }} /> <strong>Nuevo restante:</strong> ${nuevoRestante.toLocaleString()}
      </div>
    );
  }

  // 🩵 Si no fue modificado, mostramos el restante original
  return (
    <div>
      <FaMoneyBillWave style={{ color: "#5baebdff" }} /> <strong>Restante:</strong> $
      {restante.toLocaleString()}
    </div>
  );
})()}

<div>
  <FaMoneyBillWave style={{ color: "#28a745" }} /> <strong>Total:</strong> $
  {Number(p.TotalPedido ?? p.totalPedido ?? 0).toLocaleString()}
</div>

                </div>

                <div>
  <div>
    <FaBoxOpen  style={{ color: "#17b3a9ff" }}/> Productos:
  </div>
  <ul className="lista-productos">
    <li>
      En este pedido hay {(p.detalles ?? []).length} productos.
      <FaEye
        className="icono-ojo"
        title="Ver detalle"
        onClick={() => mostrarDetalleProducto(idPedido, p.Descripcion ?? p.descripcion ?? '')}
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

{/* 🔹 Mostrar la paginación solo si hay más de una página */}
{totalPaginas > 1 ? (
  <div className="paginacion pastel-paginacion">
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

) : null}

    </div>
  );
};

export default MisCompras;