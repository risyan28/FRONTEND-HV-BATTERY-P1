/**
 * PWA Icon Generator Script
 * Generates proper sized PWA icons from TMMIN logo
 *
 * Run: node generate-icons.mjs
 */

import { createCanvas, loadImage } from 'canvas'
import { writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, 'public', 'images')

async function generateIcons() {
  console.log('🎨 Generating PWA Icons...\n')

  // Load source logo
  const logoPath = join(PUBLIC_DIR, 'tmmin.png')

  if (!existsSync(logoPath)) {
    console.error('❌ Logo not found:', logoPath)
    console.log('💡 Please ensure tmmin.png exists in public/images/')
    return
  }

  const logo = await loadImage(logoPath)

  // Generate icons
  const icons = [
    { size: 192, name: 'icon-192.png', maskable: false },
    { size: 512, name: 'icon-512.png', maskable: false },
    { size: 192, name: 'icon-192-maskable.png', maskable: true },
    { size: 512, name: 'icon-512-maskable.png', maskable: true },
  ]

  for (const { size, name, maskable } of icons) {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#1e3a8a' // Theme color from manifest
    ctx.fillRect(0, 0, size, size)

    // Calculate padding (maskable needs 20%, regular 10%)
    const padding = maskable ? size * 0.2 : size * 0.1
    const imageSize = size - padding * 2

    // Calculate aspect ratio
    const aspectRatio = logo.width / logo.height
    let drawWidth = imageSize
    let drawHeight = imageSize

    if (aspectRatio > 1) {
      drawHeight = imageSize / aspectRatio
    } else {
      drawWidth = imageSize * aspectRatio
    }

    // Center the image
    const x = (size - drawWidth) / 2
    const y = (size - drawHeight) / 2

    // Draw logo
    ctx.drawImage(logo, x, y, drawWidth, drawHeight)

    // Save
    const buffer = canvas.toBuffer('image/png')
    const outputPath = join(PUBLIC_DIR, name)
    writeFileSync(outputPath, buffer)

    console.log(
      `✅ Generated: ${name} (${size}x${size}${maskable ? ' maskable' : ''})`,
    )
  }

  console.log('\n🎉 All icons generated successfully!')
  console.log('📁 Location: public/images/\n')
}

generateIcons().catch(console.error)
