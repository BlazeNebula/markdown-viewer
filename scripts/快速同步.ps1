<#
===========================================================================
 Markdown Viewer — 快速同步开发文件到 dist/chrome/markdown-viewer
===========================================================================
 说明：仅复制 source 文件到未打包扩展目录，不重新构建 vendor 和 themes。
       适合开发调试场景，修改 JS/CSS 后秒级生效。

 用法：
   .\scripts\快速同步.ps1            # 同步到 Chrome
   .\scripts\快速同步.ps1 firefox    # 同步到 Firefox

 前置条件：需先运行过 构建扩展.ps1 生成 vendor/ 和 themes/
===========================================================================
#>

param(
    [ValidateSet('chrome', 'firefox')]
    [string]$Browser = 'chrome'
)

$ProjectRoot = Resolve-Path "$PSScriptRoot/.."
$PkgDir = Join-Path $ProjectRoot "dist" | Join-Path -ChildPath $Browser | Join-Path -ChildPath "markdown-viewer"

Write-Host "==============================================" -ForegroundColor Magenta
Write-Host " 快速同步 — $Browser" -ForegroundColor Magenta
Write-Host " 目标 : $PkgDir" -ForegroundColor White
Write-Host "==============================================" -ForegroundColor Magenta

# 确保目标目录存在
if (-not (Test-Path $PkgDir)) {
    Write-Host "[错误] 目标目录不存在，请先运行 构建扩展.ps1" -ForegroundColor Red
    exit 1
}

# 复制 source 目录（跳过 vendor/ themes/ 这些构建产物）
$sourceDirs = @('background', 'content', 'icons', 'options', 'popup')
foreach ($d in $sourceDirs) {
    $src = Join-Path $ProjectRoot $d
    $dst = Join-Path $PkgDir $d
    if (Test-Path $src) {
        Copy-Item -Recurse -Path "$src\*" -Destination $dst -Force
        Write-Host "  [同步] $d/" -ForegroundColor Cyan
    }
}

# 复制 manifest.json（保持与构建脚本一致）
$manifestFile = "manifest.$Browser.json"
$manifestSrc = Join-Path $ProjectRoot $manifestFile
if (Test-Path $manifestSrc) {
    Copy-Item $manifestSrc -Destination (Join-Path $PkgDir "manifest.json") -Force
    Write-Host "  [同步] $manifestFile -> manifest.json" -ForegroundColor Cyan
}

# 复制 LICENSE
$licenseSrc = Join-Path $ProjectRoot "LICENSE"
if (Test-Path $licenseSrc) {
    Copy-Item $licenseSrc -Destination $PkgDir -Force
}

Write-Host ""
Write-Host " [完成] 已同步到 $PkgDir" -ForegroundColor Green
Write-Host " 在 Chrome 扩展管理页刷新即可查看效果" -ForegroundColor White
Write-Host ""
