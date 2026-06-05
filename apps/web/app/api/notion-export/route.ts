import { NextResponse } from "next/server";
import { buildNotionPage, validateNotionExportPayload } from "@/lib/notion";
import type { NotionErrorBody, NotionExportResult } from "@/lib/notion";

function errorResponse(
  code: NotionErrorBody["code"],
  message: string,
  status: number
): NextResponse {
  return NextResponse.json({ code, message } satisfies NotionErrorBody, { status });
}

export async function POST(request: Request): Promise<NextResponse> {
  const apiKey = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!apiKey || !databaseId) {
    return errorResponse(
      "MISSING_ENV",
      "Notion integration is not configured. Set NOTION_API_KEY and NOTION_DATABASE_ID.",
      503
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_PAYLOAD", "Request body must be valid JSON.", 400);
  }

  const validation = validateNotionExportPayload(body);

  if (!validation.ok) {
    return NextResponse.json(validation.error satisfies NotionErrorBody, { status: 400 });
  }

  const page = buildNotionPage(validation.memo, databaseId);

  let notionResponse: Response;

  try {
    notionResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify(page)
    });
  } catch {
    return errorResponse("NOTION_ERROR", "Could not reach the Notion API.", 502);
  }

  if (!notionResponse.ok) {
    return errorResponse(
      "NOTION_ERROR",
      `Notion returned an error (HTTP ${notionResponse.status}). Check your database ID and integration permissions.`,
      502
    );
  }

  const created = (await notionResponse.json()) as { id: string; url: string };

  return NextResponse.json({
    pageId: created.id,
    url: created.url
  } satisfies NotionExportResult);
}
