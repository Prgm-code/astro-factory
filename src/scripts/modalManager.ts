// Gestor del modal de productos
import type { Category } from "../utils/categoryHelpers";
import { collectCategoryIds } from "../utils/categoryHelpers";
import type { Product, ProductsResponse } from "../utils/productHelpers";
import {
  buildProductsApiUrl,
  extractUniqueBrands,
  filterProductsByBrand,
  sortProducts,
  createProductCardHTML,
  createPaginationHTML,
  createErrorHTML,
  createEmptyStateHTML,
} from "../utils/productHelpers";

export class ModalManager {
  private modal: HTMLElement | null = null;
  private modalTitle: HTMLElement | null = null;
  private loadingSpinner: HTMLElement | null = null;
  private productsGrid: HTMLElement | null = null;
  private paginationControls: HTMLElement | null = null;
  private productsFilters: HTMLElement | null = null;
  private brandFilter: HTMLSelectElement | null = null;
  private sortFilter: HTMLSelectElement | null = null;
  private productsCount: HTMLElement | null = null;
  private closeModalBtn: HTMLElement | null = null;

  private currentPage = 0;
  private totalPages = 0;
  private currentCategoryIds: number[] = [];
  private currentCategoryName = "";
  private allProducts: Product[] = [];
  private filteredProducts: Product[] = [];
  private uniqueBrands: string[] = [];
  private allCategories: Category[] = [];

  constructor(categories: Category[]) {
    this.allCategories = categories;
    this.initializeElements();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    this.modal = document.getElementById("products-modal");
    this.modalTitle = document.getElementById("modal-title");
    this.loadingSpinner = document.getElementById("loading-spinner");
    this.productsGrid = document.getElementById("products-grid");
    this.paginationControls = document.getElementById("pagination-controls");
    this.productsFilters = document.getElementById("products-filters");
    this.brandFilter = document.getElementById(
      "brand-filter"
    ) as HTMLSelectElement;
    this.sortFilter = document.getElementById(
      "sort-filter"
    ) as HTMLSelectElement;
    this.productsCount = document.getElementById("products-count");
    this.closeModalBtn = document.getElementById("close-modal");
  }

  private setupEventListeners(): void {
    // Cerrar modal
    this.closeModalBtn?.addEventListener("click", () => this.closeModal());

    // Cerrar modal al hacer click en el overlay
    this.modal?.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Cerrar modal con tecla Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal?.classList.contains("show")) {
        this.closeModal();
      }
    });

    // Event listeners para filtros
    this.brandFilter?.addEventListener("change", () => this.applyFilters());
    this.sortFilter?.addEventListener("change", () => this.applyFilters());
  }

  public openModal(categoryId: number, categoryName: string): void {
    const categoryIds = collectCategoryIds(categoryId, this.allCategories);
    this.currentCategoryIds = categoryIds;
    this.currentCategoryName = categoryName;
    this.currentPage = 0;

    if (this.modalTitle) {
      this.modalTitle.textContent = `${categoryName} - Productos Disponibles`;
    }

    this.modal?.classList.add("show");
    this.loadProducts(categoryIds, 0);
  }

  private closeModal(): void {
    this.modal?.classList.remove("show");
  }

  private async loadProducts(
    categoryIds: number[],
    page: number = 0
  ): Promise<void> {
    if (!this.loadingSpinner || !this.productsGrid || !this.paginationControls)
      return;

    // Mostrar spinner y ocultar contenido
    this.loadingSpinner.style.display = "flex";
    this.productsGrid.style.display = "none";
    this.paginationControls.style.display = "none";

    try {
      const apiUrl = buildProductsApiUrl(categoryIds, page, 24);
      console.log("Loading products from:", apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) throw new Error("Error al cargar productos");

      const data: ProductsResponse = await response.json();

      // Ocultar spinner y mostrar contenido
      this.loadingSpinner.style.display = "none";
      this.productsGrid.style.display = "grid";
      this.paginationControls.style.display = "flex";
      if (this.productsFilters) this.productsFilters.style.display = "block";

      // Almacenar productos y extraer marcas únicas
      this.allProducts = data.content.items;
      this.uniqueBrands = extractUniqueBrands(this.allProducts);

      // Actualizar filtros
      this.updateBrandFilter();
      this.updateProductsCount(data.content.pageable.totalElements);

      // Aplicar filtros y renderizar
      this.applyFilters();
      this.renderPagination(data.content.pageable);
    } catch (error) {
      console.error("Error loading products:", error);
      this.loadingSpinner.style.display = "none";
      if (this.productsGrid) {
        this.productsGrid.innerHTML = createErrorHTML();
        this.productsGrid.style.display = "grid";
      }
    }
  }

  private renderProducts(products: Product[]): void {
    if (!this.productsGrid) return;

    if (products.length === 0) {
      this.productsGrid.innerHTML = createEmptyStateHTML();
      return;
    }

    this.productsGrid.innerHTML = products
      .map((product) => createProductCardHTML(product))
      .join("");
  }

  private renderPagination(
    pageable: ProductsResponse["content"]["pageable"]
  ): void {
    if (!this.paginationControls) return;

    this.currentPage = pageable.pageNumber;
    this.totalPages = pageable.totalPages;

    this.paginationControls.innerHTML = createPaginationHTML(pageable);
  }

  private updateBrandFilter(): void {
    if (!this.brandFilter) return;

    // Limpiar opciones existentes excepto la primera
    this.brandFilter.innerHTML = '<option value="">Todas las marcas</option>';

    // Añadir opciones de marcas
    this.uniqueBrands.forEach((brand) => {
      const option = document.createElement("option");
      option.value = brand;
      option.textContent = brand;
      this.brandFilter?.appendChild(option);
    });
  }

  private updateProductsCount(totalElements: number): void {
    if (this.productsCount) {
      this.productsCount.textContent = `${totalElements} productos encontrados`;
    }
  }

  private applyFilters(): void {
    // Filtrar por marca
    const selectedBrand = this.brandFilter?.value || "";
    this.filteredProducts = filterProductsByBrand(
      this.allProducts,
      selectedBrand
    );

    // Ordenar productos
    const sortValue = this.sortFilter?.value || "relevance";
    this.filteredProducts = sortProducts(this.filteredProducts, sortValue);

    this.renderProducts(this.filteredProducts);

    // Actualizar contador con productos filtrados
    if (this.productsCount) {
      this.productsCount.textContent = `${this.filteredProducts.length} productos encontrados`;
    }
  }

  public changePage(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.loadProducts(this.currentCategoryIds, newPage);
    }
  }

  public viewProduct(slug: string): void {
    window.open(`https://www.pcfactory.cl/producto/${slug}`, "_blank");
  }
}

// Variables globales para funciones que se llaman desde HTML
let modalManager: ModalManager | null = null;

// Funciones globales para compatibilidad con onclick en HTML
(window as any).openProductsModal = function (
  categoryId: number,
  categoryName: string
) {
  modalManager?.openModal(categoryId, categoryName);
};

(window as any).changePage = function (newPage: number) {
  modalManager?.changePage(newPage);
};

(window as any).viewProduct = function (slug: string) {
  modalManager?.viewProduct(slug);
};

// Exportar para inicialización
export function initializeModalManager(categories: Category[]): ModalManager {
  modalManager = new ModalManager(categories);
  return modalManager;
}
