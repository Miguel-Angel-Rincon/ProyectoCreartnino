import React from "react";
import logo from "../../assets/Imagenes/logo2.jpg";
import qsomos from "../../assets/Imagenes/qsomos.png";

const QuienesSomos: React.FC = () => {
  const container: React.CSSProperties = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#333",
  };

  const section: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4rem",
    gap: "2rem",
  };

  const text: React.CSSProperties = {
    flex: 1,
    textAlign: "justify",
    fontSize: "1.1rem",
    lineHeight: "1.8",
  };

  const imageContainer: React.CSSProperties = {
    flex: 1,
    textAlign: "center",
  };

  const imageStyle: React.CSSProperties = {
    maxWidth: "80%",
    height: "auto",
    borderRadius: "1rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  };

  const heading: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    color: "#D67CA5",
    textAlign: "center",
  };

  const valueBox: React.CSSProperties = {
    backgroundColor: "#fde3f0",
    padding: "1.5rem",
    borderRadius: "1rem",
    textAlign: "center",
    margin: "1rem",
    flex: 1,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  };

  const callToAction: React.CSSProperties = {
    backgroundColor: "#fce4ec",
    padding: "2rem",
    borderRadius: "1rem",
    textAlign: "center",
    marginTop: "3rem",
  };

  return (
    <div style={container}>
      <h2 style={heading}>Quienes Somos</h2>
      <div style={section}>
        <div style={text}>
          <p>
            Todo gran sueño nace de una pequeña idea. Con unas simples tijeras de cocina y muchas ganas de emprender, comenzamos este camino sin saber hasta dónde nos llevaría. Gracias al apoyo incondicional de mi esposo, me atreví a dar el primer paso. Lo que inició como un proyecto casero, se convirtió en una microempresa con identidad, esfuerzo y creatividad.
          </p>
          <p>
            Personalizamos productos como tazas, cuadernos y toppers que cuentan historias, transmiten emociones y celebran momentos especiales. En cada diseño, cuidamos cada detalle como si fuera un mensaje hecho a mano.
          </p>
        </div>
        <div style={imageContainer}>
          <img src={logo} alt="Logo Creart" style={imageStyle} />
        </div>
      </div>

      <h2 style={heading}>Nuestra Misión</h2>
      <div style={section}>
        <div style={text}>
          <p>
            Crear productos personalizados que transmitan emociones, con diseños únicos hechos con amor y dedicación. Queremos ser parte de los momentos importantes de nuestros clientes, dejando huella con cada detalle. Nuestra misión es inspirar la creatividad, fomentar la conexión entre las personas y acompañar cada historia con detalles únicos e inolvidables. Además, buscamos construir relaciones duraderas con nuestros clientes, basadas en la confianza, la empatía y la excelencia en cada entrega.
          </p>
        </div>
        <div style={imageContainer}>
          <img src={qsomos} alt="Nuestra misión" style={imageStyle} />
        </div>
      </div>

      <h2 style={heading}>Nuestra Visión</h2>
      <div style={text}>
        <p>
          Ser reconocidos como una marca que transforma ideas en regalos únicos. Una comunidad creativa que conecta personas a través de la personalización y el cariño puesto en cada producto. Visualizamos un futuro donde Creart By Nina sea sinónimo de confianza, calidad y diseño emocional, expandiendo nuestro impacto a nivel nacional e internacional. Aspiramos a seguir creciendo como empresa familiar, innovando en nuevas líneas de productos y fortaleciendo nuestro compromiso con la creatividad y la cercanía con cada cliente.
        </p>
      </div>

      <h2 style={heading}>Nuestros Valores</h2>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around" }}>
        <div style={valueBox}>
          <h3>Pasión</h3>
          <p>Todo lo que hacemos lo hacemos con el corazón.</p>
        </div>
        <div style={valueBox}>
          <h3>Calidad</h3>
          <p>Cuidamos cada detalle, desde el diseño hasta la entrega.</p>
        </div>
        <div style={valueBox}>
          <h3>Cercanía</h3>
          <p>Nos conectamos con nuestros clientes para entender sus emociones.</p>
        </div>
        <div style={valueBox}>
          <h3>Creatividad</h3>
          <p>Innovamos constantemente para ofrecer productos únicos.</p>
        </div>
      </div>

      <h2 style={heading}>Testimonios</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-around" }}>
        <div style={valueBox}>
          <p><strong>Andrea R.</strong></p>
          <p>“Sus productos tienen magia. Se nota el amor en cada uno. ¡Volveré a comprar!”</p>
        </div>
        <div style={valueBox}>
          <p><strong>Camila P.</strong></p>
          <p>“Excelente calidad y diseño. Lo mejor para regalar con sentido.”</p>
        </div>
        <div style={valueBox}>
          <p><strong>Valentina L.</strong></p>
          <p>“Encargué unas tazas personalizadas y superaron mis expectativas.”</p>
        </div>
      </div>

      <div style={callToAction}>
        <h2>¿Listo para personalizar tus momentos?</h2>
        <p>Descubre nuestro catálogo de productos únicos hechos con amor.</p>
        <button style={{ padding: "1rem 2rem", backgroundColor: "#d67ca5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "1rem", cursor: "pointer" }}>
          Ver Productos
        </button>
      </div>
    </div>
  );
};

export default QuienesSomos;
