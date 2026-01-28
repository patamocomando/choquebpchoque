import React, { useState, useMemo } from 'react';
import { Veiculo, Status } from '../types.ts';
import VehicleCard from './VehicleCard.tsx';
import AddVehicleModal from './AddVehicleModal.tsx';
import AnalysisDashboard from './AnalysisDashboard.tsx';
import { ShieldAlert, Plus, Search, List, BarChart3, FileDown } from 'lucide-react';

type NewVehicleData = Omit<Veiculo, 'id' | 'status' | 'timestamp'>;

declare const jspdf: any;

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
        vehicle.modelo.toLowerCase().includes(lowercasedQuery) ||
        (vehicle.cor && vehicle.cor.toLowerCase().includes(lowercasedQuery))
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

  const exportToPDF = () => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('SIVA - ALERTA BPCHOQUE', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('BATALHÃO DE POLICIAMENTO DE CHOQUE - PMPB', 105, 30, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('RELATÓRIO DE VEÍCULOS COM ALERTA ATIVO', 15, 55);
    
    const tableData = activeAlerts.map(v => [
      v.placa,
      v.modelo,
      v.cor || '-',
      v.local || '-',
      v.tipo
    ]);

    (doc as any).autoTable({
      startY: 65,
      head: [['PLACA', 'MODELO', 'COR', 'LOCAL', 'TIPO']],
      body: tableData,
      headStyles: { fillColor: [180, 0, 0] },
      theme: 'grid'
    });

    const dateStr = new Date().toLocaleDateString('pt-BR');
    const timeStr = new Date().toLocaleTimeString('pt-BR');
    doc.setFontSize(8);
    doc.text(`Gerado em: ${dateStr} às ${timeStr}`, 15, doc.internal.pageSize.height - 10);
    
    doc.save(`SIVA_Alertas_${dateStr.replace(/\//g, '-')}.pdf`);
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
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tighter">SIVA</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Subtração Ilegal de Veículos Automotores</p>
        </header>

        <div className="mb-4 border-b border-zinc-800 flex">
            <TabButton view="list" label="Monitoramento" icon={<List className="w-4 h-4"/>}/>
            <TabButton view="analysis" label="Análise de Dados" icon={<BarChart3 className="w-4 h-4"/>}/>
        </div>

        {currentView === 'list' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    <StatCard icon={<ShieldAlert className="w-6 h-6 text-white"/>} title="Alertas Ativos" value={vehicles.filter(v => v.status === Status.ROUBADO).length} color="bg-red-600"/>
                    <button 
                        onClick={exportToPDF}
                        disabled={activeAlerts.length === 0}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-center space-x-3 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                        <FileDown className="w-6 h-6 text-red-500" />
                        <span className="text-zinc-200 font-bold uppercase text-sm">Exportar PDF</span>
                    </button>
                </div>

                <div className="mb-4 relative">
                    <input 
                        type="text"
                        placeholder="Buscar Placa, Modelo ou Cor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-md pl-10 pr-4 py-3 text-zinc-100 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition shadow-inner"
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
                                    ? 'Nenhum registro encontrado para esta busca.'
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
            className="fixed bottom-6 right-6 bg-red-600 text-white rounded-full p-4 shadow-2xl hover:bg-red-700 transition-transform transform hover:scale-110 active:scale-95 z-40 border-4 border-black"
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