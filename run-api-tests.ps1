# API Comprehensive Test Script
$BaseURL = "http://localhost:3001"
$Results = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method = "GET",
        [string]$URL,
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [string]$ContentType = "application/json"
    )
    
    $result = [PSCustomObject]@{
        Endpoint = $Name
        Method = $Method
        URL = $URL
        Status = ""
        StatusCode = ""
        Success = $false
        Error = ""
    }
    
    try {
        $params = @{
            Uri = $URL
            Method = $Method
            Headers = $Headers
            TimeoutSec = 15
        }
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = $ContentType
        }
        
        $response = Invoke-RestMethod @params
        $result.Status = "PASS"
        $result.Success = $true
        $result.StatusCode = "200"
        Write-Host "[PASS] $Name" -ForegroundColor Green
    }
    catch {
        $statusCode = ""
        $errorMsg = $_.Exception.Message
        if ($errorMsg -match "(\d{3})\s") { $statusCode = $Matches[1] }
        
        # Check for expected error codes
        if ($Name -match "404|not.found|non-existent" -and $statusCode -eq "404") {
            $result.Status = "PASS"
            $result.Success = $true
            $result.StatusCode = $statusCode
            Write-Host "[PASS] $Name (Expected 404)" -ForegroundColor Green
        }
        elseif ($Name -match "401|no.auth|without.token" -and ($statusCode -eq "401" -or $statusCode -eq "403")) {
            $result.Status = "PASS"
            $result.Success = $true
            $result.StatusCode = $statusCode
            Write-Host "[PASS] $Name (Expected 401/403)" -ForegroundColor Green
        }
        elseif ($Name -match "403|forbidden" -and $statusCode -eq "403") {
            $result.Status = "PASS"
            $result.Success = $true
            $result.StatusCode = $statusCode
            Write-Host "[PASS] $Name (Expected 403)" -ForegroundColor Green
        }
        else {
            $result.Status = "FAIL"
            $result.StatusCode = $statusCode
            $result.Error = $errorMsg
            Write-Host "[FAIL] $Name - $statusCode - $($errorMsg.Substring(0, [Math]::Min(100, $errorMsg.Length)))" -ForegroundColor Red
        }
    }
    
    $script:Results += $result
}

function Login-User {
    param([string]$Identifier, [string]$Password, [string]$UserType)
    $body = @{ identifier = $Identifier; password = $Password; userType = $UserType } | ConvertTo-Json
    try {
        $resp = Invoke-RestMethod -Uri "$BaseURL/v1/auth/login" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
        return $resp.data.accessToken
    }
    catch {
        Write-Host "Login failed for $Identifier : $_" -ForegroundColor Red
        return $null
    }
}

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  VOTING SYSTEM API COMPREHENSIVE TEST SUITE" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# === NO AUTH ENDPOINTS ===
Write-Host "`n--- HEALTH ENDPOINTS (No Auth) ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /v1/health" -URL "$BaseURL/v1/health"
Test-Endpoint -Name "GET /v1/health/ready" -URL "$BaseURL/v1/health/ready"

Write-Host "`n--- PUBLIC ENDPOINTS (No Auth) ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /v1/candidates" -URL "$BaseURL/v1/candidates"
Test-Endpoint -Name "GET /v1/candidates/{id} (404)" -URL "$BaseURL/v1/candidates/00000000-0000-0000-0000-000000000000"
Test-Endpoint -Name "GET /v1/voters/check-id (available)" -URL "$BaseURL/v1/voters/check-id/99999999"
Test-Endpoint -Name "GET /v1/voters/check-id (taken)" -URL "$BaseURL/v1/voters/check-id/12345678"
Test-Endpoint -Name "GET /v1/admin/counties" -URL "$BaseURL/v1/admin/counties"

Write-Host "`n--- AUTH ENDPOINTS (No Auth) ---" -ForegroundColor Yellow

Test-Endpoint -Name "POST /v1/auth/login (invalid)" -Method POST -URL "$BaseURL/v1/auth/login" -Body '{"identifier":"bad@test.com","password":"wrongpass"," userType":"voter"}'

# === LOGIN ===
Write-Host "`n--- Logging in... ---" -ForegroundColor Cyan
$voterToken = Login-User -Identifier "12345678" -Password "password123" -UserType "voter"
$adminToken = Login-User -Identifier "admin@iebc.go.ke" -Password "password123" -UserType "admin"
$roToken = Login-User -Identifier "ro@iebc.go.ke" -Password "password123" -UserType "ro"

Write-Host "Voter token: $($voterToken.Substring(0,30))..." -ForegroundColor Gray
Write-Host "Admin token: $($adminToken.Substring(0,30))..." -ForegroundColor Gray
Write-Host "RO token: $($roToken.Substring(0,30))..." -ForegroundColor Gray

if (-not $voterToken -or -not $adminToken -or -not $roToken) {
    Write-Host "CRITICAL: Login failed for one or more users!" -ForegroundColor Red
    exit 1
}

$vHeaders = @{ Authorization = "Bearer $voterToken" }
$aHeaders = @{ Authorization = "Bearer $adminToken" }
$rHeaders = @{ Authorization = "Bearer $roToken" }

# === AUTH PROTECTED ===
Write-Host "`n--- AUTH ENDPOINTS (Protected) ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /v1/auth/me (Voter)" -URL "$BaseURL/v1/auth/me" -Headers $vHeaders
Test-Endpoint -Name "GET /v1/auth/me (Admin)" -URL "$BaseURL/v1/auth/me" -Headers $aHeaders
Test-Endpoint -Name "GET /v1/auth/me (RO)" -URL "$BaseURL/v1/auth/me" -Headers $rHeaders
Test-Endpoint -Name "GET /v1/auth/me (No Auth - 401)" -Name "GET /v1/auth/me (No Auth)" -URL "$BaseURL/v1/auth/me"

# === VOTER ENDPOINTS ===
Write-Host "`n--- VOTER ENDPOINTS ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /v1/voters/profile (Voter)" -URL "$BaseURL/v1/voters/profile" -Headers $vHeaders
Test-Endpoint -Name "GET /v1/voters/profile (No Auth)" -URL "$BaseURL/v1/voters/profile"
Test-Endpoint -Name "GET /v1/voters/stats (Admin)" -URL "$BaseURL/v1/voters/stats" -Headers $aHeaders
Test-Endpoint -Name "GET /v1/voters/stats (Voter - 403)" -URL "$BaseURL/v1/voters/stats" -Headers $vHeaders
Test-Endpoint -Name "GET /v1/voters/{id}" -URL "$BaseURL/v1/voters/10deb490-cbbc-403b-bb03-dc136293cc48" -Headers $vHeaders
Test-Endpoint -Name "GET /v1/voters/{id}/status" -URL "$BaseURL/v1/voters/10deb490-cbbc-403b-bb03-dc136293cc48/status" -Headers $vHeaders
Test-Endpoint -Name "PUT /v1/voters/{id}" -Method PUT -URL "$BaseURL/v1/voters/10deb490-cbbc-403b-bb03-dc136293cc48" -Headers $vHeaders -Body '{"phoneNumber":"+254712345679"}'

# === CANDIDATE ENDPOINTS ===
Write-Host "`n--- CANDIDATE ENDPOINTS ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /v1/candidates (filters)" -URL "$BaseURL/v1/candidates?position=president&page=1&limit=10"
Test-Endpoint -Name "POST /v1/candidates (Admin)" -Method POST -URL "$BaseURL/v1/candidates" -Headers $aHeaders -Body '{"firstName":"Test","lastName":"Candidate","position":"mp","county":"Nairobi","party":"Test Party"}'

# === VOTE ENDPOINTS ===
Write-Host "`n--- VOTE ENDPOINTS ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /v1/votes/ballot (Voter)" -URL "$BaseURL/v1/votes/ballot" -Headers $vHeaders
Test-Endpoint -Name "GET /v1/votes/ballot (No Auth)" -URL "$BaseURL/v1/votes/ballot"
Test-Endpoint -Name "GET /v1/votes/status/{voterId}" -URL "$BaseURL/v1/votes/status/10deb490-cbbc-403b-bb03-dc136293cc48" -Headers $vHeaders

# === BATCH ENDPOINTS ===
Write-Host "`n--- BATCH ENDPOINTS ---" -ForegroundColor Yellow

Test-Endpoint -Name "POST /v1/batches/join" -Method POST -URL "$BaseURL/v1/batches/join" -Headers $vHeaders -Body '{"electionId":"24c282a2-aeea-4eeb-91b9-f03cc85cd0f8"}'
Test-Endpoint -Name "POST /v1/batches/heartbeat" -Method POST -URL "$BaseURL/v1/batches/heartbeat" -Headers $vHeaders

# === ADMIN ENDPOINTS ===
Write-Host "`n--- ADMIN ENDPOINTS ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /v1/admin/counties (Admin)" -URL "$BaseURL/v1/admin/counties" -Headers $aHeaders
Test-Endpoint -Name "GET /v1/admin/dashboard/stats" -URL "$BaseURL/v1/admin/dashboard/stats" -Headers $aHeaders
Test-Endpoint -Name "GET /v1/admin/dashboard/activity" -URL "$BaseURL/v1/admin/dashboard/activity" -Headers $aHeaders
Test-Endpoint -Name "GET /v1/admin/returning-officers" -URL "$BaseURL/v1/admin/returning-officers" -Headers $aHeaders
Test-Endpoint -Name "GET /v1/admin/ro/applications" -URL "$BaseURL/v1/admin/ro/applications" -Headers $aHeaders
Test-Endpoint -Name "POST /v1/admin/counties" -Method POST -URL "$BaseURL/v1/admin/counties" -Headers $aHeaders -Body '{"countyCode":"002","countyName":"Mombasa","region":"Coastal"}'

# === REPORT ENDPOINTS ===
Write-Host "`n--- REPORT ENDPOINTS ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /v1/reports/results" -URL "$BaseURL/v1/reports/results" -Headers $aHeaders
Test-Endpoint -Name "GET /v1/reports/turnout" -URL "$BaseURL/v1/reports/turnout" -Headers $aHeaders
Test-Endpoint -Name "GET /v1/reports/audit" -URL "$BaseURL/v1/reports/audit" -Headers $aHeaders
Test-Endpoint -Name "GET /v1/reports/blockchain/status" -URL "$BaseURL/v1/reports/blockchain/status" -Headers $aHeaders

# === RO ENDPOINTS ===
Write-Host "`n--- RO ENDPOINTS ---" -ForegroundColor Yellow

Test-Endpoint -Name "GET /v1/ro/dashboard/stats" -URL "$BaseURL/v1/ro/dashboard/stats" -Headers $rHeaders
Test-Endpoint -Name "GET /v1/ro/pending-approvals" -URL "$BaseURL/v1/ro/pending-approvals" -Headers $rHeaders
Test-Endpoint -Name "GET /v1/ro/voters" -URL "$BaseURL/v1/ro/voters" -Headers $rHeaders
Test-Endpoint -Name "GET /v1/ro/activity" -URL "$BaseURL/v1/ro/activity" -Headers $rHeaders

# === LOGOUT ===
Write-Host "`n--- LOGOUT ---" -ForegroundColor Yellow

Test-Endpoint -Name "POST /v1/auth/logout" -Method POST -URL "$BaseURL/v1/auth/logout" -Headers $vHeaders

# === SUMMARY ===
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

$total = $Results.Count
$passed = ($Results | Where-Object { $_.Success }).Count
$failed = ($Results | Where-Object { -not $_.Success }).Count

Write-Host "Total: $total | Passed: $passed | Failed: $failed" -ForegroundColor White

if ($failed -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $Results | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "  - $($_.Endpoint) [$($_.StatusCode)]: $($_.Error.Substring(0, [Math]::Min(80, $_.Error.Length)))" -ForegroundColor Red
    }
}

Write-Host "`nTest completed at $(Get-Date)" -ForegroundColor Gray

# Export results
$Results | ConvertTo-Json -Depth 3 | Out-File "C:\Users\user\Desktop\PROJECTS\voting-system\test-results.json"
Write-Host "Results saved to test-results.json" -ForegroundColor Green
