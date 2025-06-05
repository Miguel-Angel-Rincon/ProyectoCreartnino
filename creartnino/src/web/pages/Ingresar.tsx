import React from 'react';

const Ingresar = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'sans-serif',
        padding: '20px',
        backgroundColor: '#ffffff', // fondo blanco
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: '#f5cfd3', // fondo solo en el contenedor del contenido
          borderRadius: '25px',
          padding: '30px',
          boxShadow: '0 0 15px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        {/* Lado izquierdo - Imagen y mensaje */}
        <div style={{ textAlign: 'center', marginRight: '30px' }}>
          <p
            style={{
              fontWeight: 'bold',
              fontSize: '16px',
              marginBottom: '10px',
            }}
          >
            INGRESA SESIÓN
            <br />
            PARA PODER REALIZAR COMPRAS EN
            <br />
            ¡CreatNino!
          </p>
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
        </div>

        {/* Lado derecho - Formulario */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            width: '350px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            fontWeight: 'bold',
          }}
        >
          <h2
            style={{
              textAlign: 'center',
              marginBottom: '20px',
              color: '#333',
            }}
          >
            Ingresar
          </h2>

          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            type="text"
            placeholder="Usuario"
            style={{
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              transition: 'all 0.3s ease-in-out',
              outline: 'none',
              fontWeight: 'normal',
            }}
            onFocus={(e) => (e.target.style.boxShadow = '0 0 5px #7d3cf0')}
            onBlur={(e) => (e.target.style.boxShadow = 'none')}
          />

          <label htmlFor="contrasena">Contraseña</label>
          <input
            id="contrasena"
            type="password"
            placeholder="Contraseña"
            style={{
              padding: '10px',
              marginBottom: '20px',
              borderRadius: '10px',
              border: '1px solid #ccc',
              transition: 'all 0.3s ease-in-out',
              outline: 'none',
              fontWeight: 'normal',
            }}
            onFocus={(e) => (e.target.style.boxShadow = '0 0 5px #7d3cf0')}
            onBlur={(e) => (e.target.style.boxShadow = 'none')}
          />

          <button
            style={{
              backgroundColor: '#b4e5e3',
              padding: '10px',
              borderRadius: '25px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '10px',
              transition: 'transform 0.2s ease-in-out',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Ingresar
          </button>

          <a
            href="/admin-login"
            className="admin-link"
            style={{
              display: 'block',
              textAlign: 'center',
              color: '#555',
              textDecoration: 'none',
              cursor: 'pointer',
              marginTop: '10px',
              fontWeight: 'bold',
            }}
          >
            Administrador
          </a>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '10px',
              fontSize: '14px',
            }}
          >
            <a
              href="/recuperar-contrasena"
              style={{ color: '#7d3cf0', textDecoration: 'underline' }}
            >
              ¿Olvidaste tu contraseña?
            </a>
            <a href="/registro" style={{ color: '#000' }}>
              Crear una cuenta
            </a>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <a href="/" style={{ color: 'black', textDecoration: 'none' }}>
              ← Regresar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ingresar;
