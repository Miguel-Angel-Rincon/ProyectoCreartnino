import { useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/acceso.css';
import ImagenIngresar from '../../../assets/Imagenes/imagen-ingresar.png';
import { useAuth } from '../../../context/AuthContext';

const Ingresar = () => {
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [mostrarCodigoInput, setMostrarCodigoInput] = useState(false);
  const [mostrarNuevaContrasena, setMostrarNuevaContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPass, setNuevaPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const [verNuevaPass, setVerNuevaPass] = useState(false);
  const [verConfirmPass, setVerConfirmPass] = useState(false);

  const showAlert = (title: string, text: string, icon: any = 'info') => {
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'OK',
      confirmButtonColor: '#7d3cf0',
    });
  };

  const handleLogin = () => {
    if (!usuario.trim() || !contrasena.trim()) {
      return showAlert('Campos vacíos', 'Completa todos los campos.', 'warning');
    }
    showAlert('Verificación exitosa', 'Ahora ingresa el código enviado.', 'success').then(() => {
      setMostrarCodigoInput(true);
    });
  };

  const handleValidarCodigo = () => {
    if (codigo !== '12345') {
      return showAlert('Código inválido', 'El código ingresado no es correcto.', 'error');
    }

    if (mostrarRecuperar) {
      showAlert('Código correcto', 'Ahora puedes cambiar tu contraseña.', 'success').then(() => {
        setMostrarNuevaContrasena(true);
      });
    } else {
      const esAdmin = usuario.trim().toLowerCase() === 'admin';

      showAlert(
        esAdmin ? 'Bienvenido administrador' : 'Bienvenido',
        esAdmin ? 'Accediendo al panel de control...' : 'Redirigiendo a la tienda...',
        'success'
      ).then(() => {
        iniciarSesion({
          nombreCompleto: usuario,
          correo: esAdmin ? 'admin@correo.com' : 'demo@correo.com',
          celular: esAdmin ? '3001112222' : '3000000000',
          direccion: 'Sin dirección',
          rol: esAdmin ? 'admin' : 'cliente',
        });

        navigate(esAdmin ? '/dashboard' : '/');
      });
    }
  };

  const renderContenido = () => {
    if (mostrarNuevaContrasena) {
      return (
        <>
          <h3 className="titulo-form">Cambio de contraseña</h3>
          <label>Nueva contraseña</label>
          <div className="campo-password">
            <input
              type={verNuevaPass ? 'text' : 'password'}
              className="input"
              placeholder="Nueva contraseña"
              value={nuevaPass}
              onChange={(e) => setNuevaPass(e.target.value)}
            />
            <span className="toggle-password" onClick={() => setVerNuevaPass(!verNuevaPass)}>
              {verNuevaPass ? (
                // Ojo tachado
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.97 10.97 0 0 1 12 20c-7 0-11-8-11-8a21.41 21.41 0 0 1 5.06-6.08" />
                  <path d="M1 1l22 22" />
                  <path d="M9.53 9.53a3 3 0 0 0 4.24 4.24" />
                  <path d="M14.47 14.47L9.53 9.53" />
                </svg>
              ) : (
                // Ojo abierto
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </span>
          </div>

          <label>Confirmar contraseña</label>
          <div className="campo-password">
            <input
              type={verConfirmPass ? 'text' : 'password'}
              className="input"
              placeholder="Confirmar contraseña"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
            <span className="toggle-password" onClick={() => setVerConfirmPass(!verConfirmPass)}>
              {verConfirmPass ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.97 10.97 0 0 1 12 20c-7 0-11-8-11-8a21.41 21.41 0 0 1 5.06-6.08" />
                  <path d="M1 1l22 22" />
                  <path d="M9.53 9.53a3 3 0 0 0 4.24 4.24" />
                  <path d="M14.47 14.47L9.53 9.53" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </span>
          </div>

          <button
            className="boton-principal"
            onClick={() => {
              if (!nuevaPass || !confirmPass)
                return showAlert('Campos requeridos', 'Por favor completa ambos campos.', 'warning');
              if (nuevaPass !== confirmPass)
                return showAlert('Error', 'Las contraseñas no coinciden.', 'error');
              setMostrarConfirmacion(true);
            }}
          >
            Cambiar
          </button>
        </>
      );
    }

    if (mostrarCodigoInput) {
      return (
        <>
          <h3 className="titulo-form">Ingresa tu código</h3>
          <input
            type="text"
            className="input"
            placeholder="12345"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <button className="boton-principal" onClick={handleValidarCodigo}>Enviar</button>
          <button className="boton-regresar" onClick={() => {
            setMostrarRecuperar(false);
            setCodigoEnviado(false);
            setMostrarCodigoInput(false);
            setMostrarNuevaContrasena(false);
            setMostrarConfirmacion(false);
          }}>Regresar</button>
        </>
      );
    }

    if (mostrarRecuperar) {
      return (
        <>
          <h3 className="titulo-form">Para cambio de contraseña</h3>
          <label>Correo electrónico</label>
          <input
            type="email"
            className="input"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="boton-principal" onClick={() => {
            if (!email.includes('@')) return showAlert('Correo inválido', 'Ingresa un correo válido.', 'error');
            setCodigoEnviado(true);
            showAlert('Código enviado', 'Hemos enviado un código a tu correo.', 'success');
          }}>Enviar</button>

          {codigoEnviado && (
            <div className="recuperar-opciones">
              <button className="boton-modal" onClick={() => setMostrarCodigoInput(true)}>Ingresar código</button>
              <button className="boton-regresar" onClick={() => {
                setMostrarRecuperar(false);
                setCodigoEnviado(false);
              }}>Regresar</button>
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <h2 className="titulo-form">Iniciar Sesión</h2>
        <label>Usuario</label>
        <input
          type="text"
          className="input"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
        <label>Contraseña</label>
        <input
          type="password"
          className="input"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />
        <button className="boton-principal" onClick={handleLogin}>Ingresar</button>
        <div className="acciones-form">
          <span className="link-recuperar" onClick={() => setMostrarRecuperar(true)}>¿Olvidaste tu contraseña?</span>
          <Link to="/Registrar" className="link-crear">Registrar</Link>
        </div>
        <div className="volver-inicio">
          <Link to="/">← Regresar</Link>
        </div>
      </>
    );
  };

  return (
    <div className="contenedor-general">
      <div className="contenedor-interior">
        <div className="lado-izquierdo">
          <p><strong>¡Bienvenido de nuevo!<br />Inicia sesión para disfrutar de la experiencia CreatNino 🎨</strong></p>
          <img src={ImagenIngresar} alt="Creatividad" className="imagen-lateral" />
        </div>
        <div className="formulario">
          {renderContenido()}
        </div>
      </div>

      {mostrarConfirmacion && (
        <div className="modal-fondo">
          <div className="modal-contenido">
            <p><strong>El cambio de contraseña fue exitoso</strong></p>
            <button className="boton-modal" onClick={() => {
              setMostrarConfirmacion(false);
              setMostrarNuevaContrasena(false);
              setMostrarRecuperar(false);
              setCodigoEnviado(false);
              setMostrarCodigoInput(false);
            }}>Iniciar Sesión</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ingresar;