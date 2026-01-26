const supabase = require("../config/supabase");

/**
 * Retrieves all accounts for a specific user.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the accounts or an error message.
 */
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

/**
 * Retrieves a specific account by its ID.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the account or an error message.
 */
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

/**
 * Creates a new account for the authenticated user.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the created account or an error message.
 */
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

/**
 * Updates an existing account.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the updated account or an error message.
 */
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

/**
 * Deletes an account by setting its is_active flag to false.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response indicating success or failure.
 */
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

/**
 * Retrieves the total balance of all active accounts for a specific user.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the total balance or an error message.
 */
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

/**
 * Updates the balance of an account.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the updated account or an error message.
 */
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
