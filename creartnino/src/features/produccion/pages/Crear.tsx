import React, { useState } from 'react';
import '../styles/acciones.css';


interface CrearProduccionProps {
  onClose: () => void;
  onCrear: (produccion: any) => void;
}

const productosMock = [
  { IdProducto: 201, Nombre: 'Toppers', precio: 20000 },
  { IdProducto: 202, Nombre: 'Caja ataúd', precio: 25000 },
  { IdProducto: 203, Nombre: 'Taza', precio: 18000 }
];

interface DetalleProduccion {
  producto: string;
  cantidad: number;
  precio: number;
}

const CrearProduccion: React.FC<CrearProduccionProps> = ({ onClose, onCrear }) => {
  const [nombre, setNombre] = useState('');
  const [tipoProduccion, setTipoProduccion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [estadoPedido, setEstadoPedido] = useState('');
  const [estado, setEstado] = useState('');
  const [detalle, setDetalle] = useState<DetalleProduccion[]>([]);

  const agregarDetalle = () => {
    setDetalle([...detalle, { producto: '', cantidad: 0, precio: 0 }]);
  };

  const actualizarDetalle = (index: number, campo: keyof DetalleProduccion, valor: string | number) => {
    const copia = [...detalle];
    if (campo === 'producto') {
      const producto = productosMock.find(p => p.Nombre === valor);
      copia[index].producto = producto?.Nombre || '';
      copia[index].precio = producto?.precio || 0;
    } else {
      copia[index][campo] = parseFloat(valor as string);
    }
    setDetalle(copia);
  };

  const eliminarDetalle = (index: number) => {
    const copia = [...detalle];
    copia.splice(index, 1);
    setDetalle(copia);
  };

  const handleSubmit = () => {
    const nuevaProduccion = {
      IdProduccion: Math.floor(Math.random() * 1000) + 600,
      Nombre: nombre,
      TipoProducción: tipoProduccion,
      FechaRegistro: fechaInicio,
      FechaFinal: fechaFin,
      EstadosPedido: estadoPedido,
      Estado: estado,
      Productos: detalle
    };
    onCrear(nuevaProduccion);
  };

  return (
    <div className="modal d-block pastel-overlay">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content pastel-modal shadow">
          <div className="modal-header pastel-header">
            <h5 className="modal-title">🛠️ Crear Producción</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body px-4 py-3">
            <div className="row g-4">

              {/* Nombre y Tipo */}
              <div className="col-md-6">
                <label className="form-label">🏷️ Nombre</label>
                <input type="text" className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} />
              </div>

              <div className="col-md-6">
                <label className="form-label">⚙️ Tipo de Producción</label>
                <select className="form-select" value={tipoProduccion} onChange={e => setTipoProduccion(e.target.value)}>
                  <option value="">Seleccione</option>
                  <option value="Directa">Directa</option>
                  <option value="Prediseñada">Pedido</option>
                </select>
              </div>

              {/* Fechas */}
              <div className="col-md-6">
                <label className="form-label">📅 Fecha de Inicio</label>
                <input type="date" className="form-control" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
              </div>

              <div className="col-md-6">
                <label className="form-label">📦 Fecha de Finalización</label>
                <input type="date" className="form-control" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
              </div>

              {/* Estado del pedido y estado */}
              <div className="col-md-6">
                <label className="form-label">📋 Estado del Pedido</label>
                <select className="form-select" value={estadoPedido} onChange={e => setEstadoPedido(e.target.value)}>
                  <option value="">Seleccione</option>
                  <option value="Inicial">Inicial</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Final">Final</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">📌 Estado</label>
                <select className="form-select" value={estado} onChange={e => setEstado(e.target.value)}>
                  <option value="">Seleccione</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>

              {/* Detalle de productos */}
              <div className="col-12 mt-4">
                <h6 className="text-muted">📦 Detalle de la produccion</h6>
                <div className="row fw-bold mb-2">
                  <div className="col-md-5">Nombre del Producto</div>
                  <div className="col-md-4">Cantidad</div>
                  <div className="col-md-3"></div>
                </div>
                {detalle.map((item, index) => (
                  <div key={index} className="row mb-2 align-items-center">
                    <div className="col-md-5">
                      <select className="form-select" value={item.producto} onChange={e => actualizarDetalle(index, 'producto', e.target.value)}>
                        <option value="">Seleccione un producto</option>
                        {productosMock.map(p => (
                          <option key={p.IdProducto} value={p.Nombre}>{p.Nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <input type="number" className="form-control" placeholder="Cantidad" value={item.cantidad} onChange={e => actualizarDetalle(index, 'cantidad', e.target.value)} />
                    </div>
                    <div className="col-md-3 text-center">
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarDetalle(index)}>✖</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn pastel-btn-secondary" onClick={agregarDetalle}>+ Agregar Producto</button>
              </div>
            </div>
          </div>

          <div className="modal-footer pastel-footer">
            <button className="btn pastel-btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn pastel-btn-primary" onClick={handleSubmit}>Registrar Producción</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearProduccion;
