import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "../styles/style.css";
import { APP_SETTINGS } from "../../../settings/appsettings";

// Interfaces (asegúrate de que las rutas coincidan con tus archivos)
import type { IProduccion, detalleProduccion } from "../../interfaces/IProduccion";
import type { IProductos } from "../../interfaces/IProductos";
import type { IInsumos } from "../../interfaces/IInsumos";
import type { IPedido, detallePedido } from "../../interfaces/IPedidos";
import type { IClientes } from "../../interfaces/IClientes";

interface CrearProduccionProps {
  onClose: () => void;
  onCrear: (produccion: IProduccion) => void;
}

interface InsumoGasto {
  insumo: string;
  cantidadUsada: number;
  disponible: number;
}

interface DetalleUI {
  producto: string;
  cantidad: number;
  precio: number;
  insumos?: InsumoGasto[];
}

const CrearProduccion: React.FC<CrearProduccionProps> = ({ onClose, onCrear }) => {
  // --- Campos generales ---
  const [nombre, setNombre] = useState("");
  const [tipoProduccion, setTipoProduccion] = useState(""); // "Directa" | "Pedido"
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // --- Productos / Insumos ---
  const [productos, setProductos] = useState<IProductos[]>([]);
  const [insumos, setInsumos] = useState<IInsumos[]>([]);
  const [detalle, setDetalle] = useState<DetalleUI[]>([]);
  const [mostrarSubmodal, setMostrarSubmodal] = useState<number | null>(null);

  // --- Pedidos / Clientes / Buscador único por cliente ---
  const [pedidos, setPedidos] = useState<IPedido[]>([]);
  const [clientes, setClientes] = useState<IClientes[]>([]);
  const [pedidoQuery, setPedidoQuery] = useState("");
  const [pedidoSuggestions, setPedidoSuggestions] = useState<IPedido[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<IPedido | null>(null);

  // 🔎 Estados auxiliares para buscadores (productos / insumos por línea)
  const [productoQuery, setProductoQuery] = useState<string[]>([]);
  const [insumoQuery, setInsumoQuery] = useState<{ [pIndex: number]: string[] }>({});

  // --- Fecha del servidor (para validaciones de fecha) ---
  const [fechaServidor, setFechaServidor] = useState("");
  const [creando, setCreando] = useState(false);
  

  // --- Cargar datos iniciales ---
  useEffect(() => {
  const fetchData = async () => {
    try {
      const [respProd, respIns, respPedidos, respClientes, respFecha] = await Promise.all([
        fetch(`${APP_SETTINGS.apiUrl}Productos/Lista`),
        fetch(`${APP_SETTINGS.apiUrl}Insumos/Lista`),
        fetch(`${APP_SETTINGS.apiUrl}Pedidos/Lista`),
        fetch(`${APP_SETTINGS.apiUrl}Clientes/Lista`),
        fetch(`${APP_SETTINGS.apiUrl}Utilidades/FechaServidor`),
      ]);

      if (!respFecha.ok) throw new Error(`Fecha servidor: ${respFecha.status}`);

      const [dataProd, dataIns, dataPedidos, dataClientes, dataFecha] = await Promise.all([
        respProd.json(),
        respIns.json(),
        respPedidos.json(),
        respClientes.json(),
        respFecha.json(),
      ]);

      setProductos(dataProd || []);
      setInsumos(dataIns || []);
      setPedidos(dataPedidos || []);
      setClientes(dataClientes || []);

      // ✅ Establecer fecha inicial
      const fechaSrv = new Date(dataFecha.FechaServidor);
      const fechaISO = fechaSrv.toISOString().split("T")[0];
      setFechaServidor(fechaISO);
      setFechaInicio(fechaISO);
      setFechaFin(fechaISO);

    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      Swal.fire("Error", "No se pudieron cargar los datos del servidor.", "error");
    }
  };

  fetchData();
}, []);



  useEffect(() => {
  if (tipoProduccion === "Directa") {
    // 🔄 Limpiar productos e insumos
    setDetalle([]);
    setProductoQuery([]);
    setInsumoQuery({});

    // 🔄 Limpiar buscador de pedidos
    setPedidoQuery("");
    setPedidoSuggestions([]);
    setPedidoSeleccionado(null);
  }
}, [tipoProduccion]);

 useEffect(() => {
  if (tipoProduccion === "Pedido") {
    // 🔄 Limpiar productos e insumos
    setDetalle([]);
    setProductoQuery([]);
    setInsumoQuery({});

    // 🔄 Limpiar buscador de pedidos
    setPedidoQuery("");
    setPedidoSuggestions([]);
    setPedidoSeleccionado(null);
  }
}, [tipoProduccion]);

// Función auxiliar para eliminar espacios en blanco


// Función auxiliar para normalizar espacios
const normalizarTexto = (valor: string) => {
  // permite escribir espacio en medio, pero no dobles ni al inicio
  return valor.replace(/^\s+/, "").replace(/\s{2,}/g, " ");
};




  // --- Helpers ---
  const getClienteName = (idCliente?: number) => {
    if (!idCliente) return "";
    const c = clientes.find((x) => x.IdCliente === idCliente);
    return c ? c.NombreCompleto : `Cliente #${idCliente}`;
  };

  // --- Manejo pedidos (buscador único por cliente) ---
  const handlePedidoQueryChange = (q: string) => {
  setPedidoQuery(q);
  if (!q || q.trim() === "") {
    setPedidoSuggestions([]);
    return;
  }
  const qlow = q.toLowerCase();
  const sugeridos = pedidos.filter((p) => {
    const clienteName = getClienteName(p.IdCliente).toLowerCase();
    const coincideTexto = clienteName.includes(qlow) || (p.IdPedido && String(p.IdPedido).includes(qlow));
    const estadoValido = p.IdEstado === 1 || p.IdEstado === 2 || p.IdEstado ===1007; 
    return coincideTexto && estadoValido;
  });
  setPedidoSuggestions(sugeridos.slice(0, 8));
};

  // Al seleccionar un pedido — obtener detalles del pedido desde Detalles_Pedido/Lista
const seleccionarPedido = async (p: IPedido) => {
  try {
    // Guardar selección
    setPedidoSeleccionado(p);
    setPedidoQuery(getClienteName(p.IdCliente));
    setPedidoSuggestions([]);

    // 1. Obtener detalles de pedido desde API Detalles_Pedido
    const respDet = await fetch(`${APP_SETTINGS.apiUrl}Detalles_Pedido/Lista`);
    if (!respDet.ok) {
      Swal.fire("Error", "No se pudieron obtener los detalles del pedido.", "error");
      return;
    }
    const allDetalles: detallePedido[] = await respDet.json();

    // 2. Filtrar por IdPedido
    const detallesPedido = allDetalles.filter((d) => d.IdPedido === p.IdPedido);

    if (detallesPedido.length === 0) {
      Swal.fire("Sin productos", "El pedido no tiene detalles asociados.", "info");
      return;
    }

    // 3. Convertir los detalles a formato UI
    const nuevos: DetalleUI[] = detallesPedido.map((d: detallePedido) => {
      const prod = productos.find((pr) => pr.IdProducto === d.IdProducto);
      return {
        producto: prod ? prod.Nombre : `#${d.IdProducto}`,
        cantidad: d.Cantidad || 0,
        precio: prod ? prod.Precio : 0,
        insumos: [],
      };
    });

    // 4. Cargar en estado
    setDetalle(nuevos);
    setProductoQuery(nuevos.map(() => ""));
    const insQ: { [k: number]: string[] } = {};
    nuevos.forEach((_, idx) => (insQ[idx] = []));
    setInsumoQuery(insQ);
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo cargar el pedido.", "error");
  }
};


  // --- Manejo detalles (producto / insumo) ---
  const agregarDetalle = () => {
    setDetalle((prev) => {
      const next = [...prev, { producto: "", cantidad: 1, precio: 0, insumos: [] }];
      // sincronizar queries
      setProductoQuery((pq) => [...pq, ""]);
      setInsumoQuery((iq) => ({ ...iq, [next.length - 1]: [] }));
      return next;
    });
  };

  const actualizarDetalleCantidad = (index: number, valor: string | number) => {
  setDetalle((prev) => {
    const copia = [...prev];
    let n = typeof valor === "number" ? valor : parseFloat(String(valor));

    // ✅ Normalizamos cantidad
    if (isNaN(n) || n < 0) n = 0;
    if (n > 9999) {
      n = 9999; // 🚫 Límite máximo
      Swal.fire("Límite alcanzado", "La cantidad no puede superar 9999.", "warning");
    }

    copia[index] = { ...copia[index], cantidad: n };
    return copia;
  });
};

  const eliminarDetalle = (index: number) => {
    setDetalle((prev) => {
      const copia = [...prev];
      copia.splice(index, 1);
      return copia;
    });
    setProductoQuery((prev) => prev.filter((_, i) => i !== index));
    setInsumoQuery((prev) => {
      const nuevo: { [k: number]: string[] } = {};
      Object.keys(prev).forEach((k) => {
        const num = Number(k);
        if (num < index) nuevo[num] = prev[num];
        else if (num > index) nuevo[num - 1] = prev[num];
      });
      return nuevo;
    });
  };

  // Buscador producto (por línea)
  const handleProductoQueryChange = (index: number, value: string) => {
    value = normalizarTexto(value); 
    setProductoQuery((prev) => {
      const copia = [...prev];
      copia[index] = value;
      return copia;
    });
    setDetalle((prev) => {
      const copia = [...prev];
      if (copia[index]) copia[index] = { ...copia[index], producto: "" };
      return copia;
    });
  };

  const seleccionarProducto = (index: number, nombre: string) => {
    const prod = productos.find((p) => p.Nombre === nombre);
    if (!prod) return;
    setDetalle((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], producto: prod.Nombre, precio: prod.Precio };
      return copia;
    });
    setProductoQuery((prev) => {
      const copia = [...prev];
      copia[index] = "";
      return copia;
    });
  };

 const agregarInsumo = (index: number) => {
  console.log("➕ Agregando insumo en index:", index);

  setDetalle((prev) => {
    const copia = [...prev];

    if (!copia[index].insumos) {
      copia[index].insumos = [];
    }

    // 🚫 Evitar duplicados: si ya existe uno vacío no agregamos otro
    const yaTieneVacio = copia[index].insumos.some(
      (ins) => ins.insumo === "" && ins.cantidadUsada === 1
    );

    if (!yaTieneVacio) {
      copia[index].insumos.push({
        insumo: "",
        cantidadUsada: 1,
        disponible: 0,
      });
    }

    return copia;
  });

  setInsumoQuery((prev) => {
    const copia = { ...prev };
    if (!copia[index]) copia[index] = [];

    // Solo agregar si no hay ya un input vacío
    if (copia[index][copia[index].length - 1] !== "") {
      copia[index] = [...copia[index], ""];
    }

    return copia;
  });
};

  const handleInsumoQueryChange = (pIndex: number, iIndex: number, value: string) => {
    value = normalizarTexto(value); // ⛔ eliminar espacios
    setInsumoQuery((prev) => {
      const arr = prev[pIndex] ? [...prev[pIndex]] : [];
      arr[iIndex] = value;
      return { ...prev, [pIndex]: arr };
    });
    setDetalle((prev) => {
      const copia = [...prev];
      const list = copia[pIndex].insumos || [];
      if (list[iIndex]) list[iIndex].insumo = "";
      copia[pIndex].insumos = list;
      return copia;
    });
  };

  // asume: IInsumos tiene al menos { IdInsumo: number, Nombre: string, Cantidad: number }
const seleccionarInsumo = (pIndex: number, iIndex: number, ins: IInsumos) => {
  // 1) Actualizar detalle de forma inmutable y segura
  setDetalle((prev) => {
    // clonamos el array de líneas
    const copia = prev.map((linea) => ({
      ...linea,
      // clonamos array de insumos si existe
      insumos: linea.insumos ? [...linea.insumos] : undefined,
    }));

    // asegurarnos que exista la línea pIndex
    if (!copia[pIndex]) return prev;

    // si no tiene insumos, inicializamos el array
    if (!copia[pIndex].insumos) copia[pIndex].insumos = [];

    // si no existe la posición iIndex, la inicializamos conservando cantidadUsada a 0
    if (!copia[pIndex].insumos![iIndex]) {
      copia[pIndex].insumos![iIndex] = { insumo: "", cantidadUsada: 0, disponible: 0 };
    }

    // actualizamos solo esa entrada — preservando cantidadUsada si ya la había
    const existente = copia[pIndex].insumos![iIndex];
    copia[pIndex].insumos![iIndex] = {
      ...existente,
      insumo: ins.Nombre,
      disponible: ins.Cantidad, // cargamos stock disponible
      // cantidadUsada la dejamos como estaba (o 0 si no existía)
    };

    return copia;
  });

  // 2) Limpiar el query para que desaparezcan las sugerencias
  setInsumoQuery((prev) => {
    const copia = { ...prev };
    const arr = copia[pIndex] ? [...copia[pIndex]] : [];
    arr[iIndex] = ""; // <-- aquí limpiamos la caja de búsqueda
    copia[pIndex] = arr;
    return copia;
  });
};

  const actualizarInsumoCantidad = (pIndex: number, iIndex: number, valor: string | number) => {
    setDetalle((prev) => {
      const copia = [...prev];
      copia[pIndex].insumos = copia[pIndex].insumos || [];
      const insumosList = copia[pIndex].insumos!;
      const nuevaCantidad = typeof valor === "number" ? valor : parseFloat(String(valor));
      const cantidadFinal = isNaN(nuevaCantidad) ? 0 : nuevaCantidad;
      if (insumosList[iIndex] && cantidadFinal > insumosList[iIndex].disponible) {
        Swal.fire("Cantidad excedida", "No puedes usar más insumo del disponible.", "error");
        return prev; // no update
      }
      if (!insumosList[iIndex]) insumosList[iIndex] = { insumo: "", cantidadUsada: 0, disponible: 0 };
      insumosList[iIndex].cantidadUsada = cantidadFinal;
      copia[pIndex].insumos = insumosList;
      return copia;
    });
  };

  const eliminarInsumo = (pIndex: number, iIndex: number) => {
    setDetalle((prev) => {
      const copia = [...prev];
      copia[pIndex].insumos?.splice(iIndex, 1);
      return copia;
    });
    setInsumoQuery((prev) => {
      const arr = prev[pIndex] ? [...prev[pIndex]] : [];
      arr.splice(iIndex, 1);
      return { ...prev, [pIndex]: arr };
    });
  };

  // 🔹 Función auxiliar para descontar insumo
const descontarInsumo = async (insumo: IInsumos, cantidadUsada: number) => {
  const nuevoStock = insumo.Cantidad - cantidadUsada;

  if (nuevoStock < 0) {
    throw new Error(`Stock insuficiente para ${insumo.Nombre}`);
  }

  const actualizado: IInsumos = { ...insumo, Cantidad: nuevoStock };

  // Actualizar en API
  const resp = await fetch(`${APP_SETTINGS.apiUrl}Insumos/Actualizar/${insumo.IdInsumo}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(actualizado),
  });

  if (!resp.ok) {
    throw new Error(`No se pudo actualizar el stock de ${insumo.Nombre}`);
  }

  // Actualizar en estado local
  setInsumos((prev) =>
    prev.map((i) => (i.IdInsumo === insumo.IdInsumo ? { ...i, Cantidad: nuevoStock } : i))
  );

  return nuevoStock;
};

  // --- Validaciones (las mismas que tenías) ---
  const validarCampos = (): boolean => {
    if (!nombre || !tipoProduccion || !fechaInicio || !fechaFin) {
      Swal.fire("Campos incompletos", "Completa todos los campos.", "warning");
      return false;
    }
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      Swal.fire("Fechas inválidas", "La fecha final no puede ser anterior.", "warning");
      return false;
    }
    if (tipoProduccion === "Pedido" && !pedidoSeleccionado) {
      Swal.fire("Pedido requerido", "Selecciona un pedido para este tipo de producción.", "warning");
      return false;
    }
    if (detalle.length === 0) {
      Swal.fire("Sin productos", "Agrega al menos un producto.", "warning");
      return false;
    }
    for (let i = 0; i < detalle.length; i++) {
      const item = detalle[i];
      if (!item.producto || item.cantidad <= 0) {
        Swal.fire("Detalle incompleto", `Verifica producto #${i + 1}.`, "warning");
        return false;
      }
      if (!item.insumos || item.insumos.length === 0) {
        Swal.fire("Faltan insumos", `Agrega insumos al producto #${i + 1}.`, "warning");
        return false;
      }
      if (item.insumos.some((ins) => !ins.insumo || ins.cantidadUsada <= 0)) {
        Swal.fire("Insumos incompletos", `Verifica insumos del producto #${i + 1}.`, "warning");
        return false;
      }
    }
    return true;
  };

  // --- Crear producción + detalles + actualizar pedido ---
  const handleSubmit = async () => {
  if (!validarCampos()) return;
  setCreando(true);

  try {
    // ✅ 1. Validación previa de stock antes de crear producción
    const acumuladosValidacion: Record<number, number> = {};

    for (const producto of detalle) {
      for (const insumo of producto.insumos || []) {
        const insDb = insumos.find((i) => i.Nombre === insumo.insumo);
        if (!insDb) continue;

        acumuladosValidacion[insDb.IdInsumo] =
          (acumuladosValidacion[insDb.IdInsumo] || 0) + insumo.cantidadUsada;
      }
    }

    for (const [idInsumo, totalRequerido] of Object.entries(acumuladosValidacion)) {
      const insDb = insumos.find((i) => i.IdInsumo === Number(idInsumo));
      if (!insDb) continue;

      if (totalRequerido > insDb.Cantidad) {
        Swal.fire(
          "Stock insuficiente",
          `El insumo "${insDb.Nombre}" no tiene stock suficiente (disponible: ${insDb.Cantidad}, requerido: ${totalRequerido}).`,
          "error"
        );
        return;
      }
    }

    // ✅ 2. Crear producción
    const produccionBody: IProduccion = {
      NombreProduccion: nombre,
      TipoProduccion: tipoProduccion,
      FechaInicio: fechaInicio,
      FechaFinal: fechaFin,
      IdEstado: 1,
      IdPedido: pedidoSeleccionado ? pedidoSeleccionado.IdPedido : undefined,
    };

    const respProd = await fetch(`${APP_SETTINGS.apiUrl}Produccion/Crear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produccionBody),
    });

    if (!respProd.ok) {
      Swal.fire("Error", "No se pudo crear la producción.", "error");
      return;
    }

    const produccionCreada: IProduccion = await respProd.json();

    // ✅ 3. Crear detalles de producción y acumular insumos
    const acumulados: Record<number, number> = {};

    for (const producto of detalle) {
      const prodDb = productos.find((p) => p.Nombre === producto.producto);
      if (!prodDb) continue;

      for (const insumo of producto.insumos || []) {
        const insDb = insumos.find((i) => i.Nombre === insumo.insumo);
        if (!insDb) continue;

        const detalleBody: detalleProduccion = {
          IdProduccion: produccionCreada.IdProduccion!,
          IdProducto: prodDb.IdProducto!,
          IdInsumo: insDb.IdInsumo,
          CantidadProducir: producto.cantidad,
          CantidadInsumo: insumo.cantidadUsada,
          IdPedido: pedidoSeleccionado?.IdPedido || null, 
        };

        await fetch(`${APP_SETTINGS.apiUrl}Detalles_Produccion/Crear`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detalleBody),
        });

        acumulados[insDb.IdInsumo] =
          (acumulados[insDb.IdInsumo] || 0) + insumo.cantidadUsada;
      }

      // 🟢 Si es Directa ➝ Aumentar stock del producto
      if (tipoProduccion === "Directa") {
        const actualizado = {
          ...prodDb,
          Cantidad: prodDb.Cantidad + producto.cantidad, // sumamos la cantidad producida
        };

        await fetch(`${APP_SETTINGS.apiUrl}Productos/Actualizar/${prodDb.IdProducto}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(actualizado),
        });
      }
    }

    // ✅ 4. Descontar insumos acumulados
    for (const [idInsumo, totalUsado] of Object.entries(acumulados)) {
      const insDb = insumos.find((i) => i.IdInsumo === Number(idInsumo));
      if (!insDb) continue;
      await descontarInsumo(insDb, totalUsado);
    }

    // ✅ 5. Actualizar pedido si aplica
    if (tipoProduccion === "Pedido" && pedidoSeleccionado?.IdPedido) {
      try {
        const pedidoActualizado: IPedido = {
          ...pedidoSeleccionado,
          IdEstado: 3,
        };
        await fetch(`${APP_SETTINGS.apiUrl}Pedidos/Actualizar/${pedidoSeleccionado.IdPedido}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pedidoActualizado),
        });
      } catch (err) {
        console.warn("No se pudo actualizar el pedido, pero la producción fue creada.", err);
      }
    }

    // ✅ 6. Confirmación
    onCrear(produccionCreada);
    Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Producción creada correctamente.",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false, 
        });

    // 🟢 Cerrar modal automáticamente
    if (typeof onClose === "function") {
      onClose();
    }
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo crear la producción.", "error");
  }
};

  // --- Resumen de insumos (igual que antes) ---
  const resumenInsumos = (insumosG?: InsumoGasto[]) => {
    if (!insumosG || insumosG.length === 0) return null;
    const totales: Record<string, { usado: number; disponible: number }> = {};
    insumosG.forEach((ins) => {
      if (!totales[ins.insumo]) {
        totales[ins.insumo] = { usado: 0, disponible: ins.disponible };
      }
      totales[ins.insumo].usado += ins.cantidadUsada;
    });
    return (
      <div className="mt-3">
        <h6 className="text-secondary">Resumen de Insumos:</h6>
        <ul className="mb-0 ps-3">
          {Object.entries(totales).map(([nombre, datos], i) => (
            <li key={i}>
              {nombre}:  Disponible {datos.disponible}
            </li>
          ))}
        </ul>
      </div>
    );
  };

    return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">Crear Producción</h2>
      {/* Campos generales */}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">🏷️ Nombre *</label>
          <input
  type="text"
  className="form-control"
  value={nombre}
  onChange={(e) => {
  let valor = e.target.value;

  // ❌ Sin espacios al inicio ni dobles
  valor = valor.replace(/^\s+/, "");
  valor = valor.replace(/\s{2,}/g, " ");

  // ❌ Bloquear caracteres especiales (permitir letras, números y espacios)
  if (/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/.test(valor)) {
    Swal.fire({
      icon: "warning",
      title: "Caracter inválido",
      text: "Solo se permiten letras, números y espacios.",
      timer: 1500,
      showConfirmButton: false,
    });
    valor = valor.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");
  }

  // ❌ Bloquear repeticiones largas (más de 3 veces la misma letra o número)
  if (/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])\1{3,}/.test(valor)) {
    Swal.fire({
      icon: "warning",
      title: "Repetición excesiva",
      text: "No repitas el mismo carácter más de 3 veces consecutivas.",
      timer: 1500,
      showConfirmButton: false,
    });
    valor = valor.replace(/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])\1{3,}/g, "$1$1$1");
  }

  setNombre(valor);
}}

/>

        </div>
        <div className="col-md-6">
          <label className="form-label">⚙️ Tipo de Producción *</label>
          <select className="form-select" value={tipoProduccion} onChange={(e) => setTipoProduccion(e.target.value)}>
            <option value="">Seleccione</option>
            <option value="Directa">Directa</option>
            <option value="Pedido">Pedido</option>
          </select>
        </div>
        {/* 🔎 Buscador Pedido (solo si es tipo Pedido) */}
{tipoProduccion === "Pedido" && (
  <div className="row g-3 mb-3 mt-2 position-relative">
    <div className="col-md-12">
      <label className="form-label">🔎 Buscar Pedido por Cliente</label>
      <input
        type="text"
        className="form-control"
        placeholder="Escribe nombre del cliente o #pedido..."
        value={pedidoQuery}
        onChange={(e) => {
          let valor = e.target.value;

          // 🚫 Sin espacios al inicio
          valor = valor.replace(/^\s+/, "");

          // ⚙️ Permitir un solo espacio intermedio
          valor = valor.replace(/\s{2,}/g, " ");

          // 🚫 Solo letras, números, # y espacios (para nombres de clientes o pedidos)
          if (/[^a-zA-Z0-9#áéíóúÁÉÍÓÚñÑ\s]/.test(valor)) {
            Swal.fire({
              icon: "warning",
              title: "Entrada inválida",
              text: "Solo se permiten letras, números, # y espacios.",
              timer: 1800,
              showConfirmButton: false,
            });
            valor = valor.replace(/[^a-zA-Z0-9#áéíóúÁÉÍÓÚñÑ\s]/g, "");
          }

          // 🔁 Evitar repeticiones largas tipo 'aaaaa' o '11111'
          if (/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])\1{3,}/.test(valor)) {
    Swal.fire({
      icon: "warning",
      title: "Repetición excesiva",
      text: "No repitas el mismo carácter más de 3 veces consecutivas.",
      timer: 1500,
      showConfirmButton: false,
    });
    valor = valor.replace(/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])\1{3,}/g, "$1$1$1");
  }

          handlePedidoQueryChange((valor));
        }}
        maxLength={50}
      />

      {pedidoSuggestions.length > 0 && (
        <ul
          className="list-group position-absolute w-50"
          style={{ zIndex: 1100 }}
        >
          {pedidoSuggestions.map((p) => (
            <li
              key={p.IdPedido}
              className="list-group-item list-group-item-action"
              style={{ cursor: "pointer" }}
              onClick={() => seleccionarPedido(p)}
            >
              Pedido #{p.IdPedido} — Cliente: {getClienteName(p.IdCliente)} — Total: {p.TotalPedido ?? 0}
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
)}


        {/* 📅 Fecha de Inicio */}
<div className="col-md-6">
  <label className="form-label">📅 Fecha de Inicio *</label>
  <input
    type="date"
    className="form-control"
    value={fechaInicio}
    min={fechaServidor} // 🔹 No puede ser antes de la fecha del servidor
    onChange={(e) => {
      const nuevaFecha = e.target.value;

      if (new Date(nuevaFecha) < new Date(fechaServidor)) {
        Swal.fire({
          icon: "warning",
          title: "Fecha inválida",
          text: "La fecha de inicio no puede ser anterior a hoy.",
          timer: 2000,
          showConfirmButton: false,
        });
        setFechaInicio(fechaServidor);
      } else {
        setFechaInicio(nuevaFecha);

        // Si la fecha final es anterior, la ajustamos
        if (new Date(fechaFin) < new Date(nuevaFecha)) {
          setFechaFin(nuevaFecha);
        }
      }
    }}
  />
</div>

{/* 📦 Fecha de Finalización */}
<div className="col-md-6">
  <label className="form-label">📦 Fecha de Finalización *</label>
  <input
    type="date"
    className="form-control"
    value={fechaFin}
    min={fechaInicio} // 🔹 No puede ser antes de la fecha de inicio
    onChange={(e) => {
      const nuevaFechaFin = e.target.value;

      if (new Date(nuevaFechaFin) < new Date(fechaInicio)) {
        Swal.fire({
          icon: "warning",
          title: "Fecha inválida",
          text: "La fecha final no puede ser anterior a la fecha de inicio.",
          timer: 2000,
          showConfirmButton: false,
        });
        setFechaFin(fechaInicio);
      } else {
        setFechaFin(nuevaFechaFin);
      }
    }}
  />
</div>

      </div>

      

      {/* Detalles */}
      <div className="mt-4">
        <h5 className="mb-2">📦 Detalle de la Producción</h5>
        <div className="row fw-bold text-secondary mb-2">
          <div className="col-md-5">Producto *</div>
          <div className="col-md-4">Cantidad *</div>
          <div className="col-md-3">Acciones *</div>
        </div>

        {detalle.map((item, index) => {
          const q = productoQuery[index] ?? "";
          const sugerenciasProd =
  q.length > 0
    ? productos.filter(
        (p) =>
          p.Nombre.toLowerCase().includes(q.toLowerCase()) &&
          !detalle.some((d, di) => d.producto === p.Nombre && di !== index)
      )
    : [];

          return (
            <div key={index} className="row align-items-center mb-2 position-relative">
  {/* Buscador Producto (línea) */}
  <div className="col-md-5 position-relative">
  <input
    type="text"
    className="form-control"
    placeholder="Buscar producto..."
    value={q !== "" ? q : item.producto}
    onChange={(e) => {
      let valor = e.target.value;

      // 🚫 Quitar espacios al inicio
      valor = valor.replace(/^\s+/, "");

      // 🚫 No permitir más de un espacio consecutivo
      valor = valor.replace(/\s{2,}/g, " ");

      // ✅ Permitir letras, números y espacios — bloquear lo demás
      if (/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/.test(valor)) {
        Swal.fire({
          icon: "warning",
          title: "Caracter inválido",
          text: "Solo se permiten letras, números y espacios.",
          timer: 1500,
          showConfirmButton: false,
        });
        valor = valor.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");
      }

      // 🚫 Evitar repeticiones largas tipo 'aaaaaa' o '111111'
      if (/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])\1{3,}/.test(valor)) {
    Swal.fire({
      icon: "warning",
      title: "Repetición excesiva",
      text: "No repitas el mismo carácter más de 3 veces consecutivas.",
      timer: 1500,
      showConfirmButton: false,
    });
    valor = valor.replace(/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])\1{3,}/g, "$1$1$1");
  }

      handleProductoQueryChange(index, valor);
    }}
    disabled={tipoProduccion === "Pedido"} // 🚫 Bloquear si viene de Pedido
  />

  {q && sugerenciasProd.length > 0 && tipoProduccion !== "Pedido" && (
    <ul
      className="list-group position-absolute w-100"
      style={{ zIndex: 1200, top: "38px" }}
    >
      {sugerenciasProd.map((p) => (
        <li
          key={p.IdProducto}
          className="list-group-item list-group-item-action"
          style={{ cursor: "pointer" }}
          onClick={() => seleccionarProducto(index, p.Nombre)}
        >
          {p.Nombre} - ${p.Precio?.toLocaleString("es-CO")}
        </li>
      ))}
    </ul>
  )}
</div>


  <div className="col-md-4">
  <input
    type="number"
    className="form-control"
    value={item.cantidad}
    min={1}
    maxLength={5}
    onChange={(e) => {
      let valor = parseInt(e.target.value);

      // Si el valor es menor a 1 o vacío, se restaura a 1
      if (!valor || valor < 1) {
        Swal.fire({
          icon: "warning",
          title: "Cantidad inválida",
          text: "La cantidad mínima es 1.",
          timer: 1500,
          showConfirmButton: false,
        });
        valor = 1;
      }

      actualizarDetalleCantidad(index, valor);
    }}
    disabled={tipoProduccion === "Pedido"} // 🚫 Bloquear si viene de Pedido
  />
</div>


  <div className="col-md-3 d-flex gap-2">
    <button
    type="button"
    className={`btn btn-sm ${
      item.insumos && item.insumos.length > 0
        ? "btn-success"
        : "btn-outline-secondary"
    }`}
    onClick={() => setMostrarSubmodal(index)}
  >
    {item.insumos && item.insumos.length > 0
      ? "Insumos agregados 🧪"
      : "Gasto Insumos 🧪"}
  </button>

  {tipoProduccion !== "Pedido" && (
    <button
      type="button"
      className="btn btn-danger btn-sm"
      onClick={() => eliminarDetalle(index)}
    >
      <span style={{ color: "white", fontWeight: "bold" }}>X</span>
    </button>
    )}
  </div>

  {/* Submodal insumos */}
  {/* 🌸 MODAL DE GASTO DE INSUMOS CON ESTILO PASTEL */}
{mostrarSubmodal === index && (
  <div className="modal-overlay" onClick={() => setMostrarSubmodal(null)}>
    <div
      className="modal-box-pastel"
      onClick={(e) => e.stopPropagation()} // evita cerrar al hacer click dentro
    >
      {/* 🌸 Encabezado */}
      <div className="modal-header-pastel">
        <h5>🧪 Gasto de Insumos</h5>
        <button className="close-btn" onClick={() => setMostrarSubmodal(null)}>
          ✖
        </button>
      </div>

      {/* 🌸 Cuerpo */}
      <div className="modal-body">
        {item.insumos?.map((insumo, i) => {
          const qI = insumoQuery[index]?.[i] ?? "";
          const sugerenciasIns =
            qI.length > 0
              ? insumos.filter(
                  (ins) =>
                    ins.Nombre.toLowerCase().includes(qI.toLowerCase()) &&
                    !(item.insumos ?? []).some(
                      (iSel, ii) => iSel.insumo === ins.Nombre && ii !== i
                    )
                )
              : [];

          return (
            <div key={i} className="row align-items-center mb-3 position-relative">
              {/* 🔍 Buscador de insumo */}
              <div className="col-md-5 position-relative">
                <input
                  type="text"
                  className="pastel-input w-100"
                  placeholder="Buscar insumo..."
                  value={qI !== "" ? qI : insumo.insumo}
                  onChange={(e) => {
                    let valor = e.target.value.trimStart().replace(/\s{2,}/g, " ");
                    if (/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/.test(valor)) {
                      Swal.fire({
                        icon: "warning",
                        title: "Caracter inválido",
                        text: "Solo se permiten letras, números y espacios.",
                        timer: 1500,
                        showConfirmButton: false,
                      });
                      valor = valor.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "");
                    }
                    if (/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])\1{3,}/.test(valor)) {
                      Swal.fire({
                        icon: "warning",
                        title: "Repetición excesiva",
                        text: "No repitas el mismo carácter más de 3 veces consecutivas.",
                        timer: 1500,
                        showConfirmButton: false,
                      });
                      valor = valor.replace(/([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ])\1{3,}/g, "$1$1$1");
                    }
                    handleInsumoQueryChange(index, i, valor);
                  }}
                />
                {qI && sugerenciasIns.length > 0 && (
                  <ul
                    className="list-group position-absolute w-100"
                    style={{ zIndex: 1200, top: "38px" }}
                  >
                    {sugerenciasIns.map((ins) => (
                      <li
                        key={ins.IdInsumo}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: "pointer" }}
                        onClick={() => seleccionarInsumo(index, i, ins)}
                      >
                        {ins.Nombre} - Disponible: {ins.Cantidad}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 🔢 Cantidad usada */}
              <div className="col-md-5">
                <input
                  type="number"
                  className="pastel-input w-100"
                  value={insumo.cantidadUsada}
                  min={1}
                  maxLength={5}
                  onChange={(e) => {
                    let valor = parseInt(e.target.value);
                    if (!valor || valor < 1) {
                      Swal.fire({
                        icon: "warning",
                        title: "Cantidad inválida",
                        text: "La cantidad mínima es 1.",
                        timer: 1500,
                        showConfirmButton: false,
                      });
                      valor = 1;
                    }
                    actualizarInsumoCantidad(index, i, valor);
                  }}
                />
              </div>

              {/* ❌ Botón eliminar */}
              <div className="col-md-2 text-end">
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => eliminarInsumo(index, i)}
                >
                  <span style={{ color: "white", fontWeight: "bold" }}>X</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* 📊 Resumen de insumos */}
        {resumenInsumos(item.insumos)}

        {/* ✅ Botones */}
        <div className="text-end mt-4">
          <button
            type="button"
            className="btn pastel-btn-secondary me-2"
            onClick={(e) => {
              e.stopPropagation();
              agregarInsumo(index);
            }}
          >
            + Agregar Insumo
          </button>

          <button
            type="button"
            className="pastel-btn-listo"
            onClick={() => setMostrarSubmodal(null)}
          >
            ✔ Listo
          </button>
        </div>
      </div>
    </div>
  </div>
)}


</div>

          );
        })}

        {tipoProduccion === "Directa" && (
  <button
    className="btn btn-sm pastel-btn-secondary mt-2"
    onClick={agregarDetalle}
  >
    + Agregar Producto
  </button>
)}
      </div>

      <div className="text-end mt-4">
        <button className="btn pastel-btn-secondary me-2" onClick={onClose}>Cancelar</button>
        <button
      className="btn pastel-btn-primary"
      onClick={handleSubmit}
      disabled={creando}
    >
      {creando ? "Creando..." : "Crear"}
    </button>
        
      </div>
    </div>
  );
};

export default CrearProduccion;
