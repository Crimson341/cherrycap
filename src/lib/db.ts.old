import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync } from 'fs';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dataDir = path.join(process.cwd(), 'data');
    mkdirSync(dataDir, { recursive: true });
    const dbPath = path.join(dataDir, 'raffle.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  const database = db!;

  database.exec(`
    CREATE TABLE IF NOT EXISTS raffle_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      ipAddress TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      profession TEXT NOT NULL,
      skills TEXT NOT NULL,
      portfolioUrl TEXT,
      linkedinUrl TEXT,
      bio TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS raffle_winners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entryId INTEGER NOT NULL UNIQUE,
      wonAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      portfolioUrl TEXT,
      status TEXT DEFAULT 'pending',
      hostingExpiresAt DATETIME,
      supportExpiresAt DATETIME,
      FOREIGN KEY (entryId) REFERENCES raffle_entries(id)
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      expiresAt DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ipAddress TEXT NOT NULL,
      attempts INTEGER DEFAULT 1,
      lastAttempt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(ipAddress)
    );

    CREATE INDEX IF NOT EXISTS idx_raffle_entries_email ON raffle_entries(email);
    CREATE INDEX IF NOT EXISTS idx_raffle_winners_status ON raffle_winners(status);
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
    CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ipAddress);
  `);
}

export interface RaffleEntry {
  id?: number;
  email: string;
  ipAddress: string;
  firstName: string;
  lastName: string;
  profession: string;
  skills: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  bio?: string;
  createdAt?: string;
}

export interface RaffleWinner extends RaffleEntry {
  wonAt?: string;
  portfolioUrl?: string;
  status?: string;
  hostingExpiresAt?: string;
  supportExpiresAt?: string;
}

export function createRaffleEntry(entry: RaffleEntry): RaffleEntry {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO raffle_entries (email, ipAddress, firstName, lastName, profession, skills, portfolioUrl, linkedinUrl, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    entry.email,
    entry.ipAddress,
    entry.firstName,
    entry.lastName,
    entry.profession,
    entry.skills,
    entry.portfolioUrl || null,
    entry.linkedinUrl || null,
    entry.bio || null
  );

  return {
    ...entry,
    id: result.lastInsertRowid as number,
  };
}

export function getRaffleEntry(email: string): RaffleEntry | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM raffle_entries WHERE email = ?');
  return stmt.get(email) as RaffleEntry | null;
}

export function getAllRaffleEntries(): RaffleEntry[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM raffle_entries ORDER BY createdAt DESC');
  return stmt.all() as RaffleEntry[];
}

export function getRaffleWinners(): RaffleWinner[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT re.*, rw.wonAt, rw.portfolioUrl, rw.status, rw.hostingExpiresAt, rw.supportExpiresAt
    FROM raffle_winners rw
    JOIN raffle_entries re ON rw.entryId = re.id
    ORDER BY rw.wonAt DESC
  `);
  return stmt.all() as RaffleWinner[];
}

export function markAsWinner(entryId: number): RaffleWinner | null {
  const db = getDb();
  
  const hostingExpires = new Date();
  hostingExpires.setMonth(hostingExpires.getMonth() + 3);
  
  const supportExpires = new Date();
  supportExpires.setMonth(supportExpires.getMonth() + 3);

  const stmt = db.prepare(`
    INSERT INTO raffle_winners (entryId, status, hostingExpiresAt, supportExpiresAt)
    VALUES (?, 'pending', ?, ?)
  `);

  stmt.run(entryId, hostingExpires.toISOString(), supportExpires.toISOString());

  const winnerStmt = db.prepare(`
    SELECT re.*, rw.wonAt, rw.portfolioUrl, rw.status, rw.hostingExpiresAt, rw.supportExpiresAt
    FROM raffle_winners rw
    JOIN raffle_entries re ON rw.entryId = re.id
    WHERE rw.entryId = ?
  `);

  return winnerStmt.get(entryId) as RaffleWinner | null;
}

export function getRandomWinner(): RaffleEntry | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT re.* FROM raffle_entries re
    WHERE re.id NOT IN (SELECT entryId FROM raffle_winners)
    ORDER BY RANDOM()
    LIMIT 1
  `);
  return stmt.get() as RaffleEntry | null;
}

export function updateWinnerStatus(entryId: number, status: string, portfolioUrl?: string): void {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE raffle_winners
    SET status = ?, portfolioUrl = ?
    WHERE entryId = ?
  `);
  stmt.run(status, portfolioUrl || null, entryId);
}

export function getWinnerExpirationStatus(winnerId: number): { hosting: string; support: string } | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT hostingExpiresAt, supportExpiresAt
    FROM raffle_winners
    WHERE id = ?
  `);
  
  const result = stmt.get(winnerId) as { hostingExpiresAt: string; supportExpiresAt: string } | undefined;
  
  if (!result) return null;
  
  const now = new Date();
  const hostingExpires = new Date(result.hostingExpiresAt);
  const supportExpires = new Date(result.supportExpiresAt);
  
  return {
    hosting: hostingExpires > now ? 'active' : 'expired',
    support: supportExpires > now ? 'active' : 'expired',
  };
}

export function createAdminSession(email: string, token: string): void {
  const db = getDb();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const stmt = db.prepare(`
    INSERT INTO admin_sessions (email, token, expiresAt)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(email, token, expiresAt.toISOString());
}

export function getAdminSession(token: string): { email: string } | null {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT email FROM admin_sessions
    WHERE token = ? AND expiresAt > datetime('now')
  `);
  
  return stmt.get(token) as { email: string } | null;
}

export function deleteAdminSession(token: string): void {
  const db = getDb();
  const stmt = db.prepare(`DELETE FROM admin_sessions WHERE token = ?`);
  stmt.run(token);
}

export function validateAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminEmail || !adminPassword) {
    throw new Error("Admin credentials not configured");
  }
  
  return email === adminEmail && password === adminPassword;
}

export function checkDuplicateEntry(email: string, ipAddress: string): { hasDuplicate: boolean; reason?: string } {
  const db = getDb();
  
  const emailStmt = db.prepare(`SELECT id FROM raffle_entries WHERE email = ?`);
  const emailExists = emailStmt.get(email);
  
  if (emailExists) {
    return { hasDuplicate: true, reason: "email_exists" };
  }

  const ipStmt = db.prepare(`SELECT id FROM raffle_entries WHERE ipAddress = ?`);
  const ipExists = ipStmt.get(ipAddress);
  
  if (ipExists) {
    return { hasDuplicate: true, reason: "ip_exists" };
  }

  return { hasDuplicate: false };
}

export function checkAndUpdateRateLimit(ipAddress: string): { allowed: boolean; remaining: number; resetTime: Date } {
  const db = getDb();
  const MAX_ATTEMPTS = 5;
  const RATE_LIMIT_WINDOW = 3600000;

  const stmt = db.prepare(`SELECT attempts, lastAttempt FROM rate_limits WHERE ipAddress = ?`);
  const record = stmt.get(ipAddress) as { attempts: number; lastAttempt: string } | undefined;

  const now = Date.now();
  const oneHourAgo = now - RATE_LIMIT_WINDOW;
  const lastAttempt = record ? new Date(record.lastAttempt).getTime() : 0;

  let attempts = 0;
  if (record && lastAttempt > oneHourAgo) {
    attempts = record.attempts + 1;
  } else {
    attempts = 1;
  }

  const resetTime = new Date(lastAttempt + RATE_LIMIT_WINDOW);

  if (attempts > MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetTime };
  }

  const upsertStmt = db.prepare(`
    INSERT INTO rate_limits (ipAddress, attempts, lastAttempt)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(ipAddress) DO UPDATE SET
      attempts = CASE WHEN datetime(lastAttempt) > datetime('now', '-1 hour') THEN attempts + 1 ELSE 1 END,
      lastAttempt = datetime('now')
  `);
  upsertStmt.run(ipAddress, attempts);

  return { allowed: true, remaining: MAX_ATTEMPTS - attempts, resetTime };
}

export function getRaffleStats() {
  const db = getDb();
  const totalEntries = db.prepare('SELECT COUNT(*) as count FROM raffle_entries').get() as { count: number };
  const totalWinners = db.prepare('SELECT COUNT(*) as count FROM raffle_winners').get() as { count: number };
  const pendingWinners = db.prepare('SELECT COUNT(*) as count FROM raffle_winners WHERE status = ?').get('pending') as { count: number };

  return {
    totalEntries: totalEntries.count,
    totalWinners: totalWinners.count,
    pendingWinners: pendingWinners.count,
  };
}
