import crypto from 'crypto';

const memoryState = {
  users: [],
  transactions: [],
};

export function createMemoryUser({ name, email, password }) {
  const user = {
    _id: crypto.randomUUID(),
    name,
    email,
    password,
    createdAt: new Date(),
  };

  memoryState.users.push(user);
  return user;
}

export function findMemoryUserByEmail(email) {
  return memoryState.users.find((user) => user.email === email) || null;
}

export function createMemoryTransaction({ text, amount, user }) {
  const transaction = {
    _id: crypto.randomUUID(),
    text,
    amount,
    user,
    createdAt: new Date(),
  };

  memoryState.transactions.push(transaction);
  return transaction;
}

export function getMemoryTransactionsByUser(userId) {
  return memoryState.transactions
    .filter((transaction) => transaction.user === userId)
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
}

export function deleteMemoryTransactionByIdAndUser(id, userId) {
  const transactionIndex = memoryState.transactions.findIndex(
    (transaction) => transaction._id === id && transaction.user === userId
  );

  if (transactionIndex === -1) {
    return false;
  }

  memoryState.transactions.splice(transactionIndex, 1);
  return true;
}
