import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "../styles/DashboardStats.css";

// === Modelos ===
interface Pedido {
  IdPedido: number;
  IdCliente?: number;
  MetodoPago?: string;
  FechaPedido?: string;
  FechaEntrega?: string;
  Descripcion?: string;
  ValorInicial?: number;
  ValorRestante?: number;
  ComprobantePago?: string;
  TotalPedido?: number;
  IdEstado?: number; // 5 = Entregado, 7 = Venta Directa, 6 = Anulado
}

interface DetallePedido {
  IdDetallePedido: number;
  IdPedido: number;
  IdProducto: number;
  Cantidad: number;
  Subtotal: number;
}

interface Producto {
  IdProducto: number;
  CategoriaProducto?: number;
  Nombre?: string;
  Imagen?: number; // Id de la imagen
  Cantidad?: number;
  Marca?: string;
  Precio?: number;
  Estado?: boolean;
}

interface ImagenProducto {
  IdImagen: number;
  Url: string;
}

// ==== Utils de fechas ==== 
function parseFecha(fechaStr?: string | null): Date | null {
  if (!fechaStr) return null;
  if (!isNaN(Date.parse(fechaStr))) return new Date(fechaStr);
  const m = fechaStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  return null;
}

const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function mondayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

// ✅ Obtener los días de la semana actual con su fecha
function getDiasSemanaActual(): { name: string; date: Date }[] {
  const hoy = new Date();
  const start = new Date(hoy);
  start.setDate(hoy.getDate() - mondayIndex(hoy)); // lunes de la semana actual

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      name: `${DIAS_SEMANA[i]} ${d.getDate()}/${d.getMonth() + 1}`,
      date: d,
    };
  });
}


function getWeekOfMonth(date: Date): number {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = mondayIndex(start);
  return Math.ceil((date.getDate() + offset) / 7);
}

function getWeeksInMonth(year: number, monthIndex: number): number {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  let maxWeek = 1;
  for (let d = 1; d <= lastDay; d++) {
    const w = getWeekOfMonth(new Date(year, monthIndex, d));
    if (w > maxWeek) maxWeek = w;
  }
  return maxWeek;
}

export default function DashboardStatsDemo() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [detalles, setDetalles] = useState<DetallePedido[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [imagenes, setImagenes] = useState<ImagenProducto[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtroVentas, setFiltroVentas] = useState<"dia" | "semana" | "mes">("mes");
  const [filtroPedidos, setFiltroPedidos] = useState<"dia" | "semana" | "mes">("mes");
  const [tipoGraficoVentas, setTipoGraficoVentas] = useState<"bar" | "pie">("bar");
  const [tipoGraficoPedidos, setTipoGraficoPedidos] = useState<"area" | "pie">("area");
  const [filtroIngresos, setFiltroIngresos] = useState<"dia" | "semana" | "mes" | "anio">("mes");

  const COLORS = ["#8e44ad", "#f783ac", "#3498db", "#f6c000", "#2ecc71", "#ff9ff3", "#54a0ff"];

  useEffect(() => {
    async function fetchData() {
      try {
        const [resPedidos, resDetalles, resProductos, resImagenes] = await Promise.all([
          fetch("https://www.apicreartnino.somee.com/api/Pedidos/Lista"),
          fetch("https://www.apicreartnino.somee.com/api/Detalles_Pedido/Lista"),
          fetch("https://www.apicreartnino.somee.com/api/Productos/Lista"),
          fetch("https://www.apicreartnino.somee.com/api/Imagenes_Productos/Lista"),
        ]);

        setPedidos(await resPedidos.json());
        setDetalles(await resDetalles.json());
        setProductos(await resProductos.json());
        setImagenes(await resImagenes.json());
      } catch (e) {
        console.error("Error al obtener datos:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const hoy = new Date();
  const currentYear = hoy.getFullYear();
  const currentMonth = hoy.getMonth();

  // ==============================
  //   SERIES DE PEDIDOS (FechaPedido)
  // ==============================
 function buildSeriesPedidos(filtro: "dia" | "semana" | "mes") {
  if (filtro === "dia") {
    const diasSemana = getDiasSemanaActual();
    const series = diasSemana.map((d) => ({ name: d.name, pedidos: 0 }));

    pedidos.forEach((p) => {
      if (p.IdEstado === 6) return; // excluir anulados
      const f = parseFecha(p.FechaPedido);
      if (!f) return;

      diasSemana.forEach((d, idx) => {
        if (f.toDateString() === d.date.toDateString()) {
          series[idx].pedidos += 1;
        }
      });
    });

    return series;
  }

  if (filtro === "semana") {
    const nWeeks = getWeeksInMonth(currentYear, currentMonth);
    const series = Array.from({ length: nWeeks }, (_, i) => ({
      name: `Semana ${i + 1}`,
      pedidos: 0,
    }));
    pedidos.forEach((p) => {
      if (p.IdEstado === 6) return;
      const f = parseFecha(p.FechaPedido);
      if (!f) return;
      if (f.getFullYear() !== currentYear || f.getMonth() !== currentMonth) return;
      const wk = getWeekOfMonth(f);
      if (wk >= 1 && wk <= nWeeks) series[wk - 1].pedidos += 1;
    });
    return series;
  }

  const series = MESES.map((name) => ({ name, pedidos: 0 }));
  pedidos.forEach((p) => {
    if (p.IdEstado === 6) return;
    const f = parseFecha(p.FechaPedido);
    if (!f) return;
    if (f.getFullYear() !== currentYear) return;
    series[f.getMonth()].pedidos += 1;
  });
  return series;
}

  // ==============================
  //   SERIES DE VENTAS (FechaEntrega)
  // ==============================
  function buildSeriesVentas(filtro: "dia" | "semana" | "mes") {
  if (filtro === "dia") {
    const diasSemana = getDiasSemanaActual();
    const series = diasSemana.map((d) => ({ name: d.name, ventas: 0 }));

    pedidos.forEach((p) => {
      if (!(p.IdEstado === 5 || p.IdEstado === 7)) return;
      const f = parseFecha(p.FechaEntrega);
      if (!f) return;

      diasSemana.forEach((d, idx) => {
        if (f.toDateString() === d.date.toDateString()) {
          series[idx].ventas += p.TotalPedido ?? 0;
        }
      });
    });

    return series;
  }

  if (filtro === "semana") {
    const nWeeks = getWeeksInMonth(currentYear, currentMonth);
    const series = Array.from({ length: nWeeks }, (_, i) => ({
      name: `Semana ${i + 1}`,
      ventas: 0,
    }));
    pedidos.forEach((p) => {
      if (!(p.IdEstado === 5 || p.IdEstado === 7)) return;
      const f = parseFecha(p.FechaEntrega);
      if (!f) return;
      if (f.getFullYear() !== currentYear || f.getMonth() !== currentMonth) return;
      const wk = getWeekOfMonth(f);
      if (wk >= 1 && wk <= nWeeks) series[wk - 1].ventas += p.TotalPedido ?? 0;
    });
    return series;
  }

  const series = MESES.map((name) => ({ name, ventas: 0 }));
  pedidos.forEach((p) => {
    if (!(p.IdEstado === 5 || p.IdEstado === 7)) return;
    const f = parseFecha(p.FechaEntrega);
    if (!f) return;
    if (f.getFullYear() !== currentYear) return;
    series[f.getMonth()].ventas += p.TotalPedido ?? 0;
  });
  return series;
}


  const dataPedidos = buildSeriesPedidos(filtroPedidos);
  const dataVentas = buildSeriesVentas(filtroVentas);

  // ==============================
  //   GANANCIAS
  // ==============================
  function calcularIngresos(filtro: "dia" | "semana" | "mes" | "anio") {
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - mondayIndex(hoy));
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);

    let total = 0;
    pedidos.forEach((p) => {
      if (!(p.IdEstado === 5 || p.IdEstado === 7)) return;
      const f = parseFecha(p.FechaEntrega);
      if (!f) return;

      switch (filtro) {
        case "dia":
          if (f.toDateString() === hoy.toDateString()) total += p.TotalPedido ?? 0;
          break;
        case "semana":
          if (f >= inicioSemana && f <= finSemana) total += p.TotalPedido ?? 0;
          break;
        case "mes":
          if (f.getFullYear() === currentYear && f.getMonth() === currentMonth)
            total += p.TotalPedido ?? 0;
          break;
        case "anio":
          if (f.getFullYear() === currentYear) total += p.TotalPedido ?? 0;
          break;
      }
    });
    return total;
  }

  const totalIngresos = calcularIngresos(filtroIngresos);

// ==============================
// Estado para el año seleccionado
// ==============================
const [selectedYearProductos, setSelectedYearProductos] = useState(new Date().getFullYear());

// ==============================
//   TOP PRODUCTOS (más pedidos por año seleccionado)
// ==============================
const conteoProductos: { [idProd: number]: number } = {};
detalles.forEach((det) => {
  const pedido = pedidos.find((p) => p.IdPedido === det.IdPedido);
  if (!pedido || pedido.IdEstado === 6) return; // excluir anulados
  const f = parseFecha(pedido.FechaPedido);
  if (!f) return;

  // ✅ Filtrar solo por el año seleccionado
  if (f.getFullYear() !== selectedYearProductos) return;

  conteoProductos[det.IdProducto] =
    (conteoProductos[det.IdProducto] || 0) + det.Cantidad;
});

const topProductos = Object.entries(conteoProductos)
  .sort((a, b) => b[1] - a[1]) // ordenar de mayor a menor
  .slice(0, 5) // tomar solo los 5 primeros
  .map(([idStr, cantidad]) => {
    const id = Number(idStr);
    const prod = productos.find((p) => p.IdProducto === id);
    const img = imagenes.find((i) => i.IdImagen === prod?.Imagen);
    
    // Extraer la primera URL si hay múltiples separadas por |||
    let imageUrl = img?.Url ?? "https://via.placeholder.com/150";
    if (imageUrl.includes("|||")) {
      imageUrl = imageUrl.split("|||")[0].trim();
    }
    
    return {
      id,
      name: prod?.Nombre ?? "Sin nombre",
      price: prod?.Precio ? `$${prod.Precio.toLocaleString("es-CO")}` : "$0",
      img: imageUrl,
      cantidad,
    };
  });


  if (loading) return <p>Cargando datos...</p>;

  return (
    <div className="dashboard-container">
      <h2 className="chart-title" style={{ color: "#000", textAlign: "left" }}>
        Dashboard
      </h2>

      {/* === Ventas === */}
      <div className="chart-section">
        <div className="chart-header">
          <h3 className="chart-title">Ventas</h3>
          <div className="chart-controls">
            <select
              className="filtro-select"
              value={filtroVentas}
              onChange={(e) => setFiltroVentas(e.target.value as "dia" | "semana" | "mes")}
            >
              <option value="dia">Día (mes actual)</option>
              <option value="semana">Semana (mes actual)</option>
              <option value="mes">Mes (año actual)</option>
            </select>
            <button
              className="chart-toggle"
              onClick={() =>
                setTipoGraficoVentas(tipoGraficoVentas === "bar" ? "pie" : "bar")
              }
            >
              Cambiar a {tipoGraficoVentas === "bar" ? "Torta" : "Barra"}
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {tipoGraficoVentas === "bar" ? (
            <BarChart data={dataVentas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ background: "#fff", borderColor: "#8884d8" }} />
              <Bar dataKey="ventas" fill="#b197fc" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={dataVentas}
                dataKey="ventas"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {dataVentas.map((_entry, idx) => (
                  <Cell key={`cell-v-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* === Ingresos === */}
      <div className="ganancias-card">
        <div className="chart-header">
          <h3 className="chart-title">Ingresos</h3>
          <select
            className="filtro-select"
            value={filtroIngresos}
            onChange={(e) =>
              setFiltroIngresos(e.target.value as "dia" | "semana" | "mes" | "anio")
            }
          >
            <option value="dia">Hoy</option>
            <option value="semana">Semana actual</option>
            <option value="mes">Mes actual</option>
            <option value="anio">Año actual</option>
          </select>
        </div>
        <p className="ganancia-monto">${totalIngresos.toLocaleString("es-CO")}</p>
      </div>

      {/* === Pedidos === */}
      <div className="chart-section">
        <div className="chart-header">
          <h3 className="chart-title">Pedidos</h3>
          <div className="chart-controls">
            <select
              className="filtro-select"
              value={filtroPedidos}
              onChange={(e) => setFiltroPedidos(e.target.value as "dia" | "semana" | "mes")}
            >
              <option value="dia">Día (mes actual)</option>
              <option value="semana">Semana (mes actual)</option>
              <option value="mes">Mes (año actual)</option>
            </select>
            <button
              onClick={() =>
                setTipoGraficoPedidos(tipoGraficoPedidos === "area" ? "pie" : "area")
              }
              className="chart-toggle pink"
            >
              Cambiar a {tipoGraficoPedidos === "area" ? "Torta" : "Área"}
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {tipoGraficoPedidos === "area" ? (
            <AreaChart data={dataPedidos}>
              <defs>
                <linearGradient id="colorPedidos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f783ac" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#fde3f0" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ background: "#fff", borderColor: "#f783ac" }} />
              <Area type="monotone" dataKey="pedidos" stroke="#f783ac" fill="url(#colorPedidos)" />
            </AreaChart>
          ) : (
            <PieChart>
              <Pie
                data={dataPedidos}
                dataKey="pedidos"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {dataPedidos.map((_entry, idx) => (
                  <Cell key={`cell-p-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>


     {/* Productos */}
<div className="products-grid">
  <div className="chart-header">
    <h3 className="chart-title">Productos más relevantes</h3>
    <select
      className="filtro-select"
      value={selectedYearProductos}
      onChange={(e) => setSelectedYearProductos(Number(e.target.value))}
    >
      {Array.from({ length: 2 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return (
          <option key={year} value={year}>
            {year}
          </option>
        );
      })}
    </select>
  </div>

  <div className="products-container">
    {topProductos.map((product) => (
      <div key={product.id} className="product-card">
        <img src={product.img} alt={product.name} className="product-image-full" />
        <p className="product-name">{product.name}</p>
        <p className="product-price">{product.price}</p>
        <p className="product-count">Unidades solicitadas: {product.cantidad}</p>
      </div>
    ))}
  </div>
</div>

    </div>
  );
}
