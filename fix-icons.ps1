$apps = @("web", "staff", "student")

$insetXml = @"
<?xml version="1.0" encoding="utf-8"?>
<inset xmlns:android="http://schemas.android.com/apk/res/android"
    android:drawable="@mipmap/ic_launcher_foreground"
    android:inset="10%" />
"@

$launcherXml = @"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground_padded"/>
</adaptive-icon>
"@

foreach ($app in $apps) {
    $resPath = "D:\Maneza2.0\apps\$app\android\app\src\main\res"
    if (Test-Path $resPath) {
        $drawablePath = "$resPath\drawable"
        if (-not (Test-Path $drawablePath)) {
            New-Item -ItemType Directory -Force -Path $drawablePath
        }
        
        Set-Content -Path "$drawablePath\ic_launcher_foreground_padded.xml" -Value $insetXml -Encoding UTF8
        
        $anyDpiPath = "$resPath\mipmap-anydpi-v26"
        Set-Content -Path "$anyDpiPath\ic_launcher.xml" -Value $launcherXml -Encoding UTF8
        Set-Content -Path "$anyDpiPath\ic_launcher_round.xml" -Value $launcherXml -Encoding UTF8
        
        Write-Host "Updated $app"
    }
}
