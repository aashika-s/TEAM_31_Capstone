// Paste these INSIDE the `export const api = { ... }` object in lib/api.js
// (same place as createBatchScan). They use the file's existing request(), API_BASE.

  // ---------- Water screening ----------
  waterModelInfo: () => request("/api/v1/water/model-info"),

  waterStats: () => request("/api/v1/water/stats"),

  listWaterSamples: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== "")
    ).toString();
    return request(`/api/v1/water/samples${qs ? `?${qs}` : ""}`);
  },

  createWaterSample: (form) =>
    request("/api/v1/water/samples", { method: "POST", body: form, isFormData: true }),

  waterImageUrl: (filename) => `${API_BASE}/api/v1/water/images/${filename}`,
