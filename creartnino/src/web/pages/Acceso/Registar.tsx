// Registrar.tsx
import  { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import registroImage from '../../../assets/Imagenes/RegistrerCreartnino.jpg'
import '../../styles/Registrar.css';

const Registrar = () => {
  const navigate = useNavigate();

  const [tipoDocumento, setTipoDocumento] = useState('');
  const [documento, setDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [codigo, setCodigo] = useState('');
  const [verContrasena, setVerContrasena] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [mostrarCodigoInput, setMostrarCodigoInput] = useState(false);

  const showAlert = (title: string, text: string, icon: 'success' | 'warning' | 'error') => {
    return Swal.fire({ title, text, icon });
  };

  const esCorreoValido = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const esContrasenaSegura = (pass: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pass);
  };

  const enviarRegistro = () => {
    if (!tipoDocumento || !documento || !nombre || !correo || !contrasena || !confirmar) {
      return showAlert('Campos vacíos', 'Completa todos los campos.', 'warning');
    }

    if (!esCorreoValido(correo)) {
      return showAlert('Correo inválido', 'Ingresa un correo electrónico válido.', 'error');
    }

    if (contrasena !== confirmar) {
      return showAlert('Error', 'Las contraseñas no coinciden.', 'error');
    }

    if (!esContrasenaSegura(contrasena)) {
      return showAlert(
        'Contraseña insegura',
        'Debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.',
        'error'
      );
    }

    showAlert('Código enviado', 'Ingresa el código para confirmar tu registro.', 'success')
      .then(() => setMostrarCodigoInput(true));
  };

  const validarCodigo = () => {
    if (codigo !== '12345') {
      return showAlert('Código inválido', 'El código ingresado no es correcto.', 'error');
    }

    showAlert('Registro exitoso', '¡Bienvenido a CreartNino!', 'success').then(() => {
      navigate('/ingresar');
    });
  };

  return (
    <div className="contenedor">
      <div className="tarjeta">
        <div className="formulario">
          {!mostrarCodigoInput ? (
            <>
              <h2 className="titulo">Registro</h2>

              <label>Tipo de documento <span className="asterisco">*</span></label>
              <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} className="input">
                <option value="">Seleccione...</option>
                <option value="cedula">Cédula</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="otro">Otro</option>
              </select>

              <label>Documento <span className="asterisco">*</span></label>
              <input type="text" placeholder="Número de documento" value={documento} onChange={(e) => setDocumento(e.target.value)} className="input" />

              <label>Nombre <span className="asterisco">*</span></label>
              <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} className="input" />

              <label>Correo electrónico <span className="asterisco">*</span></label>
              <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} className="input" />

              <label>Contraseña <span className="asterisco">*</span></label>
              <div className="campo-password">
                <input type={verContrasena ? 'text' : 'password'} placeholder="Contraseña" value={contrasena} onChange={(e) => setContrasena(e.target.value)} className="input" />
                <span onClick={() => setVerContrasena(!verContrasena)} className="icono-ojo">
                  {verContrasena ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <label>Confirmar contraseña <span className="asterisco">*</span></label>
              <div className="campo-password">
                <input type={verConfirmar ? 'text' : 'password'} placeholder="Confirmar contraseña" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className="input" />
                <span onClick={() => setVerConfirmar(!verConfirmar)} className="icono-ojo">
                  {verConfirmar ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <button onClick={enviarRegistro} className="boton-principal">Registrarse</button>
              <Link to="/ingresar" className="boton-secundario">Iniciar sesión</Link>
              <div className="volver">
                <Link to="/">&larr; Regresar</Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="titulo">Verificación</h2>
              <label>Ingresa el código</label>
              <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} className="input" placeholder="12345" />
              <button onClick={validarCodigo} className="boton-principal">Validar código</button>
              <button onClick={() => setMostrarCodigoInput(false)} className="boton-secundario">&larr; Volver</button>
            </>
          )}
        </div>

        <div className="imagen">
          <img src={registroImage} alt="Registro CreartNino" />
        </div>
      </div>
    </div>
  );
};

export default Registrar;
