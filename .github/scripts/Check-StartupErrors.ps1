<#
.SYNOPSIS
    Scans the TestSite's Serilog JSON trace log for ERROR/FATAL entries logged during startup.

.DESCRIPTION
    CI boots the TestSite unattended (both against a ProjectReference in the `build` job, and again
    against the packed nupkg in the `test-packages` job) and needs to know whether it actually came up
    clean, not just whether the process stayed alive. This scans only the window between the
    "Starting unattended install" log line and "Application is shutting down" - errors outside that
    window (e.g. the harness's own shutdown signal) are expected noise, not startup failures.

    A single expected exception is explicitly excluded: the TaskCanceledException that Kestrel logs at
    ERROR level while a graceful shutdown is in flight is not a real failure.
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$LogDirectory
)

$logFiles = Get-ChildItem -Path $LogDirectory -Filter 'UmbracoTraceLog*.json' -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime

if (-not $logFiles) {
    Write-Host "No UmbracoTraceLog*.json files found under '$LogDirectory' - nothing to check."
    exit 0
}

$inWindow = $false
$failures = @()

foreach ($file in $logFiles) {
    foreach ($line in Get-Content -Path $file.FullName) {
        if ($line -match 'Starting unattended install') {
            $inWindow = $true
        }

        if ($inWindow -and $line -match '"Log4NetLevel":"(ERROR|FATAL)"') {
            if ($line -notmatch 'TaskCanceledException') {
                $failures += [PSCustomObject]@{ File = $file.Name; Line = $line }
            }
        }

        if ($line -match 'Application is shutting down') {
            $inWindow = $false
        }
    }
}

if ($failures.Count -gt 0) {
    Write-Host "##[error] Found $($failures.Count) ERROR/FATAL log entr$(if ($failures.Count -eq 1) { 'y' } else { 'ies' }) during startup:"
    foreach ($failure in $failures) {
        Write-Host "  [$($failure.File)] $($failure.Line)"
    }
    exit 1
}

Write-Host 'No startup errors found.'
exit 0
