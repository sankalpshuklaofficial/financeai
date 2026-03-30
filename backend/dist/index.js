"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const upload_1 = __importDefault(require("./routes/upload"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://*.vercel.app'],
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'FinanceAI Backend Running' });
});
app.get('/', (req, res) => {
    res.json({ message: 'FinanceAI API v1.0' });
});
app.use('/api/transactions', transactions_1.default);
app.use('/api/upload', upload_1.default);
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
exports.default = app;
