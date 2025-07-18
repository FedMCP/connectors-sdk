

import { NextRequest, NextResponse } from "next/server";
import { mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

/**
 * POST /api/artifacts
 * Body: Artifact JSON (must conform to FedMCP spec)
 * Response: { token: "<compact JWS string>" }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse JSON body
    const artifact = await req.json();

    // 2. Write body to a temp file for CLI consumption
    const dir = await mkdtemp(join(tmpdir(), "mcp-"));
    const jsonPath = join(dir, "artifact.json");
    await writeFile(jsonPath, JSON.stringify(artifact));

    // 3. Invoke Python CLI: fedmcp sign <artifact.json> <priv.pem>
    const { stdout } = await exec("fedmcp", [
      jsonPath,
      join(process.cwd(), "keys/priv.pem"),
    ]);

    // 4. Return compact JWS
    return NextResponse.json({ token: stdout.trim() });
  } catch (err: any) {
    console.error("Artifact signing failed:", err);
    return NextResponse.json(
      { error: "Artifact signing failed", detail: String(err.message ?? err) },
      { status: 500 },
    );
  }
}

// Disable body size limit (artifacts are small but explicit is clearer)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};