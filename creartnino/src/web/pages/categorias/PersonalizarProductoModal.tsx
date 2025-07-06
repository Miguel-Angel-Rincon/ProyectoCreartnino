// src/web/components/PersonalizarProductoModal.tsx
import React from 'react';
import { FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import '../../styles/personalizar.css';

interface Props {
  visible: boolean;
  mensajeTemp: string;
  setMensajeTemp: (val: string) => void;
  onGuardar: () => void;
  onCancelar: () => void;
}

const PersonalizarProductoModal: React.FC<Props> = ({
  visible,
  mensajeTemp,
  setMensajeTemp,
  onGuardar,
  onCancelar
}) => {
  if (!visible) return null;

  const deshabilitado = mensajeTemp.trim().length < 5;

  return (
    <div className="overlay-modal">
      <div className="modal-personalizar">
        <h2>🎨 Personaliza tu producto</h2>
        <textarea
          placeholder="Escribe un mensaje especial (mínimo 5 caracteres)..."
          value={mensajeTemp}
          onChange={(e) => setMensajeTemp(e.target.value)}
        />
        <div className="modal-botones">
          <button className="btn-cancelar" onClick={onCancelar}>
            <FaTimesCircle style={{ marginRight: '6px' }} />
            Cancelar
          </button>
          <button
            className="btn-guardar"
            onClick={onGuardar}
            disabled={deshabilitado}
          >
            <FaCheckCircle style={{ marginRight: '6px' }} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizarProductoModal;
