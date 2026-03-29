import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabase } from '../supabase';

const router = Router();

// GET all transactions
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*), account:accounts(*)')
    .eq('user_id', req.userId)
    .order('date', { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
});

// POST create transaction
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const { title, amount, type, date, category_id, account_id, description, tags } = req.body;

  if (!title || !amount || !type || !date) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: req.userId,
      title,
      amount: parseFloat(amount),
      type,
      date,
      category_id: category_id || null,
      account_id: account_id || null,
      description: description || null,
      tags: tags || [],
      source: 'manual',
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(201).json(data);
});

// PUT update transaction
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', req.userId)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
});

// DELETE transaction
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', req.userId);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ message: 'Deleted successfully' });
});

// GET dashboard stats
router.get('/stats/summary', authenticate, async (req: AuthRequest, res: Response) => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, category:categories(name, color, icon)')
    .eq('user_id', req.userId)
    .gte('date', firstDay)
    .lte('date', lastDay);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const income = data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  res.json({
    monthlyIncome: income,
    monthlyExpense: expense,
    balance: income - expense,
    savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
    transactionCount: data.length,
  });
});

export default router;
