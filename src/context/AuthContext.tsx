import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { getSupabaseClient } from '../lib/supabaseClient';
import { apiUrl } from '../lib/api';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

export interface SignupData {
  email: string;
  password: string;
  role: 'department' | 'startup' | 'validator' | 'admin';
  name: string;
  organization?: string;
  departmentId?: string;
  departmentName?: string;
  startupId?: string;
  startupName?: string;
  validatorId?: string;
  designation?: string;
}

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  session: Session | null;
  token: string | null;
  isLoading: boolean;
  isPublicMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (demo: {
    email: string;
    password?: string;
    role: UserRole;
    name: string;
    organization?: string;
    designation?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchToPublicMode: () => void;
  exitPublicMode: () => void;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPublicMode, setIsPublicMode] = useState<boolean>(false);

  // Derive current active role:
  // If user is logged in and not explicitly exploring in public mode, use currentUser.role
  // Otherwise, fallback to 'public'
  const currentRole: UserRole = currentUser && !isPublicMode ? currentUser.role : 'public';

  // Helper to sync user record with backend
  const syncUserWithBackend = useCallback(async (
    authId: string,
    email: string,
    additionalDetails: Partial<User> = {},
    token?: string
  ): Promise<User | null> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(apiUrl('/api/auth/sync-user'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          authId,
          email,
          ...additionalDetails,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.user as User;
      }
    } catch (err) {
      console.warn('[AuthContext] syncUserWithBackend failed:', err);
    }
    return null;
  }, []);

  // Fetch or sync user profile based on Supabase session
  const loadUserProfile = useCallback(async (currentSession: Session, client: SupabaseClient) => {
    const authUser = currentSession.user;
    if (!authUser) return;

    // Check if user has metadata from signup
    const meta = authUser.user_metadata || {};
    const role = (meta.role as UserRole) || 'department';
    const name = meta.name || authUser.email?.split('@')[0] || 'User';

    const synced = await syncUserWithBackend(
      authUser.id,
      authUser.email || '',
      {
        name,
        role,
        organization: meta.organization,
        departmentId: meta.departmentId,
        departmentName: meta.departmentName,
        startupId: meta.startupId,
        startupName: meta.startupName,
        validatorId: meta.validatorId,
        designation: meta.designation,
      },
      currentSession.access_token
    );

    if (synced) {
      setCurrentUser(synced);
    } else {
      // Fallback user object if sync call had network lag
      setCurrentUser({
        id: `u-${authUser.id.substring(0, 8)}`,
        authId: authUser.id,
        name,
        email: authUser.email || '',
        role,
        organization: meta.organization || 'Registered Entity',
      });
    }
  }, [syncUserWithBackend]);

  // Initialize Supabase and check existing session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      setIsLoading(true);
      try {
        const client = await getSupabaseClient();
        if (!mounted) return;

        if (client) {
          setSupabase(client);

          // Get initial session
          const { data: { session: initSession } } = await client.auth.getSession();
          if (initSession && mounted) {
            setSession(initSession);
            await loadUserProfile(initSession, client);
          }

          // Subscribe to auth state changes
          const { data: { subscription } } = client.auth.onAuthStateChange(
            async (_event, newSession) => {
              if (!mounted) return;
              setSession(newSession);
              if (newSession) {
                await loadUserProfile(newSession, client);
              } else {
                setCurrentUser(null);
              }
            }
          );

          return () => {
            subscription.unsubscribe();
          };
        }
      } catch (err) {
        console.error('[AuthContext] Initialization failed:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, [loadUserProfile]);

  // Login handler
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const client = supabase || (await getSupabaseClient());
      if (!client) {
        return { success: false, error: 'Authentication service not initialized. Check Supabase connection.' };
      }

      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        setSession(data.session);
        setIsPublicMode(false);
        await loadUserProfile(data.session, client);
        return { success: true };
      }

      return { success: false, error: 'Login session could not be established.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred during login.' };
    }
  };

  // Signup handler
  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      const client = supabase || (await getSupabaseClient());
      if (!client) {
        console.error('[Auth] Supabase client initialization failed before signUp');
        return { success: false, error: 'Authentication service not initialized. Please refresh and try again.' };
      }

      // Step 2: Calling Supabase auth
      console.log('[Auth] calling Supabase auth (signUp)...', {
        email: data.email.trim(),
        role: data.role,
        name: data.name,
        organization: data.organization,
      });

      // 1. Sign up user in Supabase Auth with metadata
      const { data: authData, error: authError } = await client.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            role: data.role,
            name: data.name,
            organization: data.organization,
            departmentId: data.departmentId,
            departmentName: data.departmentName,
            startupId: data.startupId,
            startupName: data.startupName,
            validatorId: data.validatorId,
            designation: data.designation,
          },
        },
      });

      // Step 3: Auth response received
      console.log('[Auth] auth response received from Supabase:', {
        user: authData?.user?.id,
        email: authData?.user?.email,
        hasSession: Boolean(authData?.session),
        identitiesCount: authData?.user?.identities?.length,
        error: authError ? { message: authError.message, status: authError.status, name: authError.name } : null,
      });

      if (authError) {
        const msg = authError.message.toLowerCase();
        const code = (authError as any)?.code || '';

        // If email is already registered, attempt seamless sign-in with the provided password
        if (msg.includes('already registered') || msg.includes('already exists') || code === 'user_already_exists') {
          console.info('[Auth] Email already registered. Attempting automatic sign-in with provided password...');
          try {
            const signInRes = await client.auth.signInWithPassword({
              email: data.email.trim(),
              password: data.password,
            });

            if (signInRes.data?.session) {
              setSession(signInRes.data.session);
              setIsPublicMode(false);
              await loadUserProfile(signInRes.data.session, client);
              return { success: true };
            }
          } catch (autoLoginErr) {
            console.warn('[Auth] Auto sign-in for existing user notice:', autoLoginErr);
          }

          console.warn('[Auth] User already registered with this email:', data.email.trim());
          return {
            success: false,
            error: 'An account with this email address already exists. Please switch to the Sign In tab.',
          };
        }

        console.error('[Auth] Supabase signUp failed:', authError.message);
        let friendlyError = authError.message;

        if (msg.includes('rate limit') || code === 'over_email_send_rate_limit') {
          friendlyError = 'Supabase email send rate limit exceeded (free tier throttle). Please wait a few minutes, or use a 1-Click Demo Account above.';
        } else if (msg.includes('password') && (msg.includes('short') || msg.includes('weak') || msg.includes('least'))) {
          friendlyError = 'Password is too weak. Please choose a password with at least 6 characters.';
        } else if (msg.includes('invalid') || code === 'email_address_invalid') {
          friendlyError = 'Email address is invalid or not accepted by the authentication provider. Please use a valid email (e.g. name@department.gov.in or name@gmail.com).';
        } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
          friendlyError = 'Network error connecting to Supabase. Please check your internet connection.';
        }
        return { success: false, error: friendlyError };
      }

      // Check if user already exists (Supabase returns empty identities array when email confirmation is active and user exists)
      if (authData.user && Array.isArray(authData.user.identities) && authData.user.identities.length === 0) {
        console.info('[Auth] Supabase returned empty identities array: email is already registered. Attempting sign-in...');
        try {
          const signInRes = await client.auth.signInWithPassword({
            email: data.email.trim(),
            password: data.password,
          });

          if (signInRes.data?.session) {
            setSession(signInRes.data.session);
            setIsPublicMode(false);
            await loadUserProfile(signInRes.data.session, client);
            return { success: true };
          }
        } catch (autoLoginErr) {
          console.warn('[Auth] Auto sign-in notice for existing email:', autoLoginErr);
        }

        return {
          success: false,
          error: 'An account with this email address already exists. Please switch to the Sign In tab.',
        };
      }

      const authId = authData.user?.id;
      if (!authId) {
        return { success: false, error: 'User registration failed in authentication service (no user ID returned).' };
      }

      // Step 4: Inserting user profile
      const userProfilePayload = {
        id: `u-${authId.substring(0, 8)}`,
        auth_id: authId,
        name: data.name,
        role: data.role,
        email: data.email.trim().toLowerCase(),
        organization:
          data.organization ||
          (data.role === 'department'
            ? data.departmentName || 'Government Department'
            : data.role === 'startup'
            ? data.startupName || 'Startup Innovator'
            : data.role === 'validator'
            ? 'Empanelled Quality Council'
            : 'MSInS State Directorate'),
        department_id: data.departmentId || null,
        department_name: data.departmentName || null,
        startup_id: data.startupId || null,
        startup_name: data.startupName || null,
        validator_id: data.validatorId || null,
        designation:
          data.designation ||
          (data.role === 'department'
            ? 'Nodal Officer'
            : data.role === 'startup'
            ? 'Founder & Tech Lead'
            : data.role === 'validator'
            ? 'Lead Technical Auditor'
            : 'State Innovation Director'),
      };

      console.log('[Auth] inserting user profile into users table...', userProfilePayload);

      // Direct Supabase table insert / upsert
      let directInsertResult: any = null;
      try {
        const { data: insertedData, error: insertError } = await client
          .from('users')
          .upsert(userProfilePayload, { onConflict: 'email' })
          .select()
          .maybeSingle();

        if (insertError) {
          console.warn('[Auth] Direct Supabase users table upsert notice:', insertError.message);
        } else {
          directInsertResult = insertedData;
          console.log('[Auth] Direct Supabase users table upsert succeeded:', insertedData?.id);
        }
      } catch (directErr: any) {
        console.warn('[Auth] Direct Supabase table upsert exception:', directErr?.message || directErr);
      }

      // Also sync user with backend server store for full consistency
      const syncedUser = await syncUserWithBackend(
        authId,
        data.email.trim(),
        {
          role: data.role,
          name: data.name,
          organization: userProfilePayload.organization,
          departmentId: data.departmentId,
          departmentName: data.departmentName,
          startupId: data.startupId,
          startupName: data.startupName,
          validatorId: data.validatorId,
          designation: userProfilePayload.designation,
        },
        authData.session?.access_token
      );

      const finalUser = syncedUser || (directInsertResult as User) || (userProfilePayload as any);

      // Step 5: Profile insert response
      console.log('[Auth] profile insert response:', {
        success: true,
        user: finalUser,
        directDbSaved: Boolean(directInsertResult),
        syncedWithServer: Boolean(syncedUser),
      });

      if (authData.session) {
        setSession(authData.session);
        setCurrentUser(finalUser);
        setIsPublicMode(false);
      } else {
        // In case email confirmation is not strictly blocking, auto attempt sign in
        try {
          const signInRes = await client.auth.signInWithPassword({
            email: data.email.trim(),
            password: data.password,
          });
          if (signInRes.data?.session) {
            setSession(signInRes.data.session);
            setCurrentUser(finalUser);
            setIsPublicMode(false);
          } else if (signInRes.error?.message?.includes('Email not confirmed')) {
            return {
              success: true,
              error: 'Account created! Please check your email inbox to confirm your account before signing in.',
            };
          }
        } catch (signInErr) {
          console.log('[Auth] Auto sign-in notice after signup:', signInErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error('[Auth] Unexpected error during signup process:', err);
      return { success: false, error: err.message || 'An unexpected error occurred during signup.' };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[AuthContext] SignOut error:', err);
    } finally {
      setSession(null);
      setCurrentUser(null);
      setIsPublicMode(false);
    }
  };

  // Demo user login with reliable fallback
  const loginAsDemo = async (demo: {
    email: string;
    password?: string;
    role: UserRole;
    name: string;
    organization?: string;
    designation?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const client = supabase || (await getSupabaseClient());

      // Attempt Supabase signIn if password is provided
      if (demo.password && client) {
        try {
          const { data, error } = await client.auth.signInWithPassword({
            email: demo.email.trim(),
            password: demo.password,
          });
          if (data?.session) {
            setSession(data.session);
            setIsPublicMode(false);
            await loadUserProfile(data.session, client);
            return { success: true };
          }
        } catch (signInErr) {
          console.warn('[AuthContext] Demo sign-in with password fallback notice:', signInErr);
        }
      }

      // Establish session with backend sync
      const synced = await syncUserWithBackend(
        `demo-${demo.role}`,
        demo.email.trim(),
        {
          name: demo.name,
          role: demo.role,
          organization: demo.organization,
          designation: demo.designation,
        }
      );

      const demoUser: User = synced || {
        id: `u-demo-${demo.role}`,
        authId: `demo-${demo.role}`,
        name: demo.name,
        email: demo.email.trim(),
        role: demo.role,
        organization: demo.organization || 'GovTech Innovation Ecosystem',
      };

      setCurrentUser(demoUser);
      setIsPublicMode(false);
      return { success: true };
    } catch (err: any) {
      console.warn('[AuthContext] loginAsDemo notice:', err);
      return { success: false, error: err.message || 'Failed to login as demo user' };
    }
  };

  const switchToPublicMode = () => {
    setIsPublicMode(true);
  };

  const exitPublicMode = () => {
    setIsPublicMode(false);
  };

  // Authenticated fetch wrapper injecting Bearer token and role headers
  const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});

    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    if (currentUser) {
      headers.set('x-user-id', currentUser.id);
      headers.set('x-user-role', currentUser.role);
      if (currentUser.authId) {
        headers.set('x-auth-id', currentUser.authId);
      }
    } else {
      headers.set('x-user-role', 'public');
    }

    return fetch(apiUrl(url), {
      ...options,
      headers,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        session,
        token: session?.access_token || null,
        isLoading,
        isPublicMode,
        login,
        signup,
        loginAsDemo,
        logout,
        switchToPublicMode,
        exitPublicMode,
        authenticatedFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
