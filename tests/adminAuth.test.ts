import test from "node:test";
import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  validateUserCredentials,
  createSessionToken,
  verifySessionToken,
} from "@/lib/adminAuth";

function withEnv(vars: Record<string, string | undefined>, fn: () => void) {
  const previous = new Map<string, string | undefined>();
  for (const [k, v] of Object.entries(vars)) {
    previous.set(k, process.env[k]);
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    fn();
  } finally {
    for (const [k, v] of previous.entries()) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test("hashPassword and verifyPassword validate matching passwords via scrypt", () => {
  const hash = hashPassword("S3cur3-Admin-Pass!");
  assert.ok(hash.startsWith("scrypt$"));
  assert.equal(verifyPassword("S3cur3-Admin-Pass!", hash), true);
  assert.equal(verifyPassword("wrong-pass", hash), false);
  assert.equal(verifyPassword("S3cur3-Admin-Pass!", "plain$text"), false);
});

test("validateUserCredentials checks ADMIN_USERS_JSON without hardcoded fallback accounts", () => {
  const aliceHash = hashPassword("Alpha-Pass-99");
  withEnv(
    {
      ADMIN_USERS_JSON: JSON.stringify([
        {
          username: "alice",
          passwordHash: aliceHash,
          displayName: "Alice Operator",
          role: "admin",
          roleLabel: "Admin",
          defaultEmail: "alice@example.com",
        },
      ]),
    },
    () => {
      const ok = validateUserCredentials("Alice ", "Alpha-Pass-99");
      assert.equal(ok?.username, "alice");
      assert.equal(ok?.role, "admin");
      assert.equal(validateUserCredentials("alice", "bad-pass"), null);
      assert.equal(validateUserCredentials("unknown", "Alpha-Pass-99"), null);
    }
  );
});

test("createSessionToken and verifySessionToken enforce HMAC signature and TTL expiration", () => {
  const bobHash = hashPassword("Beta-Pass-42");
  withEnv(
    {
      ADMIN_SESSION_SECRET: "test-session-secret-with-sufficient-entropy-32b",
      ADMIN_USERS_JSON: JSON.stringify([
        { username: "bob", passwordHash: bobHash, displayName: "Bob", role: "member" },
      ]),
    },
    () => {
      const issuedAt = 1_700_000_000;
      const token = createSessionToken("bob", issuedAt);
      assert.ok(token);

      const verified = verifySessionToken(token, issuedAt + 60);
      assert.equal(verified?.username, "bob");

      // Tampering with signature or payload must fail verification
      const [payload, sig] = token.split(".");
      const tamperedSig = `${payload}.${sig.slice(0, -1)}${sig.endsWith("A") ? "B" : "A"}`;
      assert.equal(verifySessionToken(tamperedSig, issuedAt + 60), null);

      // Expired tokens must be rejected
      assert.equal(verifySessionToken(token, issuedAt + 60 * 60 * 24 * 31), null);
    }
  );
});
