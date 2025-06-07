import type { APIRoute } from "astro";

// Indicar que esta ruta debe ser renderizada en el servidor
export const prerender = false;

// Variables de entorno
const API_BASE_URL = import.meta.env.API_BASE_URL;
const API_CATALOGO_PATH = import.meta.env.API_CATALOGO_PATH;
const API_DEFAULT_PAGE_SIZE = import.meta.env.API_DEFAULT_PAGE_SIZE;
const API_DEFAULT_PAGE = import.meta.env.API_DEFAULT_PAGE;
const CORS_ALLOWED_ORIGINS = import.meta.env.CORS_ALLOWED_ORIGINS;
const CORS_ALLOWED_METHODS = import.meta.env.CORS_ALLOWED_METHODS;
const CORS_ALLOWED_HEADERS = import.meta.env.CORS_ALLOWED_HEADERS;

export const GET: APIRoute = async ({ request, url }) => {
  try {
    console.log("🔍 Raw URL received:", url.toString());
    console.log("🔍 Request URL:", request.url);
    console.log("🔍 URL search string:", url.search);
    console.log("🔍 URL pathname:", url.pathname);

    // Intentar obtener parámetros desde request.url
    const requestUrl = new URL(request.url);
    console.log("🔍 Request URL object:", requestUrl.toString());
    console.log("🔍 Request search params:", requestUrl.search);
    console.log(
      "🔍 Request search params object:",
      Object.fromEntries(requestUrl.searchParams.entries())
    );

    const searchParams = requestUrl.searchParams;
    console.log(
      "🔍 All URL params:",
      Object.fromEntries(searchParams.entries())
    );

    const page = searchParams.get("page") || API_DEFAULT_PAGE;
    const size = searchParams.get("size") || API_DEFAULT_PAGE_SIZE;
    const categorias = searchParams.get("categorias");

    console.log("API received parameters:", {
      page,
      size,
      categorias,
      url: url.toString(),
    });

    console.log(
      "🔍 SearchParams has 'categorias':",
      searchParams.has("categorias")
    );
    console.log("🔍 Raw categorias value:", searchParams.get("categorias"));
    console.log("🔍 All available keys:", Array.from(searchParams.keys()));

    if (!categorias || categorias.trim() === "") {
      console.error("Missing or empty categories parameter");
      return new Response(
        JSON.stringify({
          error: "Categories parameter is required",
          received: { page, size, categorias },
          urlParams: Object.fromEntries(searchParams.entries()),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validar que las categorías contienen solo números y comas
    const categoryPattern = /^[\d,]+$/;
    if (!categoryPattern.test(categorias)) {
      console.error("Invalid categories format:", categorias);
      return new Response(
        JSON.stringify({
          error: "Categories parameter must contain only numbers and commas",
          received: categorias,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const apiUrl = `${API_BASE_URL}${API_CATALOGO_PATH}?page=${page}&size=${size}&categorias=${categorias}`;

    console.log("Making request to PCFactory API:", apiUrl);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`PCFactory API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": CORS_ALLOWED_ORIGINS,
        "Access-Control-Allow-Methods": CORS_ALLOWED_METHODS,
        "Access-Control-Allow-Headers": CORS_ALLOWED_HEADERS,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": CORS_ALLOWED_ORIGINS,
      "Access-Control-Allow-Methods": CORS_ALLOWED_METHODS,
      "Access-Control-Allow-Headers": CORS_ALLOWED_HEADERS,
    },
  });
};
