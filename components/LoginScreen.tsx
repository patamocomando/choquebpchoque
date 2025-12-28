import React, { useState, useEffect } from 'react';
import { ShieldAlert, LogIn } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (matricula: string, senha_tatica: string, remember: boolean) => boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [matricula, setMatricula] = useState('');
  const [senhaTatica, setSenhaTatica] = useState('');
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('siva_saved_matricula');
    if (saved) setMatricula(saved);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
        onLogin(matricula, senhaTatica, remember);
        setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in py-10">
      <div className="text-center mb-8">
        <ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-zinc-100">ALERTA BPCHOQUE</h1>
        <p className="text-zinc-400">BATALHÃO DE POLICIAMENTO DE CHOQUE</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <label htmlFor="matricula" className="block text-sm font-medium text-zinc-400 mb-1">
            Matrícula
          </label>
          <input
            id="matricula"
            type="text"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition"
            placeholder="Digite sua matrícula"
            required
          />
        </div>
        <div>
          <label htmlFor="senha" className="block text-sm font-medium text-zinc-400 mb-1">
            Senha Tática
          </label>
          <input
            id="senha"
            type="password"
            value={senhaTatica}
            onChange={(e) => setSenhaTatica(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition"
            placeholder="••••••••"
            required
          />
        </div>
        
        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 bg-zinc-900 border-zinc-700 rounded text-red-600 focus:ring-red-600"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-zinc-400 cursor-pointer">
            Manter login conectado
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center disabled:bg-red-800 disabled:cursor-not-allowed mt-6 shadow-lg shadow-red-900/20"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" />
              <span>Acessar Sistema</span>
            </>
          )}
        </button>
      </form>
      
      <div className="mt-12 text-center text-[10px] text-zinc-600 uppercase tracking-widest">
        Sistema de Inteligência e Vigilância Automotiva
      </div>
    </div>
  );
};

export default LoginScreen;