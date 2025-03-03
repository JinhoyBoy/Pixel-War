"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-gray-100">
      {/* Logo & Titel oben mittig */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <img src="/logo.png" className="w-5 h-5 mb-2" alt="Logo" />
        <p className="text-gray-700">Pixel War</p>
      </div>

      {/* Login Form */}
      <div className="bg-white p-6 rounded-2xl shadow-lg w-80">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">Login</h2>
        <form>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          <button type="button" 
                  className="w-full p-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition"
                  onClick={() => router.push("/canvas")}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
