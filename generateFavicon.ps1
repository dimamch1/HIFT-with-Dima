Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap 512, 512
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Blue Circle background
$p1 = New-Object System.Drawing.Point 0, 0
$p2 = New-Object System.Drawing.Point 512, 512
$c1 = [System.Drawing.Color]::FromArgb(255, 37, 99, 235)  # Royal Blue #2563EB
$c2 = [System.Drawing.Color]::FromArgb(255, 15, 44, 89)   # Deep Navy Blue #0F2C59
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $p1, $p2, $c1, $c2
$g.FillEllipse($brush, 24, 24, 464, 464)

# Border ring
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 96, 165, 250)), 14
$g.DrawEllipse($pen, 24, 24, 464, 464)

# White 'H'
$font = New-Object System.Drawing.Font ("Arial", [float]240, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$rect = New-Object System.Drawing.RectangleF ([float]0), ([float]15), ([float]512), ([float]512)
$g.DrawString("H", $font, $textBrush, $rect, $sf)

$bmp.Save("public\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("assets\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("assets\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("assets\adaptive-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Host "Favicons generated successfully!"
