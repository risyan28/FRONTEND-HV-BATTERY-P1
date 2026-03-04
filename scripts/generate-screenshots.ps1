# Generate PWA Screenshot Placeholders
# Quick fix untuk PWA warning

$imagesPath = "public\images"

Write-Host "🎨 Generating PWA Screenshot Placeholders..." -ForegroundColor Cyan
Write-Host ""

# Check if .NET System.Drawing is available
Add-Type -AssemblyName System.Drawing

# Generate Mobile Screenshot (390x844)
Write-Host "📱 Creating mobile screenshot (390x844)..." -ForegroundColor Yellow
$mobileBitmap = New-Object System.Drawing.Bitmap(390, 844)
$mobileGraphics = [System.Drawing.Graphics]::FromImage($mobileBitmap)

# Background
$mobileGraphics.Clear([System.Drawing.Color]::FromArgb(249, 250, 251))

# Header
$headerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 58, 138))
$mobileGraphics.FillRectangle($headerBrush, 0, 0, 390, 70)

# Title text
$font = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Bold)
$textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$mobileGraphics.DrawString("HV Battery P1", $font, $textBrush, 20, 30)

# Cards
$cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(219, 234, 254))
$mobileGraphics.FillRectangle($cardBrush, 20, 90, 165, 120)
$mobileGraphics.FillRectangle($cardBrush, 205, 90, 165, 120)
$mobileGraphics.FillRectangle($cardBrush, 20, 230, 350, 200)

# Border
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(229, 231, 235), 2)
$mobileGraphics.DrawRectangle($borderPen, 20, 230, 350, 200)

# Info text
$smallFont = New-Object System.Drawing.Font("Arial", 10)
$grayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(107, 114, 128))
$mobileGraphics.DrawString("Dashboard Mobile View", $smallFont, $grayBrush, 100, 800)

# Save mobile
$mobileOutputPath = Join-Path $imagesPath "screenshot-mobile.png"
$mobileBitmap.Save($mobileOutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$mobileBitmap.Dispose()
$mobileGraphics.Dispose()

Write-Host "✅ Mobile screenshot created: $mobileOutputPath" -ForegroundColor Green

# Generate Desktop Screenshot (1920x1080)
Write-Host "🖥️  Creating desktop screenshot (1920x1080)..." -ForegroundColor Yellow
$desktopBitmap = New-Object System.Drawing.Bitmap(1920, 1080)
$desktopGraphics = [System.Drawing.Graphics]::FromImage($desktopBitmap)

# Background
$desktopGraphics.Clear([System.Drawing.Color]::FromArgb(249, 250, 251))

# Header
$desktopGraphics.FillRectangle($headerBrush, 0, 0, 1920, 80)

# Title
$largefont = New-Object System.Drawing.Font("Arial", 24, [System.Drawing.FontStyle]::Bold)
$desktopGraphics.DrawString("HV Battery P1 - TMMIN", $largefont, $textBrush, 80, 35)

# Sidebar
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$desktopGraphics.FillRectangle($whiteBrush, 40, 110, 300, 920)
$desktopGraphics.DrawRectangle($borderPen, 40, 110, 300, 920)

# Stats cards
$desktopGraphics.FillRectangle($cardBrush, 380, 110, 450, 200)
$desktopGraphics.FillRectangle($cardBrush, 860, 110, 450, 200)
$desktopGraphics.FillRectangle($cardBrush, 1340, 110, 540, 200)

# Main chart
$desktopGraphics.FillRectangle($whiteBrush, 380, 340, 900, 700)
$desktopGraphics.DrawRectangle($borderPen, 380, 340, 900, 700)

# Right panels
$desktopGraphics.FillRectangle($whiteBrush, 1310, 340, 570, 340)
$desktopGraphics.DrawRectangle($borderPen, 1310, 340, 570, 340)
$desktopGraphics.FillRectangle($whiteBrush, 1310, 710, 570, 330)
$desktopGraphics.DrawRectangle($borderPen, 1310, 710, 570, 330)

# Labels
$mediumFont = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Bold)
$blueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 58, 138))
$desktopGraphics.DrawString("Production Dashboard", $mediumFont, $blueBrush, 730, 150)

# Footer text
$desktopGraphics.DrawString("HV Battery Production Management System", $smallFont, $grayBrush, 740, 1050)

# Save desktop
$desktopOutputPath = Join-Path $imagesPath "screenshot-desktop.png"
$desktopBitmap.Save($desktopOutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$desktopBitmap.Dispose()
$desktopGraphics.Dispose()

Write-Host "✅ Desktop screenshot created: $desktopOutputPath" -ForegroundColor Green

# Cleanup
$headerBrush.Dispose()
$textBrush.Dispose()
$cardBrush.Dispose()
$borderPen.Dispose()
$whiteBrush.Dispose()
$blueBrush.Dispose()
$grayBrush.Dispose()
$font.Dispose()
$largefont.Dispose()
$mediumFont.Dispose()
$smallFont.Dispose()

Write-Host ""
Write-Host "🎉 Done! Screenshots generated successfully!" -ForegroundColor Green
Write-Host "📁 Location: $imagesPath\" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Refresh browser - PWA warnings akan hilang" -ForegroundColor Green
