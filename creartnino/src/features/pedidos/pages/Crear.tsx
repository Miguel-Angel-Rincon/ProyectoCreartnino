import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../styles/acciones.css";
import { FaCalculator, FaWallet, FaCoins, FaTrash } from "react-icons/fa";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type{ IClientes } from "../../interfaces/IClientes";
import type{ IProductos } from "../../interfaces/IProductos";

interface CrearPedidoProps {
  onClose: () => void;
  onCrear: (pedido: any) => void;
}

interface PedidoDetalle {
  idProducto?: number;
  producto: string;
  cantidad: number;
  precio: number;
  subtotal?: number;
}

// ahora solo omite DOMINGOS (day === 0)
const sumarDiasHabiles = (fechaStr: string, diasHabiles: number) => {
  const fecha = new Date(fechaStr);
  let sumados = 0;
  while (sumados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    const dia = fecha.getDay(); // 0 domingo, 6 sabado
    if (dia !== 0) sumados++; // solo omitimos domingo
  }
  return fecha.toISOString().split("T")[0];
};

const formatISO = (d: Date) => d.toISOString().split("T")[0];

const siguienteNoDomingo = (fecha: Date) => {
  const f = new Date(fecha);
  while (f.getDay() === 0) { // 0 = domingo
    f.setDate(f.getDate() + 1);
  }
  return f;
};

const CrearPedido: React.FC<CrearPedidoProps> = ({ onClose, onCrear }) => {
  const [clienteBusqueda, setClienteBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<IClientes | null>(null);
  const [direccionCliente, setDireccionCliente] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [fechaPedido, setFechaPedido] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [comprobantePago, setComprobantePago] = useState<string>("");
  const [detallePedido, setDetallePedido] = useState<PedidoDetalle[]>([]);
  const [productoQuery, setProductoQuery] = useState<string[]>([]);
  const [productosApi, setProductosApi] = useState<IProductos[]>([]);
  const [clientes, setClientes] = useState<IClientes[]>([]);
  const [fechaServidor, setFechaServidor] = useState<string>("");
  const [clienteDocumento, setClienteDocumento] = useState("");


  useEffect(() => {
  const fetchFechaServidor = async () => {
    try {
      // usa APP_SETTINGS.apiUrl (ya lo importaste)
      const res = await fetch(`${APP_SETTINGS.apiUrl}Utilidades/FechaServidor`);
      if (!res.ok) throw new Error("No se pudo obtener la fecha del servidor");
      const data = await res.json();

      // Extraer YYYY-MM-DD
      const fechaSrv = new Date(data.FechaServidor).toISOString().split("T")[0];
      setFechaServidor(fechaSrv);
      setFechaPedido(fechaSrv); // <-- la fecha del pedido es la fecha del servidor (actual)
      setFechaEntrega(sumarDiasHabiles(fechaSrv, 3)); // entrega 3 días hábiles por defecto
    } catch (err) {
      console.error("Error obteniendo fecha del servidor:", err);
      // fallback a la fecha local si falla la API
      const hoy = new Date().toISOString().split("T")[0];
      setFechaServidor(hoy);
      setFechaPedido(hoy);
      setFechaEntrega(sumarDiasHabiles(hoy, 3));
    }
  };

  const fetchProductos = async () => {
    try {
      const res = await fetch("https://apicreartnino.somee.com/api/Productos/Lista");
      const data = await res.json();
      setProductosApi(
        data.map((p: any) => ({
          IdProducto: p.IdProducto,
          Nombre: p.Nombre,
          Precio: p.Precio,
          Cantidad: p.Cantidad ?? 0,
        }))
      );
    } catch (error) {
      console.error("Error al cargar productos", error);
    }
  };

  const fetchClientes = async () => {
    try {
      const res = await fetch("https://apicreartnino.somee.com/api/Clientes/Lista");
      const data = await res.json();
      setClientes(
  data.map((c: any) => ({
    IdCliente: c.IdCliente ?? c.IdClientes ?? c.id ?? 0, // usar siempre IdCliente
    Nombre: c.Nombre ?? "",
    Apellido: c.Apellido ?? "",
    NombreCompleto: c.NombreCompleto ?? `${c.Nombre ?? ""} ${c.Apellido ?? ""}`.trim(),
    Direccion: c.Direccion ?? "",
    NumDocumento: c.NumDocumento ?? "",
    TipoDocumento: c.TipoDocumento ?? "",
  }))
);

    } catch (error) {
      console.error("Error al cargar clientes", error);
      setClientes([]);
    }
  };

  fetchFechaServidor();
  fetchProductos();
  fetchClientes();
}, []);

  const clientesFiltrados = clienteBusqueda
  ? clientes.filter((c) =>
      (c.NombreCompleto?.toLowerCase().includes(clienteBusqueda.toLowerCase()) ||
       c.NumDocumento?.toString().includes(clienteBusqueda))
    )
  : [];

  const handleClienteSeleccionado = (c: IClientes) => {
    setClienteSeleccionado(c);

    setClienteBusqueda(
      c.NombreCompleto 
    );
    setDireccionCliente(c.Direccion);
    setClienteDocumento(`${c.TipoDocumento}: ${c.NumDocumento ?? "N/A"}`);
  };

  const agregarDetalle = () => {
    setDetallePedido([
      ...detallePedido,
      { producto: "", cantidad: 1, precio: 0, subtotal: 0 },
    ]);
    setProductoQuery((prev) => [...prev, ""]);
  };

  const actualizarDetalle = (
  index: number,
  campo: keyof PedidoDetalle,
  valor: string | number
) => {
  const copia = [...detallePedido];
  if (!copia[index]) return;

  // 🧮 Validar y actualizar producto
  if (campo === "producto") {
    const prod = productosApi.find((p) => p.Nombre === valor);
    copia[index].producto = prod?.Nombre || (valor as string);
    copia[index].precio = prod?.Precio ?? copia[index].precio;
    copia[index].idProducto = prod?.IdProducto;
    copia[index].subtotal = copia[index].cantidad * copia[index].precio;
    setProductoQuery((prev) => {
      const copy = [...prev];
      copy[index] = "";
      return copy;
    });
  }

  // 🧮 Validar cantidad (stock y mínimo)
  else if (campo === "cantidad") {
    const cantidad = Number(valor) || 0;
    const prod = productosApi.find((p) => p.IdProducto === copia[index].idProducto);

    if (!prod) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona un producto",
        text: "Debes elegir primero un producto antes de cambiar la cantidad.",
        timer: 1800,
        showConfirmButton: false,
      });
      return;
    }

    // 🚫 Stock insuficiente
    if (cantidad > prod.Cantidad) {
      Swal.fire({
        icon: "warning",
        title: "Stock insuficiente",
        text: `Solo hay ${prod.Cantidad} unidades disponibles de ${prod.Nombre}.`,
        timer: 2500,
        showConfirmButton: false,
      });
      copia[index].cantidad = prod.Cantidad;
    } 
    // 🚫 No permitir cantidad menor a 1
    else if (cantidad < 1) {
      copia[index].cantidad = 1;
    } 
    else {
      copia[index].cantidad = cantidad;
    }

    copia[index].subtotal = copia[index].cantidad * copia[index].precio;
  }

  // 🧮 Validar precio
  else if (campo === "precio") {
    const precio = Number(valor) || 0;
    if (precio > 9999999) {
      Swal.fire({
        icon: "warning",
        title: "Precio no válido",
        text: "El precio no puede tener más de 7 cifras.",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    copia[index].precio = precio;
    copia[index].subtotal = copia[index].cantidad * copia[index].precio;
  }

  setDetallePedido(copia);
};


  const seleccionarProducto = (index: number, nombre: string) => {
  const prod = productosApi.find((p) => p.Nombre === nombre);
  if (!prod) return;

  // 🚫 Validar que el producto no se repita en el pedido
  const yaExiste = detallePedido.some(
    (d, i) => d.idProducto === prod.IdProducto && i !== index
  );

  if (yaExiste) {
    Swal.fire({
      icon: "warning",
      title: "Producto duplicado",
      text: "Este producto ya fue agregado al pedido.",
      timer: 2000,
      showConfirmButton: false,
    });
    return;
  }

  if (prod.Cantidad <= 0) {
  Swal.fire({
    icon: "warning",
    title: "Sin stock",
    text: `El producto "${prod.Nombre}" no tiene unidades disponibles.`,
    timer: 2000,
    showConfirmButton: false,
  });
  return;
}
  // ✅ Si pasa la validación, actualizar normalmente
  actualizarDetalle(index, "producto", prod.Nombre);

  // 🔹 Limpiar el campo de búsqueda del producto
  setProductoQuery((prev) => {
    const copia = [...prev];
    copia[index] = "";
    return copia;
  });
};

  const handleProductoQueryChange = (index: number, value: string) => {
    setProductoQuery((prev) => {
      const copia = [...prev];
      copia[index] = value;
      return copia;
    });
    setDetallePedido((prev) => {
      const copia = [...prev];
      if (copia[index]) copia[index] = { ...copia[index], producto: "" };
      return copia;
    });
  };

  const eliminarDetalle = (index: number) => {
    setDetallePedido((prev) => prev.filter((_, i) => i !== index));
    setProductoQuery((prev) => prev.filter((_, i) => i !== index));
  };

  const calcularTotal = () =>
    detallePedido.reduce((acc, item) => acc + item.cantidad * item.precio, 0);

  const calcularValorInicial = () => calcularTotal() * 0.5;
  const calcularValorRestante = () => calcularTotal() - calcularValorInicial();

  const subirImagenACloudinary = async (file: File) => {
  const url = "https://api.cloudinary.com/v1_1/creartnino/image/upload";
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "CreartNino");

  // 👇 Guardar la imagen en la carpeta Productos
  formData.append("folder", "Comprobantes");

  try {
    const res = await fetch(url, { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      setComprobantePago(data.secure_url); // URL final de la imagen
      Swal.fire("✅ Éxito", "Imagen subida correctamente", "success");
    } else {
      Swal.fire("❌ Error", "No se pudo subir la imagen", "error");
    }
  } catch (error) {
    console.error("Error al subir imagen", error);
    Swal.fire("❌ Error", "Error al conectar con Cloudinary", "error");
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteSeleccionado) {
      await Swal.fire({
        icon: "warning",
        title: "Cliente requerido",
        text: "Debe seleccionar un cliente válido.",
      });
      return;
    }
    if (!metodoPago) {
      await Swal.fire({
        icon: "warning",
        title: "Método de pago requerido",
        text: "Seleccione un método válido.",
      });
      return;
    }
    if (!fechaEntrega) {
      await Swal.fire({
        icon: "warning",
        title: "Fecha de entrega requerida",
        text: "Seleccione una fecha válida.",
      });
      return;
    }
    if (detallePedido.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Detalle vacío",
        text: "Debe agregar al menos un producto.",
      });
      return;
    }
    for (let i = 0; i < detallePedido.length; i++) {
      const item = detallePedido[i];
      const existe = productosApi.some((p) => p.Nombre === item.producto);
      if (!item.producto || !existe || item.cantidad <= 0 || item.precio <= 0) {
        await Swal.fire({
          icon: "warning",
          title: "Error en producto",
          text: `Fila #${i + 1}: debes seleccionar un producto válido y completar cantidad/precio.`,
        });
        return;
      }
    }
    if (metodoPago === "Transferencia" && !comprobantePago) {
      await Swal.fire({
        icon: "warning",
        title: "Comprobante requerido",
        text: "Debe adjuntar el comprobante de pago.",
      });
      return;
    }

    const nuevoPedido = {
  IdCliente: clienteSeleccionado?.IdCliente ?? 0,
  MetodoPago: metodoPago,
  FechaPedido: fechaPedido,
  FechaEntrega: fechaEntrega,
  Descripcion: descripcion,
  ValorInicial: calcularValorInicial(),
  ValorRestante: calcularValorRestante(),
  ComprobantePago: comprobantePago || "",
  TotalPedido: calcularTotal(),
  IdEstado: 1,
  DetallePedidos: detallePedido.map((d) => ({
    IdProducto: d.idProducto,
    Cantidad: d.cantidad,
    Subtotal: d.subtotal ?? d.cantidad * d.precio,
  })),
};


    try {
      const pedidoRes = await fetch(
        "https://apicreartnino.somee.com/api/Pedidos/Crear",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoPedido),
        }
      );

      if (!pedidoRes.ok) throw new Error("Error al crear el pedido en la API");

      // === Descontar la cantidad de los productos según el detalle ===
      for (const item of detallePedido) {
        if (!item.idProducto) continue;

        const resProd = await fetch(
          "https://apicreartnino.somee.com/api/Productos/Lista"
        );
        const productos: IProductos[] = resProd.ok ? await resProd.json() : [];
        const producto = productos.find((p) => p.IdProducto === item.idProducto);
        if (!producto) continue;

        const nuevaCantidad = Math.max(
          0,
          (producto.Cantidad ?? 0) - item.cantidad
        );

        const rUpd = await fetch(
          `https://apicreartnino.somee.com/api/Productos/Actualizar/${producto.IdProducto}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...producto, Cantidad: nuevaCantidad }),
          }
        );

        if (!rUpd.ok) {
          console.error(
            "Error actualizando producto",
            producto.IdProducto,
            await rUpd.text()
          );
        }
      }

      await Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Pedido creado correctamente.",
      });
      onCrear(nuevoPedido);
      onClose();
    } catch (error: any) {
      console.error(error);
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    }
  };

  if (!fechaServidor) {
  return <p className="text-center mt-4">⏳ Cargando fecha del servidor...</p>;
}
    return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">Crear Pedido</h2>
      <form onSubmit={handleSubmit}>
        {/* Cliente, método de pago, fechas */}
        <div className="row g-4 mb-3">
          <div className="col-md-3 position-relative">
  <label className="form-label">
    👤 Cliente <span className="text-danger">*</span>
  </label>
  <input
    type="text"
    className="form-control"
    placeholder="Buscar cliente..."
    value={clienteBusqueda}
    onChange={(e) => {
      let value = e.target.value;

      value = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, ""); // solo letras, números y espacios
      value = value.replace(/^\s+/g, ""); // evitar espacios al inicio
      value = value.replace(/\s{2,}/g, " "); // evitar espacios múltiples

      // 🚫 Validación de caracteres no permitidos
      if (/[^a-zA-Z0-9#áéíóúÁÉÍÓÚñÑ\s]/.test(value)) {
        Swal.fire({
          icon: "warning",
          title: "Entrada inválida",
          text: "Solo se permiten letras, números, # y espacios.",
          timer: 1800,
          showConfirmButton: false,
        });
        value = value.replace(/[^a-zA-Z0-9#áéíóúÁÉÍÓÚñÑ\s]/g, "");
      }

      // 🚫 Repetición excesiva
      if (/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])\1{3,}/.test(value)) {
        Swal.fire({
          icon: "warning",
          title: "Repetición excesiva",
          text: "No repitas el mismo carácter más de 3 veces consecutivas.",
          timer: 1500,
          showConfirmButton: false,
        });
        value = value.replace(/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])\1{3,}/g, "$1$1$1");
      }

      setClienteBusqueda(value);

      // ✅ Si borra el texto, limpiar selección y campos relacionados
      if (value.trim() === "") {
        setClienteSeleccionado(null);
        setDireccionCliente("");
        setClienteDocumento("");
      }
    }}
  />

  {/* Lista de clientes sugeridos */}
  {!clienteSeleccionado && clienteBusqueda && clientesFiltrados.length > 0 && (
    <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
      {clientesFiltrados.map((c) => (
        <li
          key={c.IdCliente}
          className="list-group-item list-group-item-action"
          style={{ cursor: "pointer" }}
          onClick={() => handleClienteSeleccionado(c)}
        >
          {`${c.NombreCompleto} - ${c.TipoDocumento}: ${c.NumDocumento ?? "N/A"}`}
        </li>
      ))}
    </ul>
  )}
</div>
          <div className="col-md-3">
            <label className="form-label">
              💳 Método de Pago <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              required
            >
              <option value="">Seleccione</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>
          <div className="col-md-3">
  <label className="form-label">📅 Fecha del Pedido</label>
  <input
    type="date"
    className="form-control"
    value={fechaPedido}
    readOnly
    disabled
  />
</div>
          {/* Fecha de Entrega */}
<div className="col-md-3">
  <label className="form-label">
    📦 Fecha de Entrega <span className="text-danger">*</span>
  </label>
  <input
    type="date"
    className="form-control"
    value={fechaEntrega}
    min={sumarDiasHabiles(fechaServidor || new Date().toISOString().split("T")[0], 3)}
    onChange={(e) => {
      const valor = e.target.value;
      if (!valor) {
        setFechaEntrega("");
        return;
      }
      const fechaSeleccionada = new Date(valor + "T00:00:00"); // evitar zona horaria
      // Si la fecha es inválida, no hacer nada
      if (isNaN(fechaSeleccionada.getTime())) return;
      // 1) Validar que no sea antes del min
      const minStr = sumarDiasHabiles(fechaServidor || new Date().toISOString().split("T")[0], 3);
      const minDate = new Date(minStr + "T00:00:00");
      if (fechaSeleccionada < minDate) {
        Swal.fire({
          icon: "warning",
          title: "Fecha inválida",
          text: `La fecha de entrega no puede ser anterior a ${minStr}.`,
          timer: 2000,
          showConfirmButton: false,
        });
        setFechaEntrega(minStr);
        return;
      }
      // 2) Si es domingo -> corregir al siguiente día no domingo (lunes)
      if (fechaSeleccionada.getDay() === 0) {
        const corregida = siguienteNoDomingo(fechaSeleccionada);
        const corregidaIso = formatISO(corregida);
        Swal.fire({
          icon: "warning",
          title: "Domingo no permitido",
          text: `Los domingos no están permitidos. Se cambió la fecha a ${corregidaIso}.`,
          timer: 4000,
          showConfirmButton: false,
        });
        setFechaEntrega(corregidaIso);
        return;
      }
      // 3) si todo está OK
      setFechaEntrega(valor);
    }}
    // evitan que el usuario escriba libremente en algunos navegadores
    onKeyDown={(e) => {
      // opcional: evitar escribir letras (acepta flechas, backspace, etc.)
      const allowed = ["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"];
      if (allowed.includes(e.key)) return;
      // si no es número o '-' bloqueamos
      if (!/[\d-]/.test(e.key)) e.preventDefault();
    }}
    required
  />
</div>
{clienteDocumento && (
  <div className="col-md-3">
    <label className="form-label">🪪 Documento del Cliente</label>
    <input
      type="text"
      className="form-control form-control-sm"
      value={clienteDocumento}
      disabled
    />
  </div>
)}
{clienteSeleccionado && (
            <div className="col-md-3">
              <label className="form-label">📍 Dirección del Cliente</label>
              <input
                type="text"
                className="form-control"
                value={direccionCliente}
                onChange={(e) => setDireccionCliente(e.target.value)}
                disabled
              />
            </div>
          )}

</div>
        {/* Detalle de productos */}
        <div className="col-12 mt-4">
          <h6 className="text-muted">🧾 Detalle del Pedido</h6>
          <div className="row fw-bold mb-2">
            <div className="col-md-3">Producto</div>
            <div className="col-md-2">Cantidad</div>
            <div className="col-md-2">Precio</div>
            <div className="col-md-3">Subtotal</div>
            <div className="col-md-2"></div>
          </div>
          {detallePedido.map((item, index) => {
            const query = productoQuery[index] ?? "";
            const sugerencias =
  query.length > 0
    ? productosApi
        .filter((p) =>
          p.Nombre.toLowerCase().includes(query.toLowerCase())
        )
        // 🚫 Evitar que aparezcan productos ya seleccionados en otras filas
        .filter(
          (p) =>
            !detallePedido.some(
              (d, i) => d.idProducto === p.IdProducto && i !== index
            )
        )
    : [];
            return (
              <div key={index} className="row mb-2 align-items-center position-relative">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar producto..."
                    value={query !== "" ? query : item.producto}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.trim() === "" && value !== "") return;
                      handleProductoQueryChange(index, e.target.value);
                    }}
                  />
                  {query && sugerencias.length > 0 && (
                    <ul
                      className="list-group position-absolute w-100"
                      style={{ zIndex: 1000, top: "38px" }}
                    >
                      {sugerencias.map((p) => (
                        <li
                          key={p.IdProducto}
                          className="list-group-item list-group-item-action"
                          style={{ cursor: "pointer" }}
                          onClick={() => seleccionarProducto(index, p.Nombre)}
                        >
                          {p.Nombre} - ${p.Precio.toLocaleString("es-CO")}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    max={8}
                    value={item.cantidad}
                    onChange={(e) => actualizarDetalle(index, "cantidad", e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control"
                    max={8}
                    value={item.precio > 0 ? item.precio.toLocaleString("es-CO") : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\./g, "").replace(/,/g, "");
                      const parsed = Number(raw) || 0;
                      actualizarDetalle(index, "precio", parsed);
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    value={`$${(item.cantidad * item.precio).toLocaleString("es-CO")}`}
                    readOnly
                  />
                </div>
                <div className="col-md-2 text-center">
                  <button
                    className="btn btn-danger btn-sm"
                    type="button"
                    onClick={() => eliminarDetalle(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
          <button
            type="button"
            className="btn pastel-btn-secondary mt-2"
            onClick={agregarDetalle}
          >
            + Agregar Producto
          </button>
        </div>
        {/* Personalización y dirección */}
        <div className="row g-4 mt-3">
          <div className="col-md-6">
            <label className="form-label">🎨 Personalización</label>
            <textarea
              className="form-control"
              rows={2}
              value={descripcion}
              onChange={(e) => {
                const value = e.target.value;
                if (value.trim() === "" && value !== "") return;
                setDescripcion(value);
              }}
            />
          </div>
          {metodoPago === "Transferencia" && (
            <div className="col-md-6 mt-3">
              <label className="form-label">📎 Comprobante de Pago</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    subirImagenACloudinary(e.target.files[0]);
                  }
                }}
              />
            </div>
          )}
        </div>
        {/* Resumen */}
        <div className="col-12 mt-4">
          <h6 className="text-muted mb-2">📊 Resumen del Pedido</h6>
          <div className="row g-2">
            <div className="col-md-4">
              <div className="card pastel-card p-1">
                <div className="d-flex align-items-center gap-1">
                  <FaWallet size={16} className="text-info" />
                  <div>
                    <small>Valor Inicial (50%)</small>
                    <div className="fw-bold">
                      ${calcularValorInicial().toLocaleString("es-CO")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card pastel-card p-1">
                <div className="d-flex align-items-center gap-1">
                  <FaCoins size={16} className="text-warning" />
                  <div>
                    <small>Valor Restante</small>
                    <div className="fw-bold">
                      ${calcularValorRestante().toLocaleString("es-CO")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card pastel-card p-1">
                <div className="d-flex align-items-center gap-1">
                  <FaCalculator size={16} className="text-success" />
                  <div>
                    <small>Total Pedido</small>
                    <div className="fw-bold">
                      ${calcularTotal().toLocaleString("es-CO")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Botones */}
        <div className="mt-4 d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn pastel-btn-secondary me-2"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button type="submit" className="btn pastel-btn-primary">
            Crear
          </button>
        </div>
      </form>
    </div>
  );
};
export default CrearPedido;
