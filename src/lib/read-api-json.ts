export async function readApiJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("json")) {
    throw new Error(
      `API returned a non-JSON response (HTTP ${response.status}). Check that the API route is available and the session is valid.`,
    );
  }

  return (await response.json()) as T;
}
