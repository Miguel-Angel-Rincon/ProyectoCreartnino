import React, { useState } from 'react';

interface CrearProduccionProps {
  onClose: () => void;
  onCrear: (produccion: any) => void;
}

const productosMock = [
  { IdProducto: 301, Nombre: 'Chaqueta', precio: 60000 },
  { IdProducto: 302, Nombre: 'Bufanda', precio: 25000 },
  { IdProducto: 303, Nombre: 'Guantes', precio: 20000 }
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
      IdProduccion: Math.floor(Math.random() * 1000) + 600, // Temporal
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
    <div>
      <h4>Registrar Producción</h4>

      <div className="mb-3">
        <label className="form-label">Nombre:</label>
        <input className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} />
      </div>

      <div className="mb-3">
  <label className="form-label">Tipo de Producción:</label>
  <select
    className="form-control"
    value={tipoProduccion}
    onChange={e => setTipoProduccion(e.target.value)}
  >
    <option value="">Seleccione</option>
    <option value="Directa">Directa</option>
    <option value="Prediseñada">Pedido</option>
  </select>
</div>

      <div className="mb-3">
        <label className="form-label">Fecha de Inicio:</label>
        <input type="date" className="form-control" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">Fecha de Finalización:</label>
        <input type="date" className="form-control" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">Estado del Pedido:</label>
        <select className="form-control" value={estadoPedido} onChange={e => setEstadoPedido(e.target.value)}>
          <option value="">Seleccione</option>
          <option value="Inicial">Inicial</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Final">Final</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Estado:</label>
        <select className="form-control" value={estado} onChange={e => setEstado(e.target.value)}>
          <option value="">Seleccione</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En proceso">En proceso</option>
          <option value="Finalizado">Finalizado</option>
        </select>
      </div>

      <h5>Detalle de Productos</h5>
      {detalle.map((item, index) => (
        <div key={index} className="d-flex gap-2 mb-2">
          <select
            className="form-control"
            value={item.producto}
            onChange={e => actualizarDetalle(index, 'producto', e.target.value)}
          >
            <option value="">Seleccione un producto</option>
            {productosMock.map(p => (
              <option key={p.IdProducto} value={p.Nombre}>
                {p.Nombre}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="form-control"
            placeholder="Cantidad"
            value={item.cantidad}
            onChange={e => actualizarDetalle(index, 'cantidad', e.target.value)}
          />
          
          <button className="btn btn-danger" onClick={() => eliminarDetalle(index)}>X</button>
        </div>
      ))}
      <button className="btn btn-secondary mb-3" onClick={agregarDetalle}>+ Agregar Producto</button>



      <div className="text-end">
        <button className="btn btn-secondary me-2" onClick={onClose}>Cancelar</button>
        <button className="btn btn-success" onClick={handleSubmit}>Registrar Producción</button>
      </div>
    </div>
  );
};

export default CrearProduccion;
