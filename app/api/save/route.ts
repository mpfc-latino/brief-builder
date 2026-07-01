import { NextRequest, NextResponse } from "next/server";
import { Packer } from "docx";
import type { BriefData } from "@/lib/types";
import { buildBriefDocx, briefFileName } from "@/lib/brief-docx";
import { isDriveConfigured, parseDriveFolderId, uploadDocxToFolder } from "@/lib/google-drive";

export const runtime = "nodejs";

interface SaveRequest {
  brief: BriefData;
  folderUrl: string;
}

// Non-throwing JSON so the client can always degrade to a plain download.
export async function POST(request: NextRequest) {
  let payload: SaveRequest;
  try {
    payload = (await request.json()) as SaveRequest;
  } catch {
    return NextResponse.json({ saved: false, reason: "invalid-request" }, { status: 400 });
  }

  if (!isDriveConfigured()) {
    return NextResponse.json({ saved: false, reason: "not-configured" });
  }

  const folderId = parseDriveFolderId(payload.folderUrl || "");
  if (!folderId) {
    return NextResponse.json({ saved: false, reason: "invalid-folder" }, { status: 400 });
  }

  try {
    const doc = buildBriefDocx(payload.brief);
    const buffer = await Packer.toBuffer(doc);
    const name = briefFileName(payload.brief);
    const { id, webViewLink } = await uploadDocxToFolder({ buffer, name, folderId });
    return NextResponse.json({ saved: true, id, webViewLink, name });
  } catch (err: unknown) {
    // Most commonly: the service account is not a member of the shared drive (403/404).
    const status = (err as { code?: number; status?: number })?.code ?? (err as { status?: number })?.status;
    const reason = status === 403 || status === 404 ? "permission" : "error";
    const message = err instanceof Error ? err.message : "Drive upload failed";
    return NextResponse.json({ saved: false, reason, message });
  }
}
