
import React from 'react';
import { Veiculo, Status } from '../types.ts';
import { Car, MapPin, FileText, Clock, CheckCircle, Paintbrush } from 'lucide-react';

interface VehicleCardProps {
    vehicle: Veiculo;
    onUpdateStatus: (id: string) => Promise<void>;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onUpdateStatus }) => {
    const isStolen = vehicle.status === Status.ROUBADO;
    const cardClasses = isStolen
        ? 'bg-zinc-900 border-l-4 border-red-600'
        : 'bg-zinc-900 border-l-4 border-zinc-600 opacity-60';

    const formatDate = (timestamp: any) => {
        if (!timestamp?.toDate) return 'Aguardando...';
        return new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(timestamp.toDate());
    };

    return (
        <div className={`p-4 rounded-lg shadow-md flex flex-col space-y-3 ${cardClasses} animate-fade-in-up`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <Car className={`w-6 h-6 ${isStolen ? 'text-red-500' : 'text-zinc-500'}`} />
                    <div>
                        <p className="font-bold text-lg text-zinc-100">{vehicle.placa}</p>
                        <p className="text-sm text-zinc-400">{vehicle.modelo || 'Modelo não informado'} - {vehicle.tipo}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isStolen ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400'}`}>
                    {vehicle.status}
                </span>
            </div>

            <div className="text-sm text-zinc-300 space-y-2 pl-9">
                <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    <span>{vehicle.local || 'Local não informado'}</span>
                </div>
                 {vehicle.cor && (
                    <div className="flex items-center space-x-2">
                        <Paintbrush className="w-4 h-4 text-zinc-500" />
                        <span>{vehicle.cor}</span>
                    </div>
                )}
                <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-zinc-500" />
                    <span>{vehicle.observacoes || 'Nenhuma observação'}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span>{formatDate(vehicle.timestamp)}</span>
                </div>
            </div>

            {isStolen && (
                <button
                    onClick={() => onUpdateStatus(vehicle.id)}
                    className="mt-2 ml-auto bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-green-700 transition-colors flex items-center"
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Recuperado
                </button>
            )}
        </div>
    );
};

export default VehicleCard;
