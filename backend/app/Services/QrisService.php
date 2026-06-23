<?php

namespace App\Services;

/**
 * QrisService
 *
 * Memodifikasi static QRIS string (EMVCo/QRIS standard Bank Indonesia)
 * untuk menyisipkan nominal transaksi (field 54) lalu menghitung ulang CRC16.
 *
 * Format TLV: [ID 2 digit][Length 2 digit][Value]
 * CRC16: CCITT — poly 0x1021, init 0xFFFF
 */
class QrisService
{
    /**
     * Generate QRIS string dinamis dengan nominal yang sudah disisipkan.
     *
     * @param  string  $baseQris  String QRIS static dari bank
     * @param  float   $amount    Nominal yang akan disisipkan (dalam Rupiah)
     * @return string  String QRIS yang sudah berisi nominal & CRC valid
     */
    public function generateWithAmount(string $baseQris, float $amount): string
    {
        // 1. Hapus 4 karakter CRC di akhir (tapi Tag "6304" tetap ada di string)
        $qrisWithoutCrc = substr($baseQris, 0, -4);

        // 2. Ubah Point of Initiation Method (Tag 01) dari Static (11) ke Dynamic (12)
        $qrisWithoutCrc = str_replace('010211', '010212', $qrisWithoutCrc);

        // 3. Sisipkan field 54 (Transaction Amount)
        $amountStr  = number_format($amount, 0, '.', ''); // e.g. "50000"
        $amountLen  = str_pad(strlen($amountStr), 2, '0', STR_PAD_LEFT);
        $amountField = "54{$amountLen}{$amountStr}";

        // Cek apakah Tag 54 sudah ada. Jika ada, parse dan timpa.
        // Jika tidak, sisipkan persis sebelum Tag 58 (Country Code, biasanya "5802ID")
        if (strpos($qrisWithoutCrc, '5802ID') !== false) {
            $qrisWithoutCrc = preg_replace('/54\d{2}[^5]+(?=5802ID)/', '', $qrisWithoutCrc);
            $qrisWithoutCrc = str_replace('5802ID', $amountField . '5802ID', $qrisWithoutCrc);
        } else {
            // Karena $qrisWithoutCrc berakhiran "6304", sisipkan tepat sebelum "6304"
            $qrisWithoutCrc = str_replace('6304', $amountField . '6304', $qrisWithoutCrc);
        }

        // 4. Hitung ulang CRC16 (Ingat: $qrisWithoutCrc sudah mengandung "6304" di akhir)
        // Gunakan CCITT False algorithm
        $crc = $this->calculateCrc16($qrisWithoutCrc);

        return $qrisWithoutCrc . strtoupper($crc);
    }

    /**
     * Hitung CRC16-CCITT (XMODEM).
     * Poly: 0x1021, Init: 0xFFFF
     */
    private function calculateCrc16(string $data): string
    {
        $crc = 0xFFFF;

        for ($i = 0; $i < strlen($data); $i++) {
            $byte = ord($data[$i]);
            $crc ^= ($byte << 8);

            for ($j = 0; $j < 8; $j++) {
                if ($crc & 0x8000) {
                    $crc = ($crc << 1) ^ 0x1021;
                } else {
                    $crc <<= 1;
                }
                $crc &= 0xFFFF;
            }
        }

        return str_pad(dechex($crc), 4, '0', STR_PAD_LEFT);
    }
}
