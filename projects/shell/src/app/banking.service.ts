import { Injectable } from '@angular/core';

export interface UserAccount {
  username: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
  password?: string;
  balance: number;
}

export interface TransactionRecord {
  email: string;
  username: string;
  type: 'Deposit' | 'Withdrawal';
  amount: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BankingService {
  private users: UserAccount[] = [];
  private transactions: TransactionRecord[] = [];
  private currentUser: UserAccount | null = null;

  constructor() {
    this.loadDataFromStorage();
  }

  // 1. Sync engine to pull structural entries on startup
  private loadDataFromStorage() {
    const savedUsers = localStorage.getItem('bank_users');
    const savedTx = localStorage.getItem('bank_transactions');

    if (savedUsers) {
      this.users = JSON.parse(savedUsers);
    } else {
      this.users = [];
    }

    if (savedTx) {
      this.transactions = JSON.parse(savedTx);
    } else {
      this.transactions = [];
    }
  }

  // 2. Local persistence sync save wrappers
  private saveDataToStorage() {
    localStorage.setItem('bank_users', JSON.stringify(this.users));
    localStorage.setItem('bank_transactions', JSON.stringify(this.transactions));
  }

  getUsers(): UserAccount[] {
    return this.users;
  }

  // 3. Robust email duplicate lookup check criteria rule
  isEmailRegistered(email: string): boolean {
    if (!email) return false;
    return this.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  registerUser(newUser: UserAccount) {
    // Secondary safety defense confirmation trap check
    if (this.isEmailRegistered(newUser.email)) {
      return;
    }
    this.users.push({ ...newUser, balance: 0 });
    this.saveDataToStorage(); // Write changes to disk immediately
  }

  deleteUser(email: string) {
    this.users = this.users.filter(u => u.email !== email);
    this.saveDataToStorage();
  }

  updateUser(updatedUser: UserAccount) {
    const index = this.users.findIndex(u => u.email === updatedUser.email);
    if (index !== -1) {
      this.users[index].username = updatedUser.username;
      this.users[index].role = updatedUser.role;
      this.saveDataToStorage();
    }
  }

  setCurrentUser(user: UserAccount | null) {
    this.currentUser = user;
  }

  getCurrentUser(): UserAccount | null {
    return this.currentUser;
  }

  getTransactions(): TransactionRecord[] {
    return this.transactions;
  }

  getUserTransactions(email: string): TransactionRecord[] {
    return this.transactions.filter(tx => tx.email === email);
  }

  deposit(amount: number) {
    if (this.currentUser && amount > 0) {
      this.currentUser.balance += amount;

      const matchingUser = this.users.find(u => u.email === this.currentUser?.email);
      if (matchingUser) matchingUser.balance = this.currentUser.balance;

      this.transactions.unshift({
        email: this.currentUser.email,
        username: this.currentUser.username,
        type: 'Deposit',
        amount: amount,
        timestamp: new Date()
      });
      this.saveDataToStorage(); // Cache calculations
    }
  }

  withdraw(amount: number): boolean {
    if (this.currentUser && amount > 0 && this.currentUser.balance >= amount) {
      this.currentUser.balance -= amount;

      const matchingUser = this.users.find(u => u.email === this.currentUser?.email);
      if (matchingUser) matchingUser.balance = this.currentUser.balance;

      this.transactions.unshift({
        email: this.currentUser.email,
        username: this.currentUser.username,
        type: 'Withdrawal',
        amount: amount,
        timestamp: new Date()
      });
      this.saveDataToStorage(); // Cache calculations
      return true;
    }
    return false;
  }
}
