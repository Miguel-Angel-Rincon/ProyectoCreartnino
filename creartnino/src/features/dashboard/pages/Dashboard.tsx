import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import "../styles/DashboardStats.css";

export interface MonthlyData {
  name: string;
  ventas: number;
}

export interface OrderData {
  name: string;
  pedidos: number;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  img: string;
}

export interface DashboardStatsProps {
  monthlySales: MonthlyData[];
  monthlyOrders: OrderData[];
  topProducts: Product[];
}

const dummyMonthlySales: MonthlyData[] = [
  { name: "Enero", ventas: 12000 },
  { name: "Febrero", ventas: 15000 },
  { name: "Marzo", ventas: 18000 },
  { name: "Abril", ventas: 20000 },
  { name: "Mayo", ventas: 24000 },
  { name: "Junio", ventas: 22000 },
  { name: "Julio", ventas: 25000 },
  { name: "Agosto", ventas: 27000 },
  { name: "Septiembre", ventas: 30000 },
  { name: "Octubre", ventas: 32000 },
  { name: "Noviembre", ventas: 35000 },
  { name: "Diciembre", ventas: 40000 },
];

const dummyMonthlyOrders: OrderData[] = [
  { name: "Enero", pedidos: 35 },
  { name: "Febrero", pedidos: 42 },
  { name: "Marzo", pedidos: 50 },
  { name: "Abril", pedidos: 48 },
  { name: "Mayo", pedidos: 60 },
  { name: "Junio", pedidos: 55 },
  { name: "Julio", pedidos: 65 },
  { name: "Agosto", pedidos: 70 },
  { name: "Septiembre", pedidos: 75 },
  { name: "Octubre", pedidos: 80 },
  { name: "Noviembre", pedidos: 90 },
  { name: "Diciembre", pedidos: 95 },
];

const dummyTopProducts: Product[] = [
  {
    id: 1,
    name: "Basos Tematica Amor",
    price: "$30.000",
    img: "https://i.pinimg.com/736x/bb/91/2c/bb912cdc1f75b2b2ea26c8cf899dd0f0.jpg",
  },
  {
    id: 2,
    name: "Cuaderno Personalizado",
    price: "$45.000",
    img: "https://www.grupobillingham.com/images/63/91/35d2028311b20bdc4efe57ddad9d/610-460-3/libreta-para-ninos-personalizada.jpg",
  },
  {
    id: 3,
    name: "Pesebre Navideño",
    price: "$85.000",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBtsn4z1r5LIlal0BWuIxqjaMEzgMq_taq6w&s",
  },
];

const dummyMonthlyUsers: MonthlyData[] = [
  { name: "Enero", ventas: 50 },
  { name: "Febrero", ventas: 80 },
  { name: "Marzo", ventas: 110 },
  { name: "Abril", ventas: 140 },
  { name: "Mayo", ventas: 170 },
  { name: "Junio", ventas: 200 },
  { name: "Julio", ventas: 230 },
  { name: "Agosto", ventas: 260 },
  { name: "Septiembre", ventas: 290 },
  { name: "Octubre", ventas: 320 },
  { name: "Noviembre", ventas: 360 },
  { name: "Diciembre", ventas: 400 },
];

const TOTAL_USUARIOS = dummyMonthlyUsers[dummyMonthlyUsers.length - 1].ventas;

export default function DashboardStatsDemo() {
  return (
    <DashboardStats
      monthlySales={dummyMonthlySales}
      monthlyOrders={dummyMonthlyOrders}
      topProducts={dummyTopProducts}
    />
  );
}

function DashboardStats({
  monthlySales,
  monthlyOrders,
  topProducts,
}: DashboardStatsProps) {
  const [chartTypeUsuarios, setChartTypeUsuarios] = useState<"area" | "bar">("area");
  const [chartTypeVentas, setChartTypeVentas] = useState<"area" | "bar">("bar");
  const [chartTypePedidos, setChartTypePedidos] = useState<"area" | "bar">("bar");

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      {/* Usuarios */}
      <div className="chart-section">
        <div className="chart-header">
          <h3 className="chart-title">
            Usuarios Registrados <span className="chart-subtitle">({TOTAL_USUARIOS} en total)</span>
          </h3>
          <button
            onClick={() =>
              setChartTypeUsuarios(chartTypeUsuarios === "area" ? "bar" : "area")
            }
            className="button-usuarios"
          >
            Cambiar a {chartTypeUsuarios === "area" ? "barra" : "área"}
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {chartTypeUsuarios === "area" ? (
            <AreaChart
              data={dummyMonthlyUsers}
              style={{ background: "#ffffff", borderRadius: "8px", paddingBottom: "20px" }}
              margin={{ bottom: 50 }}
            >
              <defs>
                <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f783ac" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#fccde2" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderColor: "#f783ac", color: "#000" }}
                labelStyle={{ color: "#000" }}
                itemStyle={{ color: "#f783ac" }}
              />
              <Area type="monotone" dataKey="ventas" stroke="#f783ac" fill="url(#pinkGradient)" />
            </AreaChart>
          ) : (
            <BarChart
              data={dummyMonthlyUsers}
              style={{ background: "#ffffff", borderRadius: "8px" }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ventas" fill="#f783ac" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Ventas */}
      <div className="chart-section">
        <div className="chart-header">
          <h3 className="chart-title">Ventas</h3>
          <button
            onClick={() =>
              setChartTypeVentas(chartTypeVentas === "area" ? "bar" : "area")
            }
            className="button-ventas"
          >
            Cambiar a {chartTypeVentas === "area" ? "barra" : "área"}
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {chartTypeVentas === "bar" ? (
            <BarChart
              data={monthlySales}
              style={{ background: "#ffffff", borderRadius: "8px" }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ventas" fill="#b197fc" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart
              data={monthlySales}
              style={{ background: "#ffffff", borderRadius: "8px", paddingBottom: "20px" }}
              margin={{ bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderColor: "#b197fc", color: "#000" }}
                labelStyle={{ color: "#000" }}
                itemStyle={{ color: "#b197fc" }}
              />
              <Area type="monotone" dataKey="ventas" stroke="#b197fc" fill="#e5d5ff" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Ganancias */}
      <div className="earnings-grid">
        <div className="earning-card pastel-purple">
          <p className="summary-label">Ganancias mes anterior</p>
          <p className="earning-value">$600.000</p>
        </div>
        <div className="earning-card pastel-green">
          <p className="summary-label">Ganancias este mes</p>
          <p className="earning-value">$780.000</p>
          <p className="earning-subtext">+30% respecto al mes anterior</p>
        </div>
      </div>

      {/* Pedidos */}
      <div className="chart-section">
        <div className="chart-header">
          <h3 className="chart-title">Pedidos de los últimos meses</h3>
          <button
            onClick={() =>
              setChartTypePedidos(chartTypePedidos === "area" ? "bar" : "area")
            }
            className="button-pedidos"
          >
            Cambiar a {chartTypePedidos === "area" ? "barra" : "área"}
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {chartTypePedidos === "area" ? (
            <AreaChart
              data={monthlyOrders}
              style={{ background: "#ffffff", borderRadius: "8px", paddingBottom: "20px" }}
              margin={{ bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", borderColor: "#f6c000", color: "#000" }}
                labelStyle={{ color: "#000" }}
                itemStyle={{ color: "#f6c000" }}
              />
              <Area type="monotone" dataKey="pedidos" stroke="#f6c000" fill="#fff3bf" />
            </AreaChart>
          ) : (
            <BarChart
              data={monthlyOrders}
              style={{ background: "#ffffff", borderRadius: "8px" }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pedidos" fill="#fff3bf" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Productos */}
      <div>
        <h3 className="chart-title">Productos más relevantes del mes</h3>
        <div className="products-grid">
          {topProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrapper">
                <img src={product.img} alt={product.name} className="product-image-full" />
              </div>
              <p className="product-name">{product.name}</p>
              <p className="product-price">{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
