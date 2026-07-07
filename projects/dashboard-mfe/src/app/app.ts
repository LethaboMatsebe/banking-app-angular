import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BankingService, UserAccount, TransactionRecord } from '../../../shell/src/app/banking.service';

@Component({
  selector: 'app-dashboard-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  // Read the active profile role state dynamically
  userRole: string = 'user';
  currentUser: UserAccount | null = null;

  // ATM Fields
  transactionAmount: number = 0;

  // Transfer Fields
  transferRecipientEmail: string = '';
  transferAmount: number = 0;

  // Admin Fields
  editingUser: UserAccount | null = null;

  constructor(private bankingService: BankingService, private router: Router) {}

  ngOnInit() {
    this.currentUser = this.bankingService.getCurrentUser();
    if (this.currentUser) {
      this.userRole = this.currentUser.role;
    } else {
      this.router.navigate(['/auth']); // Redirect to login if no profile is active
    }
  }

  get allUsers(): UserAccount[] { return this.bankingService.getUsers(); }
  get allTransactions(): TransactionRecord[] { return this.bankingService.getTransactions(); }
  get userTransactions(): TransactionRecord[] {
    return this.currentUser ? this.bankingService.getUserTransactions(this.currentUser.email) : [];
  }

  handleDeposit() {
    if (this.transactionAmount > 0) {
      this.bankingService.deposit(this.transactionAmount);
      this.transactionAmount = 0;
    }
  }

  handleWithdraw() {
    if (this.transactionAmount > 0) {
      const success = this.bankingService.withdraw(this.transactionAmount);
      if (!success) alert('Insufficient account funds!');
      this.transactionAmount = 0;
    }
  }

  // Inter-account balance transfer action
  handleTransfer() {
    if (!this.currentUser) return;
    if (this.transferAmount <= 0 || !this.transferRecipientEmail) {
      alert('Please fill in valid transfer parameters.');
      return;
    }
    if (this.currentUser.balance < this.transferAmount) {
      alert('Insufficient funds to perform transfer request.');
      return;
    }
    if (this.transferRecipientEmail.toLowerCase() === this.currentUser.email.toLowerCase()) {
      alert('You cannot transfer money to your own email address.');
      return;
    }

    const recipient = this.allUsers.find(u => u.email.toLowerCase() === this.transferRecipientEmail.toLowerCase());
    if (!recipient) {
      alert('Recipient account profile email not found in core registry.');
      return;
    }

    // Execute transfer operations
    this.bankingService.withdraw(this.transferAmount);

    // Add directly to recipient ledger balance manually since service handles current user
    recipient.balance += this.transferAmount;

    // Append tracking logs to the auditing tree
    this.allTransactions.unshift({
      email: this.currentUser.email,
      username: this.currentUser.username,
      type: 'Withdrawal', // Track as a debit on standard history
      amount: this.transferAmount,
      timestamp: new Date()
    });

    alert(`Successfully transferred R ${this.transferAmount} to ${recipient.username}!`);
    this.transferAmount = 0;
    this.transferRecipientEmail = '';
  }

  handleLogout() {
    this.bankingService.setCurrentUser(null);
    this.router.navigate(['/auth']); // Redirect cleanly back to the authentication screen
  }

  handleDeleteUser(email: string) {
    if (confirm('Are you sure you want to remove this account?')) {
      this.bankingService.deleteUser(email);
    }
  }

  startEdit(user: UserAccount) { this.editingUser = { ...user }; }
  saveEdit() {
    if (this.editingUser) {
      this.bankingService.updateUser(this.editingUser);
      this.editingUser = null;
    }
  }
  cancelEdit() { this.editingUser = null; }
}
