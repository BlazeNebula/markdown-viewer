---
name: "-release-workflow"
description: "发布版本迭代工作流。使用场景：完成功能开发后准备发布新版本；需要更新版本号、更新日志、合并分支、打标签、构建扩展包。触发词：发布、版本、release、tag、打标签、发版、迭代。"
---

# 版本发布工作流

## 功能概述

自动化完成版本迭代发布的全流程：版本号确认 → 更新版本相关文件 → 提交代码 → 合并分支 → 打标签 → 构建扩展 → 发布 GitHub Release。

## 工作流

### 步骤 0：确认版本号

如果用户调用技能时未提供明确的版本号，执行以下操作：

1. 运行 `git log --oneline dev ^origin/dev` 或 `git log --oneline HEAD ^origin/dev` 查看当前分支未推送的提交
2. 运行 `git diff --name-only dev origin/dev` 或 `git diff --name-only HEAD origin/dev` 查看未推送的变更文件
3. 结合变更内容，参考语义化版本规范推断合适的版本类型：
   - **修订号（patch）**：bug 修复、重构、文档、构建脚本变更（如 `v5.8.1`）
   - **次版本号（minor）**：新功能、功能增强（如 `v5.9`）
   - **主版本号（major）**：破坏性变更、架构重大重构（如 `v6.0`）
4. 生成 2-3 个版本号候选，附上简要说明和推荐选项
5. 使用 `vscode_askQuestions` 工具询问用户确认版本号

### 步骤 1：更新版本号

确认版本号后，更新项目中所有涉及版本号的文件：

1. **更新 manifest 文件**：将 `manifest.json`、`manifest.chrome.json`、`manifest.firefox.json` 中的 `"version"` 字段更新为新版本号
2. **更新 CHANGELOG.md**：
   - 读取当前 CHANGELOG.md 内容
   - 询问用户本次发布的更新内容（如果用户未主动提供）
   - 在文件头部（现有的 `# Change Log` 之后，最旧条目之前）插入新版本条目
   - 新条目格式参考现有日志风格：

     ```markdown
     ## v<版本号> - <YYYY-MM-DD>

     ### 新增

     - 功能描述

     ### 修复

     - 修复描述

     ### 重构

     - 重构描述
     ```

   - 分类标签使用：`新增`、`修复`、`重构`、`变更`、`移除`、`安全`

3. **更新 README.md**（如需）：如果版本有重大变化，更新 README 中的版本相关信息
4. **更新本技能文件 `SKILL.md`**（可选）：如果工作流本身有变化

### 步骤 2：提交代码

将上述变更提交到 Git：

1. `git add -A` 暂存所有变更
2. `git commit -m "chore(release): v<版本号>"` 提交（使用约定式提交风格）
3. `git push origin dev` 推送到 dev 分支

### 步骤 3：合并到 main 分支

1. `git switch main` 切换到 main 分支
2. `git merge dev` 合并 dev 到 main
3. `git push origin main` 推送 main 分支

### 步骤 4：打版本标签

1. 创建带注释的标签：`git tag -a "v<版本号>" -m "v<版本号>"`
2. 推送标签：`git push origin "v<版本号>"`
3. 切回 dev 分支：`git switch dev`

### 步骤 5：构建扩展包

1. 运行构建脚本生成扩展包：

   ```powershell
   .\scripts\构建扩展.ps1 chrome
   ```

   如果 Firefox 也需要发布，同时运行：

   ```powershell
   .\scripts\构建扩展.ps1 firefox
   ```

2. 确认构建产物 `dist/chrome/markdown-viewer.zip`（和/或 `dist/firefox/markdown-viewer.zip`）已生成

### 步骤 6：创建 GitHub Release

使用 GitHub CLI 创建 Release 并附加构建产物：

**重要：发布说明含中文时，必须使用 `--notes-file` 参数——PowerShell 管道会损坏中文编码**

```powershell
# 1. 从 CHANGELOG.md 提取当前版本发布说明，保存为 UTF-8 无 BOM 文件
$version = "<版本号>"
$text = [System.IO.File]::ReadAllText("CHANGELOG.md", [System.Text.Encoding]::UTF8)
$pattern = "(?ms)^## v$version - .*?(?=^## )"
$match = [regex]::Match($text, $pattern)
if ($match.Success) {
    [System.IO.File]::WriteAllText(
        "release-notes.md",
        $match.Value.Trim(),
        [System.Text.Encoding]::UTF8
    )
    Write-Host "OK - 已提取发布说明"
} else {
    Write-Host "错误：未在 CHANGELOG.md 中找到 v$version 条目"
    exit 1
}

# 2. 创建 Release 并上传 Chrome 构建产物（使用 --notes-file 而非 --notes）
#    上传时重命名 zip，便于区分浏览器版本
gh release create "v<版本号>" "dist/chrome/markdown-viewer.zip#markdown-viewer-chrome.zip" `
  --title "v<版本号>" `
  --notes-file release-notes.md `
  --target main

# 3. Firefox 版本（可选）
gh release upload "v<版本号>" "dist/firefox/markdown-viewer.zip#markdown-viewer-firefox.zip" --clobber

# 4. 清理临时文件
Remove-Item release-notes.md
```

或者打开浏览器创建 Release（如果 `gh` 不可用）：

1. 打开 `https://github.com/simov/markdown-viewer/releases/new?tag=v<版本号>&target=main`
2. 填写发布说明（从 CHANGELOG.md 复制）
3. 分别上传构建产物，并重命名为易区分的名称：
   - `dist/chrome/markdown-viewer.zip` → 重命名为 `markdown-viewer-chrome.zip`
   - `dist/firefox/markdown-viewer.zip` → 重命名为 `markdown-viewer-firefox.zip`
4. 点击发布

### 步骤 7：收尾确认

1. 验证 GitHub Release 页面已正确显示
2. 通知用户发布完成

## 版本号推断参考

| 变更类型             | 版本号示例      | 说明         |
| -------------------- | --------------- | ------------ |
| Bug 修复、重构、文档 | v5.8.1 → v5.8.2 | 递增修订号   |
| 新功能、功能增强     | v5.8 → v5.9     | 递增次版本号 |
| 破坏性变更、架构重构 | v5.x → v6.0     | 递增主版本号 |

## 注意事项

- 执行 `git switch main` 前确保 dev 分支的更改已全部提交，没有未暂存或未跟踪的文件
- 构建扩展前确认 `vendor/` 和 `themes/` 目录已存在（首次需先运行完整构建）
- 如果 `gh` 命令因认证问题失败，引导用户运行 `gh auth login` 登录 GitHub
- 合并 main 后记得切回 dev 分支继续开发
- **发布说明中文编码**：`gh release create --notes` 配合 PowerShell 管道传递中文时，会因
  编码转换（UTF-8 → GBK → UTF-8）导致中文乱码。**必须使用 `--notes-file` 参数**，
  先用 PowerShell 的 .NET 方法（`[System.IO.File]::ReadAllText` /
  `[System.Text.Encoding]::UTF8`）将发布说明提取为 UTF-8 无 BOM 文件。
  详见步骤 6 中的提取命令。
