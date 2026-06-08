<#
===========================================================================
 Markdown Viewer — 一键部署所有依赖资源
===========================================================================
 功能：根据 build/ 下的各依赖构建脚本，自动完成：
   1. 安装每个依赖的 npm 包
   2. 执行构建（打包、压缩、复制）
   3. 将所有构建产物部署到 vendor/ 和 themes/ 目录

 用法：
   .\scripts\部署依赖.ps1            # 部署所有依赖（默认 Chrome）
   .\scripts\部署依赖.ps1 chrome     # 部署所有依赖（Chrome）
   .\scripts\部署依赖.ps1 firefox    # 部署所有依赖（Firefox）

 前置条件：
   - Git Bash（sh.exe）已安装
   - Node.js >= 18
   - npm >= 10

===========================================================================
#>

param(
    [ValidateSet('chrome', 'firefox')]
    [string]$Browser = 'chrome'
)

$ErrorActionPreference = 'Continue'

# ---- 路径解析 ----
$ProjectRoot = Resolve-Path "$PSScriptRoot/.."
$BuildRoot = Join-Path $ProjectRoot 'build'
$VendorDir = Join-Path $ProjectRoot 'vendor'
$ThemesDir = Join-Path $ProjectRoot 'themes'

# ---- 查找 Git Bash (sh.exe) ----
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

# ---- 工具函数：运行单个依赖的 build.sh ----
function Invoke-BuildDep {
    param(
        [string]$Name,
        [string]$SubDir,
        [string]$ExtraArg
    )
    $dir = (Join-Path $BuildRoot $SubDir) -replace '\\', '/'
    Write-Host "`n[构建] $Name ..." -ForegroundColor Cyan

    if (-not $ShPath) {
        Write-Host "  [跳过] 未找到 sh.exe（Git Bash），请安装 Git for Windows" -ForegroundColor Yellow
        return $false
    }

    $cmd = "cd '$dir' && sh build.sh $ExtraArg 2>&1"
    $output = & $ShPath -c $cmd

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [成功] $Name" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "  [失败] $Name" -ForegroundColor Red
        if ($output) { Write-Host "  $output" -ForegroundColor DarkRed }
        return $false
    }
}

# ---- 工具函数：直接复制（适用于仅需 npm install + 复制文件的依赖） ----
function Invoke-CopyDep {
    param(
        [string]$Name,
        [string]$SubDir,
        [scriptblock]$CopyAction
    )
    $dir = Join-Path $BuildRoot $SubDir
    Write-Host "`n[构建] $Name ..." -ForegroundColor Cyan

    # npm install
    Push-Location $dir
    try {
        npm ci 2>$null
        if ($LASTEXITCODE -ne 0) { npm i }
        if ($LASTEXITCODE -ne 0) { throw "npm install 失败" }

        # 执行自定义复制操作
        & $CopyAction
        Write-Host "  [成功] $Name" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  [失败] $Name : $_" -ForegroundColor Red
        return $false
    }
    finally {
        # 清理 node_modules
        if (Test-Path 'node_modules') {
            Remove-Item -Recurse -Force 'node_modules' -ErrorAction SilentlyContinue
        }
        Pop-Location
    }
}

# ============================================================
#  主流程
# ============================================================
Write-Host "==============================================" -ForegroundColor Magenta
Write-Host " Markdown Viewer — 一键部署所有依赖" -ForegroundColor Magenta
Write-Host "==============================================" -ForegroundColor Magenta
Write-Host " 浏览器 : $Browser" -ForegroundColor White
Write-Host " 项目根 : $ProjectRoot" -ForegroundColor White
Write-Host " Vendor : $VendorDir" -ForegroundColor White
Write-Host " Themes : $ThemesDir" -ForegroundColor White
Write-Host "==============================================" -ForegroundColor Magenta

if (-not $ShPath) {
    Write-Host "`n[错误] 未找到 Git Bash (sh.exe)。请安装 Git for Windows。`n" -ForegroundColor Red
    exit 1
}
Write-Host "[信息] sh.exe 路径: $ShPath`n"

Push-Location $ProjectRoot

# ---- 第 1 步：清理旧的构建产物 ----
Write-Host "=== 第 1 步：清理旧的构建产物 ===" -ForegroundColor Yellow
foreach ($dir in @($VendorDir, $ThemesDir)) {
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir -ErrorAction SilentlyContinue
        Write-Host "  [清理] $dir"
    }
}
New-Item -ItemType Directory -Force -Path $VendorDir | Out-Null
New-Item -ItemType Directory -Force -Path $ThemesDir | Out-Null
Write-Host "  [完成] vendor/ 和 themes/ 已重置为空目录`n"

# ---- 第 2 步：构建所有依赖 ----
Write-Host "=== 第 2 步：构建所有依赖 ===" -ForegroundColor Yellow

$results = @{}   # 记录每个依赖的构建结果

# ------------------------------
# 2a. 使用 build.sh 的依赖（通过 Git Bash 运行）
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

# themes 需要浏览器参数
$ok = Invoke-BuildDep -Name 'themes' -SubDir 'themes' -ExtraArg $Browser
$results['themes'] = $ok

# ------------------------------
# 2b. MDC — 特殊处理（node-sass 在 Windows 上可能编译失败）
# ------------------------------
Write-Host "`n[构建] mdc ..." -ForegroundColor Cyan
$mdcDir = (Join-Path $BuildRoot 'mdc') -replace '\\', '/'
$mdcOutput = & $ShPath -c "cd '$mdcDir' && sh build.sh 2>&1 | tail -5"
if ($LASTEXITCODE -eq 0 -and (Test-Path (Join-Path $VendorDir 'mdc.min.js'))) {
    Write-Host "  [成功] mdc" -ForegroundColor Green
    $results['mdc'] = $true
}
else {
    Write-Host "  [跳过] mdc 构建失败（node-sass 原生模块在 Windows 上不可用，不影响核心功能）" -ForegroundColor Yellow
    $results['mdc'] = $false
}

# ---- 第 3 步：验证构建结果 ----
Write-Host "`n=== 第 3 步：验证构建结果 ===" -ForegroundColor Yellow

$allOk = $true
Write-Host "`n构建摘要：" -ForegroundColor Yellow
foreach ($key in $results.Keys) {
    $icon = if ($results[$key]) { '✔' } else { '✘' }
    $color = if ($results[$key]) { 'Green' } else { 'Red' }
    Write-Host "  $icon $key" -ForegroundColor $color
    if (-not $results[$key]) { $allOk = $false }
}

# ---- 第 4 步：输出产物清单 ----
Write-Host "`n=== 第 4 步：产物清单 ===" -ForegroundColor Yellow

# Vendor 目录
$vendorFiles = @()
if (Test-Path $VendorDir) {
    $vendorFiles = Get-ChildItem -Path $VendorDir -Recurse -File | ForEach-Object {
        $relative = $_.FullName.Substring($ProjectRoot.Length + 1)
        $size = '{0:N2} KB' -f ($_.Length / 1KB)
        [PSCustomObject]@{ Path = $relative; Size = $size }
    }
}

# Themes 目录
$themeFiles = @()
if (Test-Path $ThemesDir) {
    $themeFiles = Get-ChildItem -Path $ThemesDir -File | ForEach-Object {
        $relative = $_.FullName.Substring($ProjectRoot.Length + 1)
        $size = '{0:N2} KB' -f ($_.Length / 1KB)
        [PSCustomObject]@{ Path = $relative; Size = $size }
    }
}

Write-Host "`n  Vendor 文件数：$($vendorFiles.Count)" -ForegroundColor White
if ($vendorFiles.Count -gt 0) {
    $vendorFiles | ForEach-Object { Write-Host "    $($_.Path)  ($($_.Size))" -ForegroundColor Gray }
}

Write-Host "`n  Themes 文件数：$($themeFiles.Count)" -ForegroundColor White
if ($themeFiles.Count -gt 0) {
    $themeFiles | ForEach-Object { Write-Host "    $($_.Path)  ($($_.Size))" -ForegroundColor Gray }
}

# ============================================================
Write-Host "`n==============================================" -ForegroundColor Magenta
if ($allOk) {
    Write-Host " 全部依赖部署成功！" -ForegroundColor Green
}
else {
    Write-Host " 部分依赖部署失败，请查看上方详情。" -ForegroundColor Yellow
    Write-Host " 提示：某些依赖（如 mdc）在 Windows 上可能受限，不影响扩展核心功能。" -ForegroundColor Gray
}
Write-Host "==============================================" -ForegroundColor Magenta
Write-Host ""

Pop-Location
