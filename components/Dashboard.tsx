import React, { useState, useMemo } from 'react';
import { Veiculo, Status } from '../types.ts';
import VehicleCard from './VehicleCard.tsx';
import AddVehicleModal from './AddVehicleModal.tsx';
import AnalysisDashboard from './AnalysisDashboard.tsx';
import { ShieldAlert, Plus, Search, List, BarChart3 } from 'lucide-react';

type NewVehicleData = Omit<Veiculo, 'id' | 'status' | 'timestamp'>;

interface DashboardProps {
  vehicles: Veiculo[];
  onAddVehicle: (newVehicle: NewVehicleData) => Promise<void>;
  onEditVehicle: (id: string, data: NewVehicleData) => Promise<void>;
  onUpdateStatus: (id: string) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
  onClearRecovered: () => Promise<void>;
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

type View = 'list' | 'analysis';

const Dashboard: React.FC<DashboardProps> = ({ vehicles, onAddVehicle, onEditVehicle, onUpdateStatus, onDeleteVehicle, onClearRecovered }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Veiculo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<View>('list');

  const activeAlerts = useMemo(() => {
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

  const handleOpenEditModal = (vehicle: Veiculo) => {
    setVehicleToEdit(vehicle);
    setIsModalOpen(true);
  };
  
  const handleOpenAddModal = () => {
    setVehicleToEdit(null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVehicleToEdit(null);
  };
  
  const handleSave = async (data: NewVehicleData, id?: string) => {
    if (id) {
        await onEditVehicle(id, data);
    } else {
        await onAddVehicle(data);
    }
  };

  const TabButton: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => {
    const isActive = currentView === view;
    return (
        <button 
            onClick={() => setCurrentView(view)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 text-sm font-semibold border-b-2 transition-colors ${isActive ? 'text-red-500 border-red-500' : 'text-zinc-400 border-transparent hover:text-zinc-100'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
  }

  return (
    <div className="w-full animate-fade-in">
        <header className="text-center mb-4">
            <h1 className="text-3xl font-bold text-zinc-100">SIVA</h1>
            <p className="text-zinc-400">SUBTRAÇÃO ILEGAL DE VEÍCULOS AUTOMOTORES</p>
        </header>

        <div className="mb-4 border-b border-zinc-800 flex">
            <TabButton view="list" label="Monitoramento" icon={<List className="w-4 h-4"/>}/>
            <TabButton view="analysis" label="Análise de Dados" icon={<BarChart3 className="w-4 h-4"/>}/>
        </div>

        {currentView === 'list' && (
            <>
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
                    {activeAlerts.map(vehicle => (
                        <VehicleCard key={vehicle.id} vehicle={vehicle} onUpdateStatus={onUpdateStatus} onDeleteVehicle={onDeleteVehicle} onEdit={handleOpenEditModal} />
                    ))}
                    {activeAlerts.length === 0 && (
                        <div className="text-center py-10 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <p className="text-zinc-400">
                                {searchQuery
                                    ? 'Nenhum alerta ativo encontrado para sua busca.'
                                    : 'Nenhum alerta de roubo ativo no momento.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </>
        )}

        {currentView === 'analysis' && <AnalysisDashboard vehicles={vehicles} onClearRecovered={onClearRecovered} />}
        
        <button 
            onClick={handleOpenAddModal}
            className="fixed bottom-6 right-6 bg-red-600 text-white rounded-full p-4 shadow-lg hover:bg-red-700 transition-transform transform hover:scale-110"
            aria-label="Cadastrar novo alerta"
        >
            <Plus className="w-8 h-8"/>
        </button>

        {isModalOpen && (
            <AddVehicleModal 
                onClose={handleCloseModal}
                onSave={handleSave}
                vehicleToEdit={vehicleToEdit}
            />
        )}
    </div>
  );
};

export default Dashboard;