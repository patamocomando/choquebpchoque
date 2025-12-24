import React, { useState, useEffect } from 'react';
import { Veiculo } from '../types.ts';
import { X, Send, Save, FilePenLine } from 'lucide-react';

type NewVehicleData = Omit<Veiculo, 'id' | 'status' | 'timestamp'>;

interface AddVehicleModalProps {
  onClose: () => void;
  onSave: (data: NewVehicleData, id?: string) => Promise<void>;
  vehicleToEdit?: Veiculo | null;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ onClose, onSave, vehicleToEdit }) => {
  const [formData, setFormData] = useState<NewVehicleData>({
    placa: '',
    tipo: 'Carro',
    modelo: '',
    cor: '',
    local: '',
    observacoes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!vehicleToEdit;

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        placa: vehicleToEdit.placa,
        tipo: vehicleToEdit.tipo,
        modelo: vehicleToEdit.modelo,
        cor: vehicleToEdit.cor || '',
        local: vehicleToEdit.local,
        observacoes: vehicleToEdit.observacoes,
      });
    }
  }, [vehicleToEdit, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa.trim()) {
        // The `required` attribute on the input will handle browser validation.
        return;
    }
    
    setIsLoading(true);
    await onSave(formData, vehicleToEdit?.id);
    setIsLoading(false);
    onClose();
  };

  const inputClass = "w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition";
  const labelClass = "block text-sm font-medium text-zinc-400 mb-1";

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
          <h2 className="text-xl font-bold text-zinc-100 flex items-center">
            {isEditMode ? <FilePenLine className="mr-2 text-red-500" /> : <Send className="mr-2 text-red-500" />}
            {isEditMode ? 'Editar Alerta' : 'Novo Alerta de Roubo'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                 <div>
                    <label htmlFor="placa" className={labelClass}>Placa*</label>
                    <input id="placa" name="placa" type="text" value={formData.placa} onChange={handleChange} className={inputClass} required />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="tipo" className={labelClass}>Tipo</label>
                        <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} className={inputClass}>
                            <option>Carro</option>
                            <option>Moto</option>
                            <option>Caminhão</option>
                            <option>Outro</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="modelo" className={labelClass}>Modelo</label>
                        <input id="modelo" name="modelo" type="text" value={formData.modelo} onChange={handleChange} className={inputClass} />
                    </div>
                </div>
                <div>
                    <label htmlFor="cor" className={labelClass}>Cor</label>
                    <input id="cor" name="cor" type="text" value={formData.cor} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="local" className={labelClass}>Local do Fato</label>
                    <input id="local" name="local" type="text" value={formData.local} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                    <label htmlFor="observacoes" className={labelClass}>Observações</label>
                    <textarea id="observacoes" name="observacoes" value={formData.observacoes} onChange={handleChange} className={inputClass} rows={3}></textarea>
                </div>
            </div>
            <div className="p-4 bg-zinc-900/50 flex justify-end space-x-3 rounded-b-lg">
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-zinc-700 text-white font-bold py-2 px-6 rounded-md hover:bg-zinc-600 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-red-600 text-white font-bold py-2 px-6 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center disabled:bg-red-800 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <>
                            {isEditMode ? <Save className="w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                            <span>{isEditMode ? 'Salvar Alterações' : 'Cadastrar Alerta'}</span>
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