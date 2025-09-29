import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../styles/acciones.css";
import { FaCalculator, FaWallet, FaCoins, FaTrash } from "react-icons/fa";

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

interface ProductoApi {
  IdProducto: number;
  Nombre: string;
  Precio: number;
  Cantidad?: number;
}

interface Cliente {
  IdClientes: number;
  Nombre?: string;
  Apellido?: string;
  NombreCompleto?: string;
  Direccion: string;
}

const sumarDiasHabiles = (fechaStr: string, diasHabiles: number) => {
  const fecha = new Date(fechaStr);
  let sumados = 0;
  while (sumados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    const dia = fecha.getDay();
    if (dia !== 0 && dia !== 6) sumados++;
  }
  return fecha.toISOString().split("T")[0];
};

const CrearPedido: React.FC<CrearPedidoProps> = ({ onClose, onCrear }) => {
  const [clienteBusqueda, setClienteBusqueda] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | null>(null);
  const [direccionCliente, setDireccionCliente] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [fechaPedido, setFechaPedido] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [comprobantePago, setComprobantePago] = useState<string>("");
  const [detallePedido, setDetallePedido] = useState<PedidoDetalle[]>([]);
  const [productoQuery, setProductoQuery] = useState<string[]>([]);
  const [productosApi, setProductosApi] = useState<ProductoApi[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];
    setFechaPedido(hoy);
    setFechaEntrega(sumarDiasHabiles(hoy, 3));

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
            IdClientes: c.IdClientes ?? c.IdCliente ?? 0,
            Nombre: c.Nombre ?? "",
            Apellido: c.Apellido ?? "",
            NombreCompleto:
              c.NombreCompleto ?? `${c.Nombre ?? ""} ${c.Apellido ?? ""}`.trim(),
            Direccion: c.Direccion ?? "",
          }))
        );
      } catch (error) {
        console.error("Error al cargar clientes", error);
        setClientes([]);
      }
    };

    fetchProductos();
    fetchClientes();
  }, []);

  const clientesFiltrados = clienteBusqueda
    ? clientes.filter((c) =>
        (c.NombreCompleto ?? `${c.Nombre ?? ""} ${c.Apellido ?? ""}`)
          .toLowerCase()
          .includes(clienteBusqueda.toLowerCase())
      )
    : [];

  const handleClienteSeleccionado = (c: Cliente) => {
    setClienteSeleccionado(c.IdClientes);
    setClienteBusqueda(
      c.NombreCompleto ?? `${c.Nombre ?? ""} ${c.Apellido ?? ""}`
    );
    setDireccionCliente(c.Direccion);
  };

  const agregarDetalle = () => {
    setDetallePedido([
      ...detallePedido,
      { producto: "", cantidad: 0, precio: 0, subtotal: 0 },
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
    } else if (campo === "cantidad") {
      copia[index].cantidad = Number(valor) || 0;
      copia[index].subtotal = copia[index].cantidad * copia[index].precio;
    } else if (campo === "precio") {
      copia[index].precio = Number(valor) || 0;
      copia[index].subtotal = copia[index].cantidad * copia[index].precio;
    }
    setDetallePedido(copia);
  };

  const seleccionarProducto = (index: number, nombre: string) => {
    const prod = productosApi.find((p) => p.Nombre === nombre);
    if (!prod) return;
    actualizarDetalle(index, "producto", prod.Nombre);
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
    const url = "https://api.cloudinary.com/v1_1/angelr10/image/upload";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Creartnino");

    try {
      const res = await fetch(url, { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        setComprobantePago(data.secure_url);
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
      IdCliente: clienteSeleccionado,
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
        Subtotal: d.subtotal,
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
        const productos: ProductoApi[] = resProd.ok ? await resProd.json() : [];
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
                const value = e.target.value;
                if (value.trim() === "" && value !== "") return;
                setClienteBusqueda(value);
                setClienteSeleccionado(null);
              }}
            />
            {!clienteSeleccionado && clienteBusqueda && clientesFiltrados.length > 0 && (
              <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                {clientesFiltrados.map((c) => (
                  <li
                    key={c.IdClientes}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleClienteSeleccionado(c)}
                  >
                    {c.NombreCompleto ?? `${c.Nombre ?? ""} ${c.Apellido ?? ""}`}
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
            <input type="date" className="form-control" value={fechaPedido} readOnly />
          </div>

          <div className="col-md-3">
            <label className="form-label">
              📦 Fecha de Entrega <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={fechaEntrega}
              min={sumarDiasHabiles(new Date().toISOString().split("T")[0], 3)}
              onChange={(e) => setFechaEntrega(e.target.value)}
              required
            />
          </div>
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
                ? productosApi.filter((p) =>
                    p.Nombre.toLowerCase().includes(query.toLowerCase())
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
                    value={item.cantidad}
                    onChange={(e) => actualizarDetalle(index, "cantidad", e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="text"
                    className="form-control"
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
          {clienteSeleccionado && (
            <div className="col-md-6">
              <label className="form-label">📍 Dirección del Cliente</label>
              <input
                type="text"
                className="form-control"
                value={direccionCliente}
                onChange={(e) => setDireccionCliente(e.target.value)}
              />
            </div>
          )}
          {metodoPago === "Transferencia" && (
            <div className="col-md-6 mt-3">
              <label className="form-label">📎 Comprobante de Pago</label>
              <input
                type="file"
                className="form-control"
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
