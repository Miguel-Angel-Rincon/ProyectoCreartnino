import React, { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import {
  FaCalculator,
  FaTrash,
} from "react-icons/fa";
import { APP_SETTINGS } from "../../../settings/appsettings";
import type { IProveedores } from "../../interfaces/IProveedores";
import type { IInsumos } from "../../interfaces/IInsumos";
import "../styles/style.css";

interface CrearCompraProps {
  onClose: () => void;
  onCrear: (compra: any) => void;
}

interface CompraDetalle {
  idInsumo?: number;
  insumo: string;
  cantidad: number;
  precio: number;
  subtotal?: number;
}

const CrearCompra: React.FC<CrearCompraProps> = ({ onClose, onCrear }) => {
  const [proveedores, setProveedores] = useState<IProveedores[]>([]);
  const [insumos, setInsumos] = useState<IInsumos[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [proveedorIdSeleccionado, setProveedorIdSeleccionado] = useState<number | null>(null);
  const [proveedorBusqueda, setProveedorBusqueda] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [detalleCompra, setDetalleCompra] = useState<CompraDetalle[]>([]);
  const [insumoQuery, setInsumoQuery] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fechaCompra, setFechaCompra] = useState<string>("");
  const tempIdCounter = useRef(-1);

  const buildApiUrl = (path: string) => {
    const base = (APP_SETTINGS.apiUrl || "").replace(/\/+$/, "");
    const p = path.replace(/^\/+/, "");
    return `${base}/${p}`;
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provRes, insuRes, fechaRes, catRes] = await Promise.all([
          fetch(buildApiUrl("Proveedores/Lista")),
          fetch(buildApiUrl("Insumos/Lista")),
          fetch(buildApiUrl("Utilidades/FechaServidor")),
          fetch(buildApiUrl("Categoria_Insumos/Lista")),
        ]);

        if (!provRes.ok) throw new Error(`Proveedor: ${provRes.status}`);
        if (!insuRes.ok) throw new Error(`Insumo: ${insuRes.status}`);
        if (!fechaRes.ok) throw new Error(`Fecha servidor: ${fechaRes.status}`);
        if (!catRes.ok) throw new Error(`Categorías: ${catRes.status}`);

        const [prov, insu, fecha, cat] = await Promise.all([
          provRes.json(),
          insuRes.json(),
          fechaRes.json(),
          catRes.json(),
        ]);

        setProveedores(prov);
        setInsumos(insu);
        setCategorias(Array.isArray(cat) ? cat : []);

        const fechaServidor = new Date(fecha.FechaServidor);
        const fechaISO = fechaServidor.toISOString().split("T")[0];
        setFechaCompra(fechaISO);
      } catch (err: any) {
        console.error("❌ Error al cargar datos:", err);
        Swal.fire("Error", "No se pudieron cargar proveedores, insumos o fecha del servidor.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  let alertaMostrada = false;
  const mostrarAlertaInvalida = () => {
    if (!alertaMostrada) {
      alertaMostrada = true;
      Swal.fire({
        icon: "warning",
        title: "Entrada no válida",
        text: "Solo se permiten letras y espacios. No use números ni caracteres especiales.",
        timer: 2500,
        showConfirmButton: false,
      }).then(() => {
        alertaMostrada = false;
      });
    }
  };

  const proveedoresFiltrados = proveedorBusqueda
    ? proveedores.filter((p) =>
        (p.NombreCompleto ?? "").toLowerCase().includes(proveedorBusqueda.toLowerCase())
      )
    : [];

  const agregarDetalle = () => {
    setDetalleCompra((prev) => [...prev, { insumo: "", cantidad: 1, precio: 0, subtotal: 0 }]);
    setInsumoQuery((prev) => [...prev, ""]);
  };

  const calcularSubtotalFila = (cantidad: number, precio: number) =>
    Math.round(cantidad * precio * 100) / 100;

  // Formatea número a COP con separador de miles (ej: 5000 -> "5.000")
  const formatCOP = (value: number | string) => {
    const n = Number(value) || 0;
    if (n === 0) return "";
    return n.toLocaleString("es-CO");
  };

  const formatCOPWithSign = (value: number | string) => {
    const f = formatCOP(value);
    return f ? `$${f}` : "";
  };

  const actualizarDetalle = (index: number, campo: keyof CompraDetalle, valor: string | number) => {
    const copia = [...detalleCompra];
    if (!copia[index]) return;

    if (campo === "cantidad") copia[index].cantidad = Number(valor) || 0;
    else if (campo === "precio") {
      copia[index].precio = Number(valor) || 0;
      // Si la fila se refiere a un insumo local o existente, actualizar su precio en el listado local
      const id = copia[index].idInsumo;
      if (id !== undefined && id !== null) {
        setInsumos((prev) =>
          prev.map((p) =>
            p.IdInsumo === id ? { ...p, PrecioUnitario: Number(copia[index].precio) } : p
          )
        );
      }
    }
    else if (campo === "insumo") {
      const insu = insumos.find((i) => i.Nombre === valor);
      copia[index].insumo = insu?.Nombre ?? (valor as string);
      copia[index].precio = insu?.PrecioUnitario ?? copia[index].precio;
      copia[index].idInsumo = insu?.IdInsumo;
      setInsumoQuery((prev) => {
        const copy = [...prev];
        copy[index] = "";
        return copy;
      });
    }

    copia[index].subtotal = calcularSubtotalFila(copia[index].cantidad, copia[index].precio);
    setDetalleCompra(copia);
  };

  const seleccionarInsumo = (index: number, nombre: string) => {
    const insu = insumos.find((i) => i.Nombre === nombre);
    if (!insu) return;
    actualizarDetalle(index, "insumo", insu.Nombre);
  };

  const handleInsumoQueryChange = (index: number, value: string) => {
  setInsumoQuery((prev) => {
    const copia = [...prev];
    copia[index] = value;
    return copia;
  });
  
  setDetalleCompra((prev) => {
    const copia = [...prev];
    if (copia[index]) {
      const currentIdInsumo = copia[index].idInsumo;
      
      // ✅ Si tiene un ID temporal (negativo), mantenerlo y actualizar el nombre
      if (currentIdInsumo !== undefined && currentIdInsumo !== null && currentIdInsumo < 0) {
        copia[index] = { ...copia[index], insumo: value };
        
        // ✅ Actualizar también el nombre en la lista de insumos
        setInsumos((prevInsumos) =>
          prevInsumos.map((ins) =>
            ins.IdInsumo === currentIdInsumo ? { ...ins, Nombre: value } : ins
          )
        );
      } else {
        // Si no tiene ID o tiene ID positivo (del servidor), limpiar como antes
        copia[index] = { ...copia[index], insumo: "", idInsumo: undefined };
      }
    }
    return copia;
  });
};

  const eliminarDetalle = (index: number) => {
    setDetalleCompra((prev) => prev.filter((_, i) => i !== index));
    setInsumoQuery((prev) => prev.filter((_, i) => i !== index));
  };

  const calcularTotal = () =>
    detalleCompra.reduce(
      (acc, item) => acc + (item.subtotal ?? calcularSubtotalFila(item.cantidad, item.precio)),
      0
    );

  const handleSubmit = async () => {
    if (submitting) return;

    if (!proveedorIdSeleccionado) {
      Swal.fire("⚠ Atención", "Debes seleccionar un proveedor válido.", "warning");
      return;
    }

    if (!metodoPago) {
      Swal.fire("⚠ Atención", "Selecciona un método de pago.", "warning");
      return;
    }

    if (!fechaCompra) {
      Swal.fire("⚠ Atención", "No se pudo obtener la fecha de compra.", "warning");
      return;
    }

    if (detalleCompra.length === 0) {
      Swal.fire("⚠ Atención", "Debes agregar al menos un insumo.", "warning");
      return;
    }

    const nombresInsumos = new Set<number>();

    for (let i = 0; i < detalleCompra.length; i++) {
      const item = detalleCompra[i];
      const insumo = insumos.find((ins) => ins.Nombre === item.insumo);

      if (!insumo || !item.idInsumo) {
        Swal.fire("⚠ Error", `Fila #${i + 1}: el insumo "${item.insumo || "(vacío)"}" no es válido.`, "warning");
        return;
      }

      if (nombresInsumos.has(item.idInsumo)) {
        Swal.fire("⚠ Error", `El insumo "${item.insumo}" está duplicado. Verifica las filas.`, "warning");
        return;
      }

      nombresInsumos.add(item.idInsumo);

      if (item.cantidad <= 0) {
        Swal.fire("⚠ Error", `Fila #${i + 1}: la cantidad debe ser mayor que 0.`, "warning");
        return;
      }

      if (item.precio <= 0) {
        Swal.fire("⚠ Error", `Fila #${i + 1}: el precio debe ser mayor que 0.`, "warning");
        return;
      }
    }

    const total = calcularTotal();
    if (total <= 0) {
      Swal.fire("⚠ Atención", "El total de la compra debe ser mayor a 0.", "warning");
      return;
    }

      setSubmitting(true);

      try {
        const detalleCopy = detalleCompra.map((d) => ({ ...d }));

        // Create any temporary local insumos (negative Id) on the server now
        const tempInsumos = insumos.filter((i) => (i.IdInsumo ?? 0) < 0);
        if (tempInsumos.length > 0) {
          for (const temp of tempInsumos) {
            const respTemp = await fetch(buildApiUrl("Insumos/Crear"), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                IdCatInsumo: (temp as any).IdCatInsumo,
                Nombre: (temp as any).Nombre,
                UnidadesMedidas: (temp as any).UnidadesMedidas,
                PrecioUnitario: (temp as any).PrecioUnitario,
                Cantidad: (temp as any).Cantidad ?? 0,
                Estado: true,
              }),
            });

            if (!respTemp.ok) throw new Error(`Error al crear insumo "${(temp as any).Nombre}" en el servidor`);
            const created = await respTemp.json();

            // replace temp ids with real ids in detalleCopy
            for (let j = 0; j < detalleCopy.length; j++) {
              if (detalleCopy[j].idInsumo === temp.IdInsumo) detalleCopy[j].idInsumo = created.IdInsumo;
            }

            // replace local insumo entry id
            setInsumos((prev) => prev.map((p) => (p.IdInsumo === temp.IdInsumo ? { ...p, IdInsumo: created.IdInsumo } : p)));
          }

          setDetalleCompra(detalleCopy);
          // Obtener lista actualizada desde servidor para sincronizar precios/ids
          try {
            const listaRes = await fetch(buildApiUrl("Insumos/Lista"));
            if (listaRes.ok) {
              const lista = await listaRes.json();
              setInsumos(lista);
            }
          } catch (err) {
            console.warn("No se pudo refrescar la lista de insumos después de crear temporales:", err);
          }
        }

        const payload = {
          IdCompra: 0,
          IdProveedor: proveedorIdSeleccionado,
          MetodoPago: metodoPago,
          FechaCompra: fechaCompra,
          Total: total,
          IdEstado: 1,
          DetallesCompras: detalleCopy.map((d) => ({
            IdDetalleCompra: 0,
            IdCompra: 0,
            IdInsumo: d.idInsumo,
            Cantidad: d.cantidad,
            PrecioUnitario: d.precio,
            Subtotal: d.subtotal,
          })),
        };

        const resp = await fetch(buildApiUrl("Compras/Crear"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) throw new Error("Error al crear la compra");

        const compraCreada = await resp.json();

        // Obtener la lista más reciente de insumos desde el servidor antes de actualizar cantidades
        let latestInsumos: any[] = insumos;
        try {
          const latestRes = await fetch(buildApiUrl("Insumos/Lista"));
          if (latestRes.ok) latestInsumos = await latestRes.json();
        } catch (err) {
          console.warn("No se pudo obtener la lista de insumos actual antes de actualizar cantidades:", err);
        }

        for (let detalle of detalleCopy) {
          if (!detalle.idInsumo) continue;
          const insumo = latestInsumos.find((i) => i.IdInsumo === detalle.idInsumo);
          if (!insumo) continue;

          const currentCantidad = Number(insumo.Cantidad ?? insumo.cantidad ?? 0);
          const nuevaCantidad = currentCantidad + detalle.cantidad;

          await fetch(buildApiUrl(`Insumos/Actualizar/${detalle.idInsumo}`), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...insumo, Cantidad: nuevaCantidad }),
          });
        }

        // Refrescar lista de insumos para que muestre las cantidades actualizadas
        try {
          const listaRes2 = await fetch(buildApiUrl("Insumos/Lista"));
          if (listaRes2.ok) {
            const lista2 = await listaRes2.json();
            setInsumos(lista2);
          }
        } catch (err) {
          console.warn("No se pudo refrescar la lista de insumos después de actualizar cantidades:", err);
        }

        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Compra creada correctamente.",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        onCrear(compraCreada);
        onClose();
      } catch (err: any) {
        console.error("❌ Error al guardar la compra:", err);
        Swal.fire("❌ Error", err.message || "No se pudo guardar la compra.", "error");
      } finally {
        setSubmitting(false);
      }
  };

  return (
    <div className="container-fluid pastel-contenido">
      <h2 className="titulo mb-4">Crear Compra</h2>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 180 }}>
          <div className="spinner-border" role="status" aria-hidden="true" />
          <span className="ms-2">Cargando datos...</span>
        </div>
      ) : (
        <>
          <div className="row mb-3">
            <div className="col-md-4 position-relative">
              <label className="form-label">🧑 Proveedor *</label>
              <input
                type="text"
                value={proveedorBusqueda}
                placeholder="Buscar proveedor..."
                onChange={(e) => {
                  let valor = e.target.value;
                  valor = valor.replace(/^\s+/, "");
                  valor = valor.replace(/\s{2,}/g, " ");
                  if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(valor)) {
                    mostrarAlertaInvalida();
                    valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                  }
                  valor = valor.replace(/([a-zA-ZáéíóúÁÉÍÓÚñÑ])\1{3,}/g, "$1$1$1");
                  setProveedorBusqueda(valor);
                  setProveedorIdSeleccionado(null);
                }}
                className="form-control"
              />

              {!proveedorIdSeleccionado && proveedorBusqueda && proveedoresFiltrados.length > 0 && (
                <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                  {proveedoresFiltrados.map((p) => (
                    <li
                      key={p.IdProveedor}
                      className="list-group-item list-group-item-action"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setProveedorIdSeleccionado(p.IdProveedor!);
                        setProveedorBusqueda(p.NombreCompleto ?? "");
                      }}
                    >
                      {p.NombreCompleto} - {p.TipoDocumento} - {p.NumDocumento}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label">💳 Método de Pago *</label>
              <select className="form-select" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                <option value="">Seleccione</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">📅 Fecha de Compra</label>
              <input type="date" className="form-control" value={fechaCompra} disabled readOnly />
            </div>
            {proveedorIdSeleccionado && (
              <div className="col-md-4 mb-3">
                <label className="form-label">🪪 Documento del proveedor</label>
                <input
                  type="text"
                  className="form-control"
                  value={(() => {
                    const proveedor = proveedores.find((p) => p.IdProveedor === proveedorIdSeleccionado);
                    return proveedor ? `${proveedor.TipoDocumento ?? ""}: ${proveedor.NumDocumento ?? ""}` : "";
                  })()}
                  disabled
                  readOnly
                />
              </div>
            )}
          </div>

          <div className="mb-3">
            <h5 className="mb-3">📦 Detalle de la compra</h5>
            <div className="row fw-bold text-secondary mb-1">
              <div className="col-md-3">Insumo</div>
              <div className="col-md-2">Cantidad</div>
              <div className="col-md-2">Precio</div>
              <div className="col-md-3">Subtotal</div>
              <div className="col-md-2 text-end">Acción</div>
            </div>

            {detalleCompra.map((item, index) => (
              <div key={index} className="row align-items-center mb-2 position-relative">
                <div className="col-md-3 position-relative">
  <input
    type="text"
    className="form-control form-control-sm"
    placeholder="Buscar insumo..."
    value={insumoQuery[index] || item.insumo || ""}
    onChange={(e) => {
      let valor = e.target.value;
      valor = valor.replace(/^\s+/, "");
      valor = valor.replace(/\s{2,}/g, " ");
      if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(valor)) {
        mostrarAlertaInvalida();
        valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
      }
      valor = valor.replace(/([a-zA-ZáéíóúÁÉÍÓÚñÑ])\1{3,}/g, "$1$1$1");
      handleInsumoQueryChange(index, valor);
    }}
  />

  {/* ✅ Solo mostrar dropdown si NO tiene idInsumo asignado O si el ID es temporal */}
  {insumoQuery[index] && (!item.idInsumo || (item.idInsumo && item.idInsumo >= 0)) && (
    <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, top: "38px" }}>
      {insumos
        .filter(
          (i) =>
            i.Nombre.toLowerCase().includes(insumoQuery[index].toLowerCase()) &&
            !detalleCompra.some((d, di) => d.idInsumo === i.IdInsumo && di !== index)
        )
        .map((i) => (
          <li
            key={i.IdInsumo}
            className="list-group-item list-group-item-action"
            style={{ cursor: "pointer" }}
            onClick={() => {
              seleccionarInsumo(index, i.Nombre);
              setInsumoQuery((prev) => {
                const copy = [...prev];
                copy[index] = i.Nombre;
                return copy;
              });
              setTimeout(() => {
                setInsumoQuery((prev) => {
                  const copy = [...prev];
                  copy[index] = "";
                  return copy;
                });
              }, 200);
            }}
          >
            {i.Nombre} – ${((i as any).PrecioUnitario ?? (i as any).Precio).toLocaleString("es-CO")}
          </li>
        ))}
    </ul>
  )}
</div>

                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    min={1}
                    step={1}
                    value={item.cantidad}
                    onChange={(e) => {
                      let valor = e.target.value;
                      if (valor.length > 4) return;
                      if (valor === "" || Number(valor) < 1) valor = "1";
                      actualizarDetalle(index, "cantidad", valor);
                    }}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("Text");
                      if (!/^\d+$/.test(pasted) || Number(pasted) < 1 || pasted.length > 4) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div className="col-md-2">
                  {item.idInsumo && item.idInsumo < 0 ? (
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formatCOPWithSign(item.precio)}
                      onChange={(e) => {
                        // recibir valor formateado, extraer números
                        const raw = e.target.value.replace(/[^\d]/g, "");
                        if (raw.length > 7) return;
                        const num = raw === "" ? 0 : parseInt(raw, 10);
                        actualizarDetalle(index, "precio", num);
                      }}
                    />
                  ) : (
                    <input
                      className="form-control form-control-sm"
                      value={formatCOPWithSign(item.precio)}
                      readOnly
                    />
                  )}
                </div>

                <div className="col-md-3">
                  <input
                    className="form-control form-control-sm"
                    value={`$${Math.round((item.subtotal ?? item.cantidad * item.precio) || 0).toLocaleString("es-CO")}`}
                    disabled
                  />
                </div>
                <div className="col-md-2 text-end">
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => eliminarDetalle(index)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

            <div className="d-flex gap-2 mt-2">
              <button type="button" className="btn btn-sm pastel-btn-secondary" onClick={agregarDetalle}>
                + Agregar Insumo
              </button>

              <button
                type="button"
                className="btn btn-sm pastel-btn-secondary"
                onClick={() => {
                  // Crear modal HTML personalizado
                  const categoriasHTML = categorias
                    .map((c) => `<option value="${c.IdCatInsumo}">${c.NombreCategoria}</option>`)
                    .join("");

                    

                  const modalHTML = `
                    <div class="modal d-block overlay" style="background-color: rgba(0,0,0,0.5);">
                      <div class="modal-dialog modal-dialog-centered modal-lg">
                        <div class="modal-content pastel-modal shadow-lg">
                          <form id="formCrearInsumo">
                            <div class="modal-header pastel-header" style="background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%); color: white; border-radius: 12px 12px 0 0;">
                              <h5 class="modal-title">🧰 Crear Insumo</h5>
                            </div>
                            <div class="modal-body px-4 py-3">
                              <div class="row g-4">
                                <div class="col-md-6">
                                  <label class="form-label">📝 Nombre <span class="text-danger">*</span></label>
                                  <input class="form-control" id="nombre" name="nombre" required>
                                </div>
                                <div class="col-md-6">
                                  <label class="form-label">📦 Categoría <span class="text-danger">*</span></label>
                                  <select class="form-select" id="categoria" name="categoria" required>
                                    <option value="">-- Selecciona --</option>
                                    ${categoriasHTML}
                                  </select>
                                </div>
                                <div class="col-md-6">
                                  <label class="form-label">⚖ Unidad de Medida <span class="text-danger">*</span></label>
                                  <select class="form-select" id="unidad" name="unidadMedida" required>
                                    <option value="">-- Selecciona --</option>
                                    <option value="kg">Kilogramos (kg)</option>
                                    <option value="g">Gramos (g)</option>
                                    <option value="L">Litros (L)</option>
                                    <option value="mL">Mililitros (mL)</option>
                                    <option value="m">Metros (m)</option>
                                    <option value="cm">Centímetros (cm)</option>
                                  </select>
                                </div>
                                <div class="col-md-6">
                                  <label class="form-label">💲 Precio Unitario (COP) <span class="text-danger">*</span></label>
                                  <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="text" inputMode="numeric" class="form-control" id="precio" name="precioUnitario" required placeholder="Ej: 15000">
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div class="modal-footer pastel-footer" style="border-top: 1px solid #e5e7eb; padding: 1rem 1.5rem;">
                              <button type="button" class="btn pastel-btn-secondary" id="btnCancelar">Cancelar</button>
                              <button type="submit" class="btn pastel-btn-primary">Crear</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  `;

                  

                  // Inyectar modal en el DOM
                  const modalContainer = document.createElement("div");
                  modalContainer.innerHTML = modalHTML;
                  document.body.appendChild(modalContainer);

                  // Función para formatear precio
                  const formatearCOPInput = (valor: string) => {
                    const num = parseInt(valor);
                    if (isNaN(num)) return "";
                    return num.toLocaleString("es-CO");
                  };

                  // Agregar evento al input de precio
                  const precioInput = document.getElementById("precio") as HTMLInputElement;
                  precioInput.addEventListener("input", (e) => {
                    const target = e.target as HTMLInputElement;
                    const soloNumeros = target.value.replace(/[^\d]/g, "");
                    if (soloNumeros.length > 7) {
                      target.value = target.value.slice(0, -1);
                      return;
                    }
                    if (soloNumeros === "" || parseInt(soloNumeros) === 0) {
                      target.value = "";
                    } else {
                      target.value = formatearCOPInput(soloNumeros);
                    }
                  });

                  // Botón cancelar
                  document.getElementById("btnCancelar")?.addEventListener("click", () => {
                    modalContainer.remove();
                  });

                  // Manejar submit del formulario
                  const form = document.getElementById("formCrearInsumo") as HTMLFormElement;
                  form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // ✅ Evitar doble clic
  const btnSubmit = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
  if (!btnSubmit) return; // si no se encuentra el botón, se sale
  if (btnSubmit.disabled) return; // si ya está deshabilitado, no hace nada

  // 🔒 Deshabilitar botón y mostrar spinner
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `
    Creando...
  `;

  const nombre = (document.getElementById("nombre") as HTMLInputElement).value.trim();
  const idCatInsumo = parseInt((document.getElementById("categoria") as HTMLSelectElement).value);
  const unidad = (document.getElementById("unidad") as HTMLSelectElement).value;
  const precioLimpio = (document.getElementById("precio") as HTMLInputElement).value.replace(/[^\d]/g, "");
  const precio = parseFloat(precioLimpio);

  // Funciones auxiliares de validación
  const isAllSameChar = (s: string) => s.length > 1 && /^(.)(\1)+$/.test(s);
  const hasLongRepeatSequence = (s: string, n = 4) => new RegExp(`(.)\\1{${n - 1},}`).test(s);
  const isOnlySpecialChars = (s: string) => /^[^a-zA-Z0-9]+$/.test(s);
  const hasTooManySpecialChars = (s: string, maxPercent = 0.4) => {
    const specials = (s.match(/[^a-zA-Z0-9]/g) || []).length;
    return specials / s.length > maxPercent;
  };
  const hasLowVariety = (s: string, minUnique = 3) => new Set(s).size < minUnique;

  // ⚠️ Validaciones (sin cambios)
  if (!nombre) {
    Swal.fire("⚠️ Campo requerido", "El nombre del insumo no puede estar vacío.", "warning");
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = "Crear";
    return;
  }

  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]+$/.test(nombre)) {
    Swal.fire("❌ Nombre inválido", "El nombre solo puede contener letras, números y espacios.", "error");
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = "Crear";
    return;
  }

  if (
    nombre.length < 3 ||
    nombre.length > 50 ||
    isAllSameChar(nombre) ||
    hasLongRepeatSequence(nombre) ||
    isOnlySpecialChars(nombre) ||
    hasTooManySpecialChars(nombre) ||
    hasLowVariety(nombre)
  ) {
    Swal.fire("❌ Nombre inválido", "Debe tener entre 3 y 50 caracteres válidos.", "error");
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = "Crear";
    return;
  }

  const nombreNormalizado = nombre.toLowerCase().replace(/\s+/g, "");
  const existeDuplicado = insumos.some(
    (i) => i.Nombre.toLowerCase().replace(/\s+/g, "") === nombreNormalizado
  );

  if (existeDuplicado) {
    Swal.fire("❌ Nombre duplicado", "Ya existe un insumo con ese nombre.", "error");
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = "Crear";
    return;
  }
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(nombre)) {
    Swal.fire("❌ Nombre inválido", "El nombre solo puede contener letras y espacios.", "error");
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = "Crear";
    return;
  }

  if (
    nombre.length < 3 ||
    nombre.length > 50 ||
    isAllSameChar(nombre) ||
    hasLongRepeatSequence(nombre) ||
    isOnlySpecialChars(nombre) ||
    hasTooManySpecialChars(nombre) ||
    hasLowVariety(nombre)
  ) {
    Swal.fire("❌ Nombre inválido", "Debe tener entre 3 y 50 caracteres válidos.", "error");
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = "Crear";
    return;
  }

  if (!idCatInsumo) {
    Swal.fire("⚠️ Error", "Debe seleccionar una categoría.", "warning");
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = "Crear";
    return;
  }

  if (!unidad) {
    Swal.fire("⚠️ Error", "Debe seleccionar una unidad de medida.", "warning");
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = "Crear";
    return;
  }

  if (isNaN(precio) || precio <= 0) {
    Swal.fire("❌ Precio inválido", "El precio unitario debe ser mayor a cero.", "error");
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = "Crear";
    return;
  }

  if (precio > 9999999) {
    Swal.fire("❌ Precio inválido", "El precio no puede superar 9.999.999.", "error");
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = "Crear";
    return;
  }

  // 🚀 Crear insumo LOCALMENTE (no POST): asignar id temporal negativo y agregar a insumos y al detalle
  try {
    const tempId = tempIdCounter.current;
    tempIdCounter.current -= 1;

    const nuevoLocal: any = {
      IdInsumo: tempId,
      IdCatInsumo: idCatInsumo,
      Nombre: nombre,
      UnidadesMedidas: unidad,
      PrecioUnitario: precio,
      Cantidad: 0,
      Estado: true,
    };

    // agregar al estado local de insumos
    setInsumos((prev) => [...prev, nuevoLocal]);

    // agregar al detalle de compra
    setDetalleCompra((prev) => [
      ...prev,
      {
        idInsumo: nuevoLocal.IdInsumo,
        insumo: nuevoLocal.Nombre,
        cantidad: 1,
        precio: nuevoLocal.PrecioUnitario,
        subtotal: nuevoLocal.PrecioUnitario,
      },
    ]);

    setInsumoQuery((prev) => [...prev, ""]);

    Swal.fire({
      icon: "success",
      title: "Insumo creado localmente",
      text: `El insumo "${nuevoLocal.Nombre}" fue agregado al detalle (se guardará en el servidor al crear la compra).`,
      timer: 2000,
      showConfirmButton: false,
    });

    modalContainer.remove();
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "No se pudo crear el insumo localmente. Intente nuevamente.", "error");
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = "Crear";
  }
});

                }}
              >
                + Crear Insumo
              </button>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-12">
              <div className="pastel-card text-center">
                <FaCalculator size={18} className="mb-1" />
                <small className="d-block">Total</small>
                <small>${Math.round(calcularTotal()).toLocaleString("es-CO")}</small>
              </div>
            </div>
          </div>

          <div className="text-end">
            <button
              type="button"
              className="btn pastel-btn-secondary me-2"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn pastel-btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  Creando...
                </>
              ) : (
                "Crear"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CrearCompra;