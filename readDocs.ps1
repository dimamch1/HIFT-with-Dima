Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-DocxContent {
    param([string]$filePath)
    
    try {
        $zip = [System.IO.Compression.ZipFile]::OpenRead($filePath)
        $entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
        if ($entry) {
            $stream = $entry.Open()
            $reader = New-Object System.IO.StreamReader($stream)
            $xmlContent = $reader.ReadToEnd()
            $reader.Close()
            $stream.Close()
            $zip.Dispose()
            
            # Extract all text inside <w:t> tags
            $matches = [System.Text.RegularExpressions.Regex]::Matches($xmlContent, '<w:p[ >].*?<\/w:p>')
            $paragraphs = @()
            foreach ($m in $matches) {
                $pXml = $m.Value
                $tMatches = [System.Text.RegularExpressions.Regex]::Matches($pXml, '<w:t[^>]*>(.*?)<\/w:t>')
                $line = ($tMatches | ForEach-Object { $_.Groups[1].Value }) -join ''
                if (-not [string]::IsNullOrWhiteSpace($line)) {
                    $paragraphs += [System.Net.WebUtility]::HtmlDecode($line)
                }
            }
            return $paragraphs -join "`r`n"
        }
        $zip.Dispose()
    } catch {
        return "Error reading $filePath : $_"
    }
    return ""
}

$files = Get-ChildItem -Path "C:\Users\dimam\antigravity\workout\training" -Filter "*.docx"
$out = @()
foreach ($file in $files) {
    $out += "=========================================="
    $out += "FILE: $($file.Name)"
    $out += "=========================================="
    $content = Get-DocxContent $file.FullName
    $out += $content
    $out += "`r`n"
}
$out | Out-File -Encoding utf8 "C:\Users\dimam\antigravity\workout\extracted_training_plans.txt"
Write-Host "Extracted $($files.Count) files successfully!"
