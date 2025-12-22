import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, TrendingUp, Search, ShieldAlert, Crown, Ban,
  Mail, CheckCircle, LayoutDashboard, PieChart, Lock, ArrowLeft,
  Settings, Link as LinkIcon, Save, KeyRound, Loader2, Megaphone
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
              isConnected: !!savedLink
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
          alert("URL Inválida.");
          return;
      }
      localStorage.setItem('feliz_stripe_link', stripeConfig.paymentLink);
      setStripeConfig(prev => ({ ...prev, isConnected: true }));
      alert("✅ Configuração Salva!");
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
            <h3 className="font-bold text-lg mb-4 text-gray-800">Configuração Stripe</h3>
            <div className="mb-6 p-6 bg-gray-50 rounded-2xl">
                <label className="block text-sm font-bold text-gray-700 mb-2">Link de Pagamento (Payment Link)</label>
                <div className="flex gap-2">
                    <input 
                        className="w-full border border-gray-200 rounded-xl p-3 bg-white focus:border-brand-primary outline-none" 
                        value={stripeConfig.paymentLink}
                        onChange={(e) => setStripeConfig({...stripeConfig, paymentLink: e.target.value})}
                        placeholder="https://buy.stripe.com/..."
                    />
                    <button onClick={handleSaveStripeConfig} className="bg-brand-dark text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition flex items-center"><Save size={18} className="mr-2"/> Salvar</button>
                </div>
            </div>
            
            <h3 className="font-bold text-lg mb-4 border-t pt-6 text-gray-800">Histórico de Transações (Simulado)</h3>
            <div className="space-y-3">
                {transactions.map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-full mr-3 text-green-600"><CheckCircle size={16} /></div>
                            <div>
                                <p className="font-bold text-sm text-gray-800">{tx.userEmail}</p>
                                <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()} • {tx.plan}</p>
                            </div>
                        </div>
                        <span className="font-mono font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">+ R$ {tx.amount.toFixed(2)}</span>
                    </div>
                ))}
                {transactions.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Nenhuma transação registrada ainda.</p>}
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