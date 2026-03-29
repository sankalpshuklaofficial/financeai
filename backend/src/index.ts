import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import transactionsRouter from './routes/transactions';
import uploadRouter from './routes/upload';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'https://*.vercel.app'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'FinanceAI Backend Running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'FinanceAI API v1.0' });
});

app.use('/api/transactions', transactionsRouter);
app.use('/api/upload', uploadRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});

export default app;