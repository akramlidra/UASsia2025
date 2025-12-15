export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  isToolCall?: boolean;
  toolName?: string;
  toolArgs?: any;
  toolResult?: any;
  timestamp: Date;
}

export enum ToolNames {
  KELOLA_DOKTER_STAF = 'kelola_dokter_staf',
  CARI_INFORMASI_MEDIS = 'cari_informasi_medis',
  AKUNTANSI_RUMAH_SAKIT = 'akuntansi_rumah_sakit',
  MANAJEMEN_PASIEN = 'manajemen_pasien',
  JADWAL_JANJI_TEMU = 'jadwal_janji_temu',
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  activeTool: string | null;
}