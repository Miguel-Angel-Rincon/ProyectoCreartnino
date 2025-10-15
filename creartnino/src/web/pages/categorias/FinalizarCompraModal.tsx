// src/web/components/FinalizarCompraModal.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/finalizarCompra.css';
import Swal from 'sweetalert2';
import { useCarrito } from '../../../context/CarritoContext';
import { useAuth } from '../../../context/AuthContext';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaPen,
  FaMapMarkerAlt,
  FaFileUpload,
  FaCreditCard,
  FaMoneyBillWave,
  FaReceipt,
  FaTimes,
  FaCalendarAlt,
  FaIdCard
} from 'react-icons/fa';

interface Props {
  visible: boolean;
  onClose: () => void;
  onEnviar?: () => void;
}

interface Metodo {
  nombre: string;
  numero: string;
  banco: string;
}
// 2. Definimos los nombres posibles
type MetodoKey = "Nequi" | "Daviplata" | "Bancolombia";
const metodoInfo: Record<MetodoKey, Metodo> = {
  Nequi: { nombre: "Rina Isabela Ramírez Lugo", numero: "3001234567", banco: "Nequi" },
  Daviplata: { nombre: "Rina Isabela Ramírez Lugo", numero: "3107654321", banco: "Daviplata" },
  Bancolombia: { nombre: "Rina Isabela Ramírez Lugo", numero: "123-456789-01", banco: "Bancolombia" },
};

const FinalizarCompraModal: React.FC<Props> = ({ visible, onClose, onEnviar }) => {
  const { carrito, total, limpiarCarrito } = useCarrito();
  const { usuario } = useAuth();
  const [clientes, setClientes] = useState<any[]>([]);
  const [cliente, setCliente] = useState<any>(null);
  

  const [form, setForm] = useState({
    nombreCompleto: '',
    numdocumento:'',
    correo: '',
    celular: '',
    direccion: '',
    metodo: '',
    evidencia: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [mostrarImagen, setMostrarImagen] = useState(false);
  const [fechaEntrega, setFechaEntrega] = useState<string>('');
  const [showSubModal, setShowSubModal] = useState(false);
const [metodoTemp, setMetodoTemp] = useState("");
const [fechaServidor, setFechaServidor] = useState<string>("");


  const pagoInicial = total * 0.5;
  const restante = total - pagoInicial;

useEffect(() => {
  const obtenerFechaServidor = async () => {
    try {
      const res = await fetch("https://www.apicreartnino.somee.com/api/Utilidades/FechaServidor");
      if (!res.ok) throw new Error("Error obteniendo fecha del servidor");
      const data = await res.json();
      const fechaSrv = new Date(data.FechaServidor).toISOString().split("T")[0];
      setFechaServidor(fechaSrv);
    } catch (error) {
      console.warn("⚠️ No se pudo obtener la fecha del servidor, usando local");
      setFechaServidor(new Date().toISOString().split("T")[0]);
    }
  };
  obtenerFechaServidor();
}, []);

useEffect(() => {
  if (!fechaServidor) return;
  const contienePersonalizados = carrito.some((p) => p.tipo === "Personalizado" && p.mensaje);
  const diasMinimos = contienePersonalizados ? 5 : 3;
  const minValida = sumarDiasHabiles(fechaServidor, diasMinimos);
  setFechaEntrega(minValida);
}, [fechaServidor, carrito]);

  // Traer clientes desde API
  useEffect(() => {
    fetch('https://www.apicreartnino.somee.com/api/Clientes/Lista')
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => console.error(err));
  }, []);

  // Buscar cliente por NumDocumento del usuario autenticado
  useEffect(() => {
    if (clientes.length > 0 && usuario?.NumDocumento) {
      const c = clientes.find(cli => (cli.NumDocumento ?? '').toString() === usuario.NumDocumento.toString());
      setCliente(c || null);
    }
  }, [clientes, usuario]);

  // Poner datos del cliente en el formulario
  useEffect(() => {
    if (cliente) {
      setForm(f => ({
        ...f,
        nombreCompleto: cliente.NombreCompleto ?? '',
        numdocumento: cliente.NumDocumento,
        correo: cliente.Correo ?? '',
        celular: cliente.Celular ?? '',
        direccion: cliente.Direccion ?? '',
      }));
    }
  }, [cliente]);

  // Generar descripción de productos personalizados
  useEffect(() => {
    const mensajes = carrito
      .filter(p => p.tipo === 'Personalizado' && p.mensaje)
      .map(p => `• ${p.Nombre}: ${p.mensaje}`)
      .join('\n');
    setDescripcion(mensajes);
  }, [carrito]);

// 📅 Sumar días hábiles (sin domingos)
const sumarDiasHabiles = (fechaStr: string, diasHabiles: number) => {
  if (!fechaStr) return "";
  const fecha = new Date(fechaStr);
  let sumados = 0;
  while (sumados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);
    // No contar domingos
    if (fecha.getDay() !== 0) sumados++;
  }
  return fecha.toISOString().split("T")[0];
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setForm(prev => ({ ...prev, evidencia: '✓' }));
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const subirImagenACloudinary = async () => {
    if (!file) return '';
    setSubiendoImagen(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'CreartNino'); // mismo preset que en Flutter
    formData.append('folder', 'Comprobantes'); 
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/creartnino/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setSubiendoImagen(false);
      return data.secure_url || '';
    } catch (err) {
      setSubiendoImagen(false);
      Swal.fire('Error', 'No se pudo subir la imagen', 'error');
      return '';
    }
  };

  // Contar días hábiles entre dos fechas (excluye domingos)
  const contarDiasHabiles = (desde: Date, hasta: Date) => {
    let count = 0;
    for (let d = new Date(desde); d <= hasta; d.setDate(d.getDate() + 1)) {
      const wd = d.getDay(); // 0 domingo
      if (wd !== 0) count++;
    }
    return count;
  };

 const handleSubmit = async () => {
  if (!cliente) {
    Swal.fire("Error", "No se encontró el cliente", "warning");
    return;
  }

  if (!fechaEntrega) {
    Swal.fire("Fecha requerida", "Selecciona una fecha de entrega.", "warning");
    return;
  }

  if (!fechaServidor) {
  Swal.fire("Error", "No se pudo obtener la fecha del servidor.", "error");
  return;
}

const entrega = new Date(fechaEntrega + "T00:00:00");
const inicio = new Date(fechaServidor + "T00:00:00");


  if (entrega <= inicio) {
    Swal.fire("Fecha inválida", "La fecha de entrega debe ser futura.", "warning");
    return;
  }

  const { metodo } = form;
  if (!metodo) {
    Swal.fire("Campos incompletos", "Selecciona un método de pago.", "warning");
    return;
  }

  if (!carrito || carrito.length === 0) {
    Swal.fire("Error", "El carrito está vacío", "warning");
    return;
  }

  const contienePersonalizados = carrito.some(
  (p: any) => p.tipo === "Personalizado" && p.mensaje
);
const diasMinimos = contienePersonalizados ? 5 : 3;

  const diasHabiles = contarDiasHabiles(
    new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + 1),
    new Date(entrega.getFullYear(), entrega.getMonth(), entrega.getDate())
  );

  if (diasHabiles < diasMinimos) {
    Swal.fire(
      "⚠️ Fecha no permitida",
      `La fecha seleccionada no cumple con los ${diasMinimos} días hábiles requeridos.`,
      "warning"
    );
    return;
  }

  if (entrega.getDay() === 0) {
  Swal.fire("⚠️ Domingo no permitido", "Selecciona un día hábil.", "warning");
  return;
}

  // 1️⃣ Subir comprobante
  const urlComprobante = await subirImagenACloudinary();
  if (!urlComprobante) return;

  try {
    // 2️⃣ Descripción
const descripcionFinal = (() => {
  const listaProductos = carrito
    .map((p: any) => {
      const tipo = p.tipo === "Personalizado" ? "Personalizado" : "Prediseñado";
      const detalle =
        p.mensaje && p.mensaje.trim() !== ""
          ? `"${p.mensaje}"`
          : "Sin personalización";

      return `${p.cantidad} x ${p.Nombre} (${tipo}) - ${detalle}`;
    })
    .join(", ");

  return `${listaProductos}\n\nEste pedido fue realizado desde la web.`;
})();


    // 3️⃣ Payload exacto según contrato
    const pedidoConDetalles = {
      IdCliente: cliente.IdCliente,
      MetodoPago: metodo,
      FechaPedido: new Date(fechaServidor + "T00:00:00").toISOString(), // ✅ fecha del servidor
    // ISO completo con hora
      FechaEntrega: new Date(fechaEntrega + "T00:00:00").toISOString(),
      Descripcion: descripcionFinal || "Sin descripción",
      ValorInicial: Math.round(pagoInicial),
      ValorRestante: Math.round(restante),
      TotalPedido: Math.round(total),
      ComprobantePago: urlComprobante,
      IdEstado: 1, // Primer pago
      DetallePedidos: carrito.map((p: any) => ({
        IdProducto: p.IdProducto,
        Cantidad: p.cantidad,
        Subtotal: Math.round((Number(p.Precio) || 0) * (Number(p.cantidad) || 0))
      })),
    };

    console.log("📦 Enviando pedido con detalles:", pedidoConDetalles);

    // 4️⃣ POST único
    const resPedido = await fetch(
      "https://www.apicreartnino.somee.com/api/Pedidos/Crear",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoConDetalles),
      }
    );

    if (!resPedido.ok) {
      const text = await resPedido.text();
      throw new Error(`No se pudo crear el pedido: ${text}`);
    }

    // 5️⃣ Descontar stock de productos (uno por uno)
    // 5️⃣ Descontar stock de productos (uno por uno)
for (const item of carrito) {
  const rProd = await fetch(`https://www.apicreartnino.somee.com/api/Productos/Obtener/${item.IdProducto}`);
  if (!rProd.ok) continue;

  const producto = await rProd.json();

  // ⚡ Aseguramos estructura según IProductos
  const actualizado = {
    IdProducto: producto.IdProducto,
    CategoriaProducto: producto.CategoriaProducto,
    Nombre: producto.Nombre,
    Imagen: producto.Imagen,
    Cantidad: Math.max(0, (producto.Cantidad || 0) - item.cantidad),
    Marca: producto.Marca,
    Precio: producto.Precio,
    Estado: producto.Estado,
  };

  const rUpd = await fetch(
    `https://www.apicreartnino.somee.com/api/Productos/Actualizar/${item.IdProducto}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actualizado),
    }
  );

  if (!rUpd.ok) {
    console.error("❌ Error al actualizar stock de", item.IdProducto, await rUpd.text());
  }
}

    Swal.fire(
      "✅ Pedido creado",
      `Gracias por tu compra, ${cliente.NombreCompleto ?? ""}`,
      "success"
    );
    limpiarCarrito();
    onEnviar?.();
    onClose();
  } catch (err) {
    console.error("❌ Error en el flujo de creación:", err);
    Swal.fire("Error", "No se pudo completar el pedido", "error");
  }
};

  if (!visible) return null;

  return (
  <div className="overlay-modal">
    <div className="modal-finalizar scrollable">
      {/* ❌ Botón cerrar */}
      <button className="btn-cerrar" onClick={onClose}>
        <FaTimes />
      </button>

      <h2>🧾 Finalizar Compra</h2>

      {/* 🧍 Datos del cliente */}
      <div className="formulario-tres-columnas">
        {/* Fila 1 */}
        <div className="input-icono" data-label="Nombre completo">
          <FaUser className="icono" />
          <input readOnly value={form.nombreCompleto} />
        </div>

        <div className="input-icono" data-label="Documento">
          <FaIdCard className="icono" />
          <input readOnly value={form.numdocumento || ""} />
        </div>

        <div className="input-icono" data-label="Correo">
          <FaEnvelope className="icono" />
          <input readOnly value={form.correo} />
        </div>

        {/* Fila 2 */}
        <div className="input-icono" data-label="Celular">
          <FaPhone className="icono" />
          <input readOnly value={form.celular} />
        </div>

        <div className="input-icono" data-label="Dirección">
          <FaMapMarkerAlt className="icono" />
          <input readOnly value={form.direccion} />
        </div>

        <div className="input-icono" data-label="Método de pago">
          <FaCreditCard className="icono" />
          <select
            name="metodo"
            value={form.metodo}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                setMetodoTemp(value);
                setShowSubModal(true);
              } else {
                setForm({ ...form, metodo: "" });
              }
            }}
          >
            <option value="">Selecciona método de pago</option>
            <option value="Nequi">Nequi</option>
            <option value="Daviplata">Daviplata</option>
            <option value="Bancolombia">Bancolombia</option>
          </select>
        </div>

        {/* Fila 3 */}
        <div className="input-icono" data-label="Fecha de entrega">
          <FaCalendarAlt className="icono" />
          <input
            type="date"
            value={fechaEntrega}
            min={sumarDiasHabiles(
              fechaServidor,
              carrito.some((p) => p.tipo === "Personalizado" && p.mensaje) ? 5 : 3
            )}
            onChange={(e) => {
              const valor = e.target.value;
              if (!valor) return;

              const seleccionada = new Date(valor + "T00:00:00");
              const contienePersonalizados = carrito.some(
                (p) => p.tipo === "Personalizado" && p.mensaje
              );
              const diasMinimos = contienePersonalizados ? 5 : 3;
              const minPermitida = new Date(
                sumarDiasHabiles(fechaServidor, diasMinimos) + "T00:00:00"
              );

              if (seleccionada.getDay() === 0) {
                Swal.fire("⚠️ Domingo no permitido", "Selecciona otro día hábil.", "warning");
                setFechaEntrega(sumarDiasHabiles(valor, 1));
                return;
              }

              if (seleccionada < minPermitida) {
                Swal.fire(
                  "⚠️ Fecha inválida",
                  `Debe ser al menos ${minPermitida.toISOString().split("T")[0]}.`,
                  "warning"
                );
                setFechaEntrega(sumarDiasHabiles(fechaServidor, diasMinimos));
                return;
              }

              setFechaEntrega(valor);
            }}
          />
        </div>

        <div className="input-icono subir-archivo" data-label="Comprobante de pago">
          <FaFileUpload className="icono" />
          <label className="subir-label">
            Seleccionar archivo
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>
      </div>

      {/* 💳 Submodal método de pago */}
      {showSubModal && metodoTemp && (
        <div className="overlay-submodal">
          <div className="submodal">
            <h3>📌 Datos para {metodoTemp}</h3>
            <p>
              <strong>Banco:</strong> {metodoInfo[metodoTemp as MetodoKey].banco}
            </p>
            <p>
              <strong>Nombre:</strong> {metodoInfo[metodoTemp as MetodoKey].nombre}
            </p>
            <p>
              <strong>Número:</strong> {metodoInfo[metodoTemp as MetodoKey].numero}
            </p>

            <div className="acciones">
              <button
                className="btn-confirmar"
                onClick={() => {
                  setForm({ ...form, metodo: metodoTemp });
                  setShowSubModal(false);
                }}
              >
                Confirmar
              </button>

              <button
                className="btn-cancelar"
                onClick={() => {
                  setMetodoTemp("");
                  setShowSubModal(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ Vista previa comprobante */}
      {filePreview && (
        <div className="vista-previa-img">
          <img
            src={filePreview}
            alt="Comprobante"
            onClick={() => setMostrarImagen(true)}
            title="Haz clic para ampliar"
          />
        </div>
      )}

      {/* 🛍️ Detalle del pedido */}
      <div className="detalle-pedido">
        <h3>🛍️ Detalle del pedido</h3>
        <table className="tabla-detalle">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {carrito.map((item, i) => (
              <tr key={i}>
                <td>{item.Nombre}</td>
                <td>{item.cantidad}</td>
                <td>${Number(item.Precio).toLocaleString()}</td>
                <td>${(Number(item.Precio) * Number(item.cantidad)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ✏️ Campo Descripción (solo visible si el pedido viene del carrito) */}
{carrito.length > 0 && carrito.some((p) => p.tipo === "Personalizado") && (
  <div className="input-icono" data-label="Descripción del pedido">
    <FaPen className="icono" />
    <textarea
      value={`${descripcion ? descripcion + "\n\n" : ""}(Este pedido fue realizado desde la web.)`}
      readOnly
      className="descripcion-textarea"
    />
  </div>
)}
      {/* 💰 Resumen */}
      <div className="resumen-pago">
        <p>
          <FaMoneyBillWave /> <strong>Total:</strong> ${total.toLocaleString()} COP
        </p>
        <p>
          <FaCreditCard /> <strong>Pago inicial (50%):</strong> ${pagoInicial.toLocaleString()} COP
        </p>
        <p>
          <FaReceipt /> <strong>Restante:</strong> ${restante.toLocaleString()} COP
        </p>
      </div>

      {/* 🚀 Enviar pedido */}
      <button
  className="btn-enviar"
  disabled={subiendoImagen}
  onClick={() => {
    Swal.fire({
      title: "Confirmar envío del pedido",
      text: "Si personalizaste algún producto o por valor del envio, el administrador puede enviarte una notificación con un valor adicional por esos productos.y el costo del pedido puede aumentar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6fcf97",
      cancelButtonColor: "#eb5757",
      confirmButtonText: "Sí, enviar pedido",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        handleSubmit();
      }
    });
  }}
>
  📨 {subiendoImagen ? "Subiendo..." : "Enviar Pedido"}
</button>

    </div>

    {/* 🔍 Modal imagen ampliada */}
    {mostrarImagen && (
      <div className="modal-imagen-ampliada" onClick={() => setMostrarImagen(false)}>
        <img src={filePreview || undefined} alt="Comprobante ampliado" />
      </div>
    )}
  </div>
);

};

export default FinalizarCompraModal;
