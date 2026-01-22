import { NextResponse } from 'next/server';
import { runBotEngine } from '@/../backend/src/services/botEngine';

export const dynamic = 'force-dynamic'; // Garante que não faça cache

export async function GET(request: Request) {
  try {
    // Validação opcional de segurança (Recomendado para produção)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const result = await runBotEngine();

    return NextResponse.json({ 
        success: result.success, 
        processed: result.count,
        logs: result.logs 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
