import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import registroImage from '/src/assets/Imagenes/RegistrerCreartnino.PNG';

const Registrar = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();

  const showAlert = (title: string, text: string, icon: 'success' | 'warning' | 'error') => {
    return Swal.fire({ title, text, icon });
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'white',
      fontFamily: 'sans-serif',
      padding: '20px',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: '25px',
        boxShadow: '0 0 15px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        width: 'fit-content'
      }}>

        {/* Formulario de Registro */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '25px 0 0 25px',
          padding: '40px',
          width: '350px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Registro</h2>

          <label htmlFor="tipoDocumento">Tipo de documento</label>
          <select id="tipoDocumento" style={{ ...inputStyle, padding: '10px' }}>
            <option value="">Seleccione...</option>
            <option value="cedula">Cédula</option>
            <option value="pasaporte">Pasaporte</option>
            <option value="otro">Otro</option>
          </select>

          <label htmlFor="documento">Documento</label>
          <input id="documento" type="text" placeholder="Número de documento" style={inputStyle} />

          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" type="text" placeholder="Nombre completo" style={inputStyle} />

          <label htmlFor="correo">Correo electrónico</label>
          <input id="correo" type="email" placeholder="Correo" style={inputStyle} />

          <label htmlFor="contrasena">Contraseña</label>
          <input
            id="contrasena"
            type="password"
            placeholder="Contraseña"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={inputStyle}
          />

          <label htmlFor="confirmar">Confirmar contraseña</label>
          <input
            id="confirmar"
            type="password"
            placeholder="Confirmar contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            style={inputStyle}
          />

          {/* Botón con validación y navegación */}
          <button
  onClick={() => {
    if (!usuario.trim() || !contrasena.trim()) {
      return showAlert('Campos vacíos', 'Completa todos los campos.', 'warning');
    }

    showAlert('Verificación exitosa', 'Ahora ingresa el código enviado.', 'success')
      .then(() => {
        navigate('/ingresar?recuperar=1');
      });
  }}
  style={botonPrincipal}
>
  Registrarse
</button>


          <Link to="/ingresar" style={{ ...buttonStyle, textAlign: 'center', textDecoration: 'none', color: 'black' }}>
            Iniciar sesión
          </Link>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/" style={{ color: 'black', textDecoration: 'none' }}>← Regresar</Link>
          </div>
        </div>

        {/* Imagen lateral decorativa */}
        <div style={{
          backgroundColor: '#f5cfd3',
          borderRadius: '0 25px 25px 0',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '300px',
          textAlign: 'center',
        }}>
          <img
            src={registroImage}
            alt="Registro CreartNino"
            style={{
              width: '230px',
              height: 'auto',
              borderRadius: '15px',
              marginBottom: '20px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: '10px',
  marginBottom: '15px',
  borderRadius: '10px',
  border: '1px solid #ccc',
  transition: 'all 0.3s ease-in-out',
  outline: 'none',
  fontWeight: 'normal',
};

const buttonStyle = {
  backgroundColor: '#b4e5e3',
  padding: '10px',
  borderRadius: '25px',
  border: 'none',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginBottom: '10px',
  transition: 'transform 0.2s ease-in-out',
};

const botonPrincipal = {
  ...buttonStyle,
  backgroundColor: '#a2ded0',
};

export default Registrar;
