
import logorina from '../../assets/Imagenes/logorina.png';

const Footer = () => {
  return (
    <footer
      className="py-5 border-top"
      style={{ backgroundColor: '#fff3f5', marginTop: 'auto' }}
    >
      <div className="container">
        <div className="row align-items-center justify-content-center text-center text-md-start">
          {/* Logo */}
          <div className="col-md-4 mb-4 mb-md-0 d-flex justify-content-center">
            <img
              src={logorina}
              alt="Logo CreatNino"
              className="img-fluid animate-logo"
              style={{ maxHeight: '160px', borderRadius: '20px' }}
            />
          </div>

          {/* Separador vertical */}
          <div className="col-md-1 d-none d-md-flex justify-content-center">
            <div
              style={{
                width: '1px',
                backgroundColor: '#d6b0b5',
                height: '140px',
              }}
            ></div>
          </div>

          {/* Redes sociales */}
          <div className="col-md-4 mt-4 mt-md-0 d-flex flex-column align-items-center align-items-md-start">
            <p className="fw-semibold mb-2">Contacto:</p>
            <div className="d-flex gap-3">
              <a href="https://www.instagram.com/creartnino?igsh=MXFzeDBmdXp5NmJ4bg%3D%3D&utm_source=qr" className="social-icon">
                <img
                  src="https://img.icons8.com/color/48/instagram-new--v1.png"
                  alt="Instagram"
                  width="30"
                />
              </a>
              <a href="http://wa.me/573246272022" className="social-icon">
                <img
                  src="https://img.icons8.com/color/48/whatsapp.png"
                  alt="WhatsApp"
                  width="30"
                />
              </a>
              <a href="https://www.facebook.com/share/17XoZbmcSu/?mibextid=wwXIfr" className="social-icon">
                <img
                  src="https://img.icons8.com/fluency/48/facebook-new.png"
                  alt="Facebook"
                  width="30"
                />
              </a>
              <a href="https://www.tiktok.com/@creartnino?_t=ZS-90ZlpDkZriZ&_r=1" className="social-icon">
                <img
                  src="https://img.icons8.com/ios-filled/50/000000/tiktok.png"
                  alt="TikTok"
                  width="30"
                />
              </a>
            </div>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: '#ffdce2' }} />
        <p
          className="text-center mb-0"
          style={{ fontSize: '14px', color: '#666' }}
        >
          © {new Date().getFullYear()} CreatNino. Todos los derechos reservados.
        </p>
      </div>

      <style>{`
        .animate-logo {
          transition: transform 0.6s ease-in-out;
        }
        .animate-logo:hover {
          transform: translateY(-8px) scale(1.03);
        }
        .social-icon img {
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        .social-icon img:hover {
          transform: scale(1.1);
          filter: brightness(1.2);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
