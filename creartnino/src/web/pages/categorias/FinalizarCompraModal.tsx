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
  FaMapMarkerAlt,
  FaFileUpload,
  FaCreditCard,
  FaMoneyBillWave,
  FaReceipt,
  FaTimes,
  FaCalendarAlt,
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



const metodoInfo: Record<MetodoKey, Metodo> = {
  Nequi: { nombre: "Rina Isabela Ramírez Lugo", numero: "3001234567", banco: "Nequi" },
  Daviplata: { nombre: "Rina Isabela Ramírez Lugo", numero: "3107654321", banco: "Daviplata" },
  Bancolombia: { nombre: "Rina Isabela Ramírez Lugo", numero: "123-456789-01", banco: "Bancolombia" },
};

// 2. Definimos los nombres posibles
type MetodoKey = "Nequi" | "Daviplata" | "Bancolombia";

const FinalizarCompraModal: React.FC<Props> = ({ visible, onClose, onEnviar }) => {
  const { carrito, total, limpiarCarrito } = useCarrito();
  const { usuario } = useAuth();
  const [clientes, setClientes] = useState<any[]>([]);
  const [cliente, setCliente] = useState<any>(null);
  

  const [form, setForm] = useState({
    nombreCompleto: '',
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

  const pagoInicial = total * 0.5;
  const restante = total - pagoInicial;

  




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

  const hoy = new Date();
  const entrega = new Date(fechaEntrega + "T00:00:00");
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

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

  // 1️⃣ Subir comprobante
  const urlComprobante = await subirImagenACloudinary();
  if (!urlComprobante) return;

  try {
    // 2️⃣ Descripción
    const descripcionFinal = carrito
      .map((p: any) => {
        const tipo = p.tipo === "Personalizado" ? "Personalizado" : "Prediseñado";
        return p.mensaje
          ? `${p.cantidad} x ${p.Nombre} (${tipo}) - ${p.mensaje}`
          : `${p.cantidad} x ${p.Nombre} (${tipo})`;
      })
      .join(", ");

    // 3️⃣ Payload exacto según contrato
    const pedidoConDetalles = {
      IdCliente: cliente.IdCliente,
      MetodoPago: metodo,
      FechaPedido: new Date().toISOString(), // ISO completo con hora
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
        <button className="btn-cerrar" onClick={onClose}><FaTimes /></button>
        <h2>🧾 Finalizar Compra</h2>

        <div className="formulario-dos-columnas">
          <div className="input-icono" data-label="Nombre completo">
  <FaUser className="icono" />
  <input readOnly value={form.nombreCompleto} />
</div>

          <div className="input-icono" data-label="Correo">
  <FaEnvelope className="icono" />
  <input readOnly value={form.correo} />
</div>
          <div className="input-icono" data-label="Celular">
  <FaPhone className="icono" />
  <input readOnly value={form.celular} />
</div>

<div className="input-icono" data-label="Dirección">
  <FaMapMarkerAlt className="icono" />
  <input readOnly value={form.direccion} />
</div>
        </div>

        <div className="input-icono" data-label="Fecha de entrega">
  <FaCalendarAlt className="icono" />

  <input
    type="date"
    value={fechaEntrega}
    min={new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]} 
    onChange={(e) => setFechaEntrega(e.target.value)}
  />
</div>


        {descripcion && (
  <textarea
    readOnly
    value={descripcion}
    className="descripcion-textarea"
    placeholder="Descripción del pedido personalizado"
    data-label="Descripción"
  />
)}

        <div className="formulario-dos-columnas">
  <div className="input-icono" data-label="Método de pago">
    <FaCreditCard className="icono" />
    <select
  name="metodo"
  value={form.metodo}
  onChange={(e) => {
    const value = e.target.value;
    if (value) {
      setMetodoTemp(value);
      setShowSubModal(true); // abrir submodal
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
  {showSubModal && metodoTemp && (
  <div className="overlay-submodal">
    <div className="submodal">
      <h3>📌 Datos para {metodoTemp}</h3>
      <p><strong>Banco:</strong> {metodoInfo[metodoTemp as MetodoKey].banco}</p>
      <p><strong>Nombre:</strong> {metodoInfo[metodoTemp as MetodoKey].nombre}</p>
      <p><strong>Número:</strong> {metodoInfo[metodoTemp as MetodoKey].numero}</p>

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


          <div className="input-icono subir-archivo" data-label="Comprobante de pago">
    <FaFileUpload className="icono" />
    <label className="subir-label">
      Seleccionar archivo
      <input type="file"
      accept='image/*'
      onChange={handleFileChange} />
    </label>
  </div>
        </div>

        {filePreview && (
          <div className="vista-previa-img">
            <img src={filePreview} alt="Comprobante" onClick={() => setMostrarImagen(true)} title="Haz clic para ampliar" />
          </div>
        )}

        <div className="resumen-pago">
          <p><FaMoneyBillWave /> <strong>Total:</strong> ${total.toLocaleString()} COP</p>
          <p><FaCreditCard /> <strong>Pago inicial (50%):</strong> ${pagoInicial.toLocaleString()} COP</p>
          <p><FaReceipt /> <strong>Restante:</strong> ${restante.toLocaleString()} COP</p>
        </div>

        <button className="btn-enviar" onClick={handleSubmit} disabled={subiendoImagen}>
          📨 {subiendoImagen ? 'Subiendo...' : 'Enviar Pedido'}
        </button>
      </div>

      {mostrarImagen && (
        <div className="modal-imagen-ampliada" onClick={() => setMostrarImagen(false)}>
          <img src={filePreview || undefined} alt="Comprobante ampliado" />
        </div>
      )}
    </div>
  );
};

export default FinalizarCompraModal;
