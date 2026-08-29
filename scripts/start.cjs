const fs = require("fs");
const { spawn } = require("child_process");

const requested = process.env.DATA_DIR || "./data";

function writable(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    const probe = `${dir}/.writable`;
    fs.writeFileSync(probe, "ok");
    fs.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

if (!writable(requested)) {
  try {
    fs.chmodSync(requested, 0o777);
  } catch {
    // Volume is often root-owned; chmod only works when this process is root.
  }
}

if (!writable(requested)) {
  const fallback = "/tmp/gbp-data";
  fs.mkdirSync(fallback, { recursive: true });
  process.env.DATA_DIR = fallback;
  console.warn(
    `DATA_DIR ${requested} is not writable. Using ${fallback} until the volume allows writes.`,
  );
}

const port = process.env.PORT || "4410";
const child = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "start", "--hostname", "0.0.0.0", "--port", String(port)],
  { stdio: "inherit", env: process.env },
);
child.on("exit", (code) => process.exit(code ?? 1));
