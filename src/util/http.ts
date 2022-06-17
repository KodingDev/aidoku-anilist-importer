export const createError = (message: string, code = 400): Response =>
  new Response(
    JSON.stringify({
      message,
      code,
    }),
    {
      status: code,
    },
  );

export const createJsonResponse = (data: unknown, code = 200): Response =>
  new Response(JSON.stringify(data), {
    status: code,
    headers: { "Content-Type": "application/json" },
  });
