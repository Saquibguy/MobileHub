// Product images are stored on the backend as paths like:
// /uploads/product-image.jpg
//
// In production, the frontend and backend are on different domains.
// This converts backend-relative image paths into full backend URLs.

const API_URL = import.meta.env.VITE_API_URL || "/api";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function getImageUrl(path) {
  if (!path) return "";

  // Already an absolute URL or browser-generated URL
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  // Backend-relative path
  if (path.startsWith("/")) {
    return `${API_ORIGIN}${path}`;
  }

  return `${API_ORIGIN}/${path}`;
}

export default getImageUrl;