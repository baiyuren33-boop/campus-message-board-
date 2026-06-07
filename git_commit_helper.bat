@echo off
echo ==============================================
echo Campus Hub - Git Commit Helper
echo ==============================================
echo Checking if git is installed...
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH! Please install Git and run this script again.
    pause
    exit /b
)

echo [1/5] Initializing Git repository...
git init

echo [2/5] Staging files for Commit 1 (Layout & Base)...
git add index.html
git commit -m "feat: initial commit with Campus Hub layout and dashboard structure"

echo [3/5] Staging styles.css for Commit 2 (Styling)...
git add styles.css
git commit -m "feat: implement responsive styling, glassmorphism, and dark/light themes"

echo [4/5] Staging app.js for Commit 3 (Logic)...
git add app.js
git commit -m "feat: implement SPA router, LocalStorage/Supabase dual mode, AI assistant, Pomodoro timer, and Trivia Game"

echo [5/5] Staging README.md for Commit 4 (Documentation)...
git add README.md
git add git_commit_helper.bat
git commit -m "docs: add comprehensive bilingual README.md and git commit helper"

echo ==============================================
echo [SUCCESS] Git repository initialized with 4 commits!
echo You can now push this repository to GitHub using:
echo    git remote add origin ^<your-github-repo-url^>
echo    git branch -M main
echo    git push -u origin main
echo ==============================================
pause
