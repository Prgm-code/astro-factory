# Sistema de Categorías PCFactory - Documentación

## Estructura Modular

El sistema de categorías ha sido refactorizado en una estructura modular para mejorar la mantenibilidad y organización del código.

### 📁 Estructura de Archivos

```
src/
├── components/
│   ├── Categories.astro          # Componente principal
│   ├── CategoryCard.astro        # Tarjeta individual de categoría
│   └── ProductsModal.astro       # Modal de productos
├── utils/
│   ├── categoryHelpers.ts        # Utilidades para categorías
│   └── productHelpers.ts         # Utilidades para productos
├── scripts/
│   └── modalManager.ts           # Gestor del modal de productos
└── pages/api/
    └── products.ts               # Proxy API para PCFactory
```

## 🧩 Componentes

### Categories.astro

- **Propósito**: Componente principal que organiza el banner de categorías
- **Responsabilidades**:
  - Renderizar el header con búsqueda
  - Mostrar la grilla de categorías
  - Inicializar funcionalidad de búsqueda y expansión
  - Configurar el gestor del modal

### CategoryCard.astro

- **Propósito**: Tarjeta individual para cada categoría
- **Props**:
  ```typescript
  interface Props {
    category: Category;
  }
  ```
- **Características**:
  - Muestra información de la categoría
  - Botón de expansión para subcategorías
  - Enlaces a subcategorías con modal de productos

### ProductsModal.astro

- **Propósito**: Modal para mostrar productos de una categoría
- **Características**:
  - Sistema de filtros (marca, precio, nombre)
  - Paginación de productos
  - Carga dinámica desde API
  - Estados de carga y error

## 🛠️ Utilidades

### categoryHelpers.ts

Funciones auxiliares para el manejo de categorías:

- `collectCategoryIds()`: Recopila IDs de categorías y subcategorías
- `filterCategories()`: Filtra categorías por término de búsqueda
- `findCategoryById()`: Busca una categoría por ID
- `getSubcategories()`: Obtiene todas las subcategorías
- `countTotalSubcategories()`: Cuenta subcategorías totales

### productHelpers.ts

Funciones auxiliares para el manejo de productos:

- `formatPrice()`: Formatea precios con separadores
- `extractUniqueBrands()`: Extrae marcas únicas
- `filterProductsByBrand()`: Filtra productos por marca
- `sortProducts()`: Ordena productos según criterio
- `createProductCardHTML()`: Genera HTML de tarjeta de producto
- `createPaginationHTML()`: Genera controles de paginación
- `buildProductsApiUrl()`: Construye URL de API

## 🎮 Scripts

### modalManager.ts

Clase `ModalManager` que gestiona toda la funcionalidad del modal:

- **Inicialización**: Configura elementos DOM y eventos
- **Gestión de estado**: Mantiene estado actual del modal
- **Carga de productos**: Maneja llamadas a API y renderizado
- **Filtros**: Aplica filtros de marca y ordenamiento
- **Paginación**: Controla navegación entre páginas
- **Eventos**: Maneja interacciones del usuario

## 🔄 Flujo de Funcionamiento

1. **Inicialización**:

   - `Categories.astro` carga datos de categorías
   - Se renderizan las `CategoryCard` componentes
   - Se inicializa el `ModalManager` con los datos

2. **Interacción del Usuario**:

   - Búsqueda filtra categorías en tiempo real
   - Click en categoría expande/contrae subcategorías
   - Click en subcategoría abre modal de productos

3. **Modal de Productos**:
   - Se cargan productos via proxy API
   - Se renderizan con filtros y paginación
   - Usuario puede filtrar, ordenar y navegar

## 🚀 Beneficios de la Refactorización

### ✅ Mantenibilidad

- Código separado por responsabilidades
- Funciones reutilizables
- Fácil localización de bugs

### ✅ Escalabilidad

- Nuevas funcionalidades fáciles de agregar
- Componentes independientes
- Utilidades compartibles

### ✅ Testing

- Funciones puras fáciles de testear
- Componentes aislados
- Mocking simplificado

### ✅ Performance

- Carga modular de código
- Reutilización de utilidades
- Gestión eficiente del estado

## 🔧 Uso

### Importar Componente Principal

```astro
---
import Categories from '../components/Categories.astro';
---

<Categories />
```

### Usar Utilidades en Otros Componentes

```typescript
import { formatPrice, extractUniqueBrands } from "../utils/productHelpers";
import { collectCategoryIds } from "../utils/categoryHelpers";

const price = formatPrice(299990);
const brands = extractUniqueBrands(products);
const categoryIds = collectCategoryIds(123, categories);
```

### Extender Funcionalidad

Para agregar nuevas características:

1. **Nuevos filtros**: Modificar `productHelpers.ts`
2. **Nuevas utilidades**: Agregar a archivos de utils correspondientes
3. **Nuevos componentes**: Crear archivos `.astro` separados
4. **Nueva lógica de modal**: Extender `ModalManager` clase

## 📋 API Reference

### Tipos TypeScript

```typescript
interface Category {
  id: number;
  nombre: string;
  imagen: string;
  childCategories: Category[];
}

interface Product {
  id: string;
  nombre: string;
  slug: string;
  marca: string;
  thumbnail: string;
  precio: {
    efectivo: number;
    normal: number;
    referencia: number;
    promocion: boolean;
  };
  stock: number;
  outlet: boolean;
}
```

Esta estructura modular hace que el código sea más fácil de mantener, testear y escalar.
