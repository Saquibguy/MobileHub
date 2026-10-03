import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Store } from "lucide-react";
import { authService } from "../services";
import Logo from "../components/Logo";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("CUSTOMER");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", storeName: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      // Calling authService directly (not AuthContext.register) so this does NOT
      // auto-log the user in or store a token — they land on /login and sign in explicitly.
      await authService.register({ ...form, role });
      navigate("/login", { state: { justRegistered: true, email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally { setBusy(false); }
  };

  const field = (Icon, props) => (
    <div className="relative">
      <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input className="input pl-10" {...props} />
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-indigo-50/60 to-transparent dark:from-gray-900/40">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6"><Logo size="lg" /></div>
        <div className="card p-7 hover:translate-y-0 hover:shadow-sm">
          <h1 className="font-extrabold text-2xl mb-1 text-center">Create your account</h1>
          <p className="text-gray-500 text-sm mb-5 text-center">Join MobileHub in seconds.</p>
          <div className="flex gap-2 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button type="button" className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === "CUSTOMER" ? "bg-white dark:bg-gray-700 shadow text-brand" : "text-gray-500"}`} onClick={() => setRole("CUSTOMER")}>Customer</button>
            <button type="button" className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === "SELLER" ? "bg-white dark:bg-gray-700 shadow text-brand" : "text-gray-500"}`} onClick={() => setRole("SELLER")}>Seller</button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            {field(User, { placeholder: "Full name", required: true, value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) })}
            {field(Mail, { type: "email", placeholder: "Email", required: true, value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }) })}
            {field(Phone, { placeholder: "Phone", value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }) })}
            {field(Lock, { type: "password", placeholder: "Password (min 6 chars)", required: true, minLength: 6, value: form.password, onChange: (e) => setForm({ ...form, password: e.target.value }) })}
            {role === "SELLER" && field(Store, { placeholder: "Store name", required: true, value: form.storeName, onChange: (e) => setForm({ ...form, storeName: e.target.value }) })}
            {role === "SELLER" && <p className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900">Seller accounts require admin approval before you can list products.</p>}
            {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg">{error}</p>}
            <button disabled={busy} className="btn-primary w-full">{busy ? "Creating account..." : "Create Account"}</button>
          </form>
        </div>
        <p className="text-xs text-gray-400 mt-5 text-center">Already have an account? <Link to="/login" className="text-brand font-bold">Log in</Link></p>
      </div>
    </div>
  );
}
