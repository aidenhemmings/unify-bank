const supabase = require("../config/supabase");

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
