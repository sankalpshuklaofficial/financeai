"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middleware/auth");
const supabase_1 = require("../supabase");
const csv_parser_1 = __importDefault(require("csv-parser"));
const stream_1 = require("stream");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
// Upload CSV
router.post('/csv', auth_1.authenticate, upload.single('file'), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }
    const results = [];
    const stream = stream_1.Readable.from(req.file.buffer.toString());
    stream.pipe((0, csv_parser_1.default)())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
        const transactions = results.map((row) => {
            const amount = parseFloat(row.amount || row.Amount || row.AMOUNT || '0');
            const type = amount < 0 ? 'expense' : (row.type || row.Type || 'expense');
            return {
                user_id: req.userId,
                title: row.title || row.Title || row.description || row.Description || 'Transaction',
                amount: Math.abs(amount),
                type,
                date: row.date || row.Date || new Date().toISOString().split('T')[0],
                source: 'csv',
            };
        }).filter(t => t.amount > 0);
        if (transactions.length === 0) {
            res.status(400).json({ error: 'No valid transactions found in CSV' });
            return;
        }
        const { data, error } = await supabase_1.supabase
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
exports.default = router;
