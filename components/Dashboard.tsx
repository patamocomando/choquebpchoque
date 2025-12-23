import React, { useState, useMemo } from 'react';
import { Veiculo, Status } from '../types.ts';
import VehicleCard from './VehicleCard.tsx';
import AddVehicleModal from './AddVehicleModal.tsx';
import { ShieldAlert, Plus, Search } from 'lucide-react';

interface DashboardProps {
  vehicles: Veiculo[];
  onAddVehicle: (newVehicle: Omit<Veiculo, 'id' | 'status' | 'timestamp'>) => Promise<void>;
  onUpdateStatus: (id: string) => Promise<void>;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-zinc-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-zinc-100">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ vehicles, onAddVehicle, onUpdateStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeVehicles = useMemo(() => {
    const active = vehicles.filter(v => v.status === Status.ROUBADO);
    if (!searchQuery) {
        return active;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return active.filter(vehicle => 
        vehicle.placa.toLowerCase().includes(lowercasedQuery) ||
        vehicle.modelo.toLowerCase().includes(lowercasedQuery)
    );
  }, [vehicles, searchQuery]);

  const activeAlertsCount = useMemo(() => activeVehicles.length, [activeVehicles]);

  return (
    <div className="w-full animate-fade-in">
        <header className="text-center mb-6">
            <h1 className="text-3xl font-bold text-zinc-100">SIVA</h1>
            <p className="text-zinc-400">SUBTRAÇÃO ILEGAL DE VEÍCULOS AUTOMOTORES</p>
        </header>

        <div className="mb-6">
            <StatCard icon={<ShieldAlert className="w-6 h-6 text-white"/>} title="Alertas Ativos" value={vehicles.filter(v => v.status === Status.ROUBADO).length} color="bg-red-600"/>
        </div>

        <div className="mb-4 relative">
            <input 
                type="text"
                placeholder="Pesquisar por placa ou modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md pl-10 pr-4 py-2 text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        </div>

        <div className="space-y-4">
            {activeVehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} onUpdateStatus={onUpdateStatus} />
            ))}
             {activeVehicles.length === 0 && (
                <div className="text-center py-10 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <p className="text-zinc-400">
                        {searchQuery
                            ? 'Nenhum veículo encontrado para sua busca.'
                            : 'Nenhum alerta de roubo ativo no momento.'
                        }
                    </p>
                </div>
            )}
        </div>
        
        <button 
            onClick={() => setIsModalOpen(true)}
            className="fixed bottom-6 right-6 bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-transform transform hover:scale-110"
            aria-label="Cadastrar novo alerta"
        >
            <Plus className="w-8 h-8"/>
        </button>

        {isModalOpen && (
            <AddVehicleModal 
                onClose={() => setIsModalOpen(false)}
                onAddVehicle={onAddVehicle}
            />
        )}
    </div>
  );
};

export default Dashboard;