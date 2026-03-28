import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Auth callback error:', error.message);
        setError(error.message);
        setTimeout(() => navigate('/auth'), 3000);
      } else if (data.session) {
        navigate('/');
      } else {
        setError('Sessão não encontrada');
        setTimeout(() => navigate('/auth'), 3000);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate('/');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--bg-primary)', color: 'white' }}>
        <h2 style={{ color: 'var(--error-color)' }}>Erro na autenticação</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <p style={{ fontSize: '0.875rem' }}>Redirecionando para o login...</p>
      </div>
    );
  }

  return <LoadingScreen />;
}
