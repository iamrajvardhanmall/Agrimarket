<#
.SYNOPSIS
    Automated mandi data fetch and GitHub push runner for Windows.
.DESCRIPTION
    Runs fetch_daily_market_data.py and pushes Dataset.csv to GitHub if changes are found.
    Can be run directly or scheduled via Windows Task Scheduler.
#>

param(
    [switch]$RegisterTask,
    [switch]$UnregisterTask
)

$TaskName = "AgriMarket_Mandi_Fetch_12h"
$RepoPath = Split-Path -Parent $PSScriptRoot
$PythonExe = (Get-Command python -ErrorAction SilentlyContinue).Source

if (-not $PythonExe) {
    $PythonExe = "python"
}

if ($RegisterTask) {
    Write-Host "Registering Windows Scheduled Task: $TaskName..." -ForegroundColor Cyan
    $Action = New-ScheduledTaskAction -Execute $PythonExe -Argument "scripts/auto_fetch_scheduler.py --once" -WorkingDirectory $RepoPath
    # Trigger every 12 hours indefinitely
    $Trigger = New-ScheduledTaskTrigger -Daily -At "00:00"
    $Repetition = New-ScheduledTaskRepetitionPattern -Interval (New-TimeSpan -Hours 12) -Duration ([TimeSpan]::MaxValue)
    $Trigger.Repetition = $Repetition

    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Description "Runs AgriMarket mandi data fetch every 12 hours and pushes to GitHub" -Force
    Write-Host "Task '$TaskName' registered successfully! It will run every 12 hours." -ForegroundColor Green
    exit 0
}

if ($UnregisterTask) {
    Write-Host "Unregistering task: $TaskName..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Task removed." -ForegroundColor Green
    exit 0
}

# Run directly once
Set-Location $RepoPath
python scripts/auto_fetch_scheduler.py --once

