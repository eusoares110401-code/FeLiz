import React, { useState } from 'react';
import { ChildProfile, UserProfile } from '../types';
import { ChartBar, Activity, Book, Clock, ArrowLeft, Crown, AlertOctagon, Check, Loader2 } from 'lucide-react';
import { SUBJECT_CONFIG } from '../constants';
import { playSound } from '../services/soundService';
import { dbService } from '../services/databaseService';

interface ParentDashboardProps {
  child: ChildProfile;
  onBack: () => void;
  onUpdateUser: (user: UserProfile) => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ child, onBack, onUpdateUser }) => {
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);

  const handleCancelSubscription = async () => {
    playSound.click();
    const confirmed = window.confirm(
      "Tem certeza que deseja cancelar sua assinatura Premium? Você perderá acesso aos conteúdos avançados do Quadrivium imediatamente."
    );

    if (confirmed) {
      setIsProcessingCancel(true);
      try {
        const updatedUser = await dbService.cancelPremium(child.email);
        onUpdateUser(updatedUser);
        alert("Assinatura cancelada com sucesso. Seu plano agora é Gratuito.");
      } catch (e) {
        alert("Erro ao cancelar assinatura. Tente novamente.");
        console.error(e);
      } finally {
        setIsProcessingCancel(false);
      }
    }
  };

  const handleExportReport = () => {
    playSound.click();
    // Simulação de exportação
    setTimeout(() => {
        alert(`Relatório detalhado de ${child.name} enviado para ${child.email}! 📄✅`);
    }, 500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Botão Voltar Padronizado */}
      <button 
          onClick={() => { playSound.click(); onBack(); }}
          className="flex items-center text-gray-500 hover:text-brand-primary font-bold transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100 group mb-4"
      >
          <ArrowLeft className="w-6 h-6 mr-1 group-hover:-translate-x-1 transition-transform" />
          Voltar
      </button>

      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-gray-800">Painel dos Pais</h2>
          <p className="text-gray-500">Acompanhando o progresso de <span className="font-bold text-brand-primary">{child.name}</span></p>
        </div>
        <button 
            onClick={handleExportReport}
            className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-violet-700 transition shadow-md flex items-center"
        >
          Exportar Relatório
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Activity className="text-blue-500" />} 
          label="Nível de Proficiência" 
          value="Intermediário" 
          subValue="+12% essa semana"
        />
        <StatCard 
          icon={<Clock className="text-green-500" />} 
          label="Tempo de Estudo" 
          value="3.5 Horas" 
          subValue="Média diária: 35 min"
        />
        <StatCard 
          icon={<Book className="text-purple-500" />} 
          label="Lições Completas" 
          value="42" 
          subValue="8 Perfeitas"
        />
      </div>

      {/* Trivium Breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <ChartBar className="mr-2 text-gray-400" />
          Desempenho por Área (Trivium & Quadrivium)
        </h3>
        
        <div className="space-y-4">
          {Object.values(SUBJECT_CONFIG).map((subject, idx) => (
            <div key={idx} className="flex items-center">
               <div className={`w-8 h-8 rounded-lg ${subject.color} flex items-center justify-center mr-4 text-white scale-75`}>
                 {subject.icon}
               </div>
               <div className="flex-1">
                 <div className="flex justify-between mb-1">
                   <span className="font-bold text-gray-700 text-sm">{subject.label}</span>
                   <span className="text-gray-500 text-xs">{Math.floor(Math.random() * 40) + 60}%</span>
                 </div>
                 <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                   <div 
                      className={`h-full ${subject.color} opacity-80`} 
                      style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
                   />
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 p-6 rounded-2xl border border-violet-100">
        <h3 className="text-lg font-bold text-violet-900 mb-2 flex items-center">
          ✨ Insights da IA Astra
        </h3>
        <p className="text-violet-800 text-sm leading-relaxed">
          {child.name} tem demonstrado excelente raciocínio lógico nas últimas sessões. 
          Recomendamos aumentar a dificuldade nos exercícios de <strong>Aritmética</strong> para manter o engajamento. 
          A área de <strong>Retórica</strong> (expressão verbal) pode ser reforçada com mais exercícios de leitura em voz alta.
        </p>
      </div>

      {/* Subscription Management Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
          <Crown className={`mr-2 ${child.isPremium ? 'text-yellow-500' : 'text-gray-300'}`} />
          Status da Assinatura
        </h3>

        <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="mb-4 md:mb-0">
                <p className="text-sm text-gray-500 font-bold uppercase mb-1">Plano Atual</p>
                <div className="flex items-center space-x-2">
                    <span className={`text-2xl font-bold ${child.isPremium ? 'text-brand-dark' : 'text-gray-600'}`}>
                        {child.isPremium ? 'FeLiz Premium' : 'Plano Gratuito'}
                    </span>
                    {child.isPremium && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold border border-green-200 flex items-center">
                           <Check size={12} className="mr-1" /> Ativo
                        </span>
                    )}
                </div>
                {child.isPremium && (
                    <p className="text-sm text-gray-500 mt-2">
                        Renovação automática em: {new Date(child.subscriptionRenewsAt || Date.now()).toLocaleDateString()}
                    </p>
                )}
            </div>

            <div>
                {child.isPremium ? (
                    <button 
                        onClick={handleCancelSubscription}
                        disabled={isProcessingCancel}
                        className="bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 font-bold px-6 py-3 rounded-xl transition-all flex items-center text-sm shadow-sm"
                    >
                        {isProcessingCancel ? <Loader2 className="animate-spin mr-2" /> : <AlertOctagon className="mr-2 w-4 h-4" />}
                        Cancelar Assinatura
                    </button>
                ) : (
                    <button 
                        disabled
                        className="bg-gray-200 text-gray-400 font-bold px-6 py-3 rounded-xl cursor-not-allowed text-sm"
                    >
                        Assinatura Inativa
                    </button>
                )}
            </div>
        </div>
        {child.isPremium && (
            <p className="text-xs text-gray-400 mt-4 text-center md:text-left">
                Ao cancelar, a cobrança recorrente será interrompida imediatamente.
            </p>
        )}
      </div>

    </div>
  );
};

const StatCard = ({ icon, label, value, subValue }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
    <div className="flex items-center mb-4">
      <div className="p-2 bg-gray-50 rounded-lg mr-3">{icon}</div>
      <span className="text-gray-500 font-medium text-sm">{label}</span>
    </div>
    <div className="text-3xl font-display font-bold text-gray-800 mb-1">{value}</div>
    <div className="text-xs text-green-600 font-bold">{subValue}</div>
  </div>
);

export default ParentDashboard;