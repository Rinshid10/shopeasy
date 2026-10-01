"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface AuthUserState {
  /** False until the session has been read in the browser. */
  isLoaded: boolean;
  /** The signed-in user (a guest is an anonymous user), or null if nobody is signed in. */
  user: User | null;
}

/** The visitor's Supabase user, kept up to date as they sign in and out. For display only. */
export function useAuthUser(): AuthUserState {
  const [state, setState] = useState<AuthUserState>({ isLoaded: false, user: null });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let isActive = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (isActive) setState({ isLoaded: true, user: data.session?.user ?? null });
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ isLoaded: true, user: session?.user ?? null });
    });

    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
