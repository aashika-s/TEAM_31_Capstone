// // /**
// //  * Thin fetch wrapper for the SpectraSafe API. Attaches the stored JWT to
// //  * every request unless auth:false is passed (only the register/login
// //  * endpoints need that, since there's no token yet at that point).
// //  */
// // const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
// // const TOKEN_KEY = "spectrasafe_token";

// // export function getToken() {
// //   return localStorage.getItem(TOKEN_KEY);
// // }

// // export function setToken(token) {
// //   localStorage.setItem(TOKEN_KEY, token);
// // }

// // export function clearToken() {
// //   localStorage.removeItem(TOKEN_KEY);
// // }

// // async function request(path, { method = "GET", body, isFormData = false, auth = true } = {}) {
// //   const headers = {};
// //   if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";
// //   if (auth) {
// //     const token = getToken();
// //     if (token) headers["Authorization"] = `Bearer ${token}`;
// //   }

// //   const res = await fetch(`${API_BASE}${path}`, {
// //     method,
// //     headers,
// //     body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
// //   });

// //   if (!res.ok) {
// //     let detail = res.statusText;
// //     try {
// //       const data = await res.json();
// //       detail = data.detail || detail;
// //     } catch {
// //       /* response wasn't JSON -- keep statusText */
// //     }
// //     throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
// //   }
// //   if (res.status === 204) return null;
// //   return res.json();
// // }

// // export const api = {
// //   register: (payload) => request("/api/v1/auth/register", { method: "POST", body: payload, auth: false }),
// //   login: (payload) => request("/api/v1/auth/login", { method: "POST", body: payload, auth: false }),
// //   me: () => request("/api/v1/auth/me"),

// //   listProducts: () => request("/api/v1/products/"),
// //   getProduct: (id) => request(`/api/v1/products/${id}`),
// //   createProduct: (payload) => request("/api/v1/products/", { method: "POST", body: payload }),
// //   createBatch: (productId, payload) =>
// //     request(`/api/v1/products/${productId}/batches`, { method: "POST", body: payload }),

// //   listScans: () => request("/api/v1/scans/"),
// //   getScan: (id) => request(`/api/v1/scans/${id}`),
// //   createScan: (file) => {
// //     const form = new FormData();
// //     form.append("file", file);
// //     return request("/api/v1/scans/", { method: "POST", body: form, isFormData: true });
// //   },
// // };



// /**
//  * Thin fetch wrapper for the SpectraSafe API. Attaches the stored JWT to
//  * every request unless auth:false is passed (only the register/login
//  * endpoints need that, since there's no token yet at that point).
//  */
// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
// const TOKEN_KEY = "spectrasafe_token";

// export function getToken() {
//   return localStorage.getItem(TOKEN_KEY);
// }

// export function setToken(token) {
//   localStorage.setItem(TOKEN_KEY, token);
// }

// export function clearToken() {
//   localStorage.removeItem(TOKEN_KEY);
// }

// async function request(path, { method = "GET", body, isFormData = false, auth = true } = {}) {
//   const headers = {};
//   if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";
//   if (auth) {
//     const token = getToken();
//     if (token) headers["Authorization"] = `Bearer ${token}`;
//   }

//   const res = await fetch(`${API_BASE}${path}`, {
//     method,
//     headers,
//     body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
//   });

//   if (!res.ok) {
//     let detail = res.statusText;
//     try {
//       const data = await res.json();
//       detail = data.detail || detail;
//     } catch {
//       /* response wasn't JSON -- keep statusText */
//     }
//     throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
//   }
//   if (res.status === 204) return null;
//   return res.json();
// }

// export const api = {
//   register: (payload) => request("/api/v1/auth/register", { method: "POST", body: payload, auth: false }),
//   login: (payload) => request("/api/v1/auth/login", { method: "POST", body: payload, auth: false }),
//   me: () => request("/api/v1/auth/me"),

//   listProducts: () => request("/api/v1/products/"),
//   getProduct: (id) => request(`/api/v1/products/${id}`),
//   createProduct: (payload) => request("/api/v1/products/", { method: "POST", body: payload }),
//   createBatch: (productId, payload) =>
//     request(`/api/v1/products/${productId}/batches`, { method: "POST", body: payload }),

//   listScans: (params = {}) => {
//     const query = new URLSearchParams(params).toString();
//     return request(`/api/v1/scans/${query ? `?${query}` : ""}`);
//   },
//   getScan: (id) => request(`/api/v1/scans/${id}`),
//   createScan: (file) => {
//     const form = new FormData();
//     form.append("file", file);
//     return request("/api/v1/scans/", { method: "POST", body: form, isFormData: true });
//   },
//   // Not using the generic request() helper here -- it discards response
//   // headers, and batch scan needs the X-Batch-Errors header to report
//   // which images (if any) failed alongside the ones that succeeded.
//   createBatchScan: async (files) => {
//     const form = new FormData();
//     files.forEach((f) => form.append("files", f));
//     const headers = {};
//     const token = getToken();
//     if (token) headers["Authorization"] = `Bearer ${token}`;

//     const res = await fetch(`${API_BASE}/api/v1/scans/batch`, { method: "POST", headers, body: form });
//     if (!res.ok) {
//       let detail = res.statusText;
//       try {
//         const data = await res.json();
//         detail = data.detail || detail;
//       } catch {
//         /* not JSON */
//       }
//       throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
//     }
//     const scans = await res.json();
//     const errorsHeader = res.headers.get("x-batch-errors");
//     const errors = errorsHeader ? JSON.parse(errorsHeader) : [];
//     return { scans, errors };
//   },

//   createFlag: (payload) => request("/api/v1/flags/", { method: "POST", body: payload }),
//   listFlags: () => request("/api/v1/flags/"),
// };










// /**
//  * Thin fetch wrapper for the SpectraSafe API. Attaches the stored JWT to
//  * every request unless auth:false is passed (only the register/login
//  * endpoints need that, since there's no token yet at that point).
//  */
// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
// const TOKEN_KEY = "spectrasafe_token";

// export function getToken() {
//   return localStorage.getItem(TOKEN_KEY);
// }

// export function setToken(token) {
//   localStorage.setItem(TOKEN_KEY, token);
// }

// export function clearToken() {
//   localStorage.removeItem(TOKEN_KEY);
// }

// async function request(path, { method = "GET", body, isFormData = false, auth = true } = {}) {
//   const headers = {};
//   if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";
//   if (auth) {
//     const token = getToken();
//     if (token) headers["Authorization"] = `Bearer ${token}`;
//   }

//   const res = await fetch(`${API_BASE}${path}`, {
//     method,
//     headers,
//     body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
//   });

//   if (!res.ok) {
//     let detail = res.statusText;
//     try {
//       const data = await res.json();
//       detail = data.detail || detail;
//     } catch {
//       /* response wasn't JSON -- keep statusText */
//     }
//     throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
//   }
//   if (res.status === 204) return null;
//   return res.json();
// }

// export const api = {
//   register: (payload) => request("/api/v1/auth/register", { method: "POST", body: payload, auth: false }),
//   login: (payload) => request("/api/v1/auth/login", { method: "POST", body: payload, auth: false }),
//   me: () => request("/api/v1/auth/me"),

//   listProducts: () => request("/api/v1/products/"),
//   getProduct: (id) => request(`/api/v1/products/${id}`),
//   createProduct: (payload) => request("/api/v1/products/", { method: "POST", body: payload }),
//   createBatch: (productId, payload) =>
//     request(`/api/v1/products/${productId}/batches`, { method: "POST", body: payload }),

//   listScans: (params = {}) => {
//     const query = new URLSearchParams(params).toString();
//     return request(`/api/v1/scans/${query ? `?${query}` : ""}`);
//   },
//   getScan: (id) => request(`/api/v1/scans/${id}`),
//   createScan: (file) => {
//     const form = new FormData();
//     form.append("file", file);
//     return request("/api/v1/scans/", { method: "POST", body: form, isFormData: true });
//   },
//   // Not using the generic request() helper here -- it discards response
//   // headers, and batch scan needs the X-Batch-Errors header to report
//   // which images (if any) failed alongside the ones that succeeded.
//   createBatchScan: async (files) => {
//     const form = new FormData();
//     files.forEach((f) => form.append("files", f));
//     const headers = {};
//     const token = getToken();
//     if (token) headers["Authorization"] = `Bearer ${token}`;

//     const res = await fetch(`${API_BASE}/api/v1/scans/batch`, { method: "POST", headers, body: form });
//     if (!res.ok) {
//       let detail = res.statusText;
//       try {
//         const data = await res.json();
//         detail = data.detail || detail;
//       } catch {
//         /* not JSON */
//       }
//       throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
//     }
//     const scans = await res.json();
//     const errorsHeader = res.headers.get("x-batch-errors");
//     const errors = errorsHeader ? JSON.parse(errorsHeader) : [];
//     return { scans, errors };
//   },

//   createFlag: (payload) => request("/api/v1/flags/", { method: "POST", body: payload }),
//   listFlags: () => request("/api/v1/flags/"),

//   searchEncyclopedia: (q) => request(`/api/v1/encyclopedia/search?q=${encodeURIComponent(q)}`),
//   getEncyclopediaEntry: (slug) => request(`/api/v1/encyclopedia/${encodeURIComponent(slug)}`),
// };











// PHASE 5
/**
 * Thin fetch wrapper for the SpectraSafe API. Attaches the stored JWT to
 * every request unless auth:false is passed (only the register/login
 * endpoints need that, since there's no token yet at that point).
 */
// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
// const TOKEN_KEY = "spectrasafe_token";

// export function getToken() {
//   return localStorage.getItem(TOKEN_KEY);
// }

// export function setToken(token) {
//   localStorage.setItem(TOKEN_KEY, token);
// }

// export function clearToken() {
//   localStorage.removeItem(TOKEN_KEY);
// }

// async function request(path, { method = "GET", body, isFormData = false, auth = true } = {}) {
//   const headers = {};
//   if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";
//   if (auth) {
//     const token = getToken();
//     if (token) headers["Authorization"] = `Bearer ${token}`;
//   }

//   const res = await fetch(`${API_BASE}${path}`, {
//     method,
//     headers,
//     body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
//   });

//   if (!res.ok) {
//     let detail = res.statusText;
//     try {
//       const data = await res.json();
//       detail = data.detail || detail;
//     } catch {
//       /* response wasn't JSON -- keep statusText */
//     }
//     throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
//   }
//   if (res.status === 204) return null;
//   return res.json();
// }

// export const api = {
//   register: (payload) => request("/api/v1/auth/register", { method: "POST", body: payload, auth: false }),
//   login: (payload) => request("/api/v1/auth/login", { method: "POST", body: payload, auth: false }),
//   me: () => request("/api/v1/auth/me"),

//   listProducts: () => request("/api/v1/products/"),
//   getProduct: (id) => request(`/api/v1/products/${id}`),
//   createProduct: (payload) => request("/api/v1/products/", { method: "POST", body: payload }),
//   createBatch: (productId, payload) =>
//     request(`/api/v1/products/${productId}/batches`, { method: "POST", body: payload }),
//   listBatches: (productId) => request(`/api/v1/products/${productId}/batches`),

//   listScans: (params = {}) => {
//     const query = new URLSearchParams(params).toString();
//     return request(`/api/v1/scans/${query ? `?${query}` : ""}`);
//   },
//   getScan: (id) => request(`/api/v1/scans/${id}`),
//   createScan: (file) => {
//     const form = new FormData();
//     form.append("file", file);
//     return request("/api/v1/scans/", { method: "POST", body: form, isFormData: true });
//   },
//   // Not using the generic request() helper here -- it discards response
//   // headers, and batch scan needs the X-Batch-Errors header to report
//   // which images (if any) failed alongside the ones that succeeded.
//   createBatchScan: async (files) => {
//     const form = new FormData();
//     files.forEach((f) => form.append("files", f));
//     const headers = {};
//     const token = getToken();
//     if (token) headers["Authorization"] = `Bearer ${token}`;

//     const res = await fetch(`${API_BASE}/api/v1/scans/batch`, { method: "POST", headers, body: form });
//     if (!res.ok) {
//       let detail = res.statusText;
//       try {
//         const data = await res.json();
//         detail = data.detail || detail;
//       } catch {
//         /* not JSON */
//       }
//       throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
//     }
//     const scans = await res.json();
//     const errorsHeader = res.headers.get("x-batch-errors");
//     const errors = errorsHeader ? JSON.parse(errorsHeader) : [];
//     return { scans, errors };
//   },

//   createFlag: (payload) => request("/api/v1/flags/", { method: "POST", body: payload }),
//   listFlags: () => request("/api/v1/flags/"),

//   searchEncyclopedia: (q) => request(`/api/v1/encyclopedia/search?q=${encodeURIComponent(q)}`),
//   getEncyclopediaEntry: (slug) => request(`/api/v1/encyclopedia/${encodeURIComponent(slug)}`),
// };








/**
 * Thin fetch wrapper for the SpectraSafe API. Attaches the stored JWT to
 * every request unless auth:false is passed (only the register/login
 * endpoints need that, since there's no token yet at that point).
//  */
// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
// const TOKEN_KEY = "spectrasafe_token";

// export function getToken() {
//   return localStorage.getItem(TOKEN_KEY);
// }

// export function setToken(token) {
//   localStorage.setItem(TOKEN_KEY, token);
// }

// export function clearToken() {
//   localStorage.removeItem(TOKEN_KEY);
// }

// async function request(path, { method = "GET", body, isFormData = false, auth = true } = {}) {
//   const headers = {};
//   if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";
//   if (auth) {
//     const token = getToken();
//     if (token) headers["Authorization"] = `Bearer ${token}`;
//   }

//   const res = await fetch(`${API_BASE}${path}`, {
//     method,
//     headers,
//     body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
//   });

//   if (!res.ok) {
//     let detail = res.statusText;
//     try {
//       const data = await res.json();
//       detail = data.detail || detail;
//     } catch {
//       /* response wasn't JSON -- keep statusText */
//     }
//     throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
//   }
//   if (res.status === 204) return null;
//   return res.json();
// }

// export const api = {
//   register: (payload) => request("/api/v1/auth/register", { method: "POST", body: payload, auth: false }),
//   login: (payload) => request("/api/v1/auth/login", { method: "POST", body: payload, auth: false }),
//   me: () => request("/api/v1/auth/me"),

//   listProducts: () => request("/api/v1/products/"),
//   getProduct: (id) => request(`/api/v1/products/${id}`),
//   createProduct: (payload) => request("/api/v1/products/", { method: "POST", body: payload }),
//   createBatch: (productId, payload) =>
//     request(`/api/v1/products/${productId}/batches`, { method: "POST", body: payload }),
//   listBatches: (productId) => request(`/api/v1/products/${productId}/batches`),

//   listScans: (params = {}) => {
//     const query = new URLSearchParams(params).toString();
//     return request(`/api/v1/scans/${query ? `?${query}` : ""}`);
//   },
//   getScan: (id) => request(`/api/v1/scans/${id}`),
//   createScan: (file) => {
//     const form = new FormData();
//     form.append("file", file);
//     return request("/api/v1/scans/", { method: "POST", body: form, isFormData: true });
//   },
//   // Not using the generic request() helper here -- it discards response
//   // headers, and batch scan needs the X-Batch-Errors header to report
//   // which images (if any) failed alongside the ones that succeeded.
//   createBatchScan: async (files) => {
//     const form = new FormData();
//     files.forEach((f) => form.append("files", f));
//     const headers = {};
//     const token = getToken();
//     if (token) headers["Authorization"] = `Bearer ${token}`;

//     const res = await fetch(`${API_BASE}/api/v1/scans/batch`, { method: "POST", headers, body: form });
//     if (!res.ok) {
//       let detail = res.statusText;
//       try {
//         const data = await res.json();
//         detail = data.detail || detail;
//       } catch {
//         /* not JSON */
//       }
//       throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
//     }
//     const scans = await res.json();
//     const errorsHeader = res.headers.get("x-batch-errors");
//     const errors = errorsHeader ? JSON.parse(errorsHeader) : [];
//     return { scans, errors };
//   },

//   createFlag: (payload) => request("/api/v1/flags/", { method: "POST", body: payload }),
//   listFlags: () => request("/api/v1/flags/"),
//   getFlag: (id) => request(`/api/v1/flags/${id}`),
//   updateFlagStatus: (id, status) => request(`/api/v1/flags/${id}`, { method: "PATCH", body: { status } }),

//   searchEncyclopedia: (q) => request(`/api/v1/encyclopedia/search?q=${encodeURIComponent(q)}`),
//   getEncyclopediaEntry: (slug) => request(`/api/v1/encyclopedia/${encodeURIComponent(slug)}`),
// };



// PHASE 6
/**
 * Thin fetch wrapper for the SpectraSafe API. Attaches the stored JWT to
 * every request unless auth:false is passed (only the register/login
 * endpoints need that, since there's no token yet at that point).
 */
// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
// const TOKEN_KEY = "spectrasafe_token";

// export function getToken() {
//   return localStorage.getItem(TOKEN_KEY);
// }

// export function setToken(token) {
//   localStorage.setItem(TOKEN_KEY, token);
// }

// export function clearToken() {
//   localStorage.removeItem(TOKEN_KEY);
// }

// async function request(path, { method = "GET", body, isFormData = false, auth = true } = {}) {
//   const headers = {};
//   if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";
//   if (auth) {
//     const token = getToken();
//     if (token) headers["Authorization"] = `Bearer ${token}`;
//   }

//   const res = await fetch(`${API_BASE}${path}`, {
//     method,
//     headers,
//     body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
//   });

//   if (!res.ok) {
//     let detail = res.statusText;
//     try {
//       const data = await res.json();
//       detail = data.detail || detail;
//     } catch {
//       /* response wasn't JSON -- keep statusText */
//     }
//     throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
//   }
//   if (res.status === 204) return null;
//   return res.json();
// }

// export const api = {
//   register: (payload) => request("/api/v1/auth/register", { method: "POST", body: payload, auth: false }),
//   login: (payload) => request("/api/v1/auth/login", { method: "POST", body: payload, auth: false }),
//   me: () => request("/api/v1/auth/me"),

//   listProducts: () => request("/api/v1/products/"),
//   getProduct: (id) => request(`/api/v1/products/${id}`),
//   createProduct: (payload) => request("/api/v1/products/", { method: "POST", body: payload }),
//   createBatch: (productId, payload) =>
//     request(`/api/v1/products/${productId}/batches`, { method: "POST", body: payload }),
//   listBatches: (productId) => request(`/api/v1/products/${productId}/batches`),

//   listScans: (params = {}) => {
//     const query = new URLSearchParams(params).toString();
//     return request(`/api/v1/scans/${query ? `?${query}` : ""}`);
//   },
//   getScan: (id) => request(`/api/v1/scans/${id}`),
//   createScan: (file) => {
//     const form = new FormData();
//     form.append("file", file);
//     return request("/api/v1/scans/", { method: "POST", body: form, isFormData: true });
//   },
//   // Not using the generic request() helper here -- it discards response
//   // headers, and batch scan needs the X-Batch-Errors header to report
//   // which images (if any) failed alongside the ones that succeeded.
//   createBatchScan: async (files) => {
//     const form = new FormData();
//     files.forEach((f) => form.append("files", f));
//     const headers = {};
//     const token = getToken();
//     if (token) headers["Authorization"] = `Bearer ${token}`;

//     const res = await fetch(`${API_BASE}/api/v1/scans/batch`, { method: "POST", headers, body: form });
//     if (!res.ok) {
//       let detail = res.statusText;
//       try {
//         const data = await res.json();
//         detail = data.detail || detail;
//       } catch {
//         /* not JSON */
//       }
//       throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
//     }
//     const scans = await res.json();
//     const errorsHeader = res.headers.get("x-batch-errors");
//     const errors = errorsHeader ? JSON.parse(errorsHeader) : [];
//     return { scans, errors };
//   },

//   createFlag: (payload) => request("/api/v1/flags/", { method: "POST", body: payload }),
//   listFlags: () => request("/api/v1/flags/"),
//   getFlag: (id) => request(`/api/v1/flags/${id}`),
//   updateFlagStatus: (id, status) => request(`/api/v1/flags/${id}`, { method: "PATCH", body: { status } }),

//   searchEncyclopedia: (q) => request(`/api/v1/encyclopedia/search?q=${encodeURIComponent(q)}`),
//   getEncyclopediaEntry: (slug) => request(`/api/v1/encyclopedia/${encodeURIComponent(slug)}`),
// };









/**
 * Thin fetch wrapper for the SpectraSafe API. Attaches the stored JWT to
 * every request unless auth:false is passed (only the register/login
 * endpoints need that, since there's no token yet at that point).
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const TOKEN_KEY = "spectrasafe_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, isFormData = false, auth = true } = {}) {
  const headers = {};
  if (!isFormData && body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      /* response wasn't JSON -- keep statusText */
    }
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (payload) => request("/api/v1/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/api/v1/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/api/v1/auth/me"),

  listProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/v1/products/${query ? `?${query}` : ""}`);
  },
  getProduct: (id) => request(`/api/v1/products/${id}`),
  createProduct: (payload) => request("/api/v1/products/", { method: "POST", body: payload }),
  createBatch: (productId, payload) =>
    request(`/api/v1/products/${productId}/batches`, { method: "POST", body: payload }),
  listBatches: (productId) => request(`/api/v1/products/${productId}/batches`),

  listScans: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/v1/scans/${query ? `?${query}` : ""}`);
  },
  getScan: (id) => request(`/api/v1/scans/${id}`),
  rescanLicense: (scanId, file) => {
  const form = new FormData();
  form.append("file", file);
  return request(`/api/v1/scans/${scanId}/license`, { method: "PATCH", body: form, isFormData: true });
},
  createScan: (file, location) => {
  const form = new FormData();
  form.append("file", file);
  form.append("location", location.label);
  if (location.lat != null) form.append("latitude", location.lat);
  if (location.lon != null) form.append("longitude", location.lon);
  return request("/api/v1/scans/", { method: "POST", body: form, isFormData: true });
},
  // Not using the generic request() helper here -- it discards response
  // headers, and batch scan needs the X-Batch-Errors header to report
  // which images (if any) failed alongside the ones that succeeded.
  // createBatchScan: async (files,location) => {
  //   const form = new FormData();
  //   form.append("location", location);
  //   files.forEach((f) => form.append("files", f));
  //   const headers = {};
  //   const token = getToken();
  //   if (token) headers["Authorization"] = `Bearer ${token}`;

  //   const res = await fetch(`${API_BASE}/api/v1/scans/batch`, { method: "POST", headers, body: form });
  //   if (!res.ok) {
  //     let detail = res.statusText;
  //     try {
  //       const data = await res.json();
  //       detail = data.detail || detail;
  //     } catch {
  //       /* not JSON */
  //     }
  //     throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  //   }
  //   const scans = await res.json();
  //   const errorsHeader = res.headers.get("x-batch-errors");
  //   const errors = errorsHeader ? JSON.parse(errorsHeader) : [];
  //   return { scans, errors };
  // },


  createBatchScan: async (files, location) => {
  const form = new FormData();
  form.append("location", location.label);
  if (location.lat != null) form.append("latitude", location.lat);
  if (location.lon != null) form.append("longitude", location.lon);
  files.forEach((f) => form.append("files", f));
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1/scans/batch`, { method: "POST", headers, body: form });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {}
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  const scans = await res.json();
  const errorsHeader = res.headers.get("x-batch-errors");
  const errors = errorsHeader ? JSON.parse(errorsHeader) : [];
  return { scans, errors };
},

  createFlag: (payload) => request("/api/v1/flags/", { method: "POST", body: payload }),
  listFlags: () => request("/api/v1/flags/"),
  getFlag: (id) => request(`/api/v1/flags/${id}`),
  updateFlagStatus: (id, status) => request(`/api/v1/flags/${id}`, { method: "PATCH", body: { status } }),

  createNotice: (payload) => request("/api/v1/notices/", { method: "POST", body: payload }),
listNotices: () => request("/api/v1/notices/"),
getNotice: (id) => request(`/api/v1/notices/${id}`),
downloadNoticePdf: async (id) => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/v1/notices/${id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Failed to download notice PDF");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `notice-${id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
},

  searchEncyclopedia: (q) => request(`/api/v1/encyclopedia/search?q=${encodeURIComponent(q)}`),
  getEncyclopediaEntry: (slug) => request(`/api/v1/encyclopedia/${encodeURIComponent(slug)}`),
};

