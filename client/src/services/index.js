import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (token, password) => api.post("/auth/reset-password", { token, password }).then((r) => r.data),
};

export const productService = {
  list: (params) => api.get("/products", { params }).then((r) => r.data),
  get: (idOrSlug) => api.get(`/products/${idOrSlug}`).then((r) => r.data),
  create: (formData) => api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  update: (id, formData) => api.put(`/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
  reviews: (id) => api.get(`/products/${id}/reviews`).then((r) => r.data),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data).then((r) => r.data),
};

export const categoryService = {
  list: (all = false) => api.get("/categories", { params: { all } }).then((r) => r.data),
  create: (data) => api.post("/categories", data).then((r) => r.data),
  update: (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};

export const cartService = {
  get: () => api.get("/cart").then((r) => r.data),
  add: (productId, quantity = 1, variantId = null) => api.post("/cart", { productId, quantity, variantId }).then((r) => r.data),
  update: (itemId, data) => api.put(`/cart/${itemId}`, data).then((r) => r.data),
  remove: (itemId) => api.delete(`/cart/${itemId}`).then((r) => r.data),
  clear: () => api.delete("/cart").then((r) => r.data),
};

export const wishlistService = {
  get: () => api.get("/wishlist").then((r) => r.data),
  add: (productId) => api.post("/wishlist", { productId }).then((r) => r.data),
  remove: (productId) => api.delete(`/wishlist/${productId}`).then((r) => r.data),
};

export const orderService = {
  create: (data) => api.post("/orders", data).then((r) => r.data),
  list: () => api.get("/orders").then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  updateStatus: (id, status, note) => api.put(`/orders/${id}/status`, { status, note }).then((r) => r.data),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }).then((r) => r.data),
  return: (id, reason) => api.post(`/orders/${id}/return`, { reason }).then((r) => r.data),
};

export const couponService = {
  list: () => api.get("/coupons").then((r) => r.data),
  create: (data) => api.post("/coupons", data).then((r) => r.data),
  update: (id, data) => api.put(`/coupons/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/coupons/${id}`).then((r) => r.data),
};

export const adminService = {
  dashboard: () => api.get("/admin/dashboard").then((r) => r.data),
  users: (search) => api.get("/admin/users", { params: { search } }).then((r) => r.data),
  toggleBlockUser: (id) => api.put(`/admin/users/${id}/block`).then((r) => r.data),
  sellers: () => api.get("/admin/sellers").then((r) => r.data),
  updateSellerApproval: (id, status) => api.put(`/admin/sellers/${id}/approval`, { status }).then((r) => r.data),
  orders: (status) => api.get("/admin/orders", { params: { status } }).then((r) => r.data),
  reviews: () => api.get("/admin/reviews").then((r) => r.data),
  hideReview: (id) => api.put(`/admin/reviews/${id}/hide`).then((r) => r.data),
  reports: (type) => api.get("/admin/reports", { params: { type } }).then((r) => r.data),
};

export const sellerService = {
  dashboard: () => api.get("/seller/dashboard").then((r) => r.data),
  products: () => api.get("/seller/products").then((r) => r.data),
  orders: () => api.get("/seller/orders").then((r) => r.data),
  updateFulfillment: (id, status, note) => api.put(`/seller/orders/${id}/fulfillment`, { status, note }).then((r) => r.data),
  reports: () => api.get("/seller/reports").then((r) => r.data),
  updateProfile: (data) => api.put("/seller/profile", data).then((r) => r.data),
};
