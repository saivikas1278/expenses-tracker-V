import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
    }

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { text, amount } = req.body;
    const supabase = req.app.locals.supabase;

    if (!text || amount === undefined) {
      return res.status(400).json({ message: 'text and amount are required' });
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
          text,
          amount: Number(amount),
          user_id: req.user.id,
        })
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to create transaction', error: error.message });
    }

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create transaction', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    const { data: deletedRows, error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('id');

    if (error) {
      return res.status(500).json({ message: 'Failed to delete transaction', error: error.message });
    }

    if (!deletedRows || deletedRows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete transaction', error: error.message });
  }
});

export default router;
