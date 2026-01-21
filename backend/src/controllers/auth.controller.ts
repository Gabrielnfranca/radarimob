import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class AuthController {
  
  // Login simples repassando para o Supabase
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return res.json({
        user: data.user,
        session: data.session
      });

    } catch (error: any) {
      return res.status(401).json({ error: error.message || 'Falha na autenticação' });
    }
  }

  // Cadastro rápido para facilitar testes do MVP
  static async register(req: Request, res: Response) {
    const { email, password, fullName } = req.body;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName } // Salva meta-dados
        }
      });

      if (error) throw error;

      return res.json({ message: 'Usuário criado. Verifique seu email ou faça login (se confirmação estiver desligada).', data });

    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
