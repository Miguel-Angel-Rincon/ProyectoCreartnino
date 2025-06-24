


const Footer = () => {
  return (
    <footer className="py-5 px-3" style={{ backgroundColor: "#fff0f0" }}>
      <div className="container">
        <div className="row justify-content-center align-items-center text-center text-md-start">
          {/* Imagen izquierda */}
          <div className="col-10 col-md-4 d-flex justify-content-center mb-4 mb-md-0">
            <img
              src={Rina}
              alt="Chica CreartNino"
              style={{ maxWidth: "200px" }}
            />
          </div>

          {/* Línea vertical centrada */}
          <div className="col-12 d-md-none">
            <hr style={{ borderTop: "1px solid #ccc", width: "50%", margin: "1rem auto" }} />
          </div>
          <div className="col-md-1 d-none d-md-flex justify-content-center">
            <div style={{ height: "100px", borderLeft: "1px solid #ccc" }}></div>
          </div>

          {/* Contenido derecho */}
          <div className="col-12 col-md-6 text-center text-md-start mt-4 mt-md-0">
            <ul className="list-unstyled mb-3">
              <li>- Productos</li>
              <li>- Sobre Nosotros</li>
              <li>- Términos y condiciones</li>
            </ul>

            <div className="fw-semibold mb-2">Contacto:</div>
            <div className="d-flex justify-content-center justify-content-md-start gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <img src="https://img.icons8.com/fluency/24/instagram-new.png" alt="Instagram" />
              </a>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <img src="https://img.icons8.com/color/24/whatsapp.png" alt="WhatsApp" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <img src="https://img.icons8.com/color/24/facebook-new.png" alt="Facebook" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
              >
                <img src="https://img.icons8.com/color/24/tiktok--v1.png" alt="TikTok" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Derechos reservados */}
      <div className="text-center mt-4">
        <small className="text-muted">
          &copy; {new Date().getFullYear()} CreartNino. Todos los derechos reservados.
        </small>
      </div>

      {/* Estilos adicionales para hover animado */}
      <style>{`
        .social-icon img {
          transition: transform 0.3s ease;
        }
        .social-icon:hover img {
          transform: scale(1.3) rotate(10deg);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
