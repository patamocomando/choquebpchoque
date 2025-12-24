import React, { useMemo } from 'react';
import { Veiculo, Status } from '../types.ts';
import { BarChart3, Palette, Car, ShieldCheck, ShieldAlert } from 'lucide-react';

interface AnalysisDashboardProps {
  vehicles: Veiculo[];
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; }> = ({ icon, title, value }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col items-center text-center">
        <div className="p-3 rounded-full bg-zinc-800 mb-3">
            {icon}
        </div>
        <p className="text-3xl font-bold text-zinc-100">{value}</p>
        <p className="text-zinc-400 text-sm">{title}</p>
    </div>
);

const Bar: React.FC<{ label: string; value: number; maxValue: number; colorClass: string }> = ({ label, value, maxValue, colorClass }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="flex items-center space-x-2 text-sm">
            <div className="w-24 text-zinc-400 truncate text-right">{label}</div>
            <div className="flex-1 bg-zinc-800 rounded-full h-6">
                <div 
                    className={`${colorClass} h-6 rounded-full flex items-center justify-end pr-2`}
                    style={{ width: `${percentage}%` }}
                >
                    <span className="font-bold text-white text-xs">{value}</span>
                </div>
            </div>
        </div>
    );
};


const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ vehicles }) => {

  const analysis = useMemo(() => {
    const countBy = (key: keyof Veiculo) => {
        return vehicles.reduce((acc, vehicle) => {
            const value = (vehicle[key] as string || 'N/A').toUpperCase();
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    };
    
    const statusCounts = countBy('status');
    const colorCounts = countBy('cor');
    const modelCounts = countBy('modelo');

    const sortAndSlice = (counts: Record<string, number>) => {
        return Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5); // top 5
    };

    return {
        totalVehicles: vehicles.length,
        stolenCount: statusCounts[Status.ROUBADO] || 0,
        recoveredCount: statusCounts[Status.RECUPERADO] || 0,
        topColors: sortAndSlice(colorCounts),
        topModels: sortAndSlice(modelCounts),
    };
  }, [vehicles]);

  const maxColorCount = analysis.topColors[0]?.[1] || 0;
  const maxModelCount = analysis.topModels[0]?.[1] || 0;

  return (
    <div className="w-full space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <StatCard icon={<Car className="w-6 h-6 text-zinc-300" />} title="Total de Registros" value={analysis.totalVehicles} />
             <StatCard icon={<ShieldAlert className="w-6 h-6 text-red-500" />} title="Atualmente Roubados" value={analysis.stolenCount} />
             <StatCard icon={<ShieldCheck className="w-6 h-6 text-green-500" />} title="Recuperados" value={analysis.recoveredCount} />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center"><Palette className="w-5 h-5 mr-2 text-red-500"/>Top 5 Cores</h3>
            <div className="space-y-3">
                {analysis.topColors.length > 0 ? analysis.topColors.map(([color, count]) => (
                    <Bar key={color} label={color} value={count} maxValue={maxColorCount} colorClass="bg-red-600" />
                )) : <p className="text-zinc-500 text-center py-4">Não há dados suficientes.</p>}
            </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center"><Car className="w-5 h-5 mr-2 text-red-500"/>Top 5 Modelos</h3>
            <div className="space-y-3">
                 {analysis.topModels.length > 0 ? analysis.topModels.map(([model, count]) => (
                    <Bar key={model} label={model} value={count} maxValue={maxModelCount} colorClass="bg-red-600" />
                )) : <p className="text-zinc-500 text-center py-4">Não há dados suficientes.</p>}
            </div>
        </div>
    </div>
  );
};

export default AnalysisDashboard;