import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-4">
      <Link className="navbar-brand" to="/">MiSitio</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item"><Link className="nav-link" to="/">Inicio</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/nosotros">Quiénes Somos</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/servicios">Servicios</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/contacto">Contacto</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
