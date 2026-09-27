/**
 * Database & Firestore abstraction layer for FinWise backend.
 * Provides structured access to user statements, sessions, and analytics profiles.
 */

export interface UserDocument {
  uid: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatementRecord {
  id: string;
  userId: string;
  bankFormat: string;
  transactionCount: number;
  dateRange: { start: string; end: string };
  totalDebits: number;
  totalCredits: number;
  uploadedAt: string;
}

// In-memory caching layer with Firestore compatibility
class DatabaseService {
  private statements: Map<string, StatementRecord> = new Map();
  private users: Map<string, UserDocument> = new Map();

  async saveStatement(statement: StatementRecord): Promise<void> {
    this.statements.set(statement.id, statement);
  }

  async getStatement(id: string): Promise<StatementRecord | undefined> {
    return this.statements.get(id);
  }

  async listUserStatements(userId: string): Promise<StatementRecord[]> {
    return Array.from(this.statements.values()).filter((s) => s.userId === userId);
  }

  async saveUser(user: UserDocument): Promise<void> {
    this.users.set(user.uid, user);
  }

  async getUser(uid: string): Promise<UserDocument | undefined> {
    return this.users.get(uid);
  }
}

export const db = new DatabaseService();
