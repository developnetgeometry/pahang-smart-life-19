export type PtzCredentials = {
  host: string; // e.g., 192.168.0.60
  port?: number; // ONVIF port, default 80
  user: string;
  pass: string;
};

const base = import.meta.env.VITE_PTZ_PROXY_URL as string | undefined;

async function post(path: string, body: any) {
  if (!base) throw new Error("VITE_PTZ_PROXY_URL not set");
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `PTZ ${path} failed`);
  }
  return res.json();
}

export const ptz = {
  continuous: (
    creds: PtzCredentials,
    vec: { x?: number; y?: number; z?: number }
  ) => post("/ptz/continuous", { ...creds, ...vec }),
  stop: (creds: PtzCredentials, opts?: { panTilt?: boolean; zoom?: boolean }) =>
    post("/ptz/stop", { ...creds, ...(opts || {}) }),
  preset: (
    creds: PtzCredentials,
    req: {
      action: "goto" | "set" | "remove";
      name?: string;
      token?: string;
      presetToken?: string;
    }
  ) => post("/ptz/preset", { ...creds, ...req }),
};
