import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { Pool } from 'pg';

const DB_DIR = path.join(process.cwd(), 'server', 'data');
const SQLITE_PATH = path.join(DB_DIR, 'app.sqlite');

function getPgConfig() {
  if (process.env.DATABASE_URL) return { connectionString: process.env.DATABASE_URL };
  const cfg: any = {
    host: process.env.PGHOST || process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.PGPORT || process.env.POSTGRES_PORT || 5432),
    user: process.env.PGUSER || process.env.POSTGRES_USER,
    password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
    database: process.env.PGDATABASE || process.env.POSTGRES_DB,
  };
  return cfg;
}

async function createTables(pool: Pool) {
  // Use transactional creation to be idempotent
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT,
        photoUrl TEXT,
        createdAt TIMESTAMPTZ
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        color TEXT,
        icon TEXT,
        target INTEGER,
        completed INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        frequency TEXT,
        monthlyDays JSONB,
        monthlyMonths JSONB,
        reminderTime TEXT,
        reminderEnabled BOOLEAN DEFAULT false,
        createdAt TIMESTAMPTZ,
        lastCompleted TIMESTAMPTZ
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL REFERENCES users(id),
        type TEXT,
        title TEXT,
        message TEXT,
        time TIMESTAMPTZ,
        read BOOLEAN DEFAULT false,
        metadata JSONB,
        createdAt TIMESTAMPTZ
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS habit_logs (
        id TEXT PRIMARY KEY,
        habitId TEXT NOT NULL REFERENCES habits(id),
        userId TEXT NOT NULL REFERENCES users(id),
        date DATE NOT NULL,
        completedAmount INTEGER DEFAULT 0,
        completedBoolean BOOLEAN DEFAULT false,
        note TEXT,
        createdAt TIMESTAMPTZ,
        updatedAt TIMESTAMPTZ
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS habit_overrides (
        id TEXT PRIMARY KEY,
        habitId TEXT NOT NULL REFERENCES habits(id),
        userId TEXT NOT NULL REFERENCES users(id),
        date DATE NOT NULL,
        hidden BOOLEAN DEFAULT false,
        patch JSONB,
        createdAt TIMESTAMPTZ,
        updatedAt TIMESTAMPTZ
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        userId TEXT PRIMARY KEY REFERENCES users(id),
        settings JSONB,
        updatedAt TIMESTAMPTZ
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE,
        title TEXT,
        description TEXT,
        criteria JSONB,
        createdAt TIMESTAMPTZ
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL REFERENCES users(id),
        achievementId TEXT NOT NULL REFERENCES achievements(id),
        earnedAt TIMESTAMPTZ,
        meta JSONB
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL REFERENCES users(id),
        habitId TEXT,
        timeOfDay TEXT,
        enabled BOOLEAN DEFAULT true,
        timezone TEXT,
        recurrence TEXT,
        days JSONB,
        nextRun TIMESTAMPTZ,
        createdAt TIMESTAMPTZ
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL REFERENCES users(id),
        platform TEXT,
        pushToken TEXT,
        lastSeenAt TIMESTAMPTZ,
        createdAt TIMESTAMPTZ
      );
    `);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

function parseMaybeJson(value: any) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

async function migrate() {
  if (!fs.existsSync(SQLITE_PATH)) throw new Error(`SQLite DB not found at ${SQLITE_PATH}`);

  const sqlite = new Database(SQLITE_PATH, { readonly: true });
  const pool = new Pool(getPgConfig());

  try {
    await createTables(pool);

    // Users
    const users = sqlite.prepare('SELECT id,name,email,password,photoUrl,createdAt FROM users').all();
    for (const u of users) {
      await pool.query(
        `INSERT INTO users (id,name,email,password,photoUrl,createdAt) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, photoUrl = EXCLUDED.photourl`,
        [u.id, u.name, u.email, u.password || null, u.photoUrl || null, u.createdAt ? new Date(u.createdAt) : null],
      );
    }

    // Habits
    const habits = sqlite
      .prepare('SELECT id,userId,name,description,category,color,icon,target,completed,streak,frequency,monthlyDays,monthlyMonths,reminderTime,reminderEnabled,createdAt,lastCompleted FROM habits')
      .all();
    for (const h of habits) {
      await pool.query(
        `INSERT INTO habits (id,userId,name,description,category,color,icon,target,completed,streak,frequency,monthlyDays,monthlyMonths,reminderTime,reminderEnabled,createdAt,lastCompleted)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        [
          h.id,
          h.userId,
          h.name,
          h.description || null,
          h.category || null,
          h.color || null,
          h.icon || null,
          typeof h.target === 'number' ? h.target : null,
          h.completed ? Number(h.completed) : 0,
          h.streak ? Number(h.streak) : 0,
          h.frequency || null,
          parseMaybeJson(h.monthlyDays),
          parseMaybeJson(h.monthlyMonths),
          h.reminderTime || null,
          !!h.reminderEnabled,
          h.createdAt ? new Date(h.createdAt) : null,
          h.lastCompleted ? new Date(h.lastCompleted) : null,
        ],
      );
    }

    // Notifications
    const notifications = sqlite.prepare('SELECT id,userId,type,title,message,time,read,metadata,createdAt FROM notifications').all();
    for (const n of notifications) {
      await pool.query(
        `INSERT INTO notifications (id,userId,type,title,message,time,read,metadata,createdAt) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
        [n.id, n.userId, n.type || null, n.title || null, n.message || null, n.time ? new Date(n.time) : null, !!n.read, parseMaybeJson(n.metadata), n.createdAt ? new Date(n.createdAt) : null],
      );
    }

    // Habit logs
    const logs = sqlite.prepare('SELECT id,habitId,userId,date,completedAmount,completedBoolean,note,createdAt,updatedAt FROM habit_logs').all();
    for (const l of logs) {
      await pool.query(
        `INSERT INTO habit_logs (id,habitId,userId,date,completedAmount,completedBoolean,note,createdAt,updatedAt) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
        [l.id, l.habitId, l.userId, l.date ? l.date : null, l.completedAmount || 0, !!l.completedBoolean, l.note || null, l.createdAt ? new Date(l.createdAt) : null, l.updatedAt ? new Date(l.updatedAt) : null],
      );
    }

    // Habit overrides
    const overrides = sqlite.prepare('SELECT id,habitId,userId,date,hidden,patch,createdAt,updatedAt FROM habit_overrides').all();
    for (const o of overrides) {
      await pool.query(
        `INSERT INTO habit_overrides (id,habitId,userId,date,hidden,patch,createdAt,updatedAt) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
        [o.id, o.habitId, o.userId, o.date ? o.date : null, !!o.hidden, parseMaybeJson(o.patch), o.createdAt ? new Date(o.createdAt) : null, o.updatedAt ? new Date(o.updatedAt) : null],
      );
    }

    // User settings
    const settings = sqlite.prepare('SELECT userId,settings,updatedAt FROM user_settings').all();
    for (const s of settings) {
      await pool.query(`INSERT INTO user_settings (userId,settings,updatedAt) VALUES ($1,$2,$3) ON CONFLICT (userId) DO UPDATE SET settings = EXCLUDED.settings, updatedAt = EXCLUDED.updatedat`, [s.userId, parseMaybeJson(s.settings), s.updatedAt ? new Date(s.updatedAt) : null]);
    }

    // Achievements
    const achievements = sqlite.prepare('SELECT id,key,title,description,criteria,createdAt FROM achievements').all();
    for (const a of achievements) {
      await pool.query(`INSERT INTO achievements (id,key,title,description,criteria,createdAt) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`, [a.id, a.key, a.title || null, a.description || null, parseMaybeJson(a.criteria), a.createdAt ? new Date(a.createdAt) : null]);
    }

    // User achievements
    const userAchievements = sqlite.prepare('SELECT id,userId,achievementId,earnedAt,meta FROM user_achievements').all();
    for (const ua of userAchievements) {
      await pool.query(`INSERT INTO user_achievements (id,userId,achievementId,earnedAt,meta) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`, [ua.id, ua.userId, ua.achievementId, ua.earnedAt ? new Date(ua.earnedAt) : null, parseMaybeJson(ua.meta)]);
    }

    // Reminders
    const reminders = sqlite.prepare('SELECT id,userId,habitId,timeOfDay,enabled,timezone,recurrence,days,nextRun,createdAt FROM reminders').all();
    for (const r of reminders) {
      await pool.query(`INSERT INTO reminders (id,userId,habitId,timeOfDay,enabled,timezone,recurrence,days,nextRun,createdAt) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`, [r.id, r.userId, r.habitId || null, r.timeOfDay || null, typeof r.enabled === 'number' ? !!r.enabled : !!r.enabled, r.timezone || null, r.recurrence || null, parseMaybeJson(r.days), r.nextRun ? new Date(r.nextRun) : null, r.createdAt ? new Date(r.createdAt) : null]);
    }

    // Devices
    const devices = sqlite.prepare('SELECT id,userId,platform,pushToken,lastSeenAt,createdAt FROM devices').all();
    for (const d of devices) {
      await pool.query(`INSERT INTO devices (id,userId,platform,pushToken,lastSeenAt,createdAt) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`, [d.id, d.userId, d.platform || null, d.pushToken || null, d.lastSeenAt ? new Date(d.lastSeenAt) : null, d.createdAt ? new Date(d.createdAt) : null]);
    }

    console.log('Migration to Postgres completed successfully');
  } finally {
    await pool.end();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Migration failed:', err);
    process.exit(1);
  });
