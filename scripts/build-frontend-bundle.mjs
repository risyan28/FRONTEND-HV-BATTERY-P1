// build-frontend-bundle.mjs (ESM version)

import fs from 'fs'
import crypto from 'crypto'
import path from 'path'
import os from 'os'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = process.cwd()
const BUILD_DIR = path.join(ROOT, 'build')
const SERVER_JS = path.join(ROOT, 'server.js')
const PACKAGE_JSON = path.join(ROOT, 'package.json')
const PACKAGE_LOCK = path.join(ROOT, 'package-lock.json')
const ENV_FILE = path.join(ROOT, '.env')
const MANIFEST_FILE = path.join(ROOT, 'frontend-runtime.bundle-state.json')
const MODE = process.argv.includes('--slim') ? 'slim' : 'full'
const TARGET = path.join(
  ROOT,
  MODE === 'slim' ? 'frontend-runtime-update' : 'frontend-runtime',
)
const ZIP_FILE = path.join(
  ROOT,
  MODE === 'slim' ? 'frontend-runtime-update.zip' : 'frontend-runtime.zip',
)
const ARCHIVE_FILE =
  MODE === 'slim' && os.platform() !== 'win32'
    ? ZIP_FILE.replace(/\.zip$/, '.tar.gz')
    : ZIP_FILE

function run(cmd, cwd = ROOT) {
  console.log(`> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd, shell: true })
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️ Source not found: ${src}`)
    return
  }

  const stats = fs.statSync(src)
  const isDir = stats.isDirectory()

  if (isDir) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })

    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dest, file))
    }
  } else {
    fs.copyFileSync(src, dest)
  }
}

function hashFile(filePath) {
  if (!fs.existsSync(filePath)) return `missing:${filePath}`

  const hash = crypto.createHash('sha256')
  hash.update(fs.readFileSync(filePath))
  return hash.digest('hex')
}

function readManifest() {
  if (!fs.existsSync(MANIFEST_FILE)) return null

  try {
    return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'))
  } catch {
    return null
  }
}

function writeManifest(manifest) {
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2))
}

function getDependencySignature() {
  return crypto
    .createHash('sha256')
    .update(hashFile(PACKAGE_JSON))
    .update(hashFile(PACKAGE_LOCK))
    .digest('hex')
}

console.log('\n📦 Starting FE Runtime Bundle Creation (ESM)...\n')
console.log(`   Mode: ${MODE.toUpperCase()}`)

const currentDependencySignature = getDependencySignature()
const previousManifest = readManifest()

if (
  MODE === 'slim' &&
  (!previousManifest ||
    previousManifest.dependencySignature !== currentDependencySignature)
) {
  console.error(
    '\n⚠️  Slim bundle rejected: package.json or package-lock.json changed since the last full bundle.',
  )
  console.error('   Run: npm run bundle:fe:full')
  process.exit(1)
}

try {
  //
  // 1. Build FE
  //
  console.log('🔍 Step 1: Running FE build...')
  run('npm run build')

  //
  // 2. Clean old runtime folder
  //
  console.log('\n🧹 Step 2: Cleaning previous runtime folder...')

  if (fs.existsSync(TARGET)) {
    fs.rmSync(TARGET, { recursive: true, force: true })
    console.log(`   Removed ${TARGET}`)
  }
  fs.mkdirSync(TARGET, { recursive: true })

  //
  // 3. Copy required files
  //
  console.log('\n📂 Step 3: Copying files...')

  console.log('   - Copying build/')
  copyRecursive(BUILD_DIR, path.join(TARGET, 'build'))

  console.log('   - Copying server.js')
  fs.copyFileSync(SERVER_JS, path.join(TARGET, 'server.js'))

  console.log('   - Copying package.json')
  fs.copyFileSync(PACKAGE_JSON, path.join(TARGET, 'package.json'))
  //
  // 4. Install prod dependencies only for full bootstrap bundles
  //
  if (MODE === 'full') {
    console.log('\n📦 Step 4: Installing production dependencies...')
    run('npm install --omit=dev', TARGET)
  } else {
    console.log('\n⚡ Step 4: Slim mode - skipping node_modules install')
  }

  //
  // 5. Create ZIP archive for fast Windows transfer
  //
  if (MODE === 'slim') {
    console.log('\n🗜️ Step 5: Creating ZIP archive for overlay deployment...')

    let zipCmd

    if (os.platform() === 'win32') {
      zipCmd = `powershell -Command "Compress-Archive -Path '${TARGET}\\*' -DestinationPath '${ARCHIVE_FILE}' -Force"`
    } else {
      zipCmd = `tar -czf ${ARCHIVE_FILE} -C ${path.dirname(TARGET)} ${path.basename(TARGET)}`
    }

    run(zipCmd, ROOT)
    console.log(`   Created ${path.basename(ARCHIVE_FILE)}`)
  }
  console.log('   - Copying .env')
  fs.copyFileSync(ENV_FILE, path.join(TARGET, '.env'))
  // 6. Create deployment guidance

  run(zipCmd, path.dirname(TARGET))
  if (MODE === 'slim') {
    console.log(`   - Archive: ${ARCHIVE_FILE}`)
    console.log('   - Purpose: copy over an existing runtime folder\n')
  } else {
    console.log('   - Production dependencies installed inside runtime\n')
  }

  if (MODE === 'full') {
    writeManifest({
      bundleType: 'full',
      createdAt: new Date().toISOString(),
      dependencySignature: currentDependencySignature,
    })
  }
  //
  // DONE
  if (MODE === 'slim') {
    console.log('   1. Extract ZIP into existing frontend-runtime folder')
    console.log('   2. Keep node_modules from the base runtime install')
    console.log('   3. Restart PM2 / service\n')
  } else {
    console.log('   1. Copy runtime folder to production server')
    console.log('   2. cd frontend-runtime')
    console.log('   3. npm start\n')
  }

  console.log('📋 Next steps on offline server:')
  console.log('   1. Copy ZIP ke server lokal')
  console.log('   2. unzip frontend-runtime.zip')
  console.log('   3. cd frontend-runtime')
  console.log('   4. npm start\n')
} catch (err) {
  console.error('\n❌ ERROR:', err.message)
  process.exit(1)
}
