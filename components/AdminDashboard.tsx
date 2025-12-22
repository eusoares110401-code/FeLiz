import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, TrendingUp, Search, ShieldAlert, Crown, Ban,
  Mail, CheckCircle, LayoutDashboard, PieChart, Lock, ArrowLeft,
  Settings, Link as LinkIcon, Save, KeyRound, Loader2, Megaphone,
  CreditCard, ExternalLink, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { UserProfile, Transaction } from '../types';
import { playSound } from '../services/soundService';
import { STRIPE_CHECKOUT_URL } from '../constants';
import { dbService } from '../services/databaseService';

interface AdminDashboardProps {
    onBack: () => void;
}

const ADMIN_PASSWORD_HASH = "Losa13@_soares110401"; 

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  // Auth & Loading
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dashboard Data
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'finance' | 'marketing'>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [kpis, setKpis] = useState({ totalRevenue: 0, activeUsers: 0, conversionRate: "0%" });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Settings
  const [stripeConfig, setStripeConfig] = useState({ paymentLink: '', isConnected: false });

  // Mock Data for Chart
  const chartData = [
    { name: 'Jan', revenue: 400, users: 24 },
    { name: 'Fev', revenue: 300, users: 13 },
    { name: 'Mar', revenue: 200, users: 38 },
    { name: 'Abr', revenue: 278, users: 39 },
    { name: 'Mai', revenue: 189, users: 48 },
    { name: 'Jun', revenue: 239, users: 38 },
    { name: 'Jul', revenue: 349, users: 43 },
  ];

  // --- DATA LOADING ---
  useEffect(() => {
    if (isAuthenticated) {
        loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
      setIsLoading(true);
      try {
          // 1. Users
          const allUsers = await dbService.getAllUsers();
          setUsers(allUsers);

          // 2. KPIs
          const kpiData = await dbService.getDashboardKPIs();
          setKpis({
              totalRevenue: kpiData.totalRevenue,
              activeUsers: kpiData.activeUsers,
              conversionRate: kpiData.conversionRate
          });

          // 3. Transactions
          const txs = await dbService.getTransactions();
          setTransactions(txs);

          // 4. Config
          const savedLink = localStorage.getItem('feliz_stripe_link');
          setStripeConfig({ 
              paymentLink: savedLink || STRIPE_CHECKOUT_URL,
              isConnected: !!savedLink && savedLink !== ''
          });

      } catch (e) {
          console.error("Erro ao carregar dados do admin", e);
      } finally {
          setIsLoading(false);
      }
  };

  // --- AUTH ---
  const handleLogin = () => {
      if (passwordInput === ADMIN_PASSWORD_HASH) {
          playSound.success();
          setIsAuthenticated(true);
          setLoginError(false);
      } else {
          playSound.error();
          setLoginError(true);
      }
  };

  // --- ACTIONS ---

  const handleSaveStripeConfig = () => {
      playSound.click();
      if (!stripeConfig.paymentLink.includes('http')) {
          alert("URL Inválida. Certifique-se de copiar o link completo (começando com https://).");
          return;
      }
      localStorage.setItem('feliz_stripe_link', stripeConfig.paymentLink);
      setStripeConfig(prev => ({ ...prev, isConnected: true }));
      alert("✅ Configuração da Stripe Salva com Sucesso!");
  };

  const handleTogglePremium = async (email: string) => {
      playSound.click();
      await dbService.activatePremium(email);
      loadData(); // Reload UI
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- RENDER LOGIN ---
  if (!isAuthenticated) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
              <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-gray-100">
                  <div className="bg-brand-dark w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                      <Lock size={32} />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">Admin Console</h2>
                  <div className="relative mb-6">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                          type="password" 
                          autoFocus
                          placeholder="Senha..."
                          className={`w-full bg-gray-50 border-2 rounded-xl py-3 pl-12 pr-4 outline-none font-bold text-gray-700 ${loginError ? 'border-red-300' : 'border-gray-200'}`}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      />
                  </div>
                  <button onClick={handleLogin} className="w-full bg-brand-dark text-white font-bold py-4 rounded-xl shadow-lg mb-4 cursor-pointer hover:bg-slate-800 transition">Entrar</button>
                  <button onClick={() => { playSound.click(); onBack(); }} className="text-gray-400 text-sm font-bold flex items-center justify-center w-full hover:text-gray-600 transition-colors cursor-pointer">
                      <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                  </button>
              </div>
          </div>
      );
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="space-y-8 animate-fade-in pb-12 bg-gray-50/50 min-h-full font-sans p-6 rounded-3xl">
      
      <div className="flex justify-between items-center">
        {/* Botão Voltar Padronizado */}
        <button 
            onClick={() => { playSound.click(); onBack(); }}
            className="flex items-center text-gray-500 hover:text-brand-primary font-bold transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100 group"
        >
            <ArrowLeft className="w-6 h-6 mr-1 group-hover:-translate-x-1 transition-transform" /> 
            Voltar
        </button>
        <button onClick={() => { playSound.click(); setIsAuthenticated(false); }} className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition">Logout</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard title="Receita Total" value={`R$ ${kpis.totalRevenue.toFixed(2)}`} icon={<DollarSign className="text-white" />} color="bg-green-500" />
          <MetricCard title="Usuários Totais" value={users.length} icon={<Users className="text-white" />} color="bg-blue-500" />
          <MetricCard title="Usuários Ativos (7d)" value={kpis.activeUsers} icon={<TrendingUp className="text-white" />} color="bg-purple-500" />
          <MetricCard title="Taxa de Conversão" value={kpis.conversionRate} icon={<PieChart className="text-white" />} color="bg-orange-500" />
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm overflow-x-auto">
        {['overview', 'users', 'finance', 'marketing'].map(tab => (
            <button 
                key={tab}
                onClick={() => { playSound.click(); setActiveTab(tab as any); }}
                className={`px-4 py-2 rounded-lg font-bold capitalize transition-all ${activeTab === tab ? 'bg-brand-dark text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                {tab === 'overview' ? 'Visão Geral' : tab === 'users' ? 'Usuários' : tab === 'finance' ? 'Financeiro' : 'Marketing'}
            </button>
        ))}
      </div>

      {/* --- TAB CONTENT --- */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-fade-in-up">
            <h3 className="font-bold text-lg mb-6 flex items-center text-gray-800">
               <TrendingUp className="mr-2 text-brand-primary" /> Crescimento de Receita & Usuários
            </h3>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} />
                     <YAxis axisLine={false} tickLine={false} />
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="#0EA5E9" fillOpacity={1} fill="url(#colorRevenue)" name="Receita" />
                     <Area type="monotone" dataKey="users" stroke="#F59E0B" fillOpacity={1} fill="url(#colorUsers)" name="Novos Usuários" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-sky-50 rounded-xl border border-sky-100 text-sm text-sky-800">
                <strong>Insight da IA:</strong> O crescimento de usuários está correlacionado com a liberação do módulo de Astronomia. Considere lançar mais badges cosméticos.
            </div>
         </div>
      )}

      {/* 2. USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
                 <h3 className="font-bold text-gray-800">Base de Usuários</h3>
                 <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        className="bg-gray-50 border rounded-xl pl-10 pr-4 py-2 text-sm w-full outline-none focus:border-brand-primary" 
                        placeholder="Buscar..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
             </div>
             {isLoading ? <div className="p-8 text-center"><Loader2 className="animate-spin inline text-brand-primary" /></div> : (
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                    <tr>
                        <th className="px-6 py-4">Nome</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Último Login</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <p className="font-bold text-gray-800">{u.name}</p>
                                <p className="text-xs text-gray-400">{u.email}</p>
                            </td>
                            <td className="px-6 py-4">
                                {u.isPremium ? <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex w-fit items-center"><Crown size={12} className="mr-1"/> Premium</span> : <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">Grátis</span>}
                            </td>
                            <td className="px-6 py-4 text-gray-500">{new Date(u.lastLogin).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right">
                                {!u.isPremium && (
                                    <button onClick={() => handleTogglePremium(u.email)} className="text-brand-primary font-bold text-xs hover:underline cursor-pointer">Dar Premium</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
             </div>
             )}
        </div>
      )}
      
      {/* 3. FINANCE TAB */}
      {activeTab === 'finance' && (
        <div className="bg-white rounded-3xl shadow-sm p-8 animate-fade-in-up border border-gray-100">
            <div className="flex items-center justify-between mb-8">
                 <h3 className="font-bold text-2xl text-gray-800 flex items-center">
                    <div className="bg-[#635BFF] p-2 rounded-lg mr-3 shadow-md">
                       <CreditCard className="text-white" size={24} />
                    </div>
                    Pagamentos & Assinaturas
                 </h3>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center ${stripeConfig.isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {stripeConfig.isConnected ? <CheckCircle size={12} className="mr-1"/> : <Ban size={12} className="mr-1"/>}
                    {stripeConfig.isConnected ? 'Sistema Conectado' : 'Não Configurado'}
                 </span>
            </div>

            {/* Configuração Stripe */}
            <div className="mb-10 bg-gradient-to-br from-slate-50 to-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#635BFF]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <h4 className="font-bold text-[#635BFF] mb-2 flex items-center text-lg">
                    <LinkIcon size={20} className="mr-2" /> Link de Pagamento Stripe
                </h4>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-2xl">
                    Para ativar pagamentos reais, crie um "Payment Link" no seu Dashboard da Stripe e cole a URL abaixo.
                    O aplicativo redirecionará automaticamente os pais para esta página segura.
                </p>
                
                <div className="flex flex-col md:flex-row gap-3 items-stretch">
                    <div className="flex-1 relative">
                        <input 
                            className="w-full border-2 border-gray-200 rounded-xl p-4 pl-4 bg-white focus:border-[#635BFF] focus:ring-4 focus:ring-[#635BFF]/10 outline-none transition-all font-medium text-gray-700 placeholder-gray-300" 
                            value={stripeConfig.paymentLink}
                            onChange={(e) => setStripeConfig({...stripeConfig, paymentLink: e.target.value})}
                            placeholder="https://buy.stripe.com/..."
                        />
                    </div>
                    <button 
                        onClick={handleSaveStripeConfig} 
                        className="bg-[#635BFF] hover:bg-[#544DC9] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center whitespace-nowrap"
                    >
                        <Save size={18} className="mr-2"/> Salvar Configuração
                    </button>
                </div>
                
                <div className="mt-4 flex items-center text-xs text-gray-400 font-medium">
                     <ExternalLink size={12} className="mr-1" />
                     <a href="https://dashboard.stripe.com/payment-links" target="_blank" rel="noopener noreferrer" className="hover:text-[#635BFF] transition-colors underline decoration-dotted">
                        Abrir Stripe Dashboard para criar link
                     </a>
                </div>
            </div>
            
            {/* Histórico de Transações */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h3 className="font-bold text-lg text-gray-800">Transações Recentes</h3>
                    <button onClick={loadData} className="text-[#635BFF] text-sm font-bold flex items-center hover:bg-[#635BFF]/10 px-3 py-1 rounded-lg transition-colors">
                        <RefreshCw size={14} className="mr-1" /> Atualizar
                    </button>
                </div>
                
                <div className="space-y-3">
                    {transactions.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-full mr-4 text-green-600 group-hover:scale-110 transition-transform">
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-base">{tx.userEmail}</p>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold mr-2 uppercase tracking-wide text-[10px]">{tx.plan === 'monthly' ? 'Mensal' : 'Anual'}</span>
                                        <span>{new Date(tx.date).toLocaleDateString()} às {new Date(tx.date).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>
                            <span className="font-mono font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                                + R$ {tx.amount.toFixed(2)}
                            </span>
                        </div>
                    ))}
                    {transactions.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                <DollarSign size={20} />
                            </div>
                            <p className="text-gray-500 font-medium">Nenhuma transação registrada ainda.</p>
                            <p className="text-xs text-gray-400 mt-1">As vendas aparecerão aqui automaticamente.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* 4. MARKETING TAB */}
      {activeTab === 'marketing' && (
         <div className="bg-white rounded-3xl shadow-sm p-8 animate-fade-in-up border border-gray-100 text-center">
            <div className="max-w-md mx-auto">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                    <Megaphone size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Campanhas de Email</h3>
                <p className="text-gray-500 mb-6">Envie novidades para a base de pais.</p>
                
                <button 
                    onClick={() => { playSound.click(); alert("Email de teste enviado para a base!"); }}
                    className="w-full bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-sky-600 transition shadow-lg mb-4"
                >
                    Enviar Newsletter Semanal
                </button>
                <button 
                    disabled
                    className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl cursor-not-allowed"
                >
                    Promoção Black Friday (Agendado)
                </button>
            </div>
         </div>
      )}

    </div>
  );
};

const MetricCard = ({ title, value, icon, color }: any) => (
  <div className={`${color} p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300`}>
     <div className="flex justify-between items-start mb-4">
        <div className="bg-white/20 p-2 rounded-xl">{icon}</div>
     </div>
     <h3 className="text-2xl font-bold mb-1">{value}</h3>
     <p className="text-xs opacity-90 font-bold uppercase">{title}</p>
  </div>
);

export default AdminDashboard;