import { useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';

const Ingresar = () => {
  const navigate = useNavigate();

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

  const showAlert = (title: string, text: string, icon: any = 'info') => {
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'OK',
      confirmButtonColor: '#7d3cf0'
    });
  };

  const ImagenLateral = () => (
    <img
      src="/src/assets/Imagenes/Ingresarcreartnino.PNG"
      alt="Creatividad"
      style={{
        width: '372px',
        height: '375px',
        borderRadius: '10px',
        objectFit: 'cover',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        transition: 'transform 0.3s ease-in-out',
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    />
  );

  const renderContenido = () => {
    if (mostrarNuevaContrasena) {
      return (
        <>
          <h3 style={tituloForm}>Cambio de contraseña</h3>
          <label>Nueva contraseña</label>
          <input type="password" placeholder="Ingrese nueva contraseña" style={input} value={nuevaPass} onChange={(e) => setNuevaPass(e.target.value)} />
          <label>Confirmar contraseña</label>
          <input type="password" placeholder="Confirme contraseña" style={input} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
          <button onClick={() => {
            if (!nuevaPass || !confirmPass) return showAlert('Campos requeridos', 'Por favor completa ambos campos.', 'warning');
            if (nuevaPass !== confirmPass) return showAlert('Error', 'Las contraseñas no coinciden.', 'error');
            setMostrarConfirmacion(true);
          }} style={botonPrincipal}>Cambiar</button>
        </>
      );
    }

    if (mostrarCodigoInput) {
      return (
        <>
          <h3 style={tituloForm}>Ingresa tu código</h3>
          <input type="text" placeholder="12345" style={input} value={codigo} onChange={(e) => setCodigo(e.target.value)} />
      <button
  onClick={() => {
    if (codigo !== '12345') {
      return showAlert('Código inválido', 'El código ingresado no es correcto.', 'error');
    }

    if (mostrarRecuperar) {
      showAlert('Código correcto', 'Ahora puedes cambiar tu contraseña.', 'success').then(() => {
        setMostrarNuevaContrasena(true);
      });
    } else {
      showAlert('Bienvenido', 'Redirigiendo al inicio...', 'success').then(() => {
        navigate('/');
      });
    }
  }}
  style={botonPrincipal}
>
  Enviar
</button>



          <button onClick={() => {
            setMostrarRecuperar(false);
            setCodigoEnviado(false);
            setMostrarCodigoInput(false);
            setMostrarNuevaContrasena(false);
            setMostrarConfirmacion(false);
          }} style={botonRegresar}>Regresar</button>
        </>
      );
    }

    if (mostrarRecuperar) {
      return (
        <>
          <h3 style={tituloForm}>Para cambio de contraseña</h3>
          <label>Correo electrónico</label>
          <input type="email" placeholder="Correo electrónico" style={input} value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={() => {
            if (!email.includes('@')) return showAlert('Correo inválido', 'Ingresa un correo válido.', 'error');
            setCodigoEnviado(true);
            showAlert('Código enviado', 'Hemos enviado un código a tu correo. Haz clic en "Ingresar código".', 'success');
          }} style={botonPrincipal}>Enviar</button>

          {codigoEnviado && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => setMostrarCodigoInput(true)} style={botonModal}>Ingresar código</button>
              <button onClick={() => {
                setMostrarRecuperar(false);
                setCodigoEnviado(false);
              }} style={botonRegresar}>Regresar</button>
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <h2 style={tituloForm}>Ingresar</h2>
        <label>Usuario</label>
        <input type="text" placeholder="Usuario" style={input} value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        <label>Contraseña</label>
        <input type="password" placeholder="Contraseña" style={input} value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
        <button onClick={() => {
          if (!usuario.trim() || !contrasena.trim()) {
            return showAlert('Campos vacíos', 'Completa todos los campos.', 'warning');
          }
          showAlert('Verificación exitosa', 'Ahora ingresa el código enviado.', 'success').then(() => {
            setMostrarCodigoInput(true);
          });
        }} style={botonPrincipal}>Ingresar</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span onClick={() => setMostrarRecuperar(true)} style={{ cursor: 'pointer', color: '#7d3cf0' }}>¿Olvidaste tu contraseña?</span>
          <Link to="/Registar" style={{ color: '#000', textDecoration: 'none' }}>Crear una cuenta</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="/" style={{ color: 'black' }}>← Regresar</a>
        </div>
      </>
    );
  };

  return (
    <div style={contenedorGeneral}>
      <div style={contenedorInterior}>
        <div style={ladoIzquierdo}>
          <p style={{ fontWeight: 'bold' }}>INGRESA SESIÓN <br /> PARA PODER REALIZAR COMPRAS EN <br /> ¡CreatNino!</p>
          <ImagenLateral />
        </div>
        <div style={formulario}>
          {renderContenido()}
        </div>
      </div>

      {mostrarConfirmacion && (
        <div style={modalFondo}>
          <div style={modalContenido}>
            <p style={{ fontWeight: 'bold', marginBottom: '20px' }}>
              El cambio de contraseña fue exitoso
            </p>
            <button
              onClick={() => {
                setMostrarConfirmacion(false);
                setMostrarNuevaContrasena(false);
                setMostrarRecuperar(false);
                setCodigoEnviado(false);
                setMostrarCodigoInput(false);
              }}
              style={botonModal}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos
const contenedorGeneral = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#fff' } as const;
const contenedorInterior = { backgroundColor: '#f5cfd3', borderRadius: '25px', padding: '30px', display: 'flex', flexDirection: 'row' as const, alignItems: 'center', boxShadow: '0 0 15px rgba(0,0,0,0.15)' } as const;
const ladoIzquierdo = { marginRight: '30px', textAlign: 'center' as const } as const;
const formulario = { backgroundColor: 'white', borderRadius: '20px', padding: '30px', width: '350px', fontWeight: 'bold' } as const;
const input = { padding: '10px', width: '100%', borderRadius: '10px', marginBottom: '15px', border: '1px solid #ccc', outline: 'none' } as const;
const botonPrincipal = { backgroundColor: '#b4e5e3', padding: '10px', width: '100%', borderRadius: '25px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' } as const;
const botonRegresar = { backgroundColor: 'transparent', border: 'none', color: '#000', textDecoration: 'underline', cursor: 'pointer', width: '100%' } as const;
const tituloForm = { textAlign: 'center' as const, marginBottom: '20px', color: '#333' } as const;
const modalFondo = { position: 'fixed' as const, top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 } as const;
const modalContenido = { backgroundColor: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center' as const, boxShadow: '0 8px 16px rgba(0,0,0,0.25)', width: '300px' } as const;
const botonModal = { backgroundColor: '#de6d6d', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer' } as const;

export default Ingresar;
