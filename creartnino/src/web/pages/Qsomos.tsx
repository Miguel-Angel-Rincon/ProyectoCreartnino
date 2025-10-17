import React from "react";
import "../styles/Qsomos.css" // Importamos el CSS
import logo from "../../assets/Imagenes/logo2.jpg";
import qsomos from "../../assets/Imagenes/qsomos.png";

const QuienesSomos: React.FC = () => {
  return (
    <div className="qs-container">
      <h2 className="qs-heading">Quienes Somos</h2>
      <div className="qs-section">
        <div className="qs-text">
          <p>
            Todo gran sueño nace de una pequeña idea. Con unas simples tijeras de cocina y muchas ganas de emprender, comenzamos este camino sin saber hasta dónde nos llevaría. Gracias al apoyo incondicional de mi esposo, me atreví a dar el primer paso. Lo que inició como un proyecto casero, se convirtió en una microempresa con identidad, esfuerzo y creatividad.
          </p>
          <p>
            Personalizamos productos como tazas, cuadernos y toppers que cuentan historias, transmiten emociones y celebran momentos especiales. En cada diseño, cuidamos cada detalle como si fuera un mensaje hecho a mano.
          </p>
        </div>
        <div className="qs-image-container">
          <img src={logo} alt="Logo Creart" className="qs-image" />
        </div>
      </div>

      <h2 className="qs-heading">Nuestra Misión</h2>
      <div className="qs-section">
        <div className="qs-text">
          <p>
            Crear productos personalizados que transmitan emociones, con diseños únicos hechos con amor y dedicación. Queremos ser parte de los momentos importantes de nuestros clientes, dejando huella con cada detalle. Nuestra misión es inspirar la creatividad, fomentar la conexión entre las personas y acompañar cada historia con detalles únicos e inolvidables. Además, buscamos construir relaciones duraderas con nuestros clientes, basadas en la confianza, la empatía y la excelencia en cada entrega.
          </p>
        </div>
        <div className="qs-image-container">
          <img src={qsomos} alt="Nuestra misión" className="qs-image" />
        </div>
      </div>

      <h2 className="qs-heading">Nuestra Visión</h2>
      <div className="qs-text">
        <p>
          Ser reconocidos como una marca que transforma ideas en regalos únicos. Una comunidad creativa que conecta personas a través de la personalización y el cariño puesto en cada producto. Visualizamos un futuro donde Creart By Nina sea sinónimo de confianza, calidad y diseño emocional, expandiendo nuestro impacto a nivel nacional e internacional. Aspiramos a seguir creciendo como empresa familiar, innovando en nuevas líneas de productos y fortaleciendo nuestro compromiso con la creatividad y la cercanía con cada cliente.
        </p>
      </div>

      <h2 className="qs-heading">Nuestros Valores</h2>
      <div className="qs-values">
        <div className="qs-value-box">
          <h3>Pasión</h3>
          <p>Todo lo que hacemos lo hacemos con el corazón.</p>
        </div>
        <div className="qs-value-box">
          <h3>Calidad</h3>
          <p>Cuidamos cada detalle, desde el diseño hasta la entrega.</p>
        </div>
        <div className="qs-value-box">
          <h3>Cercanía</h3>
          <p>Nos conectamos con nuestros clientes para entender sus emociones.</p>
        </div>
        <div className="qs-value-box">
          <h3>Creatividad</h3>
          <p>Innovamos constantemente para ofrecer productos únicos.</p>
        </div>
      </div>

      <h2 className="qs-heading">Testimonios</h2>
      <div className="qs-testimonios">
        <div className="qs-value-box">
          <p><strong>Andrea R.</strong></p>
          <p>“Sus productos tienen magia. Se nota el amor en cada uno. ¡Volveré a comprar!”</p>
        </div>
        <div className="qs-value-box">
          <p><strong>Camila P.</strong></p>
          <p>“Excelente calidad y diseño. Lo mejor para regalar con sentido.”</p>
        </div>
        <div className="qs-value-box">
          <p><strong>Valentina L.</strong></p>
          <p>“Encargué unas tazas personalizadas y superaron mis expectativas.”</p>
        </div>
      </div>

      <div className="qs-calltoaction">
        <h2>¿Listo para personalizar tus momentos?</h2>
        <p>Descubre nuestro catálogo de productos únicos hechos con amor.</p>
        <button className="qs-btn"><a href="/productos/todos" style={{ color: "#fff", textDecoration: "none" }}>Ver Productos</a></button>
      </div>
    </div>
  );
};

export default QuienesSomos;