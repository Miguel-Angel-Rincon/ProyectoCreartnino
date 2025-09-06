// src/web/components/FinalizarCompraModal.tsx
import React, { useState, useEffect } from 'react';
import '../../styles/finalizarCompra.css';
import Swal from 'sweetalert2';
import { useCarrito } from '../../../context/CarritoContext';
import { useAuth } from '../../../context/AuthContext';
import { useCompras } from '../../../context/CompraContext';

import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaFileUpload, FaMoneyBillWave, FaCreditCard,
  FaReceipt, FaTimes
} from 'react-icons/fa';

interface Props {
  visible: boolean;
  onClose: () => void;
  onEnviar: () => void;
}

const FinalizarCompraModal: React.FC<Props> = ({ visible, onClose, onEnviar }) => {
  const { carrito, total, limpiarCarrito } = useCarrito();
  const { usuario } = useAuth();
  const { agregarCompra } = useCompras();

  const [form, setForm] = useState({
    nombreCompleto: '',
    correo: '',
    celular: '',
    direccion: '',
    metodo: '',
    evidencia: '',
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [mostrarImagen, setMostrarImagen] = useState(false);

  useEffect(() => {
    if (usuario) {
      setForm(f => ({
        ...f,
        nombreCompleto: usuario.NombreCompleto,
        correo: usuario.Correo,
        celular: usuario.Celular,
        direccion: usuario.Direccion,
      }));
    }

    const mensajes = carrito
      .filter(p => p.tipo === 'Personalizado' && p.mensaje)
      .map(p => `• ${p.Nombre}: ${p.mensaje}`)
      .join('\n');

    setDescripcion(mensajes);
  }, [usuario, carrito]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
      setForm({ ...form, evidencia: '✓' });
    }
  };

  const handleSubmit = () => {
    const { nombreCompleto, correo, celular, direccion, metodo, evidencia } = form;

    if (!nombreCompleto || !correo || !celular || !direccion || !metodo || !evidencia) {
      Swal.fire('Campos incompletos', 'Por favor completa todos los campos.', 'warning');
      return;
    }

    // Agregar compra simulada al contexto
    const productos = carrito.map(p => ({
      nombre: p.Nombre,
      cantidad: p.cantidad,
      tipo: p.tipo,
      mensaje: p.mensaje,
      precio: p.Precio
    }));

    agregarCompra({
      fecha: new Date().toISOString(),
      metodoPago: metodo,
      total,
      inicial: pagoInicial,
      restante: restante,
      estado: 'Primer Pago',
      productos
    });

    Swal.fire('Pedido enviado', 'Gracias por tu compra. Te contactaremos pronto.', 'success');
    limpiarCarrito();
    onEnviar();
    onClose();
  };

  if (!visible) return null;

  const pagoInicial = total * 0.5;
  const restante = total - pagoInicial;

  return (
    <div className="overlay-modal">
      <div className="modal-finalizar scrollable">
        <button className="btn-cerrar" onClick={onClose}><FaTimes /></button>
        <h2>🧾 Finalizar Compra</h2>

        <div className="formulario-dos-columnas">
          <div className="input-icono">
            <FaUser className="icono" />
            <input readOnly value={form.nombreCompleto} />
          </div>
          <div className="input-icono">
            <FaEnvelope className="icono" />
            <input readOnly value={form.correo} />
          </div>
          <div className="input-icono">
            <FaPhone className="icono" />
            <input readOnly value={form.celular} />
          </div>
          <div className="input-icono">
            <FaMapMarkerAlt className="icono" />
            <input readOnly value={form.direccion} />
          </div>
        </div>

        {descripcion && (
          <textarea
            readOnly
            value={descripcion}
            className="descripcion-textarea"
            placeholder="Descripción del pedido personalizado"
          />
        )}

        <div className="formulario-dos-columnas">
          <div className="input-icono">
            <FaCreditCard className="icono" />
            <select name="metodo" value={form.metodo} onChange={handleChange}>
              <option value="">Selecciona método de pago</option>
              <option value="Nequi">Nequi</option>
              <option value="Daviplata">Daviplata</option>
              <option value="Bancolombia">Bancolombia</option>
            </select>
          </div>

          <div className="input-icono subir-archivo">
            <FaFileUpload className="icono" />
            <label className="subir-label">
              Seleccionar archivo
              <input type="file" onChange={handleFileChange} />
            </label>
          </div>
        </div>

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

        <div className="resumen-pago">
          <p><FaMoneyBillWave /> <strong>Total:</strong> ${total.toLocaleString()} COP</p>
          <p><FaCreditCard /> <strong>Pago inicial (50%):</strong> ${pagoInicial.toLocaleString()} COP</p>
          <p><FaReceipt /> <strong>Restante:</strong> ${restante.toLocaleString()} COP</p>
        </div>

        <button className="btn-enviar" onClick={handleSubmit}>
          📨 Enviar Pedido
        </button>
      </div>

      {/* Modal de imagen ampliada */}
      {mostrarImagen && (
        <div className="modal-imagen-ampliada" onClick={() => setMostrarImagen(false)}>
          <img src={filePreview || undefined} alt="Comprobante ampliado" />
        </div>
      )}
    </div>
  );
};

export default FinalizarCompraModal;
