$files = Get-ChildItem -Path 'C:\Users\alaga\Downloads\Truepocket-website-main' -Recurse -Include *.js
foreach ($file in $files) {
    $content = Get-Content $file.FullName
    $new = $content | ForEach-Object {
        # Skip lines that are likely part of data payloads or comments containing 'loan' for SEO purposes
        if ($_ -match '#') {
            $_
        } elseif ($_ -match 'loan' -and $_ -notmatch '\\"') {
            $_ -replace '(?i)loan', 'advance'
        } else {
            $_
        }
    }
    Set-Content -Path $file.FullName -Value $new -Encoding UTF8
}
