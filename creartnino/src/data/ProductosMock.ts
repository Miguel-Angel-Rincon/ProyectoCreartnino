// src/data/productosMock.ts
// src/data/productosMock.ts
import type { ProductoCarrito } from '../context/CarritoContext';
import tazaParaiso from '../assets/Imagenes/tazaParaiso.jpg';
import cajita1 from '../assets/Imagenes/cajita.jpg';
import tablasStich from '../assets/Imagenes/tablasStitch.jpg';
import topperCircular from '../assets/Imagenes/topperCircular.jpg';
import topper from '../assets/Imagenes/topper.jpg';

export const productosMock: ProductoCarrito[] = [
  // Toppers (id 1)
  { IdProducto: 101, Nombre: 'Topper decorativo 1', CategoriaProducto: 1, Precio: 8000, ImagenUrl: topper, cantidad: 0, tipo: 'Prediseñado'},
  { IdProducto: 102, Nombre: 'Topper decorativo 2', CategoriaProducto: 1, Precio: 9000, ImagenUrl: topper, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 103, Nombre: 'Topper decorativo 3', CategoriaProducto: 1, Precio: 10000, ImagenUrl: topper, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 104, Nombre: 'Topper decorativo 4', CategoriaProducto: 1, Precio: 11000, ImagenUrl: topper, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 105, Nombre: 'Topper decorativo 5', CategoriaProducto: 1, Precio: 12000, ImagenUrl: topper, cantidad: 0, tipo: 'Prediseñado' },

  // Tazas (id 2)
  { IdProducto: 201, Nombre: 'Taza personalizada 1', CategoriaProducto: 2, Precio: 15000, ImagenUrl: tazaParaiso, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 202, Nombre: 'Taza personalizada 2', CategoriaProducto: 2, Precio: 16000, ImagenUrl: tazaParaiso, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 203, Nombre: 'Taza personalizada 3', CategoriaProducto: 2, Precio: 17000, ImagenUrl: tazaParaiso, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 204, Nombre: 'Taza personalizada 4', CategoriaProducto: 2, Precio: 18000, ImagenUrl: tazaParaiso, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 205, Nombre: 'Taza personalizada 5', CategoriaProducto: 2, Precio: 19000, ImagenUrl: tazaParaiso, cantidad: 0, tipo: 'Prediseñado' },

  // Tarjetas (id 3)
  { IdProducto: 301, Nombre: 'Tarjeta creativa 1', CategoriaProducto: 3, Precio: 5000, ImagenUrl: topperCircular, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 302, Nombre: 'Tarjeta creativa 2', CategoriaProducto: 3, Precio: 5500, ImagenUrl: topperCircular, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 303, Nombre: 'Tarjeta creativa 3', CategoriaProducto: 3, Precio: 6000, ImagenUrl: topperCircular, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 304, Nombre: 'Tarjeta creativa 4', CategoriaProducto: 3, Precio: 6500, ImagenUrl: topperCircular, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 305, Nombre: 'Tarjeta creativa 5', CategoriaProducto: 3, Precio: 7000, ImagenUrl: topperCircular, cantidad: 0, tipo: 'Prediseñado' },

  // Cajas (id 4)
  { IdProducto: 401, Nombre: 'Caja sorpresa 1', CategoriaProducto: 4, Precio: 12000, ImagenUrl: cajita1, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 402, Nombre: 'Caja sorpresa 2', CategoriaProducto: 4, Precio: 12500, ImagenUrl: cajita1, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 403, Nombre: 'Caja sorpresa 3', CategoriaProducto: 4, Precio: 13000, ImagenUrl: cajita1, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 404, Nombre: 'Caja sorpresa 4', CategoriaProducto: 4, Precio: 13500, ImagenUrl: cajita1, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 405, Nombre: 'Caja sorpresa 5', CategoriaProducto: 4, Precio: 14000, ImagenUrl: cajita1, cantidad: 0, tipo: 'Prediseñado' },

  // Tablas (id 5)
  { IdProducto: 501, Nombre: 'Tabla decorativa 1', CategoriaProducto: 5, Precio: 14000, ImagenUrl: tablasStich, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 502, Nombre: 'Tabla decorativa 2', CategoriaProducto: 5, Precio: 15000, ImagenUrl: tablasStich, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 503, Nombre: 'Tabla decorativa 3', CategoriaProducto: 5, Precio: 16000, ImagenUrl: tablasStich, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 504, Nombre: 'Tabla decorativa 4', CategoriaProducto: 5, Precio: 17000, ImagenUrl: tablasStich, cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 505, Nombre: 'Tabla decorativa 5', CategoriaProducto: 5, Precio: 18000, ImagenUrl: tablasStich, cantidad: 0, tipo: 'Prediseñado' },

  // Luminosos (id 6)
  { IdProducto: 601, Nombre: 'Luminoso LED 1', CategoriaProducto: 6, Precio: 30000, ImagenUrl: '/imagenes/luminoso1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 602, Nombre: 'Luminoso LED 2', CategoriaProducto: 6, Precio: 31000, ImagenUrl: '/imagenes/luminoso2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 603, Nombre: 'Luminoso LED 3', CategoriaProducto: 6, Precio: 32000, ImagenUrl: '/imagenes/luminoso1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 604, Nombre: 'Luminoso LED 4', CategoriaProducto: 6, Precio: 33000, ImagenUrl: '/imagenes/luminoso2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 605, Nombre: 'Luminoso LED 5', CategoriaProducto: 6, Precio: 34000, ImagenUrl: '/imagenes/luminoso1.jpg', cantidad: 0, tipo: 'Prediseñado' },

  // Buzos y camisas (id 7)
  { IdProducto: 701, Nombre: 'Buzo estampado 1', CategoriaProducto: 7, Precio: 35000, ImagenUrl: '/imagenes/buzo1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 702, Nombre: 'Buzo estampado 2', CategoriaProducto: 7, Precio: 36000, ImagenUrl: '/imagenes/buzo2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 703, Nombre: 'Camisa estampada 1', CategoriaProducto: 7, Precio: 37000, ImagenUrl: '/imagenes/camisa1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 704, Nombre: 'Camisa estampada 2', CategoriaProducto: 7, Precio: 38000, ImagenUrl: '/imagenes/camisa2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 705, Nombre: 'Camisa estampada 3', CategoriaProducto: 7, Precio: 39000, ImagenUrl: '/imagenes/camisa1.jpg', cantidad: 0, tipo: 'Prediseñado' },

  // Scrunchies (id 8)
  { IdProducto: 801, Nombre: 'Scrunchie rosado', CategoriaProducto: 8, Precio: 4000, ImagenUrl: '/imagenes/scrunchie1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 802, Nombre: 'Scrunchie azul', CategoriaProducto: 8, Precio: 4000, ImagenUrl: '/imagenes/scrunchie2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 803, Nombre: 'Scrunchie verde', CategoriaProducto: 8, Precio: 4000, ImagenUrl: '/imagenes/scrunchie1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 804, Nombre: 'Scrunchie morado', CategoriaProducto: 8, Precio: 4000, ImagenUrl: '/imagenes/scrunchie2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 805, Nombre: 'Scrunchie negro', CategoriaProducto: 8, Precio: 4000, ImagenUrl: '/imagenes/scrunchie1.jpg', cantidad: 0, tipo: 'Prediseñado' },

  // Etiquetas y Stickers (id 9)
  { IdProducto: 901, Nombre: 'Sticker pack 1', CategoriaProducto: 9, Precio: 3000, ImagenUrl: '/imagenes/stickers1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 902, Nombre: 'Sticker pack 2', CategoriaProducto: 9, Precio: 3000, ImagenUrl: '/imagenes/stickers2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 903, Nombre: 'Sticker pack 3', CategoriaProducto: 9, Precio: 3000, ImagenUrl: '/imagenes/stickers1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 904, Nombre: 'Sticker pack 4', CategoriaProducto: 9, Precio: 3000, ImagenUrl: '/imagenes/stickers2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 905, Nombre: 'Sticker pack 5', CategoriaProducto: 9, Precio: 3000, ImagenUrl: '/imagenes/stickers1.jpg', cantidad: 0, tipo: 'Prediseñado' },

  // Susypig (id 10)
  { IdProducto: 1001, Nombre: 'Susypig figura 1', CategoriaProducto: 10, Precio: 23000, ImagenUrl: '/imagenes/susypig1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 1002, Nombre: 'Susypig figura 2', CategoriaProducto: 10, Precio: 24000, ImagenUrl: '/imagenes/susypig2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 1003, Nombre: 'Susypig figura 3', CategoriaProducto: 10, Precio: 25000, ImagenUrl: '/imagenes/susypig1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 1004, Nombre: 'Susypig figura 4', CategoriaProducto: 10, Precio: 26000, ImagenUrl: '/imagenes/susypig2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 1005, Nombre: 'Susypig figura 5', CategoriaProducto: 10, Precio: 27000, ImagenUrl: '/imagenes/susypig1.jpg', cantidad: 0, tipo: 'Prediseñado' },

  // Calendario (id 11)
  { IdProducto: 1101, Nombre: 'Calendario diseño 1', CategoriaProducto: 11, Precio: 6000, ImagenUrl: '/imagenes/calendario1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 1102, Nombre: 'Calendario diseño 2', CategoriaProducto: 11, Precio: 6500, ImagenUrl: '/imagenes/calendario2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 1103, Nombre: 'Calendario diseño 3', CategoriaProducto: 11, Precio: 7000, ImagenUrl: '/imagenes/calendario1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 1104, Nombre: 'Calendario diseño 4', CategoriaProducto: 11, Precio: 7500, ImagenUrl: '/imagenes/calendario2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 1105, Nombre: 'Calendario diseño 5', CategoriaProducto: 11, Precio: 8000, ImagenUrl: '/imagenes/calendario1.jpg', cantidad: 0, tipo: 'Prediseñado' },

  // Portales Belén (id 12)
  { IdProducto: 1201, Nombre: 'Portal Belén 1', CategoriaProducto: 12, Precio: 28000, ImagenUrl: '/imagenes/belen1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 1202, Nombre: 'Portal Belén 2', CategoriaProducto: 12, Precio: 29000, ImagenUrl: '/imagenes/belen2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 1203, Nombre: 'Portal Belén 3', CategoriaProducto: 12, Precio: 30000, ImagenUrl: '/imagenes/belen1.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 1204, Nombre: 'Portal Belén 4', CategoriaProducto: 12, Precio: 31000, ImagenUrl: '/imagenes/belen2.jpg', cantidad: 0, tipo: 'Prediseñado' },
  { IdProducto: 1205, Nombre: 'Portal Belén 5', CategoriaProducto: 12, Precio: 32000, ImagenUrl: '/imagenes/belen1.jpg', cantidad: 0, tipo: 'Prediseñado' }
];