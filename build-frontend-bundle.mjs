// build-frontend-bundle.mjs (ESM version)

import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = process.cwd();
const BUILD_DIR = path.join(ROOT, "build");
const SERVER_JS = path.join(ROOT, "server.js");
const PACKAGE_JSON = path.join(ROOT, "package.json");
const PACKAGE_LOCK = path.join(ROOT, "package-lock.json");
const ENV_FILE = path.join(ROOT, ".env");
const TARGET = path.join(ROOT, "frontend-runtime");
const ZIP_FILE = path.join(ROOT, "frontend-runtime.zip");

function run(cmd, cwd = ROOT) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd, shell: true });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️ Source not found: ${src}`);
    return;
  }

  const stats = fs.statSync(src);
  const isDir = stats.isDirectory();

  if (isDir) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log("\n📦 Starting FE Runtime Bundle Creation (ESM)...\n");

try {
  //
  // 1. Build FE
  //
  console.log("🔍 Step 1: Running FE build...");
  run("npm run build");

  //
  // 2. Clean old runtime folder
  //
  console.log("\n🧹 Step 2: Cleaning previous runtime folder...");

  if (fs.existsSync(TARGET)) {
    fs.rmSync(TARGET, { recursive: true, force: true });
    console.log(`   Removed ${TARGET}`);
  }
  fs.mkdirSync(TARGET, { recursive: true });

  //
  // 3. Copy required files
  //
  console.log("\n📂 Step 3: Copying files...");

  console.log("   - Copying build/");
  copyRecursive(BUILD_DIR, path.join(TARGET, "build"));

  console.log("   - Copying server.js");
  fs.copyFileSync(SERVER_JS, path.join(TARGET, "server.js"));

  console.log("   - Copying package.json");
  fs.copyFileSync(PACKAGE_JSON, path.join(TARGET, "package.json"));

  console.log("   - Copying package-lock.json");
  fs.copyFileSync(PACKAGE_LOCK, path.join(TARGET, "package-lock.json"));

  if (fs.existsSync(ENV_FILE)) {
    console.log("   - Copying .env");
    fs.copyFileSync(ENV_FILE, path.join(TARGET, ".env"));
  }

  //
  // 4. Install prod dependencies inside runtime folder
  //
  console.log("\n📦 Step 4: Installing production dependencies...");
  run("npm install --omit=dev", TARGET);

/*   //
  // 5. Create ZIP
  //
  console.log("\n🗜️ Step 5: Creating ZIP archive...");

  let zipCmd;

  if (os.platform() === "win32") {
    zipCmd = `powershell -Command "Compress-Archive -Path '${TARGET}' -DestinationPath '${ZIP_FILE}' -Force"`;
  } else {
    zipCmd = `zip -r ${ZIP_FILE} ${path.basename(TARGET)}`;
  }

  run(zipCmd, path.dirname(TARGET));

  //
  // DONE
  // */
  console.log("\n✅ SUCCESS!");
  console.log(`   - Runtime folder: ${TARGET}`);
  console.log(`   - ZIP archive: ${ZIP_FILE}\n`);

  console.log("📋 Next steps on offline server:");
  console.log("   1. Copy ZIP ke server lokal");
  console.log("   2. unzip frontend-runtime.zip");
  console.log("   3. cd frontend-runtime");
  console.log("   4. npm start\n");

} catch (err) {
  console.error("\n❌ ERROR:", err.message);
  process.exit(1);
}
