import React, { useState } from "react";

interface Props {
  onLogin: (user: string, pass: string) => void;
  onCancel: () => void;
}

export default function LoginProfesor({ onLogin, onCancel }: Props) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !pass) {
      setError("Por favor completa ambos campos");
      return;
    }
    setError("");
    onLogin(user, pass);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400">
      <div className="backdrop-blur-xl bg-white/20 shadow-xl rounded-3xl p-8 w-[90%] max-w-md">
        <h2 className="text-center text-white font-bold text-2xl mb-2 drop-shadow-md">
          Ingreso Profesor
        </h2>
        <p className="text-center text-white/80 mb-6">
          Usa tus credenciales para crear una nueva sala
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Usuario"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/90 text-gray-800 outline-none focus:ring-4 focus:ring-blue-400 placeholder-gray-500"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/90 text-gray-800 outline-none focus:ring-4 focus:ring-blue-400 placeholder-gray-500"
          />

          {error && (
            <div className="text-center text-yellow-100 bg-yellow-600/30 p-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-3 rounded-xl font-semibold shadow-lg"
          >
            Ingresar
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-white/30 hover:bg-white/40 transition-colors text-white py-3 rounded-xl font-semibold"
          >
            Volver
          </button>
        </form>
      </div>
    </div>
  );
}
