<#
===========================================================================
 Markdown Viewer 鈥?涓€閿儴缃叉墍鏈変緷璧栬祫婧?
===========================================================================
 鍔熻兘锛氭牴鎹?build/ 涓嬬殑鍚勪緷璧栨瀯寤鸿剼鏈紝鑷姩瀹屾垚锛?
   1. 瀹夎姣忎釜渚濊禆鐨?npm 鍖?
   2. 鎵ц鏋勫缓锛堟墦鍖呫€佸帇缂┿€佸鍒讹級
   3. 灏嗘墍鏈夋瀯寤轰骇鐗╅儴缃插埌 vendor/ 鍜?themes/ 鐩綍

 鐢ㄦ硶锛?
   .\scripts\閮ㄧ讲渚濊禆.ps1            # 閮ㄧ讲鎵€鏈変緷璧栵紙榛樿 Chrome锛?
   .\scripts\閮ㄧ讲渚濊禆.ps1 chrome     # 閮ㄧ讲鎵€鏈変緷璧栵紙Chrome锛?
   .\scripts\閮ㄧ讲渚濊禆.ps1 firefox    # 閮ㄧ讲鎵€鏈変緷璧栵紙Firefox锛?

 鍓嶇疆鏉′欢锛?
   - Git Bash锛坰h.exe锛夊凡瀹夎
   - Node.js >= 18
   - npm >= 10

===========================================================================
#>

param(
    [ValidateSet('chrome', 'firefox')]
    [string]$Browser = 'chrome'
)

$ErrorActionPreference = 'Continue'

# ---- 璺緞瑙ｆ瀽 ----
$ProjectRoot = Resolve-Path "$PSScriptRoot/.."
$BuildRoot = Join-Path $ProjectRoot 'build'
$VendorDir = Join-Path $ProjectRoot 'vendor'
$ThemesDir = Join-Path $ProjectRoot 'themes'

# ---- 鏌ユ壘 Git Bash (sh.exe) ----
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

# ---- 宸ュ叿鍑芥暟锛氳繍琛屽崟涓緷璧栫殑 build.sh ----
function Invoke-BuildDep {
    param(
        [string]$Name,
        [string]$SubDir,
        [string]$ExtraArg
    )
    $dir = (Join-Path $BuildRoot $SubDir) -replace '\\', '/'
    Write-Host "`n[鏋勫缓] $Name ..." -ForegroundColor Cyan

    if (-not $ShPath) {
        Write-Host "  [璺宠繃] 鏈壘鍒?sh.exe锛圙it Bash锛夛紝璇峰畨瑁?Git for Windows" -ForegroundColor Yellow
        return $false
    }

    $cmd = "cd '$dir' && sh build.sh $ExtraArg 2>&1"
    $output = & $ShPath -c $cmd

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [鎴愬姛] $Name" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "  [澶辫触] $Name" -ForegroundColor Red
        if ($output) { Write-Host "  $output" -ForegroundColor DarkRed }
        return $false
    }
}

# ---- 宸ュ叿鍑芥暟锛氱洿鎺ュ鍒讹紙閫傜敤浜庝粎闇€ npm install + 澶嶅埗鏂囦欢鐨勪緷璧栵級 ----
function Invoke-CopyDep {
    param(
        [string]$Name,
        [string]$SubDir,
        [scriptblock]$CopyAction
    )
    $dir = Join-Path $BuildRoot $SubDir
    Write-Host "`n[鏋勫缓] $Name ..." -ForegroundColor Cyan

    # npm install
    Push-Location $dir
    try {
        npm ci 2>$null
        if ($LASTEXITCODE -ne 0) { npm i }
        if ($LASTEXITCODE -ne 0) { throw "npm install 澶辫触" }

        # 鎵ц鑷畾涔夊鍒舵搷浣?
        & $CopyAction
        Write-Host "  [鎴愬姛] $Name" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  [澶辫触] $Name : $_" -ForegroundColor Red
        return $false
    }
    finally {
        # 娓呯悊 node_modules
        if (Test-Path 'node_modules') {
            Remove-Item -Recurse -Force 'node_modules' -ErrorAction SilentlyContinue
        }
        Pop-Location
    }
}

# ============================================================
#  涓绘祦绋?
# ============================================================
Write-Host "==============================================" -ForegroundColor Magenta
Write-Host " Markdown Viewer 鈥?涓€閿儴缃叉墍鏈変緷璧? -ForegroundColor Magenta
Write-Host "==============================================" -ForegroundColor Magenta
Write-Host " 娴忚鍣?: $Browser" -ForegroundColor White
Write-Host " 椤圭洰鏍?: $ProjectRoot" -ForegroundColor White
Write-Host " Vendor : $VendorDir" -ForegroundColor White
Write-Host " Themes : $ThemesDir" -ForegroundColor White
Write-Host "==============================================" -ForegroundColor Magenta

if (-not $ShPath) {
    Write-Host "`n[閿欒] 鏈壘鍒?Git Bash (sh.exe)銆傝瀹夎 Git for Windows銆俙n" -ForegroundColor Red
    exit 1
}
Write-Host "[淇℃伅] sh.exe 璺緞: $ShPath`n"

Push-Location $ProjectRoot

# ---- 绗?1 姝ワ細娓呯悊鏃х殑鏋勫缓浜х墿 ----
Write-Host "=== 绗?1 姝ワ細娓呯悊鏃х殑鏋勫缓浜х墿 ===" -ForegroundColor Yellow
foreach ($dir in @($VendorDir, $ThemesDir)) {
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir -ErrorAction SilentlyContinue
        Write-Host "  [娓呯悊] $dir"
    }
}
New-Item -ItemType Directory -Force -Path $VendorDir | Out-Null
New-Item -ItemType Directory -Force -Path $ThemesDir | Out-Null
Write-Host "  [瀹屾垚] vendor/ 鍜?themes/ 宸查噸缃负绌虹洰褰昤n"

# ---- 绗?2 姝ワ細鏋勫缓鎵€鏈変緷璧?----
Write-Host "=== 绗?2 姝ワ細鏋勫缓鎵€鏈変緷璧?===" -ForegroundColor Yellow

$results = @{}   # 璁板綍姣忎釜渚濊禆鐨勬瀯寤虹粨鏋?

# ------------------------------
# 2a. 浣跨敤 build.sh 鐨勪緷璧栵紙閫氳繃 Git Bash 杩愯锛?
# ------------------------------
$shBuildDeps = @(
    @{ Name = 'csso'; SubDir = 'csso' }
    @{ Name = 'bootstrap'; SubDir = 'bootstrap' }
    @{ Name = 'markdown-it'; SubDir = 'markdown-it' }
    @{ Name = 'marked'; SubDir = 'marked' }
    @{ Name = 'remark'; SubDir = 'remark' }
    @{ Name = 'mathjax'; SubDir = 'mathjax' }
    @{ Name = 'mithril'; SubDir = 'mithril' }
    @{ Name = 'panzoom'; SubDir = 'panzoom' }
    @{ Name = 'mermaid'; SubDir = 'mermaid' }
    @{ Name = 'prism'; SubDir = 'prism' }
)

foreach ($dep in $shBuildDeps) {
    $ok = Invoke-BuildDep -Name $dep.Name -SubDir $dep.SubDir
    $results[$dep.Name] = $ok
}

# themes 闇€瑕佹祻瑙堝櫒鍙傛暟
$ok = Invoke-BuildDep -Name 'themes' -SubDir 'themes' -ExtraArg $Browser
$results['themes'] = $ok

# MDC 宸茬Щ闄わ紝鏀圭敤 Bootstrap 5.3 + 绾?CSS 鏇夸唬

# ---- 绗?3 姝ワ細楠岃瘉鏋勫缓缁撴灉 ----
Write-Host "`n=== 绗?3 姝ワ細楠岃瘉鏋勫缓缁撴灉 ===" -ForegroundColor Yellow

$allOk = $true
Write-Host "`n鏋勫缓鎽樿锛? -ForegroundColor Yellow
foreach ($key in $results.Keys) {
    $icon = if ($results[$key]) { '[OK]' } else { '[--]' }
    $color = if ($results[$key]) { 'Green' } else { 'Red' }
    Write-Host "  $icon $key" -ForegroundColor $color
    if (-not $results[$key]) { $allOk = $false }
}

# ---- 绗?4 姝ワ細杈撳嚭浜х墿娓呭崟 ----
Write-Host "`n=== 绗?4 姝ワ細浜х墿娓呭崟 ===" -ForegroundColor Yellow

# Vendor 鐩綍
$vendorFiles = @()
if (Test-Path $VendorDir) {
    $vendorFiles = Get-ChildItem -Path $VendorDir -Recurse -File | ForEach-Object {
        $relative = $_.FullName.Substring($ProjectRoot.Length + 1)
        $size = '{0:N2} KB' -f ($_.Length / 1KB)
        [PSCustomObject]@{ Path = $relative; Size = $size }
    }
}

# Themes 鐩綍
$themeFiles = @()
if (Test-Path $ThemesDir) {
    $themeFiles = Get-ChildItem -Path $ThemesDir -File | ForEach-Object {
        $relative = $_.FullName.Substring($ProjectRoot.Length + 1)
        $size = '{0:N2} KB' -f ($_.Length / 1KB)
        [PSCustomObject]@{ Path = $relative; Size = $size }
    }
}

Write-Host "`n  Vendor 鏂囦欢鏁帮細$($vendorFiles.Count)" -ForegroundColor White
if ($vendorFiles.Count -gt 0) {
    $vendorFiles | ForEach-Object { Write-Host "    $($_.Path)  ($($_.Size))" -ForegroundColor Gray }
}

Write-Host "`n  Themes 鏂囦欢鏁帮細$($themeFiles.Count)" -ForegroundColor White
if ($themeFiles.Count -gt 0) {
    $themeFiles | ForEach-Object { Write-Host "    $($_.Path)  ($($_.Size))" -ForegroundColor Gray }
}

# ============================================================
Write-Host "`n==============================================" -ForegroundColor Magenta
if ($allOk) {
    Write-Host " 鍏ㄩ儴渚濊禆閮ㄧ讲鎴愬姛锛? -ForegroundColor Green
}
else {
    Write-Host " 閮ㄥ垎渚濊禆閮ㄧ讲澶辫触锛岃鏌ョ湅涓婃柟璇︽儏銆? -ForegroundColor Yellow
    Write-Host " 鎻愮ず锛氳鎯呰鏌ョ湅涓婃柟鏃ュ織銆侻DC 宸蹭粠椤圭洰涓Щ闄わ紝鏀圭敤 Bootstrap 5.3 + 绾?CSS 鏇夸唬銆? -ForegroundColor Gray
}
Write-Host "==============================================" -ForegroundColor Magenta
Write-Host ""

Pop-Location

