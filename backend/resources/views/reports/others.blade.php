{{-- resources/views/reports/devices.blade.php --}}
<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8">
<style>
body{font-family:sans-serif;font-size:11px;color:#111}
h1{font-size:16px;font-weight:600;margin-bottom:2px}.sub{font-size:11px;color:#555;margin-bottom:16px}
table{width:100%;border-collapse:collapse;margin-top:12px}
th{background:#f3f4f6;text-align:left;padding:6px 10px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #d1d5db}
td{padding:6px 10px;border-bottom:1px solid #e5e7eb}.num{text-align:right;font-variant-numeric:tabular-nums}
</style></head><body>
<h1>Laporan Perangkat</h1>
<div class="sub">Periode: {{ $from }} – {{ $to }}</div>
<table>
  <thead><tr>
    <th>Perangkat</th><th>Tipe</th>
    <th class="num">Sesi</th><th class="num">Total Menit</th>
    <th class="num">Utilisasi</th><th class="num">Pendapatan (Rp)</th>
  </tr></thead>
  <tbody>
    @foreach($data['data'] as $row)
    <tr>
      <td>{{ $row['device_name'] }}</td>
      <td>{{ $row['ps_type'] }}</td>
      <td class="num">{{ $row['total_sessions'] }}</td>
      <td class="num">{{ $row['total_minutes'] }}</td>
      <td class="num">{{ $row['utilization_pct'] }}%</td>
      <td class="num">{{ number_format($row['gaming_revenue'], 0, ',', '.') }}</td>
    </tr>
    @endforeach
  </tbody>
</table>
</body></html>


{{-- ============================================================ --}}
{{-- resources/views/reports/fnb.blade.php --}}
{{-- ============================================================ --}}
<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8">
<style>
body{font-family:sans-serif;font-size:11px;color:#111}
h1{font-size:16px;font-weight:600;margin-bottom:2px}.sub{font-size:11px;color:#555;margin-bottom:16px}
table{width:100%;border-collapse:collapse;margin-top:12px}
th{background:#f3f4f6;text-align:left;padding:6px 10px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #d1d5db}
td{padding:6px 10px;border-bottom:1px solid #e5e7eb}.num{text-align:right;font-variant-numeric:tabular-nums}
.total-row td{font-weight:600;border-top:2px solid #d1d5db;border-bottom:none}
</style></head><body>
<h1>Laporan F&B</h1>
<div class="sub">Periode: {{ $from }} – {{ $to }}</div>
<table>
  <thead><tr>
    <th>Item</th><th class="num">Qty Terjual</th><th class="num">Total Omzet (Rp)</th>
  </tr></thead>
  <tbody>
    @foreach($data['data'] as $row)
    <tr>
      <td>{{ $row->item_name }}</td>
      <td class="num">{{ $row->total_qty }}</td>
      <td class="num">{{ number_format($row->total_revenue, 0, ',', '.') }}</td>
    </tr>
    @endforeach
    <tr class="total-row">
      <td colspan="2">Total</td>
      <td class="num">{{ number_format($data['total_revenue'], 0, ',', '.') }}</td>
    </tr>
  </tbody>
</table>
</body></html>


{{-- ============================================================ --}}
{{-- resources/views/reports/cashiers.blade.php --}}
{{-- ============================================================ --}}
<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8">
<style>
body{font-family:sans-serif;font-size:11px;color:#111}
h1{font-size:16px;font-weight:600;margin-bottom:2px}.sub{font-size:11px;color:#555;margin-bottom:16px}
table{width:100%;border-collapse:collapse;margin-top:12px}
th{background:#f3f4f6;text-align:left;padding:6px 10px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #d1d5db}
td{padding:6px 10px;border-bottom:1px solid #e5e7eb}.num{text-align:right;font-variant-numeric:tabular-nums}
</style></head><body>
<h1>Laporan Per Kasir</h1>
<div class="sub">Periode: {{ $from }} – {{ $to }}</div>
<table>
  <thead><tr>
    <th>Kasir</th>
    <th class="num">Transaksi</th>
    <th class="num">Total Pendapatan (Rp)</th>
    <th class="num">Rata-rata / Transaksi (Rp)</th>
  </tr></thead>
  <tbody>
    @foreach($data['data'] as $row)
    <tr>
      <td>{{ $row->cashier_name }}</td>
      <td class="num">{{ $row->total_transactions }}</td>
      <td class="num">{{ number_format($row->total_revenue, 0, ',', '.') }}</td>
      <td class="num">
        {{ $row->total_transactions > 0
            ? number_format($row->total_revenue / $row->total_transactions, 0, ',', '.')
            : '0' }}
      </td>
    </tr>
    @endforeach
  </tbody>
</table>
</body></html>
