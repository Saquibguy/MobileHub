import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services";
import Logo from "../components/Logo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState("");
  const justRegistered = location.state?.justRegistered;

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setNeedsVerification(false); setResendStatus(""); setBusy(true);
    try {
      const user = await login(form.email, form.password);
      const dest = user.role === "ADMIN" ? "/admin" : user.role === "SELLER" ? "/seller" : location.state?.from || "/";
      navigate(dest);
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
      setError(msg);
      if (msg.toLowerCase().includes("verify your email")) setNeedsVerification(true);
    } finally { setBusy(false); }
  };

  const resend = async () => {
    setResendStatus("Sending...");
    try {
      const res = await authService.resendVerification(form.email);
      setResendStatus(res.message);
    } catch {
      setResendStatus("Couldn't resend right now — try again shortly.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-indigo-50/60 to-transparent dark:from-gray-900/40">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6"><Logo size="lg" /></div>
        <div className="card p-7 hover:translate-y-0 hover:shadow-sm">
          <h1 className="font-extrabold text-2xl mb-1 text-center">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-6 text-center">Log in to your MobileHub account.</p>
          {justRegistered && (
            <p className="text-emerald-700 text-xs bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl mb-4 font-semibold border border-emerald-100 dark:border-emerald-900">
              ✅ Account created! Check your email for a verification link before logging in.
            </p>
          )}
          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-10" type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-10" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg">{error}</p>}
            {needsVerification && (
              <div className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900">
                <button type="button" onClick={resend} className="font-bold underline">Resend verification email</button>
                {resendStatus && <p className="mt-1">{resendStatus}</p>}
              </div>
            )}
            <button disabled={busy} className="btn-primary w-full">{busy ? "Logging in..." : "Log In"}</button>
          </form>
        </div>
        <p className="text-xs text-gray-400 mt-5 text-center">Don't have an account? <Link to="/register" className="text-brand font-bold">Register</Link></p>
      </div>
    </div>
  );
}
