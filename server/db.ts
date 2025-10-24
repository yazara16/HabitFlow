import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "server", "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

async function ensureData() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch (e) {
    const initial: any = {
      users: [],
      habits: [],
      habit_logs: [],
      habit_overrides: [],
      notifications: [],
      achievements: [],
      user_achievements: [],
      reminders: [],
      user_settings: [],
      devices: [],
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2));
  }
}

async function readData() {
  await ensureData();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

async function writeData(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Very small SQL-ish interpreter for a limited set of queries used by the app
export async function all(sql: string, ...params: any[]) {
  const data = await readData();
  const s = sql.trim();

  // SELECT COUNT(*) as c FROM table WHERE ...
  const countMatch = s.match(/^SELECT COUNT\(\*\) as c FROM ([a-z_]+)(?: WHERE (.+))?$/i);
  if (countMatch) {
    const table = countMatch[1];
    const where = countMatch[2];
    let rows = data[table] || [];
    if (where) rows = filterRows(rows, where, params);
    return [{ c: rows.length }];
  }

  // SELECT COUNT\(DISTINCT ([a-zA-Z_]+)\) as c FROM table WHERE ...
  const countDistinct = s.match(/^SELECT COUNT\(DISTINCT ([a-z_]+)\) as c FROM ([a-z_]+)(?: WHERE (.+))?$/i);
  if (countDistinct) {
    const col = countDistinct[1];
    const table = countDistinct[2];
    const where = countDistinct[3];
    let rows = data[table] || [];
    if (where) rows = filterRows(rows, where, params);
    const set = new Set(rows.map((r: any) => r[col]));
    return [{ c: set.size }];
  }

  // SELECT MAX(col) as alias FROM table WHERE ...
  const maxMatch = s.match(/^SELECT MAX\(([a-z_]+)\) as ([a-zA-Z_]+) FROM ([a-z_]+)(?: WHERE (.+))?$/i);
  if (maxMatch) {
    const col = maxMatch[1];
    const alias = maxMatch[2];
    const table = maxMatch[3];
    const where = maxMatch[4];
    let rows = data[table] || [];
    if (where) rows = filterRows(rows, where, params);
    const vals = rows.map((r: any) => typeof r[col] === "number" ? r[col] : Number.NEGATIVE_INFINITY);
    const max = vals.length ? Math.max(...vals) : null;
    return [{ [alias]: max }];
  }

  // SELECT ... FROM table WHERE ... or SELECT * FROM table
  const selectMatch = s.match(/^SELECT (.+) FROM ([a-z_]+)(?: WHERE (.+))?$/i);
  if (selectMatch) {
    const cols = selectMatch[1].trim();
    const table = selectMatch[2];
    const where = selectMatch[3];
    let rows = data[table] || [];
    if (where) rows = filterRows(rows, where, params);
    if (cols === "*") return rows;
    const selected = cols.split(",").map((c: string) => c.trim());
    return rows.map((r: any) => {
      const out: any = {};
      for (const c of selected) {
        // handle alias like COUNT(*) as c or functions ignored
        const simple = c.replace(/.*\.(.*)/, "$1").split(/ as /i)[0].trim();
        out[simple] = r[simple];
      }
      return out;
    });
  }

  // INSERT INTO table (cols) VALUES (?,?,?,?,?) [ON CONFLICT ...]
  const insertMatch = s.match(/^INSERT INTO ([a-z_]+) \(([^)]+)\) VALUES \(([^)]+)\)/i);
  if (insertMatch) {
    const table = insertMatch[1];
    const cols = insertMatch[2].split(",").map((c: string) => c.trim());
    // map params to cols
    const obj: any = {};
    for (let i = 0; i < cols.length; i++) {
      const val = params[i];
      obj[cols[i]] = val === undefined ? null : val;
    }
    data[table] = data[table] || [];
    data[table].push(obj);
    await writeData(data);
    return { lastID: obj.id };
  }

  // UPDATE table SET col = ?, col2 = COALESCE(?, col2) WHERE id = ?
  const updateMatch = s.match(/^UPDATE ([a-z_]+) SET (.+) WHERE (.+)$/i);
  if (updateMatch) {
    const table = updateMatch[1];
    const sets = updateMatch[2];
    const where = updateMatch[3];
    const rows = data[table] || [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (matchesWhere(r, where, params)) {
        // apply sets
        // split by comma not inside parentheses
        const assignments = sets.split(/,(?![^()]*\))/);
        let paramIndex = 0;
        // We need to determine correct param index from where clause too. Simpler: apply by replacing COALESCE(?, col) patterns: find '?' positions in sets and map to params sequentially
        const questionMarksInSets = (sets.match(/\?/g) || []).length;
        const setParams = params.slice(0, questionMarksInSets);
        let pIdx = 0;
        for (const assign of assignments) {
          const m = assign.match(/^\s*([a-z_]+)\s*=\s*(.+)$/i);
          if (!m) continue;
          const col = m[1];
          const expr = m[2].trim();
          if (/COALESCE\(\?,\s*[a-z_]+\)/i.test(expr)) {
            const val = setParams[pIdx++];
            if (val !== null && typeof val !== "undefined") r[col] = val;
          } else if (/\?/i.test(expr)) {
            const val = setParams[pIdx++];
            r[col] = val;
          } else {
            // literal
            r[col] = expr.replace(/^'|'$/g, "");
          }
        }
      }
    }
    await writeData(data);
    return { changed: true };
  }

  // DELETE FROM table WHERE ...
  const deleteMatch = s.match(/^DELETE FROM ([a-z_]+) WHERE (.+)$/i);
  if (deleteMatch) {
    const table = deleteMatch[1];
    const where = deleteMatch[2];
    const rows = data[table] || [];
    const newRows = rows.filter((r: any) => !matchesWhere(r, where, params));
    data[table] = newRows;
    await writeData(data);
    return { changes: rows.length - newRows.length };
  }

  // Fallback: return empty
  return [];
}

export async function get(sql: string, ...params: any[]) {
  const rows: any[] = await all(sql, ...params);
  return rows && rows.length > 0 ? rows[0] : undefined;
}

export async function run(sql: string, ...params: any[]) {
  return await all(sql, ...params);
}

function filterRows(rows: any[], where: string, params: any[]) {
  return rows.filter((r: any) => matchesWhere(r, where, params));
}

function matchesWhere(row: any, where: string, params: any[]) {
  // support simple expressions joined by AND
  const parts = where.split(/ AND /i).map((p) => p.trim());
  let paramIndex = 0;
  for (const part of parts) {
    // patterns: col = ? or col = 'literal' or col IS NULL
    const m = part.match(/^([a-z_]+)\s*=\s*\?$/i);
    if (m) {
      const col = m[1];
      const val = params[paramIndex++];
      if (row[col] == undefined && val == null) continue;
      if (row[col] !== val) return false;
      continue;
    }
    const m2 = part.match(/^([a-z_]+)\s*=\s*([0-9]+)$/i);
    if (m2) {
      const col = m2[1];
      const val = Number(m2[2]);
      if (row[col] !== val) return false;
      continue;
    }
    const m3 = part.match(/^([a-z_]+)\s*=\s*'(.+)'$/i);
    if (m3) {
      const col = m3[1];
      const val = m3[2];
      if (row[col] !== val) return false;
      continue;
    }
    // IS NULL
    const m4 = part.match(/^([a-z_]+)\s+IS\s+NULL$/i);
    if (m4) {
      const col = m4[1];
      if (row[col] !== null && typeof row[col] !== "undefined") return false;
      continue;
    }
    // fallback: try equality with param
    const m5 = part.match(/^([a-z_]+)\s*=\s*\?$/i);
    if (m5) {
      const col = m5[1];
      const val = params[paramIndex++];
      if (row[col] !== val) return false;
      continue;
    }
  }
  return true;
}

export default { all, get, run };
