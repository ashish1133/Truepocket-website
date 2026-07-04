$files = Get-ChildItem -Path 'C:\Users\alaga\Downloads\Truepocket-website-main' -Recurse -Include *.html
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $new = $content | ForEach-Object {
        if ($_ -match '<meta' -or $_ -match '<script\s+type="application/ld\+json"') {
            $_
        } else {
            $_ -replace '(?i)loan', 'advance'
        }
    }
    Set-Content -Path $file.FullName -Value $new -Encoding UTF8
}
