import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'animate.css';
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { AuthProvider } from './context/AuthContext'; // <-
import App from './App.tsx'
import { CarritoProvider } from './context/CarritoContext.tsx';
import { ComprasProvider } from './context/CompraContext.tsx'; 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
       <CarritoProvider>
        <ComprasProvider>
      <App />
      </ComprasProvider>
      </CarritoProvider> 
    </AuthProvider>
  </StrictMode>,
)
