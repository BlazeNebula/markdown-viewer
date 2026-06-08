<#
===========================================================================
 Markdown Viewer Extension Build Script
 Target: Chrome / Firefox Extension
 Output: dist/<browser>/markdown-viewer.zip + dist/<browser>/markdown-viewer/

 Usage:
   .\scripts\构建扩展.ps1            # Build for Chrome (default)
   .\scripts\构建扩展.ps1 chrome     # Build for Chrome
   .\scripts\构建扩展.ps1 firefox    # Build for Firefox

 Prerequisites:
   - Git Bash (sh.exe) installed
   - Node.js >= 18
   - npm >= 10
===========================================================================
#>

param(
    [ValidateSet('chrome', 'firefox')]
    [string]$Browser = 'chrome'
)

$ErrorActionPreference = 'Continue'

# ---- Resolve paths ----
$ProjectRoot = Resolve-Path "$PSScriptRoot/.."
$DistDir = Join-Path $ProjectRoot "dist" | Join-Path -ChildPath $Browser
$PkgDir = Join-Path $DistDir "markdown-viewer"
$ZipPath = Join-Path $DistDir "markdown-viewer.zip"

# ---- Find sh.exe (Git Bash) ----
$ShCandidates = @(
    "$(Split-Path (Get-Command git -ErrorAction SilentlyContinue).Source)/../bin/sh.exe"
    "$env:ProgramFiles\Git\bin\sh.exe"
    "${env:ProgramFiles(x86)}\Git\bin\sh.exe"
    "D:\Program Files\Git\bin\sh.exe"
    "C:\Program Files\Git\bin\sh.exe"
)
$ShPath = $null
foreach ($c in $ShCandidates) {
    if (Test-Path $c) { $ShPath = $c; break }
}

# ---- Helper: run a build.sh in a subdirectory ----
function Invoke-BuildDep {
    param([string]$Name, [string]$SubDir, [string]$ExtraArg)
    $dir = (Join-Path $ProjectRoot $SubDir) -replace '\\', '/'
    Write-Host "[BUILD] $Name ..." -ForegroundColor Cyan
    if (-not $ShPath) {
        Write-Host "  [SKIP] sh.exe not found" -ForegroundColor Yellow
        return $false
    }
    $cmd = "cd '$dir' && sh build.sh $ExtraArg 2>&1"
    $output = & $ShPath -c $cmd
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] $Name" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "  [FAIL] $Name" -ForegroundColor Red
        Write-Host "  $output" -ForegroundColor DarkRed
        return $false
    }
}

# ============================================================
Write-Host "==============================================" -ForegroundColor Magenta
Write-Host " Markdown Viewer Extension Build" -ForegroundColor Magenta
Write-Host " Browser : $Browser" -ForegroundColor Magenta
Write-Host " Root    : $ProjectRoot" -ForegroundColor Magenta
Write-Host " Output  : $DistDir" -ForegroundColor Magenta
Write-Host "==============================================" -ForegroundColor Magenta

if (-not $ShPath) {
    Write-Host "[ERROR] Git Bash (sh.exe) not found. Please install Git for Windows." -ForegroundColor Red
    exit 1
}
Write-Host "[INFO] Using sh.exe: $ShPath"
Write-Host ""

Push-Location $ProjectRoot

# ---- Step 1: Clean previous build artifacts ----
Write-Host "=== Step 1: Clean old builds ===" -ForegroundColor Yellow
@('themes', 'vendor') | ForEach-Object {
    if (Test-Path $_) { Remove-Item -Recurse -Force $_ -ErrorAction SilentlyContinue }
    New-Item -ItemType Directory -Force -Path $_ | Out-Null
}
Write-Host "  themes/ and vendor/ are reset"
Write-Host ""

# ---- Step 2: Build all dependencies ----
Write-Host "=== Step 2: Build dependencies ===" -ForegroundColor Yellow

$depResults = @{}

# Simple deps (no extra args)
$simpleDeps = @('csso', 'bootstrap', 'markdown-it', 'marked', 'remark', 'mathjax', 'mithril', 'panzoom', 'mermaid', 'prism')
foreach ($dep in $simpleDeps) {
    $ok = Invoke-BuildDep -Name $dep -SubDir "build/$dep"
    $depResults[$dep] = $ok
}

# Themes needs browser arg
$ok = Invoke-BuildDep -Name 'themes' -SubDir 'build/themes' -ExtraArg $Browser
$depResults['themes'] = $ok

# MDC 已移除，改用 Bootstrap 5.3 + 纯 CSS 替代

Write-Host ""
Write-Host "Build Summary:" -ForegroundColor Yellow
foreach ($k in $depResults.Keys) {
    $m = if ($depResults[$k]) { '[OK]' } else { '[-]' }
    Write-Host "  $m $k"
}
Write-Host ""

# ---- Step 3: Assemble extension ----
Write-Host "=== Step 3: Assemble extension files ===" -ForegroundColor Yellow

if (Test-Path $DistDir) { Remove-Item -Recurse -Force $DistDir -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $PkgDir -Force | Out-Null

$copyDirs = @('background', 'content', 'icons', 'options', 'popup', 'themes', 'vendor')
foreach ($d in $copyDirs) {
    if (Test-Path $d) {
        Copy-Item -Recurse -Path $d -Destination "$PkgDir/" -Force
        Write-Host "  Copied: $d/"
    }
}

if (Test-Path 'LICENSE') { Copy-Item 'LICENSE' -Destination "$PkgDir/" -Force }

$manifestFile = "manifest.$Browser.json"
if (Test-Path $manifestFile) {
    Copy-Item $manifestFile -Destination "$PkgDir/manifest.json" -Force
    Copy-Item $manifestFile -Destination 'manifest.json' -Force
    Write-Host "  Copied: $manifestFile -> manifest.json"
}
else {
    Write-Host "[ERROR] Manifest not found: $manifestFile" -ForegroundColor Red
    Pop-Location; exit 1
}
Write-Host ""

# ---- Step 4: Create ZIP ----
Write-Host "=== Step 4: Create ZIP ===" -ForegroundColor Yellow
Compress-Archive -Path "$PkgDir/*" -DestinationPath $ZipPath -Force
$zipSize = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
Write-Host "  [OK] $ZipPath ($zipSize MB)" -ForegroundColor Green
Write-Host ""

# ---- Done ----
Write-Host "==============================================" -ForegroundColor Magenta
Write-Host " BUILD COMPLETE" -ForegroundColor Magenta
Write-Host "==============================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Outputs:" -ForegroundColor Cyan
Write-Host "  [ZIP]     $ZipPath" -ForegroundColor White
Write-Host "  [UNPACK]  $PkgDir\" -ForegroundColor White
Write-Host ""
Write-Host "How to use:" -ForegroundColor Cyan
Write-Host "  1. Open Chrome -> chrome://extensions" -ForegroundColor White
Write-Host "  2. Enable 'Developer mode' (top right)" -ForegroundColor White
Write-Host "  3. Click 'Load unpacked' -> select:" -ForegroundColor White
Write-Host "     $PkgDir" -ForegroundColor Yellow
Write-Host ""

Pop-Location
