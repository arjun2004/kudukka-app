export async function GET(): Promise<Response> {
  const flaskAPI: string = "http://127.0.0.1:5000/predict";

  try {
    const response: Response = await fetch(flaskAPI);
    const data: unknown = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch Flask data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export function HelloWorld(): Response {
  return new Response(JSON.stringify({ message: "Hello, World!" }), {
    headers: { "Content-Type": "application/json" },
  });
}
