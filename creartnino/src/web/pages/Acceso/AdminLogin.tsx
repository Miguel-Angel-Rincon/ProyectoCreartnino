

const AdminLogin = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        backgroundColor: '#edc3c7', // fondo rosa
        borderRadius: '30px',
        padding: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 0 15px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '20px',
          padding: '30px',
          width: '320px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '30px', fontSize: '18px', color: '#333' }}>
            Ingresar Administrador
          </h2>

          {/* Usuario */}
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label htmlFor="usuario" style={{ fontWeight: 'bold', fontSize: '13px' }}>
              Usuario
            </label>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #000' }}>
              <input
                type="text"
                id="usuario"
                placeholder=" "
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '14px'
                }}
              />
              <span role="img" aria-label="usuario" style={{ fontSize: '16px' }}>👤</span>
            </div>
          </div>

          {/* Contraseña */}
          <div style={{ marginBottom: '25px', textAlign: 'left' }}>
            <label htmlFor="password" style={{ fontWeight: 'bold', fontSize: '13px' }}>
              Contraseña
            </label>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #000' }}>
              <input
                type="password"
                id="password"
                placeholder=" "
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '14px'
                }}
              />
              <span role="img" aria-label="candado" style={{ fontSize: '16px' }}>🔒</span>
            </div>
          </div>

          {/* Botón */}
          <button style={{
            backgroundColor: '#c6e6e2',
            border: 'none',
            borderRadius: '25px',
            padding: '10px 30px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '20px',
          }}>
            Ingresar
          </button>

          {/* Enlaces */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <a href="/" style={{ color: '#000', textDecoration: 'none' }}>Regresar</a>
            <a href="/registro" style={{ color: '#000', textDecoration: 'none' }}>Crear una cuenta</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
