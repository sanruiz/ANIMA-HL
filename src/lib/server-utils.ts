import { headers } from "next/headers";

/** Returns the host of the current request, including its port if present. */
export async function getCurrentHost(): Promise<string> {
  return (await headers()).get("host") ?? "";
}

/** Identifies development hosts independently of the canonical site URL.
 * Public domains may use www or the bare domain. */
export async function isNonPublicDomain(): Promise<boolean> {
  const host = await getCurrentHost();
  if (!host) return true;

  let hostname: string;
  try {
    hostname = new URL(`http://${host}`).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return true;
  }

  return (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".sanruiz.co") ||
    hostname.startsWith("dev-")
  );
}
