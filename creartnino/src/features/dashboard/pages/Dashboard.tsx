import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  FaUsers,
  FaBoxes,
  FaShoppingCart,
  FaChartLine,
} from "react-icons/fa";
import "../styles/DashboardStats.css";

// Interfaces
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

// Datos de prueba
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
    name: "Camiseta Básica Blanca",
    price: "$15.000",
    img: "https://via.placeholder.com/150?text=Camiseta",
  },
  {
    id: 2,
    name: "Jeans Azul Oscuro",
    price: "$45.000",
    img: "https://via.placeholder.com/150?text=Jeans",
  },
  {
    id: 3,
    name: "Chaqueta Impermeable",
    price: "$85.000",
    img: "https://via.placeholder.com/150?text=Chaqueta",
  },
];

// Componente principal
export default function DashboardStatsDemo() {
  return (
    <DashboardStats
      monthlySales={dummyMonthlySales}
      monthlyOrders={dummyMonthlyOrders}
      topProducts={dummyTopProducts}
    />
  );
}

// Componente DashboardStats
function DashboardStats({
  monthlySales,
  monthlyOrders,
  topProducts,
}: DashboardStatsProps) {
  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      {/* Resumen de Datos */}
      <div className="summary-grid">
        <div className="summary-card purple">
          <FaUsers className="summary-icon" />
          <p className="summary-label">Usuarios Registrados</p>
          <p className="summary-value">175</p>
          <p className="summary-subtext">En total 700 usuarios</p>
        </div>
        <div className="summary-card pink">
          <FaBoxes className="summary-icon" />
          <p className="summary-label">Compras Insumos</p>
          <p className="summary-value">$100,000 esta semana</p>
          <p className="summary-subtext">Van $200,000 en el mes</p>
        </div>
        <div className="summary-card yellow">
          <FaShoppingCart className="summary-icon" />
          <p className="summary-label">Pedidos</p>
          <p className="summary-value">14 pedidos esta semana</p>
          <p className="summary-subtext">22 pedidos este mes</p>
        </div>
        <div className="summary-card cyan">
          <FaChartLine className="summary-icon" />
          <p className="summary-label">Venta de productos</p>
          <p className="summary-value">2 productos entregados esta semana</p>
          <p className="summary-subtext">7 productos entregados este mes</p>
        </div>
      </div>

      {/* Gráfico de Ventas */}
      <div className="chart-section">
        <h3 className="chart-title">Ventas en el año anterior (2024)</h3>
        {monthlySales.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySales}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ventas" fill="#4dabf7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>No hay datos de ventas para mostrar</p>
        )}
      </div>

      {/* Ganancias */}
      <div className="earnings-grid">
        <div className="earning-card purple-light">
          <p className="summary-label">Ganancias mes anterior</p>
          <p className="earning-value">$600.000</p>
        </div>
        <div className="earning-card green-light">
          <p className="summary-label">Ganancias este mes</p>
          <p className="earning-value">$780.000</p>
          <p className="earning-subtext">+30% respecto al mes anterior</p>
        </div>
      </div>

      {/* Pedidos últimos meses */}
      <div className="chart-section">
        <h3 className="chart-title">Pedidos últimos meses</h3>
        {monthlyOrders.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="pedidos"
                stroke="#b197fc"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No hay datos de pedidos para mostrar</p>
        )}
      </div>

      {/* Productos más relevantes */}
      <div>
        <h3 className="chart-title">Productos más relevantes del mes</h3>
        <div className="products-grid">
          {topProducts.length > 0 ? (
            topProducts.map((product) => (
              <div key={product.id} className="product-card">
                <img
                  src={product.img}
                  alt={product.name}
                  className="product-image"
                />
                <p className="product-name">{product.name}</p>
                <p className="product-price">{product.price}</p>
              </div>
            ))
          ) : (
            <p>No hay productos relevantes este mes</p>
          )}
        </div>
      </div>
    </div>
  );
}
