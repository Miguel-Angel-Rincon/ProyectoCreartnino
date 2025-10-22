import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import logorina from "../../assets/Imagenes/logorina.png";

const Footer = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        window.location.reload();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <footer
      className="py-3 border-top"
      style={{
        backgroundColor: "#fff3f5",
        marginTop: "auto",
        paddingBottom: "10px",
      }}
    >
      <div className="container text-center text-md-start">
        <div className="row justify-content-center align-items-start gy-4">

          {/* Logo y contacto */}
          <div
            className="col-md-5 d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-start text-center text-md-start"
            style={{ gap: "30px" }}
          >
            <img
              src={logorina}
              alt="Logo CreatNino"
              className="img-fluid animate-logo"
              style={{ maxHeight: "90px", borderRadius: "15px" }}
            />

            <div>
              <h6 className="fw-bold mb-2" style={{ color: "#b84c59", fontSize: "16px" }}>
                Contáctame
              </h6>
              <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-1">
                <FaPhone color="#b84c59" className="me-2" />
                <a
                  href="http://wa.me/573246272022"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "14px",
                    color: "#333",
                    textDecoration: "none",
                  }}
                >
                  +57 324 627 2022
                </a>
              </div>
              <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-1">
                <FaEnvelope color="#b84c59" className="me-2" />
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=creartnino23@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "14px",
                    color: "#333",
                    textDecoration: "none",
                  }}
                >
                  creartnino23@gmail.com
                </a>
              </div>
              <div className="d-flex align-items-center justify-content-center justify-content-md-start">
                <FaMapMarkerAlt color="#b84c59" className="me-2" />
                <span style={{ fontSize: "14px", color: "#333" }}>
                  Villa Hermosa, La Mansión - Medellín
                </span>
              </div>
            </div>
          </div>

          {/* Enlaces */}
          <div className="col-md-3 text-center text-md-start d-flex flex-column justify-content-start">
            <h6 className="fw-bold mb-2" style={{ color: "#b84c59" }}>
              Enlaces
            </h6>
            <ul className="list-unstyled mb-0" style={{ fontSize: "14px", color: "#333" }}>
              <li><a href="/" className="footer-link">Inicio</a></li>
              <li><a href="/nosotros" className="footer-link">Quiénes somos</a></li>
              <li><a href="/productos/todos" className="footer-link">Productos</a></li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div className="col-md-3 text-center text-md-start d-flex flex-column justify-content-start">
            <h6 className="fw-bold mb-2" style={{ color: "#b84c59" }}>
              Síguenos
            </h6>
            <div className="d-flex justify-content-center justify-content-md-start gap-3">
              <a href="https://www.instagram.com/creartnino" className="social-icon" target="_blank" rel="noopener noreferrer">
                <img src="https://img.icons8.com/color/48/instagram-new--v1.png" alt="Instagram" width="28" />
              </a>
              <a href="http://wa.me/573246272022" className="social-icon" target="_blank" rel="noopener noreferrer">
                <img src="https://img.icons8.com/color/48/whatsapp.png" alt="WhatsApp" width="28" />
              </a>
              <a href="https://www.facebook.com/share/17XoZbmcSu/" className="social-icon" target="_blank" rel="noopener noreferrer">
                <img src="https://img.icons8.com/fluency/48/facebook-new.png" alt="Facebook" width="28" />
              </a>
              <a href="https://www.tiktok.com/@creartnino" className="social-icon" target="_blank" rel="noopener noreferrer">
                <img src="https://img.icons8.com/ios-filled/50/000000/tiktok.png" alt="TikTok" width="28" />
              </a>
            </div>
          </div>
        </div>

        <hr className="my-2" style={{ borderColor: "#ffdce2" }} />

        {/* Texto inferior con modal */}
        <p
          className="text-center mb-0"
          style={{ fontSize: "13px", color: "#666", cursor: "pointer" }}
          onClick={() => setShowModal(true)}
        >
          © {new Date().getFullYear()} <strong>CreatNino</strong>. Todos los derechos reservados.
        </p>
      </div>

      {/* Modal Desarrolladores */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ backgroundColor: "#fff3f5", borderBottom: "2px solid #ffdce2" }}>
          <Modal.Title style={{ color: "#b84c59" }}>💻 Desarrolladores</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#fff9fa" }}>
          <div className="row text-center modal-developers">
            <div className="col-6 mb-3">
              <p><strong>Miguel Angel Orozco</strong></p>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=angelrinconorozco11@gmail.com" target="_blank" rel="noopener noreferrer" className="dev-email">
                angelrinconorozco11@gmail.com
              </a>
            </div>
            <div className="col-6 mb-3">
              <p><strong>María Camila Rojas</strong></p>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=camsu2007@gmail.com" target="_blank" rel="noopener noreferrer" className="dev-email">
                camsu2007@gmail.com
              </a>
            </div>
            <div className="col-6 mb-3">
              <p><strong>Sara Valentina Vélez</strong></p>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=saritavelezgil2007@gmail.com" target="_blank" rel="noopener noreferrer" className="dev-email">
                saritavelezgil2007@gmail.com
              </a>
            </div>
            <div className="col-6 mb-3">
              <p><strong>Andrés Felipe Arias</strong></p>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=andresquinteroo2006@gmail.com" target="_blank" rel="noopener noreferrer" className="dev-email">
                andresquinteroo2006@gmail.com
              </a>
            </div>
            <div className="col-12 mt-2">
              <p><strong>Juan Camilo Rendon</strong></p>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=Juancamiloquintanarendon573@gmail.com" target="_blank" rel="noopener noreferrer" className="dev-email">
                Juancamiloquintanarendon573@gmail.com
              </a>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <style>{`
        .animate-logo {
          transition: transform 0.5s ease;
        }
        .animate-logo:hover {
          transform: translateY(-6px) scale(1.05);
        }
        .footer-link {
          text-decoration: none;
          color: #6c757d;
          transition: color 0.3s;
        }
        .footer-link:hover {
          color: #b84c59;
        }
        .social-icon img {
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        .social-icon img:hover {
          transform: scale(1.15);
          filter: brightness(1.2);
        }

        .dev-email {
          font-size: 14px;
          color: #b84c59;
          text-decoration: none;
          word-break: break-all;
        }

        /* 🔹 Responsive del modal */
        @media (max-width: 576px) {
          .modal-dialog {
            margin: 10px;
          }
          .modal-developers .col-6 {
            flex: 0 0 100%;
            max-width: 100%;
          }
          .modal-body p {
            font-size: 14px;
            margin-bottom: 5px;
          }
          .dev-email {
            font-size: 13px;
            display: block;
            margin-bottom: 10px;
          }
        }

        /* Responsive footer */
        @media (max-width: 992px) {
          .row > div {
            text-align: center !important;
          }
          .col-md-5 {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .col-md-3 {
            margin-top: 10px;
          }
        }

        @media (max-width: 576px) {
          footer {
            padding: 20px 10px !important;
          }
          .animate-logo {
            max-height: 70px !important;
          }
          h6 {
            font-size: 15px !important;
          }
          p, a, span {
            font-size: 13px !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;