
import React, { useState } from 'react';
import { Veiculo } from '../types.ts';
import { X, Send } from 'lucide-react';

interface AddVehicleModalProps {
  onClose: () => void;
  onAddVehicle: (newVehicle: Omit<Veiculo, 'id' | 'status' | 'timestamp'>) => Promise<void>;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ onClose, onAddVehicle }) => {
  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState('Carro');
  const [modelo, setModelo] = useState('');
  const [cor, setCor] = useState('');
  const [local, setLocal] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onAddVehicle({ placa, tipo, modelo, cor, local, observacoes });
    setIsLoading(false);
    onClose();
  };

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition";
  
  return (
    <div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-lg border border-zinc-800 animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-red-600">Cadastrar Novo Alerta</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="placa" className="block text-sm font-medium text-zinc-400 mb-1">Placa *</label>
                <input id="placa" type="text" value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} className={inputClass} required maxLength={7} />
              </div>
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-zinc-400 mb-1">Tipo</label>
                <select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputClass}>
                  <option>Carro</option>
                  <option>Moto</option>
                  <option>Caminhão</option>
                  <option>Outro</option>
                </select>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="modelo" className="block text-sm font-medium text-zinc-400 mb-1">Modelo</label>
                <input id="modelo" type="text" value={modelo} onChange={(e) => setModelo(e.target.value)} className={inputClass} />
            </div>
             <div>
                <label htmlFor="cor" className="block text-sm font-medium text-zinc-400 mb-1">Cor</label>
                <input id="cor" type="text" value={cor} onChange={(e) => setCor(e.target.value)} className={inputClass} />
              </div>
          </div>
          
          <div>
            <label htmlFor="local" className="block text-sm font-medium text-zinc-400 mb-1">Local do Roubo</label>
            <input id="local" type="text" value={local} onChange={(e) => setLocal(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="observacoes" className="block text-sm font-medium text-zinc-400 mb-1">Observações</label>
            <textarea id="observacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className={inputClass} rows={3}></textarea>
          </div>
          
          <div className="pt-2 flex justify-end">
            <button
                type="submit"
                disabled={isLoading}
                className="bg-red-600 text-white font-bold py-2 px-6 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center disabled:bg-red-800 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <>
                        <Send className="w-5 h-5 mr-2" />
                        <span>Emitir Alerta</span>
                    </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;
