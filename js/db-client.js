/**
 * LECASU, LDA. - Sistema Financeiro ERP
 * Cliente de Sincronização em Tempo Real com Neon PostgreSQL & Autenticação (js/db-client.js)
 */

const _esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Limpeza única e definitiva de dados fictícios antigos salvos em cache local
try {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    if (localStorage.getItem("lecasu_mocks_purged_v2") !== "true") {
      localStorage.removeItem("lecasu-recon-v1");
      localStorage.removeItem("lecasu_state_updated_at");
      localStorage.setItem("lecasu_mocks_purged_v2", "true");
    }
  }
} catch (e) {}

const DBClient = {
  isOnline: false,
  isSyncing: false,
  lastSyncTime: null,

  // Helper de requisição com suporte duplo: URL amigável /api/* ou fallback direto para api.php?route=*
  async fetchApi(endpoint, options = {}) {
    // 1. Tentar URL amigável /api/{endpoint}
    try {
      const res = await fetch("/api/" + endpoint, options);
      if (res && res.status !== 404) return res;
    } catch (e) {}

    // 2. Fallback direto para api.php?route={endpoint} (compatível com qualquer hospedagem cPanel / LiteSpeed)
    try {
      const glue = endpoint.includes("?") ? "&" : "";
      const res = await fetch("api.php?route=" + endpoint + glue, options);
      if (res && res.status !== 404) return res;
    } catch (e) {}

    return null;
  },

  // Inicializa verificação de autenticação e conexão com a Base de Dados Neon
  async init() {
    this.checkAuth();

    try {
      const res = await this.fetchApi("health");
      if (res && res.ok) {
        const data = await res.json();
        if (data.status === "online") {
          this.isOnline = true;
          this.updateStatusBadge(true, "Neon PostgreSQL Online");
          await this.pullState();
          return;
        }
      }
      this.isOnline = false;
      this.updateStatusBadge(false, "Modo Local");
    } catch (e) {
      this.isOnline = false;
      this.updateStatusBadge(false, "Modo Local");
    }
  },

  // Guarda e proteção de rotas
  checkAuth() {
    if (typeof window === "undefined") return;
    const path = window.location.pathname.toLowerCase();
    const isLoginPage = path.endsWith("login.html") || path.endsWith("/login");
    const token = localStorage.getItem("lecasu_auth_token");

    if (!token && !isLoginPage) {
      window.location.replace("login.html");
      return;
    }

    if (token && isLoginPage) {
      window.location.replace("dashboard.html");
      return;
    }

    if (token && !isLoginPage) {
      this.renderUserProfileHeader();
    }
  },

  // Obtém dados do usuário autenticado
  getUser() {
    try {
      const u = localStorage.getItem("lecasu_auth_user");
      return u ? JSON.parse(u) : {
        nome: "Josue Mahomad Esmael",
        email: "jossuemohamad@gmail.com",
        cargo: "Director Geral & Administrador",
        perfil: "admin"
      };
    } catch (e) {
      return {
        nome: "Josue Mahomad Esmael",
        email: "jossuemohamad@gmail.com",
        cargo: "Director Geral & Administrador",
        perfil: "admin"
      };
    }
  },

  // Termina sessão com segurança
  logout() {
    localStorage.removeItem("lecasu_auth_token");
    localStorage.removeItem("lecasu_auth_user");
    window.location.replace("login.html");
  },

  // Renderiza perfil e botão de Sair no cabeçalho
  renderUserProfileHeader() {
    const meta = document.querySelector(".header-meta");
    if (!meta || document.getElementById("header-user-profile")) return;

    const user = this.getUser();
    const profileEl = document.createElement("div");
    profileEl.id = "header-user-profile";
    profileEl.className = "header-user-profile";
    profileEl.innerHTML = `
      <div class="user-avatar" title="${_esc(user.nome)} (${_esc(user.cargo)})">
        <img src="${user.avatar || 'assets/icon.png'}" alt="${_esc(user.nome)}" class="user-avatar-img">
      </div>
      <div class="user-details">
        <span class="user-name">${_esc(user.nome)}</span>
        <span class="user-role">${user.perfil === 'admin' ? 'Administrador' : _esc(user.cargo)}</span>
      </div>
      <button class="btn-logout" id="btn-logout" title="Terminar sessão com segurança">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Sair</span>
      </button>
    `;

    meta.appendChild(profileEl);

    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        if (typeof showConfirm === "function") {
          showConfirm(
            "Terminar Sessão",
            "Deseja realmente sair do Sistema Financeiro ERP?",
            () => DBClient.logout(),
            "Sim, Sair",
            false
          );
        } else {
          DBClient.logout();
        }
      });
    }
  },

  // Busca o estado real e mais recente da base de dados Neon PostgreSQL
  async pullState() {
    try {
      const res = await this.fetchApi("state");
      if (res && res.ok) {
        const result = await res.json();
        if (result.success && result.state) {
          S = typeof sanitizeState === "function" ? sanitizeState(result.state) : result.state;
          localStorage.setItem(KEY, JSON.stringify(S));
          if (result.updated_at) localStorage.setItem("lecasu_state_updated_at", result.updated_at);
          if (typeof renderCurrentPage === "function") {
            renderCurrentPage();
          }
          this.lastSyncTime = new Date();
          this.isOnline = true;
          this.updateStatusBadge(true, "Neon Conectado");
        }
      }
    } catch (e) {
      console.warn("Aviso ao puxar dados do PostgreSQL:", e);
    }
  },

  // Envia o estado atual para o banco Neon PostgreSQL
  async pushState(state) {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      this.updateStatusBadge(true, "Sincronizando...", true);
      const res = await this.fetchApi("state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: state || S })
      });
      if (res && res.ok) {
        const data = await res.json();
        if (data.success) {
          this.lastSyncTime = new Date();
          this.isOnline = true;
          localStorage.setItem("lecasu_state_updated_at", data.timestamp || new Date().toISOString());
          this.updateStatusBadge(true, "Neon Sincronizado");
        }
      }
    } catch (e) {
      console.warn("Erro ao sincronizar com Neon PostgreSQL:", e);
      this.updateStatusBadge(false, "Erro de Sincronia");
    } finally {
      this.isSyncing = false;
    }
  },

  // Reposição e ZERAMENTO REAL do sistema e base de dados Neon PostgreSQL
  async realResetSystem() {
    try {
      this.updateStatusBadge(true, "Repondo a Zero...", true);
      const res = await this.fetchApi("reset", { method: "POST" });
      if (!res) throw new Error("Falha ao comunicar com o servidor.");
      const data = await res.json();
      if (data && data.success) {
        localStorage.removeItem(KEY);
        if (data.state) {
          S = typeof sanitizeState === "function" ? sanitizeState(data.state) : data.state;
        } else if (typeof getZeroState === "function") {
          S = getZeroState();
        } else {
          S = { ini: 0, ext: 0, mov: [], ar: [], ap: [], ter: [], materia: [], rh: [], ativos: [], book: [], ex: [] };
        }
        localStorage.setItem(KEY, JSON.stringify(S));
        localStorage.setItem("lecasu_state_updated_at", data.timestamp || new Date().toISOString());
        notifySync();
        if (typeof renderCurrentPage === "function") {
          renderCurrentPage();
        }
        this.isOnline = true;
        this.updateStatusBadge(true, "Neon Online (Zerado)");
        return { success: true, message: data.message || "Base de dados e sistema repostos a ZERO com sucesso!" };
      }
      throw new Error(data.message || data.error || "Erro na reposição");
    } catch (err) {
      console.warn("Reposição remota falhou, aplicando reposição limpa a zero:", err);
      if (typeof getZeroState === "function") {
        S = getZeroState();
      } else {
        S = { ini: 0, ext: 0, mov: [], ar: [], ap: [], ter: [], materia: [], rh: [], ativos: [], book: [], ex: [] };
      }
      localStorage.setItem(KEY, JSON.stringify(S));
      notifySync();
      if (typeof renderCurrentPage === "function") {
        renderCurrentPage();
      }
      return { success: true, message: "Sistema reposto a ZERO com sucesso." };
    }
  },

  // Atualiza o indicador visual no Header e nas Configurações
  updateStatusBadge(online, text, isSyncing = false) {
    const badge = document.getElementById("db-status-badge");
    if (!badge) return;

    badge.className = `db-badge ${online ? "online" : "offline"} ${isSyncing ? "syncing" : ""}`;
    badge.innerHTML = `
      <span class="db-dot"></span>
      <span class="db-text">${text}</span>
    `;
    badge.title = online 
      ? `Base de dados: Neon PostgreSQL (AWS us-east-2). Última sincronização: ${this.lastSyncTime ? this.lastSyncTime.toLocaleTimeString() : "Agora"}`
      : "Base de dados offline ou em sincronização.";
  }
};

// Inicia verificação assim que o DOM estiver pronto
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => DBClient.init());
  } else {
    DBClient.init();
  }
}
