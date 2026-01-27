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
 * Looks up the recipient by account number and sets up approval workflow.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the created payment or an error message.
 */
const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { to_account_number, ...restPaymentData } = req.body;

    // Look up the recipient account to find the recipient user
    let recipientUserId = null;
    let recipientAccountId = null;
    let requiresApproval = false;

    if (to_account_number) {
      const { data: recipientAccount, error: accountError } = await supabase
        .from("accounts")
        .select("id, user_id")
        .eq("account_number", to_account_number)
        .single();

      if (!accountError && recipientAccount) {
        // Only set up approval if the recipient is a different user
        if (recipientAccount.user_id !== userId) {
          recipientUserId = recipientAccount.user_id;
          recipientAccountId = recipientAccount.id;
          requiresApproval = true;
        }
      }
    }

    const paymentData = {
      ...restPaymentData,
      to_account_number,
      user_id: userId,
      recipient_user_id: recipientUserId,
      recipient_account_id: recipientAccountId,
      requires_approval: requiresApproval,
      // If requires approval, status should be pending
      status: requiresApproval
        ? "pending"
        : restPaymentData.status || "pending",
    };

    const { data, error } = await supabase
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res
      .status(201)
      .json({ payment: data, requires_approval: requiresApproval });
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

/**
 * Retrieves incoming pending payments for the authenticated user (payments they need to approve).
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the incoming pending payments or an error message.
 */
const getIncomingPendingPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error, count } = await supabase
      .from("payments")
      .select(
        `
        *,
        sender:users!payments_user_id_fkey(id, first_name, last_name, username, email),
        from_account:accounts!payments_from_account_id_fkey(id, name, account_number)
      `,
        { count: "exact" },
      )
      .eq("recipient_user_id", userId)
      .eq("status", "pending")
      .eq("requires_approval", true)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Include sender info
    const paymentsWithSender = data.map((payment) => ({
      ...payment,
      sender_name: payment.sender
        ? `${payment.sender.first_name || ""} ${payment.sender.last_name || ""}`.trim() ||
          payment.sender.username
        : "Unknown",
      from_account_name: payment.from_account?.name || "Unknown Account",
    }));

    res.json({ payments: paymentsWithSender, count: count || 0 });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch incoming pending payments" });
  }
};

/**
 * Approves an incoming payment and processes the transfer.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the result of the approval or an error message.
 */
const approvePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get the payment details
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .eq("recipient_user_id", userId)
      .eq("status", "pending")
      .single();

    if (fetchError || !payment) {
      return res
        .status(404)
        .json({ error: "Payment not found or already processed" });
    }

    // Get recipient's account using the to_account_number
    const { data: recipientAccount, error: accountError } = await supabase
      .from("accounts")
      .select("*")
      .eq("account_number", payment.to_account_number)
      .eq("user_id", userId)
      .single();

    if (accountError || !recipientAccount) {
      return res.status(400).json({ error: "Recipient account not found" });
    }

    // Get sender's account to deduct the amount
    const { data: senderAccount, error: senderAccountError } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", payment.from_account_id)
      .single();

    if (senderAccountError || !senderAccount) {
      return res.status(400).json({ error: "Sender account not found" });
    }

    // Check if sender has sufficient balance
    if (senderAccount.balance < payment.amount) {
      // Update payment status to failed
      await supabase
        .from("payments")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", id);

      return res
        .status(400)
        .json({ error: "Insufficient funds in sender's account" });
    }

    // Start transaction: Update sender's balance (deduct)
    const { error: deductError } = await supabase
      .from("accounts")
      .update({
        balance: senderAccount.balance - payment.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.from_account_id);

    if (deductError) {
      return res
        .status(500)
        .json({ error: "Failed to deduct from sender's account" });
    }

    // Update recipient's balance (add)
    const { error: addError } = await supabase
      .from("accounts")
      .update({
        balance: recipientAccount.balance + payment.amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recipientAccount.id);

    if (addError) {
      // Rollback sender's deduction
      await supabase
        .from("accounts")
        .update({
          balance: senderAccount.balance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.from_account_id);

      return res
        .status(500)
        .json({ error: "Failed to add to recipient's account" });
    }

    // Create transaction record for recipient (credit)
    const { error: recipientTxError } = await supabase
      .from("transactions")
      .insert({
        account_id: recipientAccount.id,
        description: `Payment from ${payment.recipient_name || "Unknown"}: ${payment.description || "Transfer"}`,
        amount: payment.amount,
        type: "credit",
        category: "Transfer",
        status: "completed",
        reference_number: `PAY-${id.substring(0, 8).toUpperCase()}`,
      });

    if (recipientTxError) {
      console.error(
        "Failed to create recipient transaction:",
        recipientTxError,
      );
    }

    // Create transaction record for sender (debit)
    const { error: senderTxError } = await supabase
      .from("transactions")
      .insert({
        account_id: payment.from_account_id,
        description: `Payment to ${payment.recipient_name}: ${payment.description || "Transfer"}`,
        amount: payment.amount,
        type: "debit",
        category: "Transfer",
        status: "completed",
        reference_number: `PAY-${id.substring(0, 8).toUpperCase()}`,
      });

    if (senderTxError) {
      console.error("Failed to create sender transaction:", senderTxError);
    }

    // Update payment status to completed
    const { data: updatedPayment, error: updateError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        recipient_account_id: recipientAccount.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: "Failed to update payment status" });
    }

    res.json({
      success: true,
      message: "Payment approved and processed successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Error approving payment:", error);
    res.status(500).json({ error: "Failed to approve payment" });
  }
};

/**
 * Declines an incoming payment.
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 * @returns A JSON response containing the result of the decline or an error message.
 */
const declinePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    // Get the payment details
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .eq("recipient_user_id", userId)
      .eq("status", "pending")
      .single();

    if (fetchError || !payment) {
      return res
        .status(404)
        .json({ error: "Payment not found or already processed" });
    }

    // Update payment status to declined
    const { data: updatedPayment, error: updateError } = await supabase
      .from("payments")
      .update({
        status: "declined",
        declined_at: new Date().toISOString(),
        decline_reason: reason || "Declined by recipient",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: "Failed to decline payment" });
    }

    res.json({
      success: true,
      message: "Payment declined successfully",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Error declining payment:", error);
    res.status(500).json({ error: "Failed to decline payment" });
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
  getIncomingPendingPayments,
  approvePayment,
  declinePayment,
};
