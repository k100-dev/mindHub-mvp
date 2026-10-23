param([string]$PdfDirectory = "docs/estagio/fase-2/06-evidencias/pdf-previa", [string]$OutputDirectory = "docs/estagio/fase-2/06-evidencias/pdf-render")
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
$null = [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType=WindowsRuntime]
$null = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType=WindowsRuntime]
$taskMethod = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 } | Select-Object -First 1
$actionMethod = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and -not $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 } | Select-Object -First 1
function Await-Result($Operation, $ResultType) {
  $task = $taskMethod.MakeGenericMethod($ResultType).Invoke($null, @($Operation))
  $task.GetAwaiter().GetResult()
}
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$outputPath = (Resolve-Path -LiteralPath $OutputDirectory).Path
$results = @()
foreach ($pdfFile in Get-ChildItem -LiteralPath $PdfDirectory -Filter '*.pdf') {
  $file = Await-Result ([Windows.Storage.StorageFile]::GetFileFromPathAsync($pdfFile.FullName)) ([Windows.Storage.StorageFile])
  $pdf = Await-Result ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])
  foreach ($oldImage in Get-ChildItem -LiteralPath $outputPath -Filter "$($pdfFile.BaseName)-pagina-*.png") {
    $oldPage = [int]($oldImage.BaseName -replace '^.*-pagina-', '')
    if ($oldPage -gt $pdf.PageCount) { Remove-Item -LiteralPath $oldImage.FullName }
  }
  for ($pageIndex = 0; $pageIndex -lt $pdf.PageCount; $pageIndex++) {
    $page = $pdf.GetPage($pageIndex)
    $stream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
    $action = $page.RenderToStreamAsync($stream)
    $actionTask = $actionMethod.Invoke($null,@($action))
    $null = $actionTask.GetAwaiter().GetResult()
    $reader = New-Object Windows.Storage.Streams.DataReader($stream.GetInputStreamAt(0))
    $null = Await-Result ($reader.LoadAsync([uint32]$stream.Size)) ([uint32])
    $bytes = New-Object byte[] ([int]$stream.Size)
    $reader.ReadBytes($bytes)
    $imageName = '{0}-pagina-{1:00}.png' -f $pdfFile.BaseName, ($pageIndex + 1)
    [System.IO.File]::WriteAllBytes((Join-Path $outputPath $imageName),$bytes)
    $results += [ordered]@{pdf=$pdfFile.Name;page=($pageIndex+1);image=$imageName;width=$page.Size.Width;height=$page.Size.Height}
    $reader.Dispose(); $stream.Dispose(); $page.Dispose()
  }
  Write-Output "$($pdfFile.Name): $($pdf.PageCount) pagina(s) rasterizada(s)"
}
$results | ConvertTo-Json | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $outputPath 'paginas.json')
