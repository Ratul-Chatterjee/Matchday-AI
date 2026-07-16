const TICKET_KEY = 'matchday_ticket';
const LANGUAGE_KEY = 'matchday_language';
const CHAT_KEY = 'matchday_chat';
const API_KEY_KEY = 'matchday_api_key';
const DISMISS_KEY = 'matchday_desktop_dismissed';

export const localStorageUtils = {
  getTicket: <T = Record<string, unknown>>(): T | null => {
    try {
      const raw = localStorage.getItem(TICKET_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setTicket: (ticket: Record<string, unknown>): void => {
    try {
      localStorage.setItem(TICKET_KEY, JSON.stringify(ticket));
    } catch {
      // localStorage full or unavailable
    }
  },

  clearTicket: (): void => {
    try {
      localStorage.removeItem(TICKET_KEY);
    } catch {
      // noop
    }
  },

  getLanguage: (): string => {
    try {
      return localStorage.getItem(LANGUAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  },

  setLanguage: (lang: string): void => {
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      // noop
    }
  },

  getChatHistory: (): Array<{ role: string; content: string }> => {
    try {
      const raw = localStorage.getItem(CHAT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  setChatHistory: (history: Array<{ role: string; content: string }>): void => {
    try {
      const trimmed = history.slice(-50);
      localStorage.setItem(CHAT_KEY, JSON.stringify(trimmed));
    } catch {
      // noop
    }
  },

  getApiKey: (): string => {
    try {
      return localStorage.getItem(API_KEY_KEY) || '';
    } catch {
      return '';
    }
  },

  setApiKey: (key: string): void => {
    try {
      localStorage.setItem(API_KEY_KEY, key);
    } catch {
      // noop
    }
  },

  getDesktopDismissed: (): boolean => {
    try {
      return localStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      return false;
    }
  },

  setDesktopDismissed: (dismissed: boolean): void => {
    try {
      localStorage.setItem(DISMISS_KEY, dismissed ? 'true' : 'false');
    } catch {}
  },

  clearAll: (): void => {
    try {
      localStorage.removeItem(TICKET_KEY);
      localStorage.removeItem(LANGUAGE_KEY);
      localStorage.removeItem(CHAT_KEY);
      localStorage.removeItem(API_KEY_KEY);
      localStorage.removeItem(DISMISS_KEY);
    } catch {
      // noop
    }
  },
};
