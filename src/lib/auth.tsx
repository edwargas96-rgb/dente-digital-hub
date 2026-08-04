import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Perfil = "clinica" | "laboratorio";

export type AuthState = {
  session: Session | null;
  userId: string | null;
  email: string | null;
  role: Perfil | null;
  clinicId: string | null;
  clinicNome: string | null;
  nomeCompleto: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Perfil | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinicNome, setClinicNome] = useState<string | null>(null);
  const [nomeCompleto, setNomeCompleto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function carregarPerfil(uid: string | null) {
    if (!uid) {
      setRole(null);
      setClinicId(null);
      setClinicNome(null);
      setNomeCompleto(null);
      return;
    }
    const [{ data: roles }, { data: profile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase
        .from("profiles")
        .select("nome_completo, clinic_id, clinics(nome)")
        .eq("id", uid)
        .maybeSingle(),
    ]);
    const isLab = (roles ?? []).some((r) => r.role === "laboratorio");
    setRole(isLab ? "laboratorio" : "clinica");
    setNomeCompleto(profile?.nome_completo ?? null);
    setClinicId(profile?.clinic_id ?? null);
    setClinicNome(
      (profile as unknown as { clinics?: { nome: string } | null })?.clinics?.nome ?? null,
    );
  }

  useEffect(() => {
    let ativo = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, novaSessao) => {
      if (!ativo) return;
      setSession(novaSessao);
      if (event === "SIGNED_OUT") {
        setRole(null);
        setClinicId(null);
        setClinicNome(null);
        setNomeCompleto(null);
      } else if (novaSessao?.user) {
        void carregarPerfil(novaSessao.user.id);
      }
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!ativo) return;
      setSession(data.session);
      await carregarPerfil(data.session?.user.id ?? null);
      setLoading(false);
    })();

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value: AuthState = {
    session,
    userId: session?.user.id ?? null,
    email: session?.user.email ?? null,
    role,
    clinicId,
    clinicNome,
    nomeCompleto,
    loading,
    refresh: async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      await carregarPerfil(data.session?.user.id ?? null);
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return ctx;
}
