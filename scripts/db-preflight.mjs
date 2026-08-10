/**
 * Deploy DB preflight — connect with DATABASE_URL and report failures in a
 * SANITIZED form, because drizzle-kit push has been exiting 1 with no error
 * output at all (failing on every deploy since 2026-08-05, run history shows
 * the secret was created seven minutes after the only "successful" run —
 * i.e. the migration step has never once connected).
 *
 * This is a public repo: nothing derived from the connection string may be
 * printed. The sanitizer masks every URL component (user, password, host,
 * port, database) wherever it appears in an error message; what remains —
 * the error name/code and the redacted message — is enough to distinguish
 * a bad password (28P01) from bad DNS (ENOTFOUND), a missing database
 * (3D000), TLS trouble (SELF_SIGNED_CERT_IN_CHAIN, ...), or a timeout.
 */

import pg from 'pg';

const raw = process.env.DATABASE_URL ?? '';

if (!raw) {
  console.error('::error::DATABASE_URL is empty.');
  process.exit(1);
}

console.log(`DATABASE_URL: length=${raw.length}, starts with ${JSON.stringify(raw.slice(0, 11))}...`);
if (raw !== raw.trim()) {
  console.log('note: value has leading/trailing whitespace');
}
if (/^['"]|['"]$/.test(raw.trim())) {
  console.log('note: value appears to be wrapped in quote characters');
}

let url;
try {
  url = new URL(raw.trim());
  console.log(`URL parses: protocol=${url.protocol} user=${url.username ? 'set' : 'MISSING'} password=${url.password ? 'set' : 'MISSING'} host=${url.hostname ? 'set' : 'MISSING'} port=${url.port || '(default)'} database=${url.pathname.length > 1 ? 'set' : 'MISSING'} query=${url.search || '(none)'}`);
} catch {
  console.error('::error::DATABASE_URL is not a parseable URL — likely a paste artifact (wrapping quotes, psql prefix, truncation).');
  process.exit(1);
}

function sanitize(message) {
  let out = String(message);
  const parts = [
    url.password,
    url.username,
    url.hostname,
    url.pathname.replace(/^\//, ''),
    url.port,
  ].filter((p) => p && p.length > 1);
  for (const part of parts) {
    out = out.split(part).join('<redacted>');
  }
  // Belt and braces: mask anything that still looks like a connection URL.
  out = out.replace(/postgres(ql)?:\/\/\S+/g, 'postgres://<redacted>');
  return out;
}

const client = new pg.Client({
  connectionString: raw.trim(),
  connectionTimeoutMillis: 15_000,
});

try {
  await client.connect();
  const res = await client.query('select version(), current_database()');
  console.log(`connect OK — server: ${sanitize(res.rows[0].version)}`);
  await client.end();
} catch (err) {
  console.error(`::error::DB preflight failed — name=${err?.name ?? '?'} code=${err?.code ?? '(none)'} message="${sanitize(err?.message)}"`);
  if (err?.cause) {
    console.error(`::error::cause — code=${err.cause?.code ?? '(none)'} message="${sanitize(err.cause?.message)}"`);
  }
  process.exit(1);
}
