export type ItemKind = 'event' | 'reminder' | 'task' | 'note';

export interface Item {
  id: string;
  kind: ItemKind;
  title: string;
  details?: string;
  /** ISO date-time. Events/reminders have it, notes may not. */
  at?: string;
  /** minutes, for events */
  durationMin?: number;
  location?: string;
  clientId?: string;
  done?: boolean;
  createdAt: string;
  /** raw transcript this item came from */
  source?: string;
  // integrations
  calendarEventId?: string;
  notificationId?: string;
  whatsappJobId?: string;
}

export type ClientStage = 'lead' | 'contact' | 'showing' | 'offer' | 'deal' | 'lost';

export interface ClientTouch {
  at: string;
  summary: string;
  /** where it came from: voice, forwarded chat, meeting recap */
  via: 'voice' | 'chat' | 'meeting' | 'manual';
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  stage: ClientStage;
  budget?: string;
  interest?: string;
  tags: string[];
  notes?: string;
  /** Memory Box: services / objects the person cares about */
  interests?: string[];
  /** Memory Box: what was agreed */
  agreements?: string[];
  /** Memory Box: history of conversations */
  touches?: ClientTouch[];
  followUpAt?: string;
  followUpItemId?: string;
  createdAt: string;
  lastTouchAt?: string;
}

export interface Todo {
  text: string;
  dueAt?: string;
  done?: boolean;
  itemId?: string;
}

/** "Выжимка смыслов": a voice message / dictation turned into structure. */
export interface Digest {
  id: string;
  title: string;
  summary: string;
  todos: Todo[];
  agreements: string[];
  clientId?: string;
  transcript: string;
  source: 'dictation' | 'shared-audio' | 'shared-text' | 'file';
  createdAt: string;
}

export type MaterialKind = 'image' | 'link' | 'text' | 'audio';

/** Raw "junk" thrown into the Studio. */
export interface Material {
  id: string;
  kind: MaterialKind;
  text?: string;
  uri?: string;
  mime?: string;
  createdAt: string;
}

export type CreationFormat = 'newsletter' | 'video' | 'landing' | 'brief' | 'post';

export interface Creation {
  id: string;
  format: CreationFormat;
  title: string;
  /** light markdown: #, ##, -, **bold** */
  body: string;
  materialIds: string[];
  shareUrl?: string;
  createdAt: string;
}

/** Output of the digest / memory endpoint. */
export interface DigestResult {
  title: string;
  summary: string;
  todos: { text: string; dueAt?: string }[];
  agreements: string[];
  contact?: {
    name: string;
    phone?: string;
    stage?: ClientStage;
    budget?: string;
    interests?: string[];
    agreements?: string[];
    followUpAt?: string;
    followUpWhat?: string;
    summary: string;
  };
}

export interface Broadcast {
  id: string;
  text: string;
  clientIds: string[];
  sentIds: string[];
  /** server-side automatic sending (WhatsApp Business) */
  auto?: boolean;
  at?: string;
  repeat?: 'daily' | 'weekdays' | 'weekly';
  serverId?: string;
  createdAt: string;
}

/** What the AI (or the local parser) understood from one utterance. */
export type Action =
  | {
      type: 'create_event';
      title: string;
      at: string;
      durationMin?: number;
      location?: string;
      clientName?: string;
      remindBeforeMin?: number;
    }
  | { type: 'create_reminder'; title: string; at: string; clientName?: string }
  | { type: 'create_task'; title: string; at?: string; clientName?: string }
  | { type: 'create_note'; title: string; body: string; clientName?: string }
  | {
      type: 'upsert_client';
      name: string;
      phone?: string;
      stage?: ClientStage;
      budget?: string;
      interest?: string;
      note?: string;
    }
  | {
      type: 'send_message';
      /** recipient as said by the user: "Алексею" → "Алексей" */
      clientName: string;
      phone?: string;
      /** the finished, polite message to send (written by the AI) */
      text: string;
      /** send later; omitted = now */
      at?: string;
    }
  | {
      type: 'broadcast';
      text: string;
      stage?: ClientStage;
      tag?: string;
      /** first send time; omitted = now */
      at?: string;
      repeat?: 'daily' | 'weekdays' | 'weekly';
    }
  | {
      /** «Зуми, открой камеру / Инстаграм», «позвони Алексею» */
      type: 'open_app';
      app: string;
      clientName?: string;
    }
  | { type: 'answer'; text: string };

export interface AssistantResult {
  transcript: string;
  reply: string;
  actions: Action[];
}

export interface Profile {
  name: string;
  whatsapp?: string;
  role: 'broker' | 'sales' | 'freelance' | 'other';
  remindBeforeMin: number;
  voiceReplies: boolean;
  whatsappReminders: boolean;
  calendarSync: boolean;
  /** "Линия Zumi": personal Twilio business number, calls through it are auto-recorded */
  lineNumber?: string;
  /** listen for «Привет, Зуми» */
  handsFree: boolean;
  /** WhatsApp Business sender connected on the server → messages go out automatically */
  waConnected?: boolean;
}
