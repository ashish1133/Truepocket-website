$files = Get-ChildItem -Path '.' -Filter '*.html' -Recurse
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $content = $content -replace 'Truepocket', 'TruePocket'
    $content = $content -replace '(?s)<!-- Favicon configurations -->.*?<!-- Security Headers -->', '<!-- Favicon configurations -->
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <!-- Security Headers -->'
    Set-Content -Path $file.FullName -Value $content -NoNewline
}
