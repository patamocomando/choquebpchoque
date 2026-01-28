import React, { useState, useMemo } from 'react';
import { Veiculo, Status } from '../types.ts';
import VehicleCard from './VehicleCard.tsx';
import AddVehicleModal from './AddVehicleModal.tsx';
import AnalysisDashboard from './AnalysisDashboard.tsx';
import { ShieldAlert, Plus, Search, List, BarChart3, FileDown } from 'lucide-react';

type NewVehicleData = Omit<Veiculo, 'id' | 'status' | 'timestamp'>;

// Acessando jsPDF injetado no index.html
declare const jspdf: any;

interface DashboardProps {
  vehicles: Veiculo[];
  onAddVehicle: (newVehicle: NewVehicleData) => Promise<void>;
  onEditVehicle: (id: string, data: NewVehicleData) => Promise<void>;
  onUpdateStatus: (id: string) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
  onClearRecovered: () => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({ vehicles, onAddVehicle, onEditVehicle, onUpdateStatus, onDeleteVehicle, onClearRecovered }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<Veiculo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'analysis'>('list');

  // BUSCA REFINADA: Placa, Modelo e Cor
  const activeAlerts = useMemo(() => {
    const active = vehicles.filter(v => v.status === Status.ROUBADO);
    if (!searchQuery) return active;
    
    const query = searchQuery.toLowerCase();
    return active.filter(v => 
        v.placa.toLowerCase().includes(query) ||
        v.modelo.toLowerCase().includes(query) ||
        (v.cor && v.cor.toLowerCase().includes(query))
    );
  }, [vehicles, searchQuery]);

  const exportPDF = () => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('SIVA - ALERTAS BPCHOQUE', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('BATALHÃO DE POLICIAMENTO DE CHOQUE - PMPB', 105, 22, { align: 'center' });

    const rows = activeAlerts.map(v => [v.placa, v.modelo, v.cor || '-', v.local]);
    
    (doc as any).autoTable({
      startY: 40,
      head: [['PLACA', 'MODELO', 'COR', 'LOCAL']],
      body: rows,
      headStyles: { fillColor: [180, 0, 0] },
      theme: 'grid'
    });

    doc.save(`SIVA_BPCHOQUE_${new Date().toLocaleDateString()}.pdf`);
  };

  return (
    <div className="w-full animate-fade-in pb-20">
        <header className="text-center mb-6">
            <h1 className="text-4xl font-black text-zinc-100 italic tracking-tighter">SIVA</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">BPCHOQUE - Vigilância Tática</p>
        </header>

        <div className="flex bg-zinc-900 rounded-lg p-1 mb-6 border border-zinc-800">
            <button onClick={() => setCurrentView('list')} className={`flex-1 py-2 rounded-md text-xs font-bold uppercase flex items-center justify-center space-x-2 ${currentView === 'list' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>
                <List className="w-4 h-4" /> <span>Alertas</span>
            </button>
            <button onClick={() => setCurrentView('analysis')} className={`flex-1 py-2 rounded-md text-xs font-bold uppercase flex items-center justify-center space-x-2 ${currentView === 'analysis' ? 'bg-red-600 text-white' : 'text-zinc-500'}`}>
                <BarChart3 className="w-4 h-4" /> <span>Estatística</span>
            </button>
        </div>

        {currentView === 'list' ? (
            <>
                <div className="flex space-x-2 mb-4">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="Buscar Placa, Modelo ou Cor..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-600"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    </div>
                    <button onClick={exportPDF} className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 hover:text-red-500 transition-colors">
                        <FileDown className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-3">
                    {activeAlerts.map(v => (
                        <VehicleCard 
                            key={v.id} 
                            vehicle={v} 
                            onUpdateStatus={onUpdateStatus} 
                            onDeleteVehicle={onDeleteVehicle} 
                            onEdit={(v) => { setVehicleToEdit(v); setIsModalOpen(true); }} 
                        />
                    ))}
                </div>
            </>
        ) : (
            <AnalysisDashboard vehicles={vehicles} onClearRecovered={onClearRecovered} />
        )}

        <button 
            onClick={() => { setVehicleToEdit(null); setIsModalOpen(true); }}
            className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-2xl border-4 border-black active:scale-90 transition-transform"
        >
            <Plus className="w-8 h-8" />
        </button>

        {isModalOpen && (
            <AddVehicleModal 
                onClose={() => setIsModalOpen(false)} 
                onSave={async (data, id) => { id ? await onEditVehicle(id, data) : await onAddVehicle(data); }} 
                vehicleToEdit={vehicleToEdit} 
            />
        )}
    </div>
  );
};

export default Dashboard;