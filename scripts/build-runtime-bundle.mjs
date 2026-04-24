import fs from 'fs'
import crypto from 'crypto'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = process.cwd()
const DEPLOYMENT_ROOT = path.join(ROOT, 'Deployment')
const BUILD_DIR = path.join(ROOT, 'build')
const SERVER_JS = path.join(ROOT, 'server.js')
const PACKAGE_JSON = path.join(ROOT, 'package.json')
const PACKAGE_LOCK = path.join(ROOT, 'package-lock.json')
const ENV_FILE = path.join(ROOT, '.env')
const MANIFEST_FILE = path.join(ROOT, 'frontend-runtime.bundle-state.json')

const argMode = process.argv.includes('--full')
  ? 'full'
  : process.argv.includes('--slim')
    ? 'slim'
    : 'auto'

function run(cmd, cwd = ROOT) {
  console.log(`> ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd, shell: true })
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content)
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return

  const stats = fs.statSync(src)
  if (stats.isDirectory()) {
    ensureDir(dest)
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child))
    }
    return
  }

  ensureDir(path.dirname(dest))
  fs.copyFileSync(src, dest)
}

function hashFile(filePath) {
  if (!fs.existsSync(filePath)) return `missing:${filePath}`
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex')
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/')
}

function getRepoRoot() {
  try {
    return execSync('git rev-parse --show-toplevel', {
      cwd: ROOT,
      encoding: 'utf8',
      shell: true,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return null
  }
}

function filterGeneratedFiles(files) {
  const ignoredPrefixes = [
    'Deployment/',
    'frontend-runtime/',
    'build/',
    'dev-dist/',
  ]
  const ignoredExact = ['frontend-runtime.bundle-state.json']

  return files.filter((file) => {
    const normalized = normalizePath(file)
    if (ignoredExact.includes(normalized)) return false
    return !ignoredPrefixes.some((prefix) => normalized.startsWith(prefix))
  })
}

function listGitChangedFiles() {
  try {
    const repoRoot = getRepoRoot()
    if (!repoRoot) return []

    const rootRelative = normalizePath(path.relative(repoRoot, ROOT))
    const scopeArg = rootRelative ? `"${rootRelative}"` : '.'

    const trackedOutput = execSync(
      `git diff --name-only --diff-filter=ACMR HEAD -- ${scopeArg}`,
      {
        cwd: ROOT,
        encoding: 'utf8',
        shell: true,
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    )

    const untrackedOutput = execSync(
      `git ls-files --others --exclude-standard -- ${scopeArg}`,
      {
        cwd: ROOT,
        encoding: 'utf8',
        shell: true,
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    )

    const prefix = rootRelative ? `${rootRelative}/` : ''
    const toLocalPath = (line) => {
      const normalized = normalizePath(line.trim())
      if (!normalized) return null
      if (!prefix) return normalized
      return normalized.startsWith(prefix)
        ? normalized.slice(prefix.length)
        : null
    }

    const files = new Set()

    for (const line of trackedOutput.split(/\r?\n/)) {
      const local = toLocalPath(line)
      if (local) files.add(local)
    }

    for (const line of untrackedOutput.split(/\r?\n/)) {
      const local = toLocalPath(line)
      if (local) files.add(local)
    }

    return filterGeneratedFiles(Array.from(files).sort())
  } catch {
    try {
      const output = execSync('git status --porcelain=v1', {
        cwd: ROOT,
        encoding: 'utf8',
        shell: true,
        stdio: ['ignore', 'pipe', 'ignore'],
      })

      return filterGeneratedFiles(
        output
          .split(/\r?\n/)
          .map((line) => line.replace(/\s+$/, ''))
          .filter((line) => line.length >= 4)
          .map((line) => line.substring(3).replace(/ -> /g, ' -> ').trim()),
      )
    } catch {
      return []
    }
  }
}

function readManifest() {
  if (!fs.existsSync(MANIFEST_FILE)) return null

  try {
    return JSON.parse(readText(MANIFEST_FILE))
  } catch {
    return null
  }
}

function writeManifest(manifest) {
  writeText(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`)
}

function writeRuntimeNotes(targetDir, notes) {
  const body = [
    '# Frontend Runtime Update Notes',
    '',
    `- Bundle mode: ${notes.mode}`,
    `- Selected from: ${notes.reason}`,
    `- Created at: ${notes.createdAt}`,
    `- Changed files: ${notes.changedFiles.length}`,
    '',
    '## Changed Files',
    ...(notes.changedFiles.length > 0
      ? notes.changedFiles.map((file) => `- ${file}`)
      : ['- None detected']),
    '',
    '## Deployment',
    notes.mode === 'full'
      ? '- This bundle includes node_modules. Use this for first install or dependency changes.'
      : '- This bundle is overlay-only. Extract on top of an existing frontend-runtime folder.',
    '- Restart PM2 or the Windows service after extract.',
    '- If deploy fails, restore the previous runtime folder backup and check logs.',
    '',
  ].join('\n')

  writeText(path.join(targetDir, 'DEPLOYMENT-NOTES.md'), body)
}

function printFooterSummary({
  appName,
  requestedMode,
  resolvedMode,
  reason,
  changedFiles,
}) {
  console.log(`\n📌 ${appName} Bundle Summary (End)\n`)
  console.log(
    `Changed files since HEAD (informational only): ${changedFiles.length}`,
  )
  if (changedFiles.length > 0) {
    for (const file of changedFiles) {
      console.log(`  - ${file}`)
    }
  } else {
    console.log('  - None detected')
  }
  console.log(`Requested mode: ${requestedMode.toUpperCase()}`)
  console.log(`Resolved mode: ${resolvedMode.toUpperCase()}`)
  console.log(`Reason: ${reason}`)
}

function createDependencySignature() {
  return crypto
    .createHash('sha256')
    .update(hashFile(PACKAGE_JSON))
    .update(hashFile(PACKAGE_LOCK))
    .digest('hex')
}

function determineMode(explicitMode, manifest) {
  if (explicitMode === 'full' || explicitMode === 'slim') {
    return { mode: explicitMode, reason: `explicit --${explicitMode}` }
  }

  if (!manifest) {
    return { mode: 'full', reason: 'no previous manifest found' }
  }

  const dependencySignature = createDependencySignature()
  if (dependencySignature !== manifest.dependencySignature) {
    return {
      mode: 'full',
      reason:
        'package.json or package-lock.json changed since last full bundle',
    }
  }

  return { mode: 'slim', reason: 'code-only update' }
}

const changedFiles = listGitChangedFiles()
const manifest = readManifest()
const { mode, reason } = determineMode(argMode, manifest)
ensureDir(DEPLOYMENT_ROOT)
const runtimeDir = path.join(
  DEPLOYMENT_ROOT,
  mode === 'slim' ? 'frontend-runtime-update' : 'frontend-runtime',
)

console.log('\n📦 Frontend Runtime Bundle\n')
console.log(`Requested mode: ${argMode.toUpperCase()}`)
console.log(`Resolved mode: ${mode.toUpperCase()}`)
console.log('Build policy: ALWAYS BUILD (safe default)')
console.log(`Reason: ${reason}`)
if (changedFiles.length > 0) {
  console.log('Changed files since HEAD (informational only):')
  for (const file of changedFiles) {
    console.log(`  - ${file}`)
  }
}

if (mode === 'slim' && !manifest) {
  console.error(
    '\n⚠️  Slim mode is not available yet because no full runtime manifest exists.',
  )
  console.error('   Run: npm run bundle:fe:full')
  process.exit(1)
}

try {
  console.log('\n🔍 Step 1: Building frontend...')
  run('npm run build')

  console.log('\n🧹 Step 2: Preparing runtime folder...')
  if (fs.existsSync(runtimeDir)) {
    fs.rmSync(runtimeDir, { recursive: true, force: true })
  }
  ensureDir(runtimeDir)

  console.log('\n📂 Step 3: Copying runtime files...')
  copyRecursive(BUILD_DIR, path.join(runtimeDir, 'build'))
  fs.copyFileSync(SERVER_JS, path.join(runtimeDir, 'server.js'))
  fs.copyFileSync(PACKAGE_JSON, path.join(runtimeDir, 'package.json'))
  fs.copyFileSync(PACKAGE_LOCK, path.join(runtimeDir, 'package-lock.json'))
  if (fs.existsSync(ENV_FILE)) {
    fs.copyFileSync(ENV_FILE, path.join(runtimeDir, '.env'))
  }

  const dependencySignature = createDependencySignature()

  if (mode === 'full') {
    console.log('\n📦 Step 4: Installing production dependencies...')
    run('npm install --omit=dev', runtimeDir)
  } else {
    console.log('\n⚡ Step 4: Slim mode - skipping node_modules install')
  }

  writeRuntimeNotes(runtimeDir, {
    mode,
    reason,
    createdAt: new Date().toISOString(),
    changedFiles,
  })

  if (mode === 'full') {
    writeManifest({
      bundleType: 'full',
      createdAt: new Date().toISOString(),
      dependencySignature,
    })
  }

  console.log('\n✅ Frontend bundle complete')
  console.log(`Runtime folder: ${runtimeDir}`)
  if (mode === 'slim') {
    console.log('Archive: not created automatically (manual by user)')
  }
  console.log('Notes: DEPLOYMENT-NOTES.md inside the runtime folder')
  printFooterSummary({
    appName: 'Frontend Runtime',
    requestedMode: argMode,
    resolvedMode: mode,
    reason,
    changedFiles,
  })
} catch (error) {
  console.error('\n❌ Frontend bundle failed:')
  console.error(error?.message || error)
  process.exit(1)
}
