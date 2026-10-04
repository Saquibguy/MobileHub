// Product images are stored on the backend as root-relative paths like "/uploads/xyz.jpg".
// That works locally because Vite's dev proxy forwards /uploads to the backend on the
// same apparent origin. In production, the frontend (e.g. Cloudflare Pages) and backend
// (e.g. Render) live on different domains, so a bare "/uploads/..." path resolves against
// the FRONTEND's origin instead and 404s. This resolves it to the backend's real origin.
const API_URL = import.meta.env.VITE_API_URL || "/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function getImageUrl(path) {
  if (!path) return "";
  // Already absolute (http://, https://, blob:, data:) — leave untouched.
  if (!path.startsWith("/")) return path;
  return `${API_ORIGIN}${path}`;
}
