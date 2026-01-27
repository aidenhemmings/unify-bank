const supabase = require("../config/supabase");

class RealtimeService {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map();
    this.channels = new Map();
  }

  initialize() {
    this.io.on("connection", (socket) => {
      socket.on("subscribe:accounts", (data) => {
        const { userId } = data;
        if (!userId) {
          socket.emit("error", { message: "User ID required" });
          return;
        }
        this.addSocketToUser(socket, userId);
        this.subscribeToUserAccounts(userId);
      });

      socket.on("subscribe:payments", (data) => {
        const { userId } = data;
        if (!userId) {
          socket.emit("error", { message: "User ID required" });
          return;
        }
        this.addSocketToUser(socket, userId);
        this.subscribeToUserPayments(userId);
      });

      socket.on("subscribe:incoming-payments", (data) => {
        const { userId } = data;
        if (!userId) {
          socket.emit("error", { message: "User ID required" });
          return;
        }
        this.addSocketToUser(socket, userId);
        this.subscribeToIncomingPayments(userId);
      });

      socket.on("subscribe:transactions", (data) => {
        const { accountIds } = data;
        if (!accountIds || accountIds.length === 0) {
          return;
        }
        const userId = socket.userId;
        if (!userId) {
          socket.emit("error", { message: "Subscribe to accounts first" });
          return;
        }
        this.subscribeToUserTransactions(userId, accountIds);
      });

      socket.on("disconnect", () => {
        if (socket.userId) {
          const userSocketSet = this.userSockets.get(socket.userId);
          if (userSocketSet) {
            userSocketSet.delete(socket.id);
            if (userSocketSet.size === 0) {
              this.userSockets.delete(socket.userId);
              this.cleanupUserSubscriptions(socket.userId);
            }
          }
        }
      });
    });
  }

  addSocketToUser(socket, userId) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket.id);
    socket.userId = userId;
  }

  subscribeToUserAccounts(userId) {
    const channelKey = `accounts:${userId}`;
    if (this.channels.has(channelKey)) return;

    const channel = supabase
      .channel(channelKey)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "accounts",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          this.emitToUser(userId, "db:change", {
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
            table: "accounts",
          });
        },
      )
      .subscribe();

    this.channels.set(channelKey, channel);
  }

  subscribeToUserPayments(userId) {
    const channelKey = `payments:${userId}`;
    if (this.channels.has(channelKey)) return;

    const channel = supabase
      .channel(channelKey)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          this.emitToUser(userId, "db:change", {
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
            table: "payments",
          });
        },
      )
      .subscribe();

    this.channels.set(channelKey, channel);
  }

  subscribeToIncomingPayments(userId) {
    const channelKey = `incoming-payments:${userId}`;
    if (this.channels.has(channelKey)) return;

    const channel = supabase
      .channel(channelKey)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "payments",
          filter: `recipient_user_id=eq.${userId}`,
        },
        (payload) => {
          this.emitToUser(userId, "db:change", {
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
            table: "payments",
          });
        },
      )
      .subscribe();

    this.channels.set(channelKey, channel);
  }

  subscribeToUserTransactions(userId, accountIds) {
    const channelKey = `transactions:${userId}`;
    if (this.channels.has(channelKey)) return;

    const channel = supabase
      .channel(channelKey)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
        },
        (payload) => {
          const accountId = payload.new?.account_id || payload.old?.account_id;
          if (accountIds.includes(accountId)) {
            this.emitToUser(userId, "db:change", {
              eventType: payload.eventType,
              new: payload.new,
              old: payload.old,
              table: "transactions",
            });
          }
        },
      )
      .subscribe();

    this.channels.set(channelKey, channel);
  }

  emitToUser(userId, event, data) {
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.forEach((socketId) => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  cleanupUserSubscriptions(userId) {
    const keysToRemove = [];

    this.channels.forEach((channel, key) => {
      if (key.includes(userId)) {
        try {
          if (channel && typeof channel.unsubscribe === "function") {
            channel.unsubscribe();
          }
        } catch (err) {
          // Silent cleanup
        }
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => this.channels.delete(key));
  }
}

module.exports = RealtimeService;
