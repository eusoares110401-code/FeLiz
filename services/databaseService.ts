import { UserProfile, SubjectType, Transaction } from "../types";
import { MOCK_CHILD } from "../constants";

/**
 * DATABASE SERVICE (Backend Abstraction Layer)
 * 
 * Este serviço atua como a única fonte de verdade para dados.
 * Atualmente ele usa localStorage para persistência (PWA style).
 * 
 * PARA MIGRAR PARA NESTJS + POSTGRES:
 * Basta substituir a lógica dentro destas funções por chamadas:
 * const res = await fetch('https://api.feliz.education/users', ...);
 */

const DB_KEYS = {
    USERS: 'feliz_db_users',
    TRANSACTIONS: 'feliz_db_transactions',
    SESSION: 'feliz_current_session'
};

// --- HELPER: Simula Latência de Rede ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class DatabaseService {

    // ==========================================
    // AUTHENTICATION
    // ==========================================

    async login(email: string, password: string): Promise<UserProfile> {
        await delay(800); // Fake network latency

        // Admin Backdoor
        if (email.includes('admin') && password === 'admin') {
            return { ...MOCK_CHILD, email, isAdmin: true, name: 'Admin User', isPremium: true, masteredLetters: [] };
        }

        const db = this._getDb();
        const user = db[email];

        if (!user) throw new Error("Usuário não encontrado.");
        if (user.password !== password) throw new Error("Senha incorreta.");

        // Garantir compatibilidade com usuários antigos sem masteredLetters
        if (!user.profile.masteredLetters) {
            user.profile.masteredLetters = [];
        }

        // Update Last Login
        user.profile.lastLogin = new Date().toISOString();
        this._saveDb(db);
        this._saveSession(user.profile);

        return user.profile;
    }

    async register(data: { parentEmail: string; password: string; childName: string; childAge: number; avatar: string }): Promise<UserProfile> {
        await delay(1500);

        const db = this._getDb();
        if (db[data.parentEmail]) throw new Error("Email já cadastrado.");

        const newUser: UserProfile = {
            id: crypto.randomUUID(),
            email: data.parentEmail,
            name: data.childName,
            age: data.childAge,
            avatar: data.avatar || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${data.childName}`,
            isAdmin: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            xp: 0,
            level: 1,
            streak: 0,
            unlockedSubjects: [SubjectType.GRAMMAR], // Começa só com Gramática
            masteredLetters: [], // Inicia vazio
            isPremium: false,
            subscriptionStatus: 'free'
        };

        // Regra de Negócio: Libera Aritmética para crianças > 5 anos
        if (data.childAge > 5) {
            newUser.unlockedSubjects.push(SubjectType.ARITHMETIC);
        }

        db[data.parentEmail] = { password: data.password, profile: newUser };
        this._saveDb(db);
        this._saveSession(newUser);

        // Enviar email de boas-vindas (Simulação)
        console.log(`[SMTP] Sending Welcome Email to ${data.parentEmail}`);

        return newUser;
    }

    logout(): void {
        localStorage.removeItem(DB_KEYS.SESSION);
    }

    getCurrentUser(): UserProfile | null {
        const session = localStorage.getItem(DB_KEYS.SESSION);
        if (!session) return null;
        
        const user = JSON.parse(session);
        // Migração simples em tempo de execução
        if (!user.masteredLetters) user.masteredLetters = [];
        return user;
    }

    // ==========================================
    // PROGRESS & GAMIFICATION
    // ==========================================

    async updateUserProgress(email: string, xpEarned: number): Promise<UserProfile> {
        await delay(500);
        const db = this._getDb();
        const user = db[email];

        if (!user) throw new Error("User not found");

        user.profile.xp += xpEarned;
        
        // Level Up Logic (Simples: a cada 1000 XP)
        const newLevel = Math.floor(user.profile.xp / 1000) + 1;
        if (newLevel > user.profile.level) {
            user.profile.level = newLevel;
        }
        
        user.profile.streak += 1; // Simplificado

        this._saveDb(db);
        this._saveSession(user.profile);
        return user.profile;
    }

    // NOVA FUNÇÃO: Marcar letra como aprendida
    async markLetterAsMastered(email: string, letter: string): Promise<UserProfile> {
        // Sem delay artificial para feedback rápido na UI
        const db = this._getDb();
        const user = db[email];

        if (!user) throw new Error("User not found");

        if (!user.profile.masteredLetters) {
            user.profile.masteredLetters = [];
        }

        // Só adiciona se ainda não tiver (evita duplicatas)
        if (!user.profile.masteredLetters.includes(letter)) {
            user.profile.masteredLetters.push(letter);
            user.profile.xp += 20; // Bônus por masterizar letra
        }

        this._saveDb(db);
        this._saveSession(user.profile);
        return user.profile;
    }

    // ==========================================
    // PAYMENTS & SUBSCRIPTIONS
    // ==========================================

    async activatePremium(email: string, plan: 'monthly' | 'yearly' = 'monthly'): Promise<UserProfile> {
        await delay(1000);
        const db = this._getDb();
        const user = db[email];
        
        if (!user) throw new Error("User not found");

        // 1. Atualiza Perfil
        user.profile.isPremium = true;
        user.profile.subscriptionStatus = 'active';
        user.profile.subscriptionPlan = plan;
        user.profile.subscriptionRenewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // +30 dias

        // 2. Registra Transação Financeira
        const amount = plan === 'monthly' ? 29.90 : 299.00;
        const transaction: Transaction = {
            id: crypto.randomUUID(),
            userEmail: email,
            amount: amount,
            date: new Date().toISOString(),
            status: 'succeeded',
            plan: plan
        };
        this._saveTransaction(transaction);

        this._saveDb(db);
        this._saveSession(user.profile);
        return user.profile;
    }

    async cancelPremium(email: string): Promise<UserProfile> {
        await delay(1000);
        const db = this._getDb();
        const user = db[email];

        if (!user) throw new Error("Usuário não encontrado.");

        // Reverte para status free
        user.profile.isPremium = false;
        user.profile.subscriptionStatus = 'canceled';
        user.profile.subscriptionPlan = null;
        user.profile.subscriptionRenewsAt = undefined;

        this._saveDb(db);
        this._saveSession(user.profile);
        return user.profile;
    }

    async getTransactions(): Promise<Transaction[]> {
        await delay(500);
        return JSON.parse(localStorage.getItem(DB_KEYS.TRANSACTIONS) || '[]');
    }

    // ==========================================
    // ADMIN & KPI
    // ==========================================

    async getAllUsers(): Promise<UserProfile[]> {
        await delay(500);
        const db = this._getDb();
        return Object.values(db).map((u: any) => u.profile);
    }

    async getDashboardKPIs() {
        await delay(800);
        const db = this._getDb();
        const users = Object.values(db).map((u: any) => u.profile) as UserProfile[];
        const transactions = await this.getTransactions();

        // 1. Receita (MRR/ARR)
        const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);
        
        // 2. Active Users (Logaram nos últimos 7 dias)
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const activeUsers = users.filter(u => new Date(u.lastLogin) > oneWeekAgo).length;

        // 3. Conversion Rate
        const premiumUsers = users.filter(u => u.isPremium).length;
        const conversionRate = users.length > 0 ? ((premiumUsers / users.length) * 100).toFixed(1) : "0";

        return {
            totalRevenue,
            activeUsers,
            totalUsers: users.length,
            conversionRate: `${conversionRate}%`
        };
    }

    // ==========================================
    // PRIVATE STORAGE METHODS
    // ==========================================

    private _getDb() {
        return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '{}');
    }

    private _saveDb(data: any) {
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(data));
    }

    private _saveSession(profile: UserProfile) {
        localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(profile));
    }

    private _saveTransaction(tx: Transaction) {
        const txs = this.getTransactionsSync();
        txs.unshift(tx); // Add to top
        localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(txs));
    }

    private getTransactionsSync(): Transaction[] {
        return JSON.parse(localStorage.getItem(DB_KEYS.TRANSACTIONS) || '[]');
    }
}

export const dbService = new DatabaseService();