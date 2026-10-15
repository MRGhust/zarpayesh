// SQLite-backed test adapter. Production imports are untouched; only tests resolve sdk here.
import { DatabaseSync } from "node:sqlite";
export const sqlDb = new DatabaseSync(":memory:");
export const sent = [];
export const controls = {
  admin: false,
  fail: null,
  response: null,
  fetches: 0,
  historyResponse: null,
};
export const api = new Proxy(
  {},
  {
    get: (_, method) => async (params) => {
      if (method === "getMe") return { id: 1, username: "test_bot" };
      if (method === "getChatMember")
        return { status: controls.admin ? "administrator" : "member" };
      if (controls.fail && ["sendMessage", "sendPhoto"].includes(method))
        throw controls.fail;
      sent.push({ method, ...params });
      return { message_id: sent.length };
    },
  },
);
export const fetch = async (url) => {
  controls.fetches++;
  return url?.includes("/api/history") && controls.historyResponse
    ? controls.historyResponse
    : controls.response;
};
export class InputFile {
  constructor(bytes, name) {
    this.bytes = bytes;
    this.name = name;
  }
}
export class EndpointError extends Error {}
const tables = [];
function column(name) {
  return {
    name,
    type: "TEXT",
    notNull() {
      return this;
    },
    default(value) {
      this.value = value;
      return this;
    },
    primaryKey() {
      this.pk = true;
      return this;
    },
  };
}
export const text = column;
export const integer = (name) => ({ ...column(name), type: "INTEGER" });
export const real = (name) => ({ ...column(name), type: "REAL" });
export const index = () => ({
  on() {
    return this;
  },
});
export function table(name, cols) {
  const t = { _name: name, _cols: cols };
  for (const [key, col] of Object.entries(cols)) {
    col.key = key;
    col.table = name;
    t[key] = col;
  }
  tables.push(t);
  return t;
}
export function reset() {
  for (const t of tables) {
    sqlDb.exec(`DROP TABLE IF EXISTS ${t._name}`);
    sqlDb.exec(
      `CREATE TABLE ${t._name} (${Object.values(t._cols)
        .map(
          (c) =>
            `${c.name} ${c.type}${c.pk ? " PRIMARY KEY" : ""}${c.value === undefined ? "" : ` DEFAULT ${typeof c.value === "string" ? `'${c.value}'` : c.value}`}`,
        )
        .join(",")})`,
    );
  }
  sent.length = 0;
  controls.admin = false;
  controls.fail = null;
  controls.fetches = 0;
  controls.response = null;
  controls.historyResponse = null;
}
const op = (operator) => (col, value) => ({
  q: `${col.name} ${operator} ?`,
  p: [value],
});
export const eq = op("="),
  lt = op("<"),
  lte = op("<="),
  gte = op(">=");
export const and = (...args) => ({
  q: args.map((x) => `(${x.q})`).join(" AND "),
  p: args.flatMap((x) => x.p),
});
export const asc = (col) => ({ q: `${col.name} ASC` });
export const db = {
  insert(t) {
    const b = {
      values(row) {
        this.row = row;
        return this;
      },
      onConflictDoNothing() {
        this.ignore = true;
        return this;
      },
      onConflictDoUpdate({ target, set }) {
        this.conflict = { target, set };
        return this;
      },
      async run() {
        const entries = Object.entries(this.row),
          fields = entries.map(([k]) => t[k].name),
          values = entries.map(([, v]) => v);
        let q = `INSERT ${this.ignore ? "OR IGNORE " : ""}INTO ${t._name} (${fields.join(",")}) VALUES (${fields.map(() => "?").join(",")})`;
        if (this.conflict) {
          const { target, set } = this.conflict,
            cols = Object.entries(set);
          q += ` ON CONFLICT (${target.name}) DO UPDATE SET ${cols.map(([k]) => `${t[k].name}=?`).join(",")}`;
          values.push(...cols.map(([, v]) => v));
        }
        const r = sqlDb.prepare(q).run(...values);
        return { rowsAffected: Number(r.changes) };
      },
    };
    return b;
  },
  select() {
    return {
      from(t) {
        this.t = t;
        return this;
      },
      where(w) {
        this.w = w;
        return this;
      },
      orderBy(col) {
        this.order = col.q || col.name;
        return this;
      },
      limit(n) {
        this.n = n;
        return this;
      },
      async all() {
        const t = this.t,
          q = `SELECT ${Object.entries(t._cols)
            .map(([k, c]) => `${c.name} AS "${k}"`)
            .join(
              ",",
            )} FROM ${t._name}${this.w ? ` WHERE ${this.w.q}` : ""}${this.order ? ` ORDER BY ${this.order}` : ""}${this.n ? ` LIMIT ${this.n}` : ""}`;
        return sqlDb.prepare(q).all(...(this.w?.p || []));
      },
      async get() {
        return (await this.all())[0] || null;
      },
    };
  },
  update(t) {
    return {
      set(row) {
        this.row = row;
        return this;
      },
      where(w) {
        this.w = w;
        return this;
      },
      async run() {
        const cols = Object.entries(this.row),
          q = `UPDATE ${t._name} SET ${cols.map(([k]) => `${t[k].name}=?`).join(",")} WHERE ${this.w.q}`;
        const r = sqlDb.prepare(q).run(...cols.map(([, v]) => v), ...this.w.p);
        return { rowsAffected: Number(r.changes) };
      },
    };
  },
  delete(t) {
    return {
      where(w) {
        this.w = w;
        return this;
      },
      async run() {
        const r = sqlDb
          .prepare(`DELETE FROM ${t._name} WHERE ${this.w.q}`)
          .run(...this.w.p);
        return { rowsAffected: Number(r.changes) };
      },
    };
  },
};
