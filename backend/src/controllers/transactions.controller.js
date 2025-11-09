const supabase = require("../config/supabase");

const getTransactionsByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { limit } = req.query;

    let query = supabase
      .from("transactions")
      .select("*")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const transactions = data.map((t) => ({
      ...t,
      date: new Date(t.created_at),
    }));

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit } = req.query;

    let query = supabase
      .from("transactions")
      .select("*, accounts!inner(user_id)")
      .eq("accounts.user_id", userId)
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const transactions = data.map((t) => ({
      id: t.id,
      account_id: t.account_id,
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
      status: t.status,
      reference_number: t.reference_number,
      date: new Date(t.created_at),
      created_at: t.created_at,
      updated_at: t.updated_at,
    }));

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const transaction = {
      ...data,
      date: new Date(data.created_at),
    };

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
};

const createTransaction = async (req, res) => {
  try {
    const transactionData = req.body;

    const { data, error } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const transaction = {
      ...data,
      date: new Date(data.created_at),
    };

    res.status(201).json({ transaction });
  } catch (error) {
    res.status(500).json({ error: "Failed to create transaction" });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const transaction = {
      ...data,
      date: new Date(data.created_at),
    };

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ error: "Failed to update transaction" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete transaction" });
  }
};

const getTransactionsByCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.params;

    const { data, error } = await supabase
      .from("transactions")
      .select("*, accounts!inner(user_id)")
      .eq("accounts.user_id", userId)
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const transactions = data.map((t) => ({
      ...t,
      date: new Date(t.created_at),
    }));

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transactions by category" });
  }
};

const getMonthlyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.params;

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const { data, error } = await supabase
      .from("transactions")
      .select("amount, type, accounts!inner(user_id)")
      .eq("accounts.user_id", userId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .eq("status", "completed");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const income = data
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const expenses = data
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    res.json({ income, expenses });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch monthly stats" });
  }
};

module.exports = {
  getTransactionsByAccount,
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByCategory,
  getMonthlyStats,
};
