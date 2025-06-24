

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#f5cfd3',
      color: '#333',
      textAlign: 'center',
      padding: '15px',
      marginTop: '40px',
      borderTop: '1px solid rgba(0,0,0,0.1)',
      boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
      fontSize: '14px'
    }}>
      <small>&copy; {new Date().getFullYear()} CreatNino. Todos los derechos reservados.</small>
    </footer>
  );
};

export default Footer;
