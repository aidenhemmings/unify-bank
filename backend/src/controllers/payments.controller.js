const supabase = require("../config/supabase");

/**
 * Retrieves all payments for a specific user.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the payments or an error message.
 */
const getPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ payments: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

/**
 * Retrieves a specific payment by its ID.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the payment or an error message.
 */
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ payment: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment" });
  }
};

/**
 * Creates a new payment for the authenticated user.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the created payment or an error message.
 */
const createPayment = async (req, res) => {
  try {
    const paymentData = {
      ...req.body,
      user_id: req.user.id,
    };

    const { data, error } = await supabase
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ payment: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to create payment" });
  }
};

/**
 * Updates an existing payment.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the updated payment or an error message.
 */
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("payments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ payment: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to update payment" });
  }
};

/**
 * Cancels a payment.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response indicating success or failure.
 */
const cancelPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("payments")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Payment cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel payment" });
  }
};

/**
 * Retrieves pending payments for the authenticated user.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the pending payments and their count or an error message.
 */
const getPendingPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error, count } = await supabase
      .from("payments")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .in("status", ["pending", "processing"])
      .order("scheduled_date", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ payments: data, count: count || 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending payments" });
  }
};

/**
 * Retrieves payments by their status for the authenticated user.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the payments or an error message.
 */
const getPaymentsByStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.params;

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ payments: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments by status" });
  }
};

/**
 * Processes a payment.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the result of the payment processing or an error message.
 */
const processPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.rpc("process_payment", {
      payment_id_param: id,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ result: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to process payment" });
  }
};

/**
 * Processes scheduled payments.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response indicating success or failure.
 */
const processScheduledPayments = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc("process_scheduled_payments");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ result: data });
  } catch (error) {
    res.status(500).json({ error: "Failed to process scheduled payments" });
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  cancelPayment,
  getPendingPayments,
  getPaymentsByStatus,
  processPayment,
  processScheduledPayments,
};
