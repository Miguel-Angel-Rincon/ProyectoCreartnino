// ✅ src/web/components/categorias/PersonalizarProductoModal.tsx
import React, { useState, useEffect } from "react";
import {
  FaTimesCircle,
  FaCheckCircle,
  FaUpload,
  FaPalette,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import "../../styles/personalizar.css";

interface ValoresPersonalizados {
  nombre?: string;
  mensaje?: string;
  color?: string;
  tamaño?: string;
  otraCosa?: string;
  imagen?: File | null;
  imagenNombre?: string | null;
  imagenUrl?: string | null; // URL de Cloudinary
}

interface Props {
  visible: boolean;
  onGuardar: (descripciones: string[], imagenes: (File | null | string)[]) => void;
  onCancelar: () => void;
  valoresIniciales?: ValoresPersonalizados | ValoresPersonalizados[];
  cantidad?: number;
  indiceActual?: number;
  onCambiarIndice?: (nuevoIndice: number) => void;
}

const PersonalizarProductoModal: React.FC<Props> = ({
  visible,
  onGuardar,
  onCancelar,
  valoresIniciales,
  cantidad = 1,
  indiceActual: indiceProp,
  onCambiarIndice,
}) => {
  const [personalizaciones, setPersonalizaciones] = useState<ValoresPersonalizados[]>([]);
  const [indiceLocal, setIndiceLocal] = useState(0);
  const [_cantidad, setCantidad] = useState<number>(1);
  const [enviando, setEnviando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const indiceActual = indiceProp ?? indiceLocal;
  const setIndiceActual = onCambiarIndice ?? setIndiceLocal;

  // 🟢 Inicializar al abrir
  useEffect(() => {
    if (!visible) return;

    const lista: ValoresPersonalizados[] = [];

    const inicial: ValoresPersonalizados =
      Array.isArray(valoresIniciales) && valoresIniciales.length > 0
        ? valoresIniciales[0]
        : (valoresIniciales as ValoresPersonalizados) || {
            nombre: "",
            tamaño: "",
            color: "",
            mensaje: "",
            otraCosa: "",
            imagen: null,
            imagenNombre: null,
            imagenUrl: null,
          };

    const { nombre = "", tamaño = "", color = "", mensaje = "", otraCosa = "", imagen = null, imagenNombre = null, imagenUrl = null } = inicial;

    const hayMultiples =
      [nombre, tamaño, color, mensaje, otraCosa].some(
        (v) => typeof v === "string" && v.includes("-")
      );

    if (hayMultiples) {
      const separar = (campo: string) =>
        campo.split("-").map((v) => v.trim()).filter((v) => v !== "");

      const nombres = separar(nombre);
      const tamaños = separar(tamaño);
      const colores = separar(color);
      const mensajes = separar(mensaje);
      const otras = separar(otraCosa);

      const max = Math.max(
        nombres.length,
        tamaños.length,
        colores.length,
        mensajes.length,
        otras.length
      );

      for (let i = 0; i < max; i++) {
        lista.push({
          nombre: nombres[i] ?? "",
          tamaño: tamaños[i] ?? "Mediano",
          color: colores[i] ?? "#000000",
          mensaje: mensajes[i] ?? "",
          otraCosa: otras[i] ?? "",
          imagen: null,
          imagenNombre,
          imagenUrl,
        });
      }

      if (max !== cantidad) setCantidad(max);
    } else {
      for (let i = 0; i < (cantidad || 1); i++) {
        lista.push({
          nombre,
          tamaño: tamaño || "Mediano",
          color: color || "#000000",
          mensaje,
          otraCosa,
          imagen,
          imagenNombre,
          imagenUrl,
        });
      }
    }

    setPersonalizaciones(lista);
    setIndiceActual(0);
  }, [valoresIniciales, visible, cantidad]);

  if (!visible) return null;

  const actual = personalizaciones[indiceActual] || {
    nombre: "",
    mensaje: "",
    color: "#000000",
    tamaño: "Mediano",
    otraCosa: "",
    imagen: null,
    imagenNombre: null,
    imagenUrl: null,
  };

  const actualizarCampo = (campo: keyof ValoresPersonalizados, valor: any) => {
    const copia = [...personalizaciones];
    copia[indiceActual] = { ...copia[indiceActual], [campo]: valor };
    setPersonalizaciones(copia);
  };

  // 🖼️ Subir imagen a Cloudinary inmediatamente
  const manejarImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire("⚠️ Imagen demasiado grande", "El archivo no debe superar los 2 MB.", "warning");
      e.target.value = "";
      return;
    }

    setSubiendoImagen(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "CreartNino");
    formData.append("folder", "Productos");

    try {
      const resCloud = await axios.post(
        "https://api.cloudinary.com/v1_1/creartnino/image/upload",
        formData
      );
      
      const urlImagen = resCloud.data.secure_url;
      console.log("✅ Imagen subida a Cloudinary:", urlImagen);

      // Guardar File, nombre y URL de Cloudinary
      actualizarCampo("imagen", file);
      actualizarCampo("imagenNombre", file.name);
      actualizarCampo("imagenUrl", urlImagen);

      Swal.fire({
        icon: "success",
        title: "Imagen subida",
        text: "Tu imagen ha sido cargada correctamente",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      console.error("Error subiendo imagen:", err);
      Swal.fire({
        icon: "error",
        title: "Error al subir imagen",
        text: "No se pudo subir la imagen a Cloudinary. Intenta de nuevo.",
      });
      e.target.value = "";
    } finally {
      setSubiendoImagen(false);
    }
  };

  // 💾 Guardar personalizaciones
  const guardar = async () => {
    if (personalizaciones.length === 0) return;

    setEnviando(true);

    // 🧾 Combinar datos
    const nombres = personalizaciones.map((p) => p.nombre || "No").join(" - ");
    const tamaños = personalizaciones.map((p) => p.tamaño || "No").join(" - ");
    const colores = personalizaciones.map((p) => p.color || "No").join(" - ");
    const mensajes = personalizaciones.map((p) => p.mensaje || "No").join(" - ");
    const otrasCosas = personalizaciones.map((p) => p.otraCosa || "No").join(" - ");
    
    // 📸 Concatenar URLs de imágenes separadas por " - "
    const urlsImagenes = personalizaciones
      .map((p) => p.imagenUrl || "No")
      .join(" - ");

    const descripcionFinal =
      personalizaciones.length === 1
        ? `Nombre personalizado: ${nombres} | Tamaño: ${tamaños} | Color: ${colores} | Mensaje: ${mensajes} | Otra cosa: ${otrasCosas} | Referencia: ${urlsImagenes}`
        : `Nombres personalizados: ${nombres} | Tamaños: ${tamaños} | Colores: ${colores} | Mensajes: ${mensajes} | Otras cosas: ${otrasCosas} | Referencias: ${urlsImagenes}`;

    // 📸 Obtener URLs de imágenes (ya subidas a Cloudinary)
    const imagenesSubidas: (File | null | string)[] = personalizaciones.map(
      (p) => p.imagenUrl || null
    );

    // 📤 Enviar al padre
    onGuardar([descripcionFinal], imagenesSubidas);
    setEnviando(false);

    Swal.fire({
      icon: "success",
      title: "🎨 Personalización guardada",
      text:
        personalizaciones.length === 1
          ? "Tu personalización ha sido guardada correctamente."
          : "Todas las personalizaciones fueron guardadas correctamente.",
      confirmButtonColor: "#ff69b4",
    });
  };

  const cerrarModal = () => {
    setPersonalizaciones([]);
    setIndiceActual(0);
    onCancelar();
  };

  const anterior = () => setIndiceActual(Math.max(indiceActual - 1, 0));
  const siguiente = () => setIndiceActual(Math.min(indiceActual + 1, personalizaciones.length - 1));

  return (
    <div className="overlay-modal">
      <div className="modal-personalizar moderno">
        <h2>
          <FaPalette style={{ marginRight: "8px", color: "#ff69b4" }} />
          Personaliza tu producto
        </h2>

        <p className="subtitulo">
          {personalizaciones.length > 1
            ? `Editando producto ${indiceActual + 1} de ${personalizaciones.length}`
            : "Todos los campos son opcionales — agrega o edita los detalles que desees ✨"}
        </p>

        <div className="grid-fila">
          <div className="campo">
            <label>Personalizado:</label>
            <input
              type="text"
              placeholder="Ejemplo: Sofía"
              value={actual.nombre}
              onChange={(e) => actualizarCampo("nombre", e.target.value)}
            />
          </div>

          <div className="campo">
            <label>Tamaño:</label>
            <select
              value={actual.tamaño}
              onChange={(e) => actualizarCampo("tamaño", e.target.value)}
            >
              <option value="Pequeño">Pequeño</option>
              <option value="Mediano">Mediano</option>
              <option value="Grande">Grande</option>
            </select>
          </div>

          <div className="campo">
            <label>Color:</label>
            <input
              type="color"
              value={actual.color}
              onChange={(e) => actualizarCampo("color", e.target.value)}
            />
          </div>
        </div>

        <div className="grid-fila">
          <div className="campo campo-full">
            <label>Mensaje especial:</label>
            <textarea
              placeholder="Escribe un mensaje bonito (opcional)..."
              value={actual.mensaje}
              onChange={(e) => actualizarCampo("mensaje", e.target.value)}
            />
          </div>

          <div className="campo campo-full">
            <label>Otra cosa:</label>
            <input
              type="text"
              placeholder="Agrega algún detalle adicional..."
              value={actual.otraCosa}
              onChange={(e) => actualizarCampo("otraCosa", e.target.value)}
            />
          </div>

          <div className="campo campo-full">
            <label className="subir-imagen">
              <FaUpload /> Subir imagen personalizada o referencia (máx. 2 MB)
              <input 
                type="file" 
                accept="image/*" 
                onChange={manejarImagen}
                disabled={subiendoImagen}
              />
            </label>

            {subiendoImagen && (
              <p className="preview subiendo">⏳ Subiendo imagen a Cloudinary...</p>
            )}

            {!subiendoImagen && actual.imagenUrl && (
              <p className="preview">✅ Imagen subida: <strong>{actual.imagenNombre}</strong></p>
            )}

            {!subiendoImagen && !actual.imagenUrl && actual.imagenNombre && (
              <p className="preview">📷 Imagen actual: <strong>{actual.imagenNombre}</strong></p>
            )}
          </div>
        </div>

        {personalizaciones.length > 1 && (
          <div className="nav-botones">
            <button onClick={anterior} disabled={indiceActual === 0}>
              <FaArrowLeft /> Anterior
            </button>
            <button
              onClick={siguiente}
              disabled={indiceActual === personalizaciones.length - 1}
            >
              Siguiente <FaArrowRight />
            </button>
          </div>
        )}

        <div className="modal-botones">
          <button className="btn-cancelar" onClick={cerrarModal}>
            <FaTimesCircle style={{ marginRight: "6px" }} />
            Cancelar
          </button>
          <button
            className="btn-guardar"
            onClick={guardar}
            disabled={enviando || subiendoImagen}
          >
            {enviando ? "Guardando..." : subiendoImagen ? "Subiendo imagen..." : (
              <>
                <FaCheckCircle style={{ marginRight: "6px" }} /> Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizarProductoModal;