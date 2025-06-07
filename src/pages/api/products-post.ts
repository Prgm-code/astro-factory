import type { APIRoute } from "astro";

// Indicar que esta ruta debe ser renderizada en el servidor
export const prerender = false;

// Variables de entorno
const API_BASE_URL = import.meta.env.API_BASE_URL || "https://api.pcfactory.cl";
const API_CATALOGO_PATH =
  import.meta.env.API_CATALOGO_PATH ||
  "/pcfactory-services-catalogo/v1/catalogo/productos/query";
const API_DEFAULT_PAGE_SIZE = import.meta.env.API_DEFAULT_PAGE_SIZE || "24";
const API_DEFAULT_PAGE = import.meta.env.API_DEFAULT_PAGE || "0";
const CORS_ALLOWED_ORIGINS = import.meta.env.CORS_ALLOWED_ORIGINS || "*";
const CORS_ALLOWED_METHODS =
  import.meta.env.CORS_ALLOWED_METHODS || "GET, POST, PUT, DELETE, OPTIONS";
const CORS_ALLOWED_HEADERS =
  import.meta.env.CORS_ALLOWED_HEADERS || "Content-Type";

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verificar si hay contenido en el body
    const contentLength = request.headers.get("content-length");

    if (!contentLength || contentLength === "0") {
      console.error("Empty request body");
      return new Response(
        JSON.stringify({
          error: "Empty request body",
          received: "No content",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
          message:
            jsonError instanceof Error
              ? jsonError.message
              : "Unknown JSON error",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const {
      page = API_DEFAULT_PAGE,
      size = API_DEFAULT_PAGE_SIZE,
      categorias,
    } = body;

    if (!categorias || categorias.toString().trim() === "") {
      console.error("Missing or empty categories parameter");
      return new Response(
        JSON.stringify({
          error: "Categories parameter is required",
          received: { page, size, categorias },
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
    const categoriasStr = categorias.toString();
    if (!categoryPattern.test(categoriasStr)) {
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

    const apiUrl = `${API_BASE_URL}${API_CATALOGO_PATH}?page=${page}&size=${size}&categorias=${categoriasStr}`;

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
    console.error("API Error:", error);

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
