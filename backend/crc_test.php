<?php

function calculateCrc16(string $data): string {
    $crc = 0xFFFF;
    for ($i = 0; $i < strlen($data); $i++) {
        $x = (($crc >> 8) ^ ord($data[$i])) & 0xFF;
        $x ^= $x >> 4;
        $crc = (($crc << 8) ^ ($x << 12) ^ ($x << 5) ^ $x) & 0xFFFF;
    }
    return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
}

$baseQris = "00020101021126580013ID.CO.BRI.WWW01189360000200417126970208417126970303UMI51440014ID.CO.QRIS.WWW0215ID10253720648610303UMI5204541153033605802ID5915IZI PLAYSTATION6009PEKANBARU61052826162070703A0163042BB4";
$amount = 15000;

// 1. Hapus 4 karakter CRC di akhir
$qrisWithoutCrc = substr($baseQris, 0, -4);

// 2. Ubah Point of Initiation Method
$qrisWithoutCrc = str_replace('010211', '010212', $qrisWithoutCrc);

// 3. Sisipkan field 54 (Transaction Amount)
$amountStr  = number_format($amount, 0, '.', ''); // e.g. "50000"
$amountLen  = str_pad(strlen($amountStr), 2, '0', STR_PAD_LEFT);
$amountField = "54{$amountLen}{$amountStr}";

if (strpos($qrisWithoutCrc, '5802ID') !== false) {
    // Hapus Tag 54 lama jika ada (biasanya tepat sebelum 5802ID)
    $qrisWithoutCrc = preg_replace('/54\d{2}[^5]+(?=5802ID)/', '', $qrisWithoutCrc);
    // Sisipkan Tag 54 baru
    $qrisWithoutCrc = str_replace('5802ID', $amountField . '5802ID', $qrisWithoutCrc);
} else {
    $qrisWithoutCrc .= $amountField;
}

$crc = calculateCrc16($qrisWithoutCrc . '6304');
$finalQris = $qrisWithoutCrc . '6304' . $crc;

echo "FINAL: " . $finalQris . "\n";
