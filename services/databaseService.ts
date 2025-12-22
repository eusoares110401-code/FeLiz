import { UserProfile, SubjectType, Transaction } from "../types";
import { MOCK_CHILD } from "../constants";

/**
 * DATABASE SERVICE (Robust LocalStorage Wrapper)
 * Revisado para garantir estabilidade total.
 */

const DB_KEYS = {
    USERS: 'feliz_db_users_v2', // Mudamos a chave para v2 para limpar dados legados corrompidos se necessário
    TRANSACTIONS: 'feliz_db_transactions_v2',
    SESSION: 'feliz_current_session_v2'
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class DatabaseService {

    // ==========================================
    // AUTHENTICATION
    // ==========================================

    async login(email: string, password: string): Promise<UserProfile> {
        await delay(600); 

        // Admin Backdoor
        if (email.toLowerCase().includes('admin') && password === 'admin') {
            const adminUser = this._createDefaultUser(email, "Admin", 30);
            adminUser.isAdmin = true;
            adminUser.isPremium = true;
            adminUser.unlockedSubjects = Object.values(SubjectType);
            this._saveSession(adminUser);
            return adminUser;
        }

        const db = this._getDb();
        const userEntry = db[email];

        if (!userEntry) throw new Error("Usuário não encontrado.");
        if (userEntry.password !== password) throw new Error("Senha incorreta.");

        // Data Migration & Repair (Crucial para evitar crash)
        const profile = this._repairProfile(userEntry.profile);

        // Update Last Login
        profile.lastLogin = new Date().toISOString();
        
        // Save back
        userEntry.profile = profile;
        this._saveDb(db);
        this._saveSession(profile);

        return profile;
    }

    async register(data: { parentEmail: string; password: string; childName: string; childAge: number; avatar: string }): Promise<UserProfile> {
        await delay(800);

        const db = this._getDb();
        if (db[data.parentEmail]) throw new Error("Este email já possui cadastro.");

        const newUser = this._createDefaultUser(data.parentEmail, data.childName, data.childAge);
        if (data.avatar) newUser.avatar = data.avatar;

        db[data.parentEmail] = { password: data.password, profile: newUser };
        this._saveDb(db);
        this._saveSession(newUser);

        return newUser;
    }

    logout(): void {
        localStorage.removeItem(DB_KEYS.SESSION);
    }

    getCurrentUser(): UserProfile | null {
        try {
            const session = localStorage.getItem(DB_KEYS.SESSION);
            if (!session) return null;
            
            let rawUser;
            try {
                rawUser = JSON.parse(session);
            } catch (e) {
                console.error("JSON de sessão inválido", e);
                this.logout();
                return null;
            }
            
            if (!rawUser || typeof rawUser !== 'object' || !rawUser.id) {
                this.logout();
                return null;
            }

            // Auto-reparo silencioso
            const repairedUser = this._repairProfile(rawUser);
            
            // Atualiza sessão se houve reparo
            if (JSON.stringify(repairedUser) !== JSON.stringify(rawUser)) {
                this._saveSession(repairedUser);
            }
            
            return repairedUser;
        } catch (e) {
            console.error("Erro crítico na sessão, limpando.", e);
            this.logout();
            return null;
        }
    }

    // ==========================================
    // PROGRESS & GAMIFICATION
    // ==========================================

    async updateUserProgress(email: string, xpEarned: number): Promise<UserProfile> {
        await delay(300);
        const db = this._getDb();
        const userEntry = db[email];

        if (!userEntry) throw new Error("User not found in DB");

        const profile = this._repairProfile(userEntry.profile);
        profile.xp += xpEarned;
        
        const newLevel = Math.floor(profile.xp / 1000) + 1;
        if (newLevel > profile.level) {
            profile.level = newLevel;
        }
        
        // Simulação simples de streak (incrementa a cada lição por enquanto)
        profile.streak += 1; 

        userEntry.profile = profile;
        this._saveDb(db);
        this._saveSession(profile);
        return profile;
    }

    async markLetterAsMastered(email: string, letter: string): Promise<UserProfile> {
        const db = this._getDb();
        const userEntry = db[email];

        if (!userEntry) throw new Error("User not found");

        const profile = this._repairProfile(userEntry.profile);

        if (!profile.masteredLetters.includes(letter)) {
            profile.masteredLetters.push(letter);
            profile.xp += 50; // Bônus maior por aprender uma letra
        }

        userEntry.profile = profile;
        this._saveDb(db);
        this._saveSession(profile);
        return profile;
    }

    // ==========================================
    // PAYMENTS
    // ==========================================

    async activatePremium(email: string, plan: 'monthly' | 'yearly' = 'monthly'): Promise<UserProfile> {
        await delay(500);
        const db = this._getDb();
        const userEntry = db[email];
        
        if (!userEntry) throw new Error("User not found");
        
        const profile = this._repairProfile(userEntry.profile);
        profile.isPremium = true;
        profile.subscriptionStatus = 'active';
        profile.subscriptionPlan = plan;
        profile.subscriptionRenewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // Unlock Quadrivium
        const allSubjects = Object.values(SubjectType);
        profile.unlockedSubjects = allSubjects;

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

        userEntry.profile = profile;
        this._saveDb(db);
        this._saveSession(profile);
        return profile;
    }

    async cancelPremium(email: string): Promise<UserProfile> {
        await delay(500);
        const db = this._getDb();
        const userEntry = db[email];

        if (!userEntry) throw new Error("Usuário não encontrado.");
        
        const profile = this._repairProfile(userEntry.profile);
        profile.isPremium = false;
        profile.subscriptionStatus = 'canceled';
        profile.subscriptionPlan = null;
        profile.subscriptionRenewsAt = undefined;
        // Reverte unlocks para básico se necessário (opcional, mantemos desbloqueado por gentileza aqui)
        
        userEntry.profile = profile;
        this._saveDb(db);
        this._saveSession(profile);
        return profile;
    }

    async getTransactions(): Promise<Transaction[]> {
        await delay(300);
        return this.getTransactionsSync();
    }

    async getAllUsers(): Promise<UserProfile[]> {
        await delay(300);
        const db = this._getDb();
        return Object.values(db).map((u: any) => this._repairProfile(u.profile));
    }

    async getDashboardKPIs() {
        await delay(500);
        const db = this._getDb();
        const users = Object.values(db).map((u: any) => this._repairProfile(u.profile));
        const transactions = this.getTransactionsSync();

        const totalRevenue = transactions.reduce((acc, t) => acc + t.amount, 0);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const activeUsers = users.filter(u => new Date(u.lastLogin) > oneWeekAgo).length;
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
    // HELPERS & REPAIR
    // ==========================================

    private _createDefaultUser(email: string, name: string, age: number): UserProfile {
        return {
            id: crypto.randomUUID(),
            email: email,
            name: name,
            age: age,
            avatar: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}`,
            isAdmin: false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            xp: 0,
            level: 1,
            streak: 0,
            unlockedSubjects: age > 5 ? [SubjectType.GRAMMAR, SubjectType.ARITHMETIC] : [SubjectType.GRAMMAR],
            masteredLetters: [],
            isPremium: false,
            subscriptionStatus: 'free'
        };
    }

    private _repairProfile(profile: any): UserProfile {
        if (!profile) return this._createDefaultUser("unknown@email.com", "Guest", 5);
        
        const repaired = { ...profile };

        // Garante arrays
        if (!Array.isArray(repaired.masteredLetters)) repaired.masteredLetters = [];
        if (!Array.isArray(repaired.unlockedSubjects)) repaired.unlockedSubjects = [SubjectType.GRAMMAR];
        if (repaired.unlockedSubjects.length === 0) repaired.unlockedSubjects = [SubjectType.GRAMMAR];
        
        // Garante números
        if (typeof repaired.xp !== 'number') repaired.xp = 0;
        if (typeof repaired.level !== 'number') repaired.level = 1;
        if (typeof repaired.streak !== 'number') repaired.streak = 0;
        if (typeof repaired.age !== 'number') repaired.age = 5;

        // Garante strings
        if (!repaired.name) repaired.name = "Estudante";
        if (!repaired.avatar) repaired.avatar = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${repaired.name}`;
        
        return repaired as UserProfile;
    }

    private _getDb() {
        try {
            const data = localStorage.getItem(DB_KEYS.USERS);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error("DB Corrupted", e);
            return {};
        }
    }

    private _saveDb(data: any) {
        try {
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(data));
        } catch (e) {
            alert("Memória cheia! Limpe o navegador.");
        }
    }

    private _saveSession(profile: UserProfile) {
        localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(profile));
    }

    private _saveTransaction(tx: Transaction) {
        const txs = this.getTransactionsSync();
        txs.unshift(tx);
        localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(txs));
    }

    private getTransactionsSync(): Transaction[] {
        try {
            const data = localStorage.getItem(DB_KEYS.TRANSACTIONS);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }
}

export const dbService = new DatabaseService();