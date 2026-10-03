import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X } from "lucide-react";
import { categoryService, productService } from "../../services";
import { useToast } from "../../context/ToastContext";

export default function AddProduct() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // object URLs for preview
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", price: "", discountPrice: "", stock: "",
    sku: "", brand: "", categoryId: "",
  });

  useEffect(() => { categoryService.list().then((r) => setCategories(r.data)); }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const onPickImages = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 8 - images.length);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      if (!form.categoryId) throw new Error("Please choose a category.");
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("discountPrice", form.discountPrice || form.price);
      fd.append("stock", form.stock);
      fd.append("sku", form.sku);
      fd.append("brand", form.brand);
      fd.append("categoryId", form.categoryId);
      images.forEach((file) => fd.append("images", file));

      await productService.create(fd);
      showToast("Product added");
      navigate("/seller/products");
    } catch (err) {
      setError(err.message || err.response?.data?.message || "Couldn't add product.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="font-extrabold text-lg mb-4">Add New Product</h2>
      <form onSubmit={submit} className="card p-5 space-y-4 hover:translate-y-0 hover:shadow-sm">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Product Name</label>
          <input className="input" required value={form.name} onChange={set("name")} placeholder="e.g. Premium Silicone Phone Cover" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
          <textarea className="input min-h-[90px]" value={form.description} onChange={set("description")} placeholder="Describe the product..." />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Price (₹)</label>
            <input className="input" type="number" min="0" step="0.01" required value={form.price} onChange={set("price")} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Discount Price (₹) <span className="text-gray-400 font-normal">optional</span></label>
            <input className="input" type="number" min="0" step="0.01" value={form.discountPrice} onChange={set("discountPrice")} placeholder="Same as price if blank" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Stock Quantity</label>
            <input className="input" type="number" min="0" required value={form.stock} onChange={set("stock")} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">SKU</label>
            <input className="input" required value={form.sku} onChange={set("sku")} placeholder="Unique code, e.g. MH-2001" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Brand</label>
            <input className="input" value={form.brand} onChange={set("brand")} placeholder="Your store/brand name" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
            <select className="input" required value={form.categoryId} onChange={set("categoryId")}>
              <option value="">Select category...</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Product Images <span className="text-gray-400 font-normal">up to 8, JPG/PNG/WEBP</span></label>
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5">
                  <X size={11} />
                </button>
              </div>
            ))}
            {images.length < 8 && (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-brand hover:text-brand transition-colors">
                <Upload size={16} />
                <span className="text-[10px] mt-1">Upload</span>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple className="hidden" onChange={onPickImages} />
              </label>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" className="btn-ghost flex-1" onClick={() => navigate("/seller/products")}>Cancel</button>
          <button disabled={busy} className="btn-primary flex-1">{busy ? "Saving..." : "Add Product"}</button>
        </div>
      </form>
    </div>
  );
}
