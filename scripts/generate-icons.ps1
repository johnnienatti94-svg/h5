Add-Type -AssemblyName System.Drawing
$src = "C:\Users\johnn\.gemini\antigravity-ide\brain\06e44c43-7a69-45df-b9d8-42d5a4732d71\.user_uploaded\media_1791340584583.jpg"
$img = [System.Drawing.Image]::FromFile($src)

# Save as public/brand-icon.png
$img.Save("d:\Projects\H5 project\meepro-app\public\brand-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Save as public/brand-icon.jpg
$img.Save("d:\Projects\H5 project\meepro-app\public\brand-icon.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)

# Save as src/app/icon.png
$img.Save("d:\Projects\H5 project\meepro-app\src\app\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Save as src/app/apple-icon.png
$img.Save("d:\Projects\H5 project\meepro-app\src\app\apple-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Save a 64x64 favicon.ico in public
$bmp = New-Object System.Drawing.Bitmap 64, 64
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, 64, 64)
$g.Dispose()

$hIcon = $bmp.GetHicon()
$ico = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream "d:\Projects\H5 project\meepro-app\public\favicon.ico", ([System.IO.FileMode]::Create)
$ico.Save($fs)
$fs.Close()

$img.Dispose()
$bmp.Dispose()
Write-Host "Icons generated successfully!"
