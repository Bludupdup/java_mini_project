/**
 * Accounts and login sessions, kept in one JSON file on the server.
 *
 * Passwords are never stored: only a scrypt hash with a random salt, which is
 * slow to compute on purpose so a stolen file can't be guessed through quickly.
 * Session tokens are stored hashed too, so the file alone can't be used to
 * log in as anyone.
 */

import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const SESSION_DAYS = 30;
export const SESSION_SECONDS = SESSION_DAYS * 24 * 60 * 60;

const hashToken = (token) => createHash("sha256").update(token).digest("hex");
const publicUser = ({ id, name, email }) => ({ id, name, email });

async function hashPassword(password, salt = randomBytes(16)) {
  const hash = await scryptAsync(password.normalize("NFKC"), salt, 64);
  return { salt: salt.toString("hex"), hash: hash.toString("hex") };
}

async function passwordMatches(password, user) {
  const { hash } = await hashPassword(password, Buffer.from(user.salt, "hex"));
  // Compares every byte, so the time taken doesn't reveal how much matched.
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.hash, "hex"));
}

export function createAuthStore(filePath) {
  let data = null;
  let lastWrite = Promise.resolve();

  async function load() {
    if (data) return data;

    try {
      data = JSON.parse(await readFile(filePath, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      data = { users: [], sessions: [] };
    }

    return data;
  }

  // Writes one at a time, into a temporary file that then replaces the real
  // one, so a crash mid-write can never leave half a file behind.
  function save() {
    lastWrite = lastWrite.then(async () => {
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(`${filePath}.tmp`, JSON.stringify(data, null, 2));
      await rename(`${filePath}.tmp`, filePath);
    });

    return lastWrite;
  }

  return {
    /** email must already be normalized. Returns { user } or { error: "email-taken" }. */
    async createUser({ name, email, password }) {
      await load();

      if (data.users.some((user) => user.email === email)) return { error: "email-taken" };

      const user = {
        id: randomUUID(),
        name,
        email,
        ...(await hashPassword(password)),
        createdAt: new Date().toISOString(),
      };

      data.users.push(user);
      await save();
      return { user: publicUser(user) };
    },

    /** The user if the email and password match, otherwise null. */
    async checkPassword(email, password) {
      await load();
      const user = data.users.find((candidate) => candidate.email === email);

      if (!user) {
        // Hash anyway, so "no such email" takes as long as "wrong password".
        await hashPassword(password);
        return null;
      }

      return (await passwordMatches(password, user)) ? publicUser(user) : null;
    },

    /** Starts a session and returns its secret token (for the cookie). */
    async createSession(userId) {
      await load();
      const token = randomBytes(32).toString("base64url");
      const now = Date.now();

      data.sessions = data.sessions.filter((session) => session.expiresAt > now);
      data.sessions.push({
        tokenHash: hashToken(token),
        userId,
        expiresAt: now + SESSION_SECONDS * 1000,
      });
      await save();
      return token;
    },

    /** The logged-in user for a session token, or null if it's unknown or expired. */
    async findSessionUser(token) {
      if (!token) return null;
      await load();

      const tokenHash = hashToken(token);
      const session = data.sessions.find(
        (candidate) => candidate.tokenHash === tokenHash && candidate.expiresAt > Date.now(),
      );
      const user = session && data.users.find((candidate) => candidate.id === session.userId);

      return user ? publicUser(user) : null;
    },

    async deleteSession(token) {
      if (!token) return;
      await load();

      const tokenHash = hashToken(token);
      data.sessions = data.sessions.filter((session) => session.tokenHash !== tokenHash);
      await save();
    },
  };
}
