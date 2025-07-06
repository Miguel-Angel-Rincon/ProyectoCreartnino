import { useState } from "react";
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
  Legend
} from "recharts";
import "../styles/DashboardStats.css";

export interface Product {
  id: number;
  name: string;
  price: string;
  img: string;
}

const ventasData = {
  dia: [
    { name: "Lunes", ventas: 3000 },
    { name: "Martes", ventas: 5000 },
    { name: "Miércoles", ventas: 4000 },
    { name: "Jueves", ventas: 4500 },
    { name: "Viernes", ventas: 6000 },
    { name: "Sábado", ventas: 7000 },
    { name: "Domingo", ventas: 5500 },
  ],
  semana: [
    { name: "Semana 1", ventas: 12000 },
    { name: "Semana 2", ventas: 15000 },
    { name: "Semana 3", ventas: 17000 },
    { name: "Semana 4", ventas: 20000 },
  ],
  mes: [
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
  ],
};

const pedidosData = {
  dia: [
    { name: "Lunes", pedidos: 5 },
    { name: "Martes", pedidos: 7 },
    { name: "Miércoles", pedidos: 6 },
    { name: "Jueves", pedidos: 8 },
    { name: "Viernes", pedidos: 9 },
    { name: "Sábado", pedidos: 10 },
    { name: "Domingo", pedidos: 4 },
  ],
  semana: [
    { name: "Semana 1", pedidos: 20 },
    { name: "Semana 2", pedidos: 25 },
    { name: "Semana 3", pedidos: 30 },
    { name: "Semana 4", pedidos: 35 },
  ],
  mes: [
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
  ],
};

const topProducts: Product[] = [
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

export default function DashboardStatsDemo() {
  return (
    <DashboardStatsDemoComponent />
  );
}

function DashboardStatsDemoComponent() {
  const [filtroVentas, setFiltroVentas] = useState<'dia' | 'semana' | 'mes'>('mes');
  const [filtroPedidos, setFiltroPedidos] = useState<'dia' | 'semana' | 'mes'>('mes');
  const [tipoGraficoVentas, setTipoGraficoVentas] = useState<'bar' | 'pie'>('bar');
  const [tipoGraficoPedidos, setTipoGraficoPedidos] = useState<'area' | 'pie'>('area');

  const dataVentas = ventasData[filtroVentas];
  const dataPedidos = pedidosData[filtroPedidos];
  const totalGanancias = dataVentas.reduce((acc, curr) => acc + curr.ventas, 0);

  const COLORS = ['#8e44ad', '#f783ac', '#3498db', '#f6c000', '#2ecc71', '#ff9ff3', '#54a0ff'];

  return (
    <div className="dashboard-container">
      <h2 className="chart-title" style={{ color: '#000', textAlign: 'left' }}>Dashboard</h2>

      

      <div className="chart-section">
        <div className="chart-header">
          <h3 className="chart-title">Ventas</h3>
          <div className="chart-controls">
            <button
              className="chart-toggle"
              onClick={() => setTipoGraficoVentas(tipoGraficoVentas === 'bar' ? 'pie' : 'bar')}
            >
              Cambiar a {tipoGraficoVentas === 'bar' ? 'Torta' : 'Barra'}
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {tipoGraficoVentas === 'bar' ? (
            <BarChart data={dataVentas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ background: '#fff', borderColor: '#8884d8' }} />
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
                {dataVentas.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="ganancias-card">
        <h3 className="chart-title">Total de ganancias ({filtroVentas})</h3>
        <select
          className="filtro-select"
          value={filtroVentas}
          onChange={(e) => setFiltroVentas(e.target.value as 'dia' | 'semana' | 'mes')}
        >
          <option value="dia">Día</option>
          <option value="semana">Semana</option>
          <option value="mes">Mes</option>
        </select>
        <p className="ganancia-monto">${totalGanancias.toLocaleString()}</p>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <h3 className="chart-title">Pedidos</h3>
          <div className="chart-controls">
            <select
              className="filtro-select"
              value={filtroPedidos}
              onChange={(e) => setFiltroPedidos(e.target.value as 'dia' | 'semana' | 'mes')}
            >
              <option value="dia">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
            </select>
                <button
      onClick={() => setTipoGraficoPedidos(tipoGraficoPedidos === 'area' ? 'pie' : 'area')}
      className="chart-toggle pink"
    >
      Cambiar a {tipoGraficoPedidos === 'area' ? 'Torta' : 'Área'}
    </button>

          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {tipoGraficoPedidos === 'area' ? (
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
              <Tooltip contentStyle={{ background: '#fff', borderColor: '#f783ac' }} />
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
                {dataPedidos.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="products-grid">
        <h3 className="chart-title">Productos más relevantes del mes</h3>
        <div className="products-container">
          {topProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.img} alt={product.name} className="product-image-full" />
              <p className="product-name">{product.name}</p>
              <p className="product-price">{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
