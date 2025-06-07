// Funciones auxiliares para el manejo de productos

export interface Product {
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

export interface ProductsResponse {
  content: {
    items: Product[];
    pageable: {
      pageNumber: number;
      totalPages: number;
      totalElements: number;
      pageSize: number;
    };
  };
}

/**
 * Formatea un precio con separadores de miles
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CL").format(price);
}

/**
 * Extrae marcas únicas de una lista de productos
 */
export function extractUniqueBrands(products: Product[]): string[] {
  const brands = products.map((product) => product.marca);
  return [...new Set(brands)].sort();
}

/**
 * Filtra productos por marca
 */
export function filterProductsByBrand(
  products: Product[],
  brand: string
): Product[] {
  if (!brand) return products;
  return products.filter((product) => product.marca === brand);
}

/**
 * Ordena productos según el criterio especificado
 */
export function sortProducts(products: Product[], sortBy: string): Product[] {
  const sortedProducts = [...products];

  switch (sortBy) {
    case "price-asc":
      return sortedProducts.sort(
        (a, b) => a.precio.efectivo - b.precio.efectivo
      );
    case "price-desc":
      return sortedProducts.sort(
        (a, b) => b.precio.efectivo - a.precio.efectivo
      );
    case "name":
      return sortedProducts.sort((a, b) => a.nombre.localeCompare(b.nombre));
    case "relevance":
    default:
      return sortedProducts; // Mantener orden original
  }
}

/**
 * Crea el HTML para una tarjeta de producto
 */
export function createProductCardHTML(product: Product): string {
  return `
    <div class="product-card">
      <div class="product-image">
        <img 
          src="https://assets.pcfactory.cl${product.thumbnail}" 
          alt="${product.nombre}"
          loading="lazy"
        />
        ${
          product.precio.promocion
            ? '<div class="product-badge">OFERTA</div>'
            : ""
        }
        ${
          product.outlet ? '<div class="product-badge outlet">OUTLET</div>' : ""
        }
      </div>
      
      <div class="product-info">
        <div class="product-brand">${product.marca}</div>
        <h3 class="product-name">${product.nombre}</h3>
        
        <div class="product-pricing">
          <div class="price-current">$${formatPrice(
            product.precio.efectivo
          )}</div>
          ${
            product.precio.referencia > 0 &&
            product.precio.referencia !== product.precio.normal
              ? `<div class="price-original">$${formatPrice(
                  product.precio.referencia
                )}</div>`
              : ""
          }
        </div>
        
        <div class="product-stock">Stock: ${product.stock}</div>
        
        <div class="product-actions">
          <button class="btn-primary" onclick="viewProduct('${
            product.slug
          }')" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 1rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); text-transform: uppercase; font-size: 0.9rem; letter-spacing: 0.5px;">
            Ver Producto
          </button>
          <button class="btn-secondary" title="Agregar a favoritos">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Crea el HTML para los controles de paginación
 */
export function createPaginationHTML(
  pageable: ProductsResponse["content"]["pageable"]
): string {
  const { pageNumber, totalPages, totalElements, pageSize } = pageable;
  const startItem = pageNumber * pageSize + 1;
  const endItem = Math.min((pageNumber + 1) * pageSize, totalElements);

  return `
    <button 
      class="pagination-btn" 
      ${pageNumber === 0 ? "disabled" : ""}
      onclick="changePage(${pageNumber - 1})"
    >
      Anterior
    </button>
    
    <div class="pagination-info">
      ${startItem}-${endItem} de ${totalElements} productos
    </div>
    
    <button 
      class="pagination-btn" 
      ${pageNumber >= totalPages - 1 ? "disabled" : ""}
      onclick="changePage(${pageNumber + 1})"
    >
      Siguiente
    </button>
  `;
}

/**
 * Crea mensaje de error para la carga de productos
 */
export function createErrorHTML(): string {
  return `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #64748b;">
      <h3 style="color: #ef4444; margin-bottom: 1rem;">Error al cargar productos</h3>
      <p>No se pudieron cargar los productos en este momento.</p>
      <p style="font-size: 0.875rem; margin-top: 0.5rem;">Verifica tu conexión a internet e inténtalo de nuevo.</p>
      <button onclick="window.location.reload()" 
              style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
        🔄 Reintentar
      </button>
    </div>
  `;
}

/**
 * Crea mensaje cuando no hay productos
 */
export function createEmptyStateHTML(): string {
  return `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #64748b;">
      <p>No se encontraron productos en esta categoría.</p>
    </div>
  `;
}

/**
 * Construye la URL de la API para cargar productos
 */
export function buildProductsApiUrl(
  categoryIds: number[],
  page: number = 0,
  size: number = 24
): string {
  const idsArray = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
  const categoriesParam = idsArray.join(",");
  return `/api/products?page=${page}&size=${size}&categorias=${categoriesParam}`;
}
