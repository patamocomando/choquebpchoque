import React, { useMemo, useState } from 'react';
import { Veiculo, Status } from '../types.ts';
import { Palette, Car, ShieldAlert, CheckCircle2, ListChecks, Trash2 } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal.tsx';

interface AnalysisDashboardProps {
  vehicles: Veiculo[];
  onClearRecovered: () => Promise<void>;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; colorClass?: string }> = ({ icon, title, value, colorClass = "text-zinc-100" }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col items-center text-center">
        <div className="p-2 rounded-full bg-zinc-800 mb-2">
            {icon}
        </div>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">{title}</p>
    </div>
);

const Bar: React.FC<{ label: string; value: number; maxValue: number; colorClass: string }> = ({ label, value, maxValue, colorClass }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="flex items-center space-x-2 text-sm">
            <div className="w-24 text-zinc-400 truncate text-right">{label}</div>
            <div className="flex-1 bg-zinc-800 rounded-full h-5">
                <div 
                    className={`${colorClass} h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                >
                    <span className="font-bold text-white text-[10px]">{value}</span>
                </div>
            </div>
        </div>
    );
};


const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ vehicles, onClearRecovered }) => {
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const analysis = useMemo(() => {
    const activeVehicles = vehicles.filter(v => v.status === Status.ROUBADO);
    const recoveredVehicles = vehicles.filter(v => v.status === Status.RECUPERADO);

    const countBy = (list: Veiculo[], key: keyof Veiculo) => {
        return list.reduce((acc, vehicle) => {
            const value = (vehicle[key] as string || 'N/A').toUpperCase();
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    };
    
    const colorCounts = countBy(activeVehicles, 'cor');
    const modelCounts = countBy(activeVehicles, 'modelo');

    const sortAndSlice = (counts: Record<string, number>) => {
        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    };

    return {
        totalActive: activeVehicles.length,
        totalRecovered: recoveredVehicles.length,
        totalGeneral: vehicles.length,
        topColors: sortAndSlice(colorCounts),
        topModels: sortAndSlice(modelCounts),
    };
  }, [vehicles]);

  const maxColorCount = analysis.topColors[0]?.[1] || 0;
  const maxModelCount = analysis.topModels[0]?.[1] || 0;

  const handleConfirmClear = async () => {
    await onClearRecovered();
    setIsClearModalOpen(false);
  };

  return (
    <div className="w-full space-y-4 animate-fade-in pb-20">
        <div className="grid grid-cols-3 gap-2">
             <StatCard 
                icon={<ShieldAlert className="w-5 h-5 text-red-500" />} 
                title="Ativos" 
                value={analysis.totalActive} 
                colorClass="text-red-500"
             />
             <StatCard 
                icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} 
                title="Recuperados" 
                value={analysis.totalRecovered} 
                colorClass="text-green-500"
             />
             <StatCard 
                icon={<ListChecks className="w-5 h-5 text-zinc-400" />} 
                title="Total" 
                value={analysis.totalGeneral} 
             />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center uppercase tracking-widest">
                <Palette className="w-4 h-4 mr-2 text-red-500"/>
                Cores Predominantes (Ativos)
            </h3>
            <div className="space-y-2">
                {analysis.topColors.length > 0 ? analysis.topColors.map(([color, count]) => (
                    <Bar key={color} label={color} value={count} maxValue={maxColorCount} colorClass="bg-red-600" />
                )) : <p className="text-zinc-500 text-center py-2 text-xs">Sem dados ativos.</p>}
            </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center uppercase tracking-widest">
                <Car className="w-4 h-4 mr-2 text-red-500"/>
                Modelos Predominantes (Ativos)
            </h3>
            <div className="space-y-2">
                 {analysis.topModels.length > 0 ? analysis.topModels.map(([model, count]) => (
                    <Bar key={model} label={model} value={count} maxValue={maxModelCount} colorClass="bg-red-600" />
                )) : <p className="text-zinc-500 text-center py-2 text-xs">Sem dados ativos.</p>}
            </div>
        </div>
        
        <div className="pt-4 flex flex-col space-y-4">
            <button 
                onClick={() => setIsClearModalOpen(true)}
                className="flex items-center justify-center space-x-2 text-zinc-500 hover:text-red-500 transition-colors py-2 border border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest"
            >
                <Trash2 className="w-4 h-4" />
                <span>Zerar Histórico de Recuperados</span>
            </button>
            
            <div className="p-4 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-lg text-center">
                <p className="text-[9px] text-zinc-600 uppercase tracking-tighter leading-tight">
                    O total de registros é a soma de alertas de roubo ativos e veículos já recuperados. 
                    Ao "Zerar", os recuperados são apagados permanentemente do sistema.
                </p>
            </div>
        </div>

        <ConfirmationModal 
            isOpen={isClearModalOpen}
            onClose={() => setIsClearModalOpen(false)}
            onConfirm={handleConfirmClear}
            title="Zerar Sistema"
            message="Esta ação apagará permanentemente todos os registros de veículos RECUPERADOS do banco de dados. O contador de recuperados voltará a zero e o total de registros será atualizado. Deseja prosseguir?"
            confirmText="Sim, Zerar Agora"
            cancelText="Cancelar"
        />
    </div>
  );
};

export default AnalysisDashboard;