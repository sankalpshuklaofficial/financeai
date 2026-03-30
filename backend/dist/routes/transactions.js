"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const supabase_1 = require("../supabase");
const router = (0, express_1.Router)();
// GET all transactions
router.get('/', auth_1.authenticate, async (req, res) => {
    const { data, error } = await supabase_1.supabase
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
router.post('/', auth_1.authenticate, async (req, res) => {
    const { title, amount, type, date, category_id, account_id, description, tags } = req.body;
    if (!title || !amount || !type || !date) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    const { data, error } = await supabase_1.supabase
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
router.put('/:id', auth_1.authenticate, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase_1.supabase
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
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase_1.supabase
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
router.get('/stats/summary', auth_1.authenticate, async (req, res) => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    const { data, error } = await supabase_1.supabase
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
exports.default = router;
