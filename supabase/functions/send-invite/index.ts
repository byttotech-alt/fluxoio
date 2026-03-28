// @ts-ignore: Deno module only available in Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// @ts-ignore: Deno global only available in Supabase Edge Functions
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { emails, inviterName } = await req.json();

    if (!emails || !Array.isArray(emails)) {
      throw new Error('Lista de e-mails inválida');
    }

    // Para cada e-mail, dispara pelo Resend (em produção, o ideal é enviar em lote ou assíncrono)
    const promises = emails.map((email: string) => {
      return fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Fluxio <onboarding@resend.dev>', // Modifique para o seu domínio verificado no Resend
          to: [email],
          subject: `${inviterName} convidou você para o Fluxio`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #6C63FF;">Você foi convidado!</h2>
              <p>Olá,</p>
              <p>O administrador <strong>${inviterName}</strong> convidou você para se juntar à equipe na plataforma <strong>Fluxio</strong>.</p>
              <br/>
              <a href="#" style="background: #6C63FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Aceitar Convite e Acessar
              </a>
              <br/><br/>
              <p style="color: #666; font-size: 14px;">Se você não estava aguardando este e-mail, pode ignorá-lo com segurança.</p>
            </div>
          `
        })
      });
    });

    await Promise.all(promises);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
