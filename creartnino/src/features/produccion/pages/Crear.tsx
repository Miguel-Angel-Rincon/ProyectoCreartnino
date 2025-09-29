import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
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

  // --- Cargar datos iniciales ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [respProd, respIns, respPedidos, respClientes] = await Promise.all([
          fetch(`${APP_SETTINGS.apiUrl}Productos/Lista`),
          fetch(`${APP_SETTINGS.apiUrl}Insumos/Lista`),
          fetch(`${APP_SETTINGS.apiUrl}Pedidos/Lista`),
          fetch(`${APP_SETTINGS.apiUrl}Clientes/Lista`),
        ]);
        if (!respProd.ok || !respIns.ok || !respPedidos.ok || !respClientes.ok) {
          throw new Error("Error fetching lists");
        }
        const [dataProd, dataIns, dataPedidos, dataClientes] = await Promise.all([
          respProd.json(),
          respIns.json(),
          respPedidos.json(),
          respClientes.json(),
        ]);
        setProductos(dataProd || []);
        setInsumos(dataIns || []);
        setPedidos(dataPedidos || []);
        setClientes(dataClientes || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
        Swal.fire("Error", "No se pudieron cargar los datos.", "error");
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
const normalizarTexto = (valor: string) => valor.replace(/\s+/g, " ").trim();



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
    const estadoValido = p.IdEstado === 1 || p.IdEstado === 2;
    return coincideTexto && estadoValido;
  });
  setPedidoSuggestions(sugeridos.slice(0, 8));
};


  // Al seleccionar un pedido — obtener detalles completos y autopoblar detalle de producción
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
      const next = [...prev, { producto: "", cantidad: 0, precio: 0, insumos: [] }];
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
      (ins) => ins.insumo === "" && ins.cantidadUsada === 0
    );

    if (!yaTieneVacio) {
      copia[index].insumos.push({
        insumo: "",
        cantidadUsada: 0,
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
    Swal.fire("Éxito", "Producción creada correctamente.", "success");

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
              {nombre}: Usado {datos.usado} / Disponible {datos.disponible}
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
              const value = e.target.value;
              if (value.trim() === "" && value !== "") return;
              setNombre(value);
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
  <div className="row g-3 mb-3 mt-2">
    <div className="col-md-12">
      <label className="form-label">🔎 Buscar Pedido por Cliente</label>
      <input
        type="text"
        className="form-control"
        placeholder="Escribe nombre del cliente o #pedido..."
        value={pedidoQuery}
        onChange={(e) => handlePedidoQueryChange(normalizarTexto(e.target.value))}
      />
      {pedidoSuggestions.length > 0 && (
        <ul className="list-group position-absolute w-50" style={{ zIndex: 1100 }}>
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

        <div className="col-md-6">
          <label className="form-label">📅 Fecha de Inicio *</label>
          <input type="date" className="form-control" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">📦 Fecha de Finalización *</label>
          <input type="date" className="form-control" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
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
          const sugerenciasProd = q.length > 0 ? productos.filter((p) => p.Nombre.toLowerCase().includes(q.toLowerCase())) : [];

          return (
            <div key={index} className="row align-items-center mb-2 position-relative">
  {/* Buscador Producto (línea) */}
  <div className="col-md-5 position-relative">
    <input
      type="text"
      className="form-control"
      placeholder="Buscar producto..."
      value={q !== "" ? q : item.producto}
      onChange={(e) => handleProductoQueryChange(index, e.target.value)}
      disabled={tipoProduccion === "Pedido"} // 🚫 Bloquear si viene de Pedido
    />
    {q && sugerenciasProd.length > 0 && tipoProduccion !== "Pedido" && (
      <ul className="list-group position-absolute w-100" style={{ zIndex: 1200, top: "38px" }}>
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
      maxLength={5}
      onChange={(e) => actualizarDetalleCantidad(index, e.target.value)}
      disabled={tipoProduccion === "Pedido"} // 🚫 Bloquear si viene de Pedido
    />
  </div>

  <div className="col-md-3 d-flex gap-2">
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm"
      onClick={() => setMostrarSubmodal(index)}
    >
      Gasto Insumos🧪
    </button>

    {tipoProduccion !== "Pedido" && (
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={() => eliminarDetalle(index)}
      >
        ✖
      </button>
    )}
  </div>

  {/* Submodal insumos */}
  <Modal
  show={mostrarSubmodal === index}
  onHide={() => setMostrarSubmodal(null)}
  centered
  className="pastel-modal"
>
  <Modal.Header closeButton className="pastel-header">
    <Modal.Title>🧪 Gasto de Insumos</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    {/* 🔄 Renderizar insumos */}
    {item.insumos?.map((insumo, i) => {
      const qI = insumoQuery[index]?.[i] ?? "";
      const sugerenciasIns =
        qI.length > 0
          ? insumos.filter((ins) =>
              ins.Nombre.toLowerCase().includes(qI.toLowerCase())
            )
          : [];

      return (
        <div
          key={i}
          className="row align-items-center mb-2 position-relative"
        >
          {/* 🔎 Buscador de insumos */}
          <div className="col-md-5 position-relative">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar insumo..."
              value={qI !== "" ? qI : insumo.insumo}
              onChange={(e) =>
                handleInsumoQueryChange(index, i, e.target.value)
              }
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
              className="form-control"
              value={insumo.cantidadUsada}
              maxLength={5}
              min={0}
              onChange={(e) =>
                actualizarInsumoCantidad(index, i, Number(e.target.value))
              }
            />
          </div>

          {/* ❌ Botón eliminar */}
          <div className="col-md-2 text-end">
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => eliminarInsumo(index, i)}
            >
              ✖
            </button>
          </div>
        </div>
      );
    })}

    {/* 📊 Resumen de insumos */}
    {resumenInsumos(item.insumos)}

    {/* ✅ Botones del modal */}
    <div className="text-end mt-3">
      <button
  type="button"
  className="btn btn-sm pastel-btn-secondary me-2"
  onClick={(e) => {
    e.stopPropagation(); // 🚫 evita que se dispare dos veces
    agregarInsumo(index);
  }}
>
  + Agregar Insumo
</button>

      <button
        type="button"
        className="btn btn-sm pastel-btn-primary"
        onClick={() => setMostrarSubmodal(null)}
      >
        ✔ Listo
      </button>
    </div>
  </Modal.Body>
</Modal>

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
        <button className="btn pastel-btn-primary" onClick={handleSubmit}>Crear</button>
      </div>
    </div>
  );
};

export default CrearProduccion;
