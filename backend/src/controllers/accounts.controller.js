const supabase = require("../config/supabase");

const getAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ accounts: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
};

const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.json({ account: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch account" });
  }
};

const createAccount = async (req, res) => {
  try {
    const accountData = {
      ...req.body,
      user_id: req.user.id,
    };

    const { data, error } = await supabase
      .from("accounts")
      .insert(accountData)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ account: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to create account" });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("accounts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ account: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to update account" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("accounts")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete account" });
  }
};

const getTotalBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("accounts")
      .select("balance")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const balance = data.reduce(
      (sum, account) => sum + (account.balance || 0),
      0
    );
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch total balance" });
  }
};

const updateAccountBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type } = req.body;

    if (!amount || !type || !["credit", "debit"].includes(type)) {
      return res.status(400).json({ error: "Invalid amount or type" });
    }

    const { data: account, error: fetchError } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", id)
      .single();

    if (fetchError || !account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const currentBalance = account.balance || 0;
    const newBalance =
      type === "credit" ? currentBalance + amount : currentBalance - amount;

    const { data, error } = await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ account: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to update account balance" });
  }
};

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  getTotalBalance,
  updateAccountBalance,
};
