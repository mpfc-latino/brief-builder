import { NextRequest, NextResponse } from "next/server";
import { Packer } from "docx";
import type { BriefData } from "@/lib/types";
import { buildBriefDocx, briefFileName } from "@/lib/brief-docx";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let brief: BriefData;
  try {
    brief = (await request.json()) as BriefData;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const doc = buildBriefDocx(brief);
  const buffer = await Packer.toBuffer(doc);
  const fileName = briefFileName(brief);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
