import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class AlertsController {

  static async list(req: Request, res: Response) {
    try {
      const { region, neighborhood, page = 1 } = req.query;
      
      // Paginação simples
      const limit = 20;
      const from = (Number(page) - 1) * limit;
      const to = from + limit - 1;

      // Inicia a query na tabela de sinais
      // Seleciona também os dados da Location e Source relacionadas
      let query = supabase
        .from('intent_signals')
        .select(`
          *,
          locations!inner(region, neighborhood, city),
          sources(name, platform)
        `)
        .order('posted_at', { ascending: false })
        .range(from, to);

      // Filtros Dinâmicos
      if (region) {
        // Filtra na tabela relacionada 'locations'
        query = query.eq('locations.region', region);
      }
      
      if (neighborhood) {
        query = query.eq('locations.neighborhood', neighborhood);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return res.json({
        data,
        page: Number(page),
        hasMore: (data?.length || 0) === limit
      });

    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar alertas' });
    }
  }

  static async getById(req: Request, res: Response) {
      // Implementação futura para detalhes
      return res.json({ not_implemented: true });
  }
}
