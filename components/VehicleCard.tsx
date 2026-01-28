import React, { useState } from 'react';
import { Veiculo, Status } from '../types.ts';
import { Car, MapPin, FileText, Clock, CheckCircle, Paintbrush, Trash2, FilePenLine } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal.tsx';

interface VehicleCardProps {
    vehicle: Veiculo;
    onUpdateStatus: (id: string) => Promise<void>;
    onDeleteVehicle: (id: string) => Promise<void>;
    onEdit: (vehicle: Veiculo) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onUpdateStatus, onDeleteVehicle, onEdit }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRecoverModalOpen, setIsRecoverModalOpen] = useState(false);
    const isStolen = vehicle.status === Status.ROUBADO;
    
    const cardClasses = isStolen
        ? 'bg-zinc-900 border-l-4 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.1)]'
        : 'bg-zinc-900 border-l-4 border-green-600/50 opacity-70';

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Registro Antigo';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
            return new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        } catch (e) {
            return 'Data Indisponível';
        }
    };
    
    const handleDeleteConfirm = () => {
        onDeleteVehicle(vehicle.id);
        setIsDeleteModalOpen(false);
    };

    const handleRecoverConfirm = () => {
        onUpdateStatus(vehicle.id);
        setIsRecoverModalOpen(false);
    };

    return (
        <>
            <div className={`p-4 rounded-lg flex flex-col space-y-3 ${cardClasses} transition-all duration-300 border border-zinc-800/50`}>
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded bg-black/40 ${isStolen ? 'text-red-500' : 'text-green-500'}`}>
                            <Car className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-black text-xl text-zinc-100 tracking-tight leading-none uppercase">{vehicle.placa}</p>
                            <p className="text-[11px] font-bold text-zinc-500 uppercase mt-1">
                                {vehicle.modelo || 'S/ MODELO'} • {vehicle.tipo}
                            </p>
                        </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${isStolen ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                        {vehicle.status}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-[12px] text-zinc-400 pl-1">
                    <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span className="truncate">{vehicle.local || 'Local N/I'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Paintbrush className="w-3 h-3 text-red-500" />
                        <span className="capitalize">{vehicle.cor || 'Cor N/I'}</span>
                    </div>
                    <div className="flex items-center space-x-2 col-span-2">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span className="font-mono">{formatDate(vehicle.timestamp)}</span>
                    </div>
                    {vehicle.observacoes && (
                        <div className="flex items-start space-x-2 col-span-2 bg-black/20 p-2 rounded italic text-[11px]">
                            <FileText className="w-3 h-3 text-zinc-600 mt-0.5" />
                            <span className="leading-tight text-zinc-500">{vehicle.observacoes}</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-zinc-800/50">
                    <div className="flex space-x-1">
                        <button onClick={() => onEdit(vehicle)} className="p-2 text-zinc-500 hover:text-yellow-500 transition-colors">
                            <FilePenLine className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    {isStolen && (
                        <button
                            onClick={() => setIsRecoverModalOpen(true)}
                            className="bg-green-600 text-white font-black py-2 px-4 rounded text-[10px] hover:bg-green-700 transition-colors flex items-center uppercase tracking-tighter"
                        >
                            <CheckCircle className="w-3 h-3 mr-1.5" />
                            Veículo Recuperado
                        </button>
                    )}
                </div>
            </div>

            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Excluir Registro"
                message={`Deseja apagar definitivamente o alerta da placa ${vehicle.placa}?`}
                confirmText="Excluir"
            />
            <ConfirmationModal 
                isOpen={isRecoverModalOpen}
                onClose={() => setIsRecoverModalOpen(false)}
                onConfirm={handleRecoverConfirm}
                title="Confirmar Recuperação"
                message={`A placa ${vehicle.placa} foi localizada?`}
                confirmText="Confirmar"
            />
        </>
    );
};

export default VehicleCard;