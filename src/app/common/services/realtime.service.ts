import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environment/environment';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

export interface RealtimePayload<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  table: string;
}

@Injectable({
  providedIn: 'root',
})
export class UbRealtimeService implements OnDestroy {
  private socket: Socket | null = null;
  private subjects: Map<string, Subject<RealtimePayload>> = new Map();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private currentUserId: string | null = null;
  private currentAccountIds: string[] = [];

  /**
   * Observable for connection status
   */
  get isConnected$(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  /**
   * Connect to the backend Socket.io server
   * Should be called after user authentication
   * @param userId The authenticated user's ID
   * @param accountIds Array of user's account IDs
   */
  connect(userId: string, accountIds: string[]): void {
    if (this.socket?.connected && this.currentUserId === userId) {
      // Already connected for this user
      return;
    }

    // Disconnect any existing connection
    this.disconnect();

    this.currentUserId = userId;
    this.currentAccountIds = accountIds;

    // Connect to the backend Socket.io server
    this.socket = io(environment.socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to realtime server, socket id:', this.socket?.id);
      this.connectionStatus.next(true);

      // Subscribe to all user-related channels
      console.log('Subscribing to channels for user:', userId);
      this.socket?.emit('subscribe:accounts', { userId });
      this.socket?.emit('subscribe:payments', { userId });
      this.socket?.emit('subscribe:incoming-payments', { userId });
      this.socket?.emit('subscribe:transactions', { accountIds });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from realtime server');
      this.connectionStatus.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connectionStatus.next(false);
    });

    // Listen for database changes
    this.socket.on('db:change', (payload: RealtimePayload) => {
      console.log(
        'Received db:change event:',
        payload.table,
        payload.eventType,
      );
      this.handleDatabaseChange(payload);
    });
  }

  /**
   * Handle incoming database change from Socket.io
   */
  private handleDatabaseChange(payload: RealtimePayload): void {
    const { table } = payload;
    console.log(
      `handleDatabaseChange: table=${table}, eventType=${payload.eventType}, currentUserId=${this.currentUserId}`,
    );

    // Notify all relevant subjects
    if (table === 'accounts') {
      const subject = this.subjects.get('accounts');
      console.log(`  accounts subject exists: ${!!subject}`);
      if (subject) {
        subject.next(payload);
      }
    } else if (table === 'transactions') {
      const subject = this.subjects.get('transactions');
      console.log(`  transactions subject exists: ${!!subject}`);
      if (subject) {
        subject.next(payload);
      }
    } else if (table === 'payments') {
      // Determine if this is outgoing or incoming
      const outgoingSubject = this.subjects.get('payments:outgoing');
      const incomingSubject = this.subjects.get('payments:incoming');

      const paymentData = payload.new || payload.old;
      console.log(
        `  payments: outgoing subject=${!!outgoingSubject}, incoming subject=${!!incomingSubject}`,
      );
      console.log(
        `  paymentData.user_id=${paymentData?.user_id}, paymentData.recipient_user_id=${paymentData?.recipient_user_id}`,
      );

      if (paymentData) {
        if (paymentData.user_id === this.currentUserId && outgoingSubject) {
          console.log(`  -> Emitting to outgoing payments subject`);
          outgoingSubject.next(payload);
        }
        if (
          paymentData.recipient_user_id === this.currentUserId &&
          incomingSubject
        ) {
          console.log(`  -> Emitting to incoming payments subject`);
          incomingSubject.next(payload);
        }
      }
    }
  }

  /**
   * Subscribe to account changes for the connected user
   * @returns Observable of account changes
   */
  subscribeToUserAccounts(): Observable<RealtimePayload> {
    const key = 'accounts';
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new Subject<RealtimePayload>());
    }
    return this.subjects.get(key)!.asObservable();
  }

  /**
   * Subscribe to all transactions for user's accounts
   * @returns Observable of transaction changes
   */
  subscribeToUserTransactions(): Observable<RealtimePayload> {
    const key = 'transactions';
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new Subject<RealtimePayload>());
    }
    return this.subjects.get(key)!.asObservable();
  }

  /**
   * Subscribe to outgoing payment changes (payments created by user)
   * @returns Observable of payment changes
   */
  subscribeToOutgoingPayments(): Observable<RealtimePayload> {
    const key = 'payments:outgoing';
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new Subject<RealtimePayload>());
    }
    return this.subjects.get(key)!.asObservable();
  }

  /**
   * Subscribe to incoming payment changes (payments received by user)
   * @returns Observable of payment changes
   */
  subscribeToIncomingPayments(): Observable<RealtimePayload> {
    const key = 'payments:incoming';
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new Subject<RealtimePayload>());
    }
    return this.subjects.get(key)!.asObservable();
  }

  /**
   * Update account IDs (call when accounts change)
   * @param accountIds New array of account IDs
   */
  updateAccountIds(accountIds: string[]): void {
    if (
      this.socket?.connected &&
      JSON.stringify(accountIds) !== JSON.stringify(this.currentAccountIds)
    ) {
      this.currentAccountIds = accountIds;
      this.socket.emit('subscribe:transactions', { accountIds });
    }
  }

  /**
   * Disconnect from the Socket.io server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentUserId = null;
    this.currentAccountIds = [];
    this.connectionStatus.next(false);

    // Complete all subjects
    this.subjects.forEach((subject) => subject.complete());
    this.subjects.clear();
  }

  /**
   * Unsubscribe from all channels (for backward compatibility)
   */
  unsubscribeAll(): void {
    this.disconnect();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
