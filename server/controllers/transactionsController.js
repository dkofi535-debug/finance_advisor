const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require('../services/transactionsService');

const validateTransactionPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    const error = new Error('Request body is required.');
    error.statusCode = 400;
    throw error;
  }

  const { type, category, amount, description, transaction_date } = payload;

  if (!type || typeof type !== 'string') {
    const error = new Error('Type is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!['income', 'expense'].includes(type.trim().toLowerCase())) {
    const error = new Error('Type must be either income or expense.');
    error.statusCode = 400;
    throw error;
  }

  if (!category || typeof category !== 'string' || !category.trim()) {
    const error = new Error('Category is required.');
    error.statusCode = 400;
    throw error;
  }

  if (amount === undefined || amount === null || amount === '') {
    const error = new Error('Amount is required.');
    error.statusCode = 400;
    throw error;
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    const error = new Error('Amount must be a positive number.');
    error.statusCode = 400;
    throw error;
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    const error = new Error('Description is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!transaction_date || typeof transaction_date !== 'string' || !transaction_date.trim()) {
    const error = new Error('Transaction date is required.');
    error.statusCode = 400;
    throw error;
  }

  const parsedDate = new Date(transaction_date);

  if (Number.isNaN(parsedDate.getTime())) {
    const error = new Error('Transaction date must be a valid date.');
    error.statusCode = 400;
    throw error;
  }

  return {
    type: type.trim().toLowerCase(),
    category: category.trim(),
    amount: numericAmount,
    description: description.trim(),
    transaction_date: parsedDate.toISOString().split('T')[0],
  };
};

const create = async (req, res, next) => {
  try {
    const transactionData = validateTransactionPayload(req.body);
    const transaction = await createTransaction({
      userId: req.user.id,
      ...transactionData,
    });

    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully.',
      transaction,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const transactions = await getTransactions(req.user.id);

    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const transaction = await getTransactionById(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const transactionData = validateTransactionPayload({
      ...req.body,
      transaction_date: req.body.transaction_date || undefined,
    });

    const transaction = await updateTransaction(req.user.id, req.params.id, transactionData);

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      transaction,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await deleteTransaction(req.user.id, req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    next(error);
  }
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
