import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import '../styles/style.css';

interface CrearProduccionProps {
  onClose: () => void;
  onCrear: (produccion: any) => void;
}

const productosMock = [
  { IdProducto: 201, Nombre: 'Toppers', precio: 20000 },
  { IdProducto: 202, Nombre: 'Caja ataúd', precio: 25000 },
  { IdProducto: 203, Nombre: 'Taza', precio: 18000 }
];

const insumosMock = [
  { IdInsumo: 1, Nombre: 'Vinilo', cantidad: 100 },
  { IdInsumo: 2, Nombre: 'Resina', cantidad: 200 },
  { IdInsumo: 3, Nombre: 'Papel Transfer', cantidad: 150 }
];

interface InsumoGasto {
  insumo: string;
  cantidadUsada: number;
  disponible: number;
}

interface DetalleProduccion {
  producto: string;
  cantidad: number;
  precio: number;
  insumos?: InsumoGasto[];
}

const CrearProduccion: React.FC<CrearProduccionProps> = ({ onClose, onCrear }) => {
  const [nombre, setNombre] = useState('');
  const [tipoProduccion, setTipoProduccion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [detalle, setDetalle] = useState<DetalleProduccion[]>([]);
  const [mostrarSubmodal, setMostrarSubmodal] = useState<number | null>(null);

  const agregarDetalle = () => {
    setDetalle([...detalle, { producto: '', cantidad: 0, precio: 0, insumos: [] }]);
  };

  const actualizarDetalle = (index: number, campo: 'producto' | 'cantidad', valor: string | number) => {
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

  const agregarInsumo = (index: number) => {
    const copia = [...detalle];
    copia[index].insumos = copia[index].insumos || [];
    copia[index].insumos!.push({ insumo: '', cantidadUsada: 0, disponible: 0 });
    setDetalle(copia);
  };

  const actualizarInsumo = (pIndex: number, iIndex: number, campo: keyof InsumoGasto, valor: string | number) => {
    const copia = [...detalle];
    const insumos = copia[pIndex].insumos || [];
    if (campo === 'insumo') {
      const ins = insumosMock.find(i => i.Nombre === valor);
      insumos[iIndex].insumo = ins?.Nombre || '';
      insumos[iIndex].disponible = ins?.cantidad || 0;
    } else if (campo === 'cantidadUsada') {
      const nuevaCantidad = parseFloat(valor as string);
      if (nuevaCantidad > insumos[iIndex].disponible) {
        Swal.fire({ icon: 'error', title: 'Cantidad excedida', text: 'No puedes usar más insumo del disponible.', confirmButtonColor: '#d33' });
        return;
      }
      insumos[iIndex].cantidadUsada = nuevaCantidad;
    }
    copia[pIndex].insumos = insumos;
    setDetalle(copia);
  };

  const eliminarInsumo = (pIndex: number, iIndex: number) => {
    const copia = [...detalle];
    copia[pIndex].insumos?.splice(iIndex, 1);
    setDetalle(copia);
  };

  const validarCampos = (): boolean => {
    if (!nombre || !tipoProduccion || !fechaInicio || !fechaFin) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Por favor, completa todos los campos generales.', confirmButtonColor: '#f78fb3' });
      return false;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      Swal.fire({ icon: 'warning', title: 'Fechas inválidas', text: 'La fecha final no puede ser anterior a la inicial.', confirmButtonColor: '#f78fb3' });
      return false;
    }

    if (detalle.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Sin productos', text: 'Agrega al menos un producto al detalle de producción.', confirmButtonColor: '#f78fb3' });
      return false;
    }

    for (let i = 0; i < detalle.length; i++) {
      const item = detalle[i];
      if (!item.producto || item.cantidad <= 0) {
        Swal.fire({ icon: 'warning', title: 'Detalle incompleto', text: `Verifica los datos del producto #${i + 1}.`, confirmButtonColor: '#f78fb3' });
        return false;
      }

      if (!item.insumos || item.insumos.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Faltan insumos', text: `Agrega al menos un insumo al producto #${i + 1}.`, confirmButtonColor: '#f78fb3' });
        return false;
      }

      if (item.insumos.some(ins => !ins.insumo || ins.cantidadUsada <= 0)) {
        Swal.fire({ icon: 'warning', title: 'Insumos incompletos', text: `Verifica los insumos del producto #${i + 1}.`, confirmButtonColor: '#f78fb3' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validarCampos()) return;

    const nuevaProduccion = {
      IdProduccion: Math.floor(Math.random() * 1000) + 600,
      Nombre: nombre,
      TipoProduccion: tipoProduccion,
      FechaRegistro: fechaInicio,
      FechaFinal: fechaFin,
      EstadosPedido: 'en producción',
      Estado: 'en proceso',
      Productos: detalle
    };

    onCrear(nuevaProduccion);
    Swal.fire({ icon: 'success', title: 'Producción creada', text: `Tipo de producción: ${tipoProduccion}`, confirmButtonColor: '#e83e8c' });
  };

  const resumenInsumos = (insumos?: InsumoGasto[]) => {
    if (!insumos || insumos.length === 0) return null;
    const totales: Record<string, { usado: number; disponible: number }> = {};
    insumos.forEach(ins => {
      if (!totales[ins.insumo]) {
        totales[ins.insumo] = { usado: 0, disponible: ins.disponible };
      }
      totales[ins.insumo].usado += ins.cantidadUsada;
    });

    return (
      <div className="mt-3">
        <h6 className="text-secondary">Resumen de Insumos:</h6>
        <ul className="mb-0 ps-3">
          {Object.entries(totales).map(([nombre, datos], i) => (
            <li key={i}>
              {nombre}: Usado {datos.usado} / Disponible {datos.disponible}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">🛠️ Crear Producción</h2>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">🏷️ Nombre <span className="text-danger">*</span></label>
          <input type="text" className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">⚙️ Tipo de Producción <span className="text-danger">*</span></label>
          <select className="form-select" value={tipoProduccion} onChange={e => setTipoProduccion(e.target.value)}>
            <option value="">Seleccione</option>
            <option value="Directa">Directa</option>
            <option value="Pedido">Pedido</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">📅 Fecha de Inicio <span className="text-danger">*</span></label>
          <input type="date" className="form-control" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">📦 Fecha de Finalización <span className="text-danger">*</span></label>
          <input type="date" className="form-control" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <h5 className="mb-2">📦 Detalle de la Producción</h5>
        <div className="row fw-bold text-secondary mb-2">
          <div className="col-md-5">Producto <span className="text-danger">*</span></div>
          <div className="col-md-4">Cantidad <span className="text-danger">*</span></div>
          <div className="col-md-3">Acciones <span className="text-danger">*</span></div>
        </div>

        {detalle.map((item, index) => (
          <div key={index} className="row align-items-center mb-2">
            <div className="col-md-5">
              <select className="form-select" value={item.producto} onChange={e => actualizarDetalle(index, 'producto', e.target.value)}>
                <option value="">Seleccione</option>
                {productosMock.map(p => (
                  <option key={p.IdProducto} value={p.Nombre}>{p.Nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4 d-flex gap-2 align-items-center">
              <input
                type="number"
                className="form-control"
                value={item.cantidad}
                onChange={e => actualizarDetalle(index, 'cantidad', e.target.value)}
              />
            </div>
            <div className="col-md-3 d-flex gap-2 justify-content-start mt-1">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setMostrarSubmodal(index)}>
                🧪 <span className="text-danger">*</span>
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => eliminarDetalle(index)}>✖</button>
            </div>

            {/* Submodal */}
            <Modal show={mostrarSubmodal === index} onHide={() => setMostrarSubmodal(null)} centered className="pastel-modal">
              <Modal.Header closeButton className="pastel-header">
                <Modal.Title>🧪 Gasto de Insumos</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {item.insumos?.map((insumo, i) => (
                  <div key={i} className="row align-items-center mb-2">
                    <div className="col-md-5">
                      <select className="form-select" value={insumo.insumo} onChange={e => actualizarInsumo(index, i, 'insumo', e.target.value)}>
                        <option value="">Seleccione</option>
                        {insumosMock.map(ins => (
                          <option key={ins.IdInsumo} value={ins.Nombre}>{ins.Nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-5">
                      <input
                        type="number"
                        className="form-control"
                        value={insumo.cantidadUsada}
                        onChange={e => actualizarInsumo(index, i, 'cantidadUsada', e.target.value)}
                      />
                    </div>
                    <div className="col-md-2 text-end">
                      <button className="btn btn-danger btn-sm" onClick={() => eliminarInsumo(index, i)}>✖</button>
                    </div>
                  </div>
                ))}
                {resumenInsumos(item.insumos)}
                <div className="text-end mt-3">
                  <button className="btn btn-sm pastel-btn-secondary me-2" onClick={() => agregarInsumo(index)}>+ Agregar Insumo</button>
                  <button className="btn btn-sm pastel-btn-primary" onClick={() => setMostrarSubmodal(null)}>✔ Listo</button>
                </div>
              </Modal.Body>
            </Modal>
          </div>
        ))}

        <button className="btn btn-sm pastel-btn-secondary mt-2" onClick={agregarDetalle}>+ Agregar Producto</button>
      </div>

      <div className="text-end mt-4">
        <button className="btn pastel-btn-secondary me-2" onClick={onClose}>Cancelar</button>
        <button className="btn pastel-btn-primary" onClick={handleSubmit}>Crear</button>
      </div>
    </div>
  );
};

export default CrearProduccion;
