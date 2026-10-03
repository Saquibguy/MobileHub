import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="text-center py-24 px-4">
      <div className="text-6xl mb-3">🔍</div>
      <h1 className="font-extrabold text-2xl mb-2">404 — Page not found</h1>
      <p className="text-gray-500 mb-5">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary inline-block">Back to Home</Link>
    </div>
  );
}

export function Unauthorized() {
  return (
    <div className="text-center py-24 px-4">
      <div className="text-6xl mb-3">🔒</div>
      <h1 className="font-extrabold text-2xl mb-2">Unauthorized</h1>
      <p className="text-gray-500 mb-5">Please log in to view this page.</p>
      <Link to="/login" className="btn-primary inline-block">Log In</Link>
    </div>
  );
}

export function Forbidden() {
  return (
    <div className="text-center py-24 px-4">
      <div className="text-6xl mb-3">🚫</div>
      <h1 className="font-extrabold text-2xl mb-2">Forbidden</h1>
      <p className="text-gray-500 mb-5">You don't have permission to view this page.</p>
      <Link to="/" className="btn-primary inline-block">Back to Home</Link>
    </div>
  );
}
