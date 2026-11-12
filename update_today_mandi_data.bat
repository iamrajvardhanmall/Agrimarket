@echo off
title AgriMarket - Live Mandi Data Sync
echo ==============================================================
echo        AgriMarket AI - Today's Live Mandi Data Sync
echo ==============================================================
echo.
cd /d "%~dp0"

echo [1/3] Fetching latest live records from data.gov.in (India IP)...
D:\Python311\python.exe data_engine\fetch_daily_market_data.py --max-records 5000

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to fetch data. Check your internet connection or MARKET_DATA_API_KEY.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Checking if new records were added to Dataset.csv...
git status --porcelain data_engine\Dataset.csv > "%TEMP%\git_dataset_diff.txt"
set /p DIFF=<"%TEMP%\git_dataset_diff.txt"
del "%TEMP%\git_dataset_diff.txt"

if "%DIFF%"=="" (
    echo Dataset.csv is already up to date with today's data!
) else (
    echo [3/3] Pushing today's updated dataset to GitHub...
    git add data_engine\Dataset.csv
    for /f "tokens=1-3 delims=/ " %%a in ("%DATE%") do (
        git commit -m "chore(data): auto-update mandi dataset [%%a-%%b-%%c]"
    )
    git push origin Raj
    echo.
    echo ==============================================================
    echo [SUCCESS] Today's live market data successfully pushed to GitHub!
    echo ==============================================================
)

echo.
pause
