$files = Get-ChildItem -Path '.' -Filter '*.html' -Recurse
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $content = $content -replace 'TruePocket-logo', 'truepocket-logo'
    Set-Content -Path $file.FullName -Value $content -NoNewline
}
