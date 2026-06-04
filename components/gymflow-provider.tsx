"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  formatSessions,
  getAlerts,
  initialCheckins,
  initialMembers,
  initialSubscriptionTypes,
  type CheckinRow,
  type MemberRow,
  type SubscriptionTypeRow,
} from "@/lib/demo-data";

type NewMemberInput = {
  name: string;
  phone: string;
  subscriptionTypeId: string;
};

type NewSubscriptionTypeInput = {
  name: string;
  durationDays: number;
  sessions: number | null;
  price: number;
};

type RenewMemberInput = {
  memberId: string;
  subscriptionTypeId: string;
};

type GymFlowState = {
  members: MemberRow[];
  subscriptionTypes: SubscriptionTypeRow[];
  checkins: CheckinRow[];
  alerts: MemberRow[];
  addMember: (input: NewMemberInput) => void;
  addSubscriptionType: (input: NewSubscriptionTypeInput) => void;
  renewMember: (input: RenewMemberInput) => boolean;
  performCheckin: (memberId: string) => { ok: boolean; message: string };
  resetDemo: () => void;
};

const storageKey = "gymflow-demo-state-v1";

const GymFlowContext = createContext<GymFlowState | null>(null);

function nextMemberNumber(members: MemberRow[]) {
  const highest = members.reduce((max, member) => Math.max(max, Number(member.number)), 0);
  return String(highest + 1).padStart(6, "0");
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR").format(date);
}

function makeInitialState() {
  return {
    members: initialMembers,
    subscriptionTypes: initialSubscriptionTypes,
    checkins: initialCheckins,
  };
}

export function GymFlowProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<MemberRow[]>(initialMembers);
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionTypeRow[]>(initialSubscriptionTypes);
  const [checkins, setCheckins] = useState<CheckinRow[]>(initialCheckins);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as ReturnType<typeof makeInitialState>;
      setMembers(parsed.members);
      setSubscriptionTypes(parsed.subscriptionTypes);
      setCheckins(parsed.checkins);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ members, subscriptionTypes, checkins }),
    );
  }, [members, subscriptionTypes, checkins]);

  const value = useMemo<GymFlowState>(() => {
    return {
      members,
      subscriptionTypes,
      checkins,
      alerts: getAlerts(members),
      addMember(input) {
        const type = subscriptionTypes.find((item) => item.id === input.subscriptionTypeId);
        if (!type) return;

        const status: MemberRow["status"] = "active";
        const member: MemberRow = {
          id: crypto.randomUUID(),
          number: nextMemberNumber(members),
          name: input.name,
          phone: input.phone,
          plan: type.name,
          status,
          statusLabel: "Actif",
          sessionsLeft: formatSessions(type.sessions),
          expiresAt: formatDate(addDays(new Date(), type.durationDays)),
        };

        setMembers((current) => [member, ...current]);
        setSubscriptionTypes((current) =>
          current.map((item) =>
            item.id === type.id ? { ...item, activeMembers: item.activeMembers + 1 } : item,
          ),
        );
      },
      addSubscriptionType(input) {
        setSubscriptionTypes((current) => [
          {
            id: crypto.randomUUID(),
            name: input.name,
            durationDays: input.durationDays,
            sessions: input.sessions,
            price: input.price,
            activeMembers: 0,
          },
          ...current,
        ]);
      },
      renewMember(input) {
        const type = subscriptionTypes.find((item) => item.id === input.subscriptionTypeId);
        if (!type) return false;

        setMembers((current) =>
          current.map((member) =>
            member.id === input.memberId
              ? {
                  ...member,
                  plan: type.name,
                  status: "active",
                  statusLabel: "Actif",
                  sessionsLeft: formatSessions(type.sessions),
                  expiresAt: formatDate(addDays(new Date(), type.durationDays)),
                }
              : member,
          ),
        );
        setSubscriptionTypes((current) =>
          current.map((item) =>
            item.id === type.id ? { ...item, activeMembers: item.activeMembers + 1 } : item,
          ),
        );

        return true;
      },
      performCheckin(memberId) {
        const member = members.find((item) => item.id === memberId);
        if (!member) return { ok: false, message: "Membre introuvable" };
        if (member.status === "expired") {
          return { ok: false, message: "Abonnement expire" };
        }

        let result = "Valide";
        const numericSessions = Number(member.sessionsLeft);
        if (Number.isFinite(numericSessions)) {
          const nextSessions = Math.max(numericSessions - 1, 0);
          result = `${nextSessions} restantes`;
          setMembers((current) =>
            current.map((item) => {
              if (item.id !== member.id) return item;
              if (nextSessions === 0) {
                return {
                  ...item,
                  sessionsLeft: "0",
                  status: "expired",
                  statusLabel: "Plus de seances",
                };
              }
              if (nextSessions <= 2) {
                return {
                  ...item,
                  sessionsLeft: String(nextSessions),
                  status: "warning",
                  statusLabel: `${nextSessions} seance${nextSessions > 1 ? "s" : ""} restante${nextSessions > 1 ? "s" : ""}`,
                };
              }
              return { ...item, sessionsLeft: String(nextSessions) };
            }),
          );
        }

        const now = new Date();
        setCheckins((current) => [
          {
            id: crypto.randomUUID(),
            time: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            name: member.name,
            plan: member.plan,
            result,
          },
          ...current,
        ]);

        return { ok: true, message: `${member.name} pointe - ${result}` };
      },
      resetDemo() {
        const initial = makeInitialState();
        setMembers(initial.members);
        setSubscriptionTypes(initial.subscriptionTypes);
        setCheckins(initial.checkins);
      },
    };
  }, [checkins, members, subscriptionTypes]);

  return <GymFlowContext.Provider value={value}>{children}</GymFlowContext.Provider>;
}

export function useGymFlow() {
  const context = useContext(GymFlowContext);
  if (!context) {
    throw new Error("useGymFlow must be used inside GymFlowProvider");
  }
  return context;
}
