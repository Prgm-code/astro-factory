// Funciones auxiliares para el manejo de categorías

export interface Category {
  id: number;
  nombre: string;
  imagen: string;
  childCategories: Category[];
}

/**
 * Recopila todos los IDs de categorías y subcategorías
 */
export function collectCategoryIds(
  mainCategoryId: number,
  allCategories: Category[]
): number[] {
  const categoryIds = [mainCategoryId];

  // Buscar en los datos de categorías para obtener subcategorías
  allCategories.forEach((category) => {
    if (category.id === mainCategoryId && category.childCategories) {
      category.childCategories.forEach((subCategory) => {
        categoryIds.push(subCategory.id);
        // También agregar sub-subcategorías si existen
        if (
          subCategory.childCategories &&
          subCategory.childCategories.length > 0
        ) {
          subCategory.childCategories.forEach((subSubCategory) => {
            categoryIds.push(subSubCategory.id);
          });
        }
      });
    }
  });

  return [...new Set(categoryIds)]; // Eliminar duplicados
}

/**
 * Filtra categorías basándose en el término de búsqueda
 */
export function filterCategories(
  categories: Category[],
  searchTerm: string
): Category[] {
  const term = searchTerm.toLowerCase();

  return categories.filter((category) => {
    const categoryName = category.nombre?.toLowerCase() || "";
    const subcategoryNames =
      category.childCategories
        ?.map((sub) => sub.nombre.toLowerCase())
        .join(" ") || "";

    return categoryName.includes(term) || subcategoryNames.includes(term);
  });
}

/**
 * Busca una categoría por ID
 */
export function findCategoryById(
  categories: Category[],
  id: number
): Category | null {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }

    // Buscar en subcategorías
    for (const subCategory of category.childCategories) {
      if (subCategory.id === id) {
        return subCategory;
      }

      // Buscar en sub-subcategorías
      for (const subSubCategory of subCategory.childCategories) {
        if (subSubCategory.id === id) {
          return subSubCategory;
        }
      }
    }
  }

  return null;
}

/**
 * Obtiene todas las subcategorías de una categoría específica
 */
export function getSubcategories(category: Category): Category[] {
  const subcategories: Category[] = [];

  // Agregar subcategorías directas
  subcategories.push(...category.childCategories);

  // Agregar sub-subcategorías
  category.childCategories.forEach((subCategory) => {
    subcategories.push(...subCategory.childCategories);
  });

  return subcategories;
}

/**
 * Cuenta el total de subcategorías (incluyendo sub-subcategorías)
 */
export function countTotalSubcategories(category: Category): number {
  let count = category.childCategories.length;

  category.childCategories.forEach((subCategory) => {
    count += subCategory.childCategories.length;
  });

  return count;
}
