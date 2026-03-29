import { Router, Response } from 'express';
import multer from 'multer';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabase } from '../supabase';
import csv from 'csv-parser';
import { Readable } from 'stream';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Upload CSV
router.post('/csv', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const results: Record<string, string>[] = [];

  const stream = Readable.from(req.file.buffer.toString());
  stream.pipe(csv())
    .on('data', (data: Record<string, string>) => results.push(data))
    .on('end', async () => {
      const transactions = results.map((row) => {
        const amount = parseFloat(
          row.amount || row.Amount || row.AMOUNT || '0'
        );
        const type = amount < 0 ? 'expense' : (
          row.type || row.Type || 'expense'
        );

        return {
          user_id: req.userId,
          title: row.title || row.Title || row.description || row.Description || 'Transaction',
          amount: Math.abs(amount),
          type,
          date: row.date || row.Date || new Date().toISOString().split('T')[0],
          source: 'csv' as const,
        };
      }).filter(t => t.amount > 0);

      if (transactions.length === 0) {
        res.status(400).json({ error: 'No valid transactions found in CSV' });
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactions)
        .select();

      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }

      res.json({
        message: 'CSV imported successfully',
        imported: data.length,
        transactions: data,
      });
    })
    .on('error', () => {
      res.status(500).json({ error: 'Failed to parse CSV' });
    });
});

export default router;