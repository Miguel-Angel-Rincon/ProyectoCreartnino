import React from 'react';
import registroImage from '/src/assets/Imagenes/RegistrerCreartnino.PNG'; // Ajusta si es necesario

const Registrar = () => {
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
          <h2 style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#333'
          }}>Registro</h2>

          {/* Tipo de documento */}
          <label htmlFor="tipoDocumento">Tipo de documento</label>
          <select id="tipoDocumento" style={{ ...inputStyle, padding: '10px' }}>
            <option value="">Seleccione...</option>
            <option value="cedula">Cédula</option>
            <option value="pasaporte">Pasaporte</option>
            <option value="otro">Otro</option>
          </select>

          {/* Documento */}
          <label htmlFor="documento">Documento</label>
          <input
            id="documento"
            type="text"
            placeholder="Número de documento"
            style={inputStyle}
          />

          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            placeholder="Nombre completo"
            style={inputStyle}
          />

          <label htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            placeholder="Correo"
            style={inputStyle}
          />

          <label htmlFor="contrasena">Contraseña</label>
          <input
            id="contrasena"
            type="password"
            placeholder="Contraseña"
            style={inputStyle}
          />

          <label htmlFor="confirmar">Confirmar contraseña</label>
          <input
            id="confirmar"
            type="password"
            placeholder="Confirmar contraseña"
            style={inputStyle}
          />

          <button style={buttonStyle}>
            Registrarse
          </button>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '10px',
            fontSize: '14px'
          }}>
            <a href="/recuperar-contrasena" style={{ color: '#7d3cf0', textDecoration: 'underline' }}>
              ¿Olvidaste tu contraseña?
            </a>
            <a href="/login" style={{ color: '#000' }}>
              Iniciar sesión
            </a>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a href="/" style={{ color: 'black', textDecoration: 'none' }}>← Regresar</a>
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
            alt="Registro CreatNino"
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

export default Registrar;
