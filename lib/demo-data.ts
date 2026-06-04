import {
  Activity,
  AlertTriangle,
  Banknote,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Stat = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export type MemberRow = {
  id: string;
  number: string;
  name: string;
  phone: string;
  plan: string;
  status: "active" | "warning" | "expired";
  statusLabel: string;
  sessionsLeft: string;
  expiresAt: string;
};

export type SubscriptionTypeRow = {
  id: string;
  name: string;
  durationDays: number;
  sessions: number | null;
  price: number;
  activeMembers: number;
};

export type CheckinRow = {
  id: string;
  time: string;
  name: string;
  plan: string;
  result: string;
};

export const initialMembers: MemberRow[] = [
  {
    id: "1",
    number: "000184",
    name: "Awa Diop",
    phone: "+221 77 123 45 67",
    plan: "Mensuel illimite",
    status: "expired",
    statusLabel: "Expire aujourd'hui",
    sessionsLeft: "Illimite",
    expiresAt: "03/06/2026",
  },
  {
    id: "2",
    number: "000183",
    name: "Moussa Fall",
    phone: "+221 76 400 90 12",
    plan: "Pack 10 seances",
    status: "warning",
    statusLabel: "1 seance restante",
    sessionsLeft: "1",
    expiresAt: "14/06/2026",
  },
  {
    id: "3",
    number: "000182",
    name: "Fatou Ndiaye",
    phone: "+221 78 908 11 33",
    plan: "Trimestriel",
    status: "warning",
    statusLabel: "Expire dans 2 jours",
    sessionsLeft: "Illimite",
    expiresAt: "05/06/2026",
  },
  {
    id: "4",
    number: "000181",
    name: "Ibrahima Sarr",
    phone: "+221 70 555 01 44",
    plan: "Mensuel illimite",
    status: "active",
    statusLabel: "Actif",
    sessionsLeft: "Illimite",
    expiresAt: "28/06/2026",
  },
  {
    id: "5",
    number: "000180",
    name: "Marieme Ba",
    phone: "+221 77 900 45 01",
    plan: "Pack 10 seances",
    status: "active",
    statusLabel: "Actif",
    sessionsLeft: "7",
    expiresAt: "21/07/2026",
  },
];

export const initialSubscriptionTypes: SubscriptionTypeRow[] = [
  {
    id: "mensuel",
    name: "Mensuel illimite",
    durationDays: 30,
    sessions: null,
    price: 15000,
    activeMembers: 96,
  },
  {
    id: "pack10",
    name: "Pack 10 seances",
    durationDays: 60,
    sessions: 10,
    price: 12000,
    activeMembers: 54,
  },
  {
    id: "trimestriel",
    name: "Trimestriel",
    durationDays: 90,
    sessions: null,
    price: 40000,
    activeMembers: 34,
  },
];

export const initialCheckins: CheckinRow[] = [
  { id: "1", time: "18:42", name: "Ibrahima Sarr", plan: "Mensuel illimite", result: "Valide" },
  { id: "2", time: "18:36", name: "Marieme Ba", plan: "Pack 10 seances", result: "7 restantes" },
  { id: "3", time: "18:21", name: "Cheikh Gueye", plan: "Mensuel illimite", result: "Valide" },
  { id: "4", time: "18:08", name: "Aminata Sow", plan: "Trimestriel", result: "Valide" },
];

export function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} F CFA`;
}

export function formatDuration(days: number) {
  return `${days} jours`;
}

export function formatSessions(sessions: number | null) {
  return sessions === null ? "Illimite" : String(sessions);
}

export function buildStats(members: MemberRow[], checkins: CheckinRow[]): Stat[] {
  const alerts = members.filter((member) => member.status !== "active").length;
  const activeMembers = members.filter((member) => member.status !== "expired").length;

  return [
    {
      label: "Revenus du jour",
      value: formatCurrency(42000),
      detail: "8 paiements encaisses",
      icon: Banknote,
    },
    {
      label: "Entrees",
      value: String(checkins.length),
      detail: "journal du jour",
      icon: Activity,
    },
    {
      label: "Membres actifs",
      value: String(activeMembers),
      detail: `${members.length} membres au total`,
      icon: Users,
    },
    {
      label: "Alertes",
      value: String(alerts),
      detail: "expires ou a renouveler",
      icon: AlertTriangle,
    },
  ];
}

export function getAlerts(members: MemberRow[]) {
  return members.filter((member) => member.status !== "active");
}

