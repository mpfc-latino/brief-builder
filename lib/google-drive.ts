import { Readable } from "node:stream";
import { google } from "googleapis";

// Google Drive upload via a SERVICE ACCOUNT (no per-user sign-in). Writes into a
// Shared Drive folder. Service accounts have no personal storage quota, so the
// target must live in a Shared Drive (the "Latinovation Team Drive"), and the
// service-account email must be a member (Content Manager) of that drive.

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** True if the service-account key is configured (env present). */
export function isDriveConfigured(): boolean {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64);
}

/**
 * Extract a Drive folder id from a pasted link or raw id. Handles:
 *  - https://drive.google.com/drive/folders/<id>
 *  - https://drive.google.com/drive/u/0/folders/<id>
 *  - https://drive.google.com/open?id=<id>   (and ?usp=… suffixes)
 *  - a raw id
 */
export function parseDriveFolderId(input: string): string | null {
  const s = (input || "").trim();
  if (!s) return null;
  if (/^[A-Za-z0-9_-]{10,}$/.test(s)) return s; // raw id
  let m = s.match(/\/folders\/([A-Za-z0-9_-]+)/); // also covers /u/0/folders/
  if (m) return m[1];
  m = s.match(/[?&]id=([A-Za-z0-9_-]+)/); // open?id=
  return m ? m[1] : null;
}

function driveClient() {
  // Read + decode the key inside the call so a missing/invalid key degrades
  // gracefully instead of crashing the module.
  const raw = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64 || "", "base64").toString("utf8");
  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
  return google.drive({ version: "v3", auth });
}

export interface DriveUploadResult {
  id: string;
  webViewLink: string;
}

/** Upload a .docx buffer into a Shared Drive folder. Throws on Drive errors. */
export async function uploadDocxToFolder(opts: {
  buffer: Buffer;
  name: string;
  folderId: string;
}): Promise<DriveUploadResult> {
  const drive = driveClient();
  const res = await drive.files.create({
    requestBody: { name: opts.name, parents: [opts.folderId], mimeType: DOCX_MIME },
    media: { mimeType: DOCX_MIME, body: Readable.from(opts.buffer) },
    fields: "id, webViewLink",
    supportsAllDrives: true, // required for Shared Drives
  });
  return { id: res.data.id ?? "", webViewLink: res.data.webViewLink ?? "" };
}
