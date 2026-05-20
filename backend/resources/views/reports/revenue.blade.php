<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: sans-serif; font-size: 11px; color: #111; }
  h1   { font-size: 16px; font-weight: 600; margin-bottom: 2px; }
  .sub { font-size: 11px; color: #555; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th { background: #f3f4f6; text-align: left; padding: 6px 10px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; border-bottom: 1px solid #d1d5db; }
  td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; }
  tr:last-child td { border-bottom: none; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .summary { margin-top: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 16px; }
  .summary table { margin-top: 0; }
  .summary td { border: none; padding: 3px 0; }
  .total { font-weight: 600; }
</style>
</head>
<body>
<h1>Laporan Pendapatan</h1>
<div class="sub">Periode: {{ $from }} – {{ $to }}</div>

<div class="summary">
  <table>
    <tr><td>Total pendapatan</td><td class="num total">Rp {{ number_format($data['summary']['total_revenue'], 0, ',', '.') }}</td></tr>
    <tr><td>Pendapatan gaming</td><td class="num">Rp {{ number_format($data['summary']['gaming_revenue'], 0, ',', '.') }}</td></tr>
    <tr><td>Pendapatan F&B</td><td class="num">Rp {{ number_format($data['summary']['fnb_revenue'], 0, ',', '.') }}</td></tr>
    <tr><td>Total transaksi</td><td class="num">{{ $data['summary']['total_transactions'] }}</td></tr>
  </table>
</div>

<table>
  <thead>
    <tr>
      <th>Periode</th>
      <th class="num">Transaksi</th>
      <th class="num">Gaming (Rp)</th>
      <th class="num">F&B (Rp)</th>
      <th class="num">Total (Rp)</th>
    </tr>
  </thead>
  <tbody>
    @foreach($data['data'] as $row)
    <tr>
      <td>{{ $row->period }}</td>
      <td class="num">{{ $row->total_transactions }}</td>
      <td class="num">{{ number_format($row->gaming_revenue, 0, ',', '.') }}</td>
      <td class="num">{{ number_format($row->fnb_revenue, 0, ',', '.') }}</td>
      <td class="num">{{ number_format($row->total_revenue, 0, ',', '.') }}</td>
    </tr>
    @endforeach
  </tbody>
</table>
</body>
</html>
