param([string]$CapPath)

$bytes = [System.IO.File]::ReadAllBytes($CapPath)
$offset = 24
$packets = New-Object System.Collections.Generic.List[object]

while ($offset + 16 -le $bytes.Length) {
    $tsSec = [BitConverter]::ToUInt32($bytes, $offset)
    $tsUsec = [BitConverter]::ToUInt32($bytes, $offset + 4)
    $inclLen = [BitConverter]::ToUInt32($bytes, $offset + 8)
    $origLen = [BitConverter]::ToUInt32($bytes, $offset + 12)
    $offset += 16
    if ($inclLen -eq 0 -or $offset + $inclLen -gt $bytes.Length) { break }

    $pktStart = $offset
    $pkt = $bytes[$pktStart..($pktStart + $inclLen - 1)]
    $offset += $inclLen

    if ($pkt.Length -lt 14) { continue }

    $ethType = ($pkt[12] -shl 8) -bor $pkt[13]
    $ipStart = 14
    if ($ethType -eq 0x8100 -and $pkt.Length -ge 18) {
        $ethType = ($pkt[16] -shl 8) -bor $pkt[17]
        $ipStart = 18
    }
    if ($ethType -ne 0x0800 -or $pkt.Length -lt $ipStart + 20) { continue }

    $verIhl = $pkt[$ipStart]
    $ihl = ($verIhl -band 0x0F) * 4
    if ($pkt.Length -lt $ipStart + $ihl) { continue }

    $proto = $pkt[$ipStart + 9]
    $srcIp = "{0}.{1}.{2}.{3}" -f $pkt[$ipStart + 12], $pkt[$ipStart + 13], $pkt[$ipStart + 14], $pkt[$ipStart + 15]
    $dstIp = "{0}.{1}.{2}.{3}" -f $pkt[$ipStart + 16], $pkt[$ipStart + 17], $pkt[$ipStart + 18], $pkt[$ipStart + 19]

    $l4Start = $ipStart + $ihl
    if ($proto -eq 17 -and $pkt.Length -ge $l4Start + 8) {
        $srcPort = ($pkt[$l4Start] -shl 8) -bor $pkt[$l4Start + 1]
        $dstPort = ($pkt[$l4Start + 2] -shl 8) -bor $pkt[$l4Start + 3]
        $udpLen = ($pkt[$l4Start + 4] -shl 8) -bor $pkt[$l4Start + 5]
        $payloadStart = $l4Start + 8
        $payloadLen = [Math]::Max(0, $udpLen - 8)
        if ($payloadStart + $payloadLen -gt $pkt.Length) { $payloadLen = $pkt.Length - $payloadStart }

        $payload = if ($payloadLen -gt 0) { $pkt[$payloadStart..($payloadStart + $payloadLen - 1)] } else { @() }
        $text = if ($payloadLen -gt 0) { [System.Text.Encoding]::ASCII.GetString($payload) } else { "" }

        $isRtp = $false
        $pt = $null
        if ($payloadLen -ge 12) {
            $b0 = $payload[0]
            $version = ($b0 -shr 6) -band 0x03
            $pt = $payload[1] -band 0x7F
            if ($version -eq 2 -and $pt -le 127 -and ($srcPort -ge 16384 -or $dstPort -ge 16384)) {
                $isRtp = $true
            }
        }

        $packets.Add([pscustomobject]@{
            Time = $tsSec + ($tsUsec / 1000000.0)
            Proto = "UDP"
            Src = "$srcIp`:$srcPort"
            Dst = "$dstIp`:$dstPort"
            Len = $payloadLen
            IsRtp = $isRtp
            RtpPt = $pt
            Text = $text
            Payload = $payload
        }) | Out-Null
    }
    elseif ($proto -eq 6 -and $pkt.Length -ge $l4Start + 20) {
        $srcPort = ($pkt[$l4Start] -shl 8) -bor $pkt[$l4Start + 1]
        $dstPort = ($pkt[$l4Start + 2] -shl 8) -bor $pkt[$l4Start + 3]
        $dataOffset = (($pkt[$l4Start + 12] -shr 4) -band 0x0F) * 4
        $payloadStart = $l4Start + $dataOffset
        $payloadLen = [Math]::Max(0, $pkt.Length - $payloadStart)
        $text = if ($payloadLen -gt 0) { [System.Text.Encoding]::ASCII.GetString($pkt[$payloadStart..($pkt.Length - 1)]) } else { "" }

        $packets.Add([pscustomobject]@{
            Time = $tsSec + ($tsUsec / 1000000.0)
            Proto = "TCP"
            Src = "$srcIp`:$srcPort"
            Dst = "$dstIp`:$dstPort"
            Len = $payloadLen
            IsRtp = $false
            RtpPt = $null
            Text = $text
            Payload = @()
        }) | Out-Null
    }
}

Write-Host "=== PCAP SUMMARY ==="
Write-Host "Total parsed L4 packets: $($packets.Count)"
Write-Host "UDP: $(($packets | Where-Object Proto -eq 'UDP').Count)"
Write-Host "TCP: $(($packets | Where-Object Proto -eq 'TCP').Count)"

$sipPackets = $packets | Where-Object { $_.Text -match '^(SIP/2\.0|INVITE|ACK|BYE|CANCEL|OPTIONS|REGISTER|PRACK|UPDATE|INFO|REFER|NOTIFY|SUBSCRIBE|MESSAGE)' }
Write-Host "SIP packets: $($sipPackets.Count)"

Write-Host "`n=== SIP MESSAGES (first line) ==="
foreach ($s in $sipPackets) {
    $first = ($s.Text -split "`r?`n")[0]
    Write-Host ("{0,12:F3}s {1} -> {2} | {3}" -f $s.Time, $s.Src, $s.Dst, $first)
}

Write-Host "`n=== SDP BLOCKS ==="
$allText = [System.Text.Encoding]::ASCII.GetString($bytes)
$blocks = [regex]::Matches($allText, '(?s)v=0\r?\n.*?(?=\r?\n\r?\n|\z)')
$idx = 0
foreach ($b in $blocks) {
    $idx++
    Write-Host "--- SDP #$idx ---"
    Write-Host $b.Value
    Write-Host ""
}

Write-Host "=== RTP STREAMS (heuristic) ==="
$rtp = $packets | Where-Object { $_.IsRtp }
Write-Host "RTP-like UDP packets: $($rtp.Count)"
$rtp | Group-Object { "$($_.Src)->$($_.Dst)" } | Sort-Object Count -Descending | ForEach-Object {
    $pts = ($_.Group | ForEach-Object { $_.RtpPt } | Sort-Object -Unique) -join ','
    Write-Host ("{0,4} pkts | PT={1} | {2}" -f $_.Count, $pts, $_.Name)
}

Write-Host "`n=== UDP PORT ACTIVITY (top) ==="
$packets | Where-Object Proto -eq 'UDP' | ForEach-Object {
    [pscustomobject]@{ Flow = "$($_.Src)->$($_.Dst)"; Len = $_.Len; IsRtp = $_.IsRtp }
} | Group-Object Flow | Sort-Object Count -Descending | Select-Object -First 20 | ForEach-Object {
    $rtpCount = ($_.Group | Where-Object IsRtp).Count
    Write-Host ("{0,4} pkts ({1,3} rtp) | {2}" -f $_.Count, $rtpCount, $_.Name)
}

Write-Host "`n=== RTP BY DESTINATION PORT ==="
$audioPorts = @(14334, 17424, 58012, 6825)
foreach ($port in $audioPorts) {
    $in = ($packets | Where-Object { $_.Proto -eq 'UDP' -and $_.Dst -match ":$port$" }).Count
    $out = ($packets | Where-Object { $_.Proto -eq 'UDP' -and $_.Src -match ":$port$" }).Count
    $rtpIn = ($packets | Where-Object { $_.Proto -eq 'UDP' -and $_.Dst -match ":$port$" -and $_.IsRtp }).Count
    $rtpOut = ($packets | Where-Object { $_.Proto -eq 'UDP' -and $_.Src -match ":$port$" -and $_.IsRtp }).Count
    Write-Host ("port {0,5}: in={1,4} (rtp {2,4}) | out={3,4} (rtp {4,4})" -f $port, $in, $rtpIn, $out, $rtpOut)
}
