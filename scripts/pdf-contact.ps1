$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = (Resolve-Path -LiteralPath 'docs/estagio/fase-2/06-evidencias/pdf-render').Path
$pages = Get-Content -Raw -LiteralPath (Join-Path $root 'paginas.json') | ConvertFrom-Json
$font = New-Object System.Drawing.Font('Arial',12)
for ($batch = 0; $batch -lt [math]::Ceiling($pages.Count/4); $batch++) {
  $bitmap = New-Object System.Drawing.Bitmap(1600,2300)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::LightGray)
  for ($index = 0; $index -lt 4; $index++) {
    $itemIndex = $batch*4+$index
    if ($itemIndex -ge $pages.Count) { break }
    $item = $pages[$itemIndex]
    $image = [System.Drawing.Image]::FromFile((Join-Path $root $item.image))
    $x = ($index % 2)*800
    $y = [math]::Floor($index/2)*1150
    $scale = [math]::Min(780/$image.Width,1100/$image.Height)
    $graphics.DrawString("$($item.pdf) p.$($item.page)",$font,[System.Drawing.Brushes]::Black,$x+10,$y+5)
    $graphics.DrawImage($image,[int]($x+10),[int]($y+35),[int]($image.Width*$scale),[int]($image.Height*$scale))
    $image.Dispose()
  }
  $bitmap.Save((Join-Path $root ('REVISAO-{0:00}.png' -f ($batch+1))),[System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose();$bitmap.Dispose()
}
$font.Dispose()
