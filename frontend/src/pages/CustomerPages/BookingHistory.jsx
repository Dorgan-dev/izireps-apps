import { useEffect, useState } from "react";
import { bookingHistoryApi } from "../../services/api";

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingHistoryApi
      .list()
      .then((res) => {
        setBookings(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container py-4">
      <h2>Riwayat Booking</h2>

      {bookings.length === 0 ? (
        <p>Belum ada riwayat booking.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tanggal</th>
              <th>Jam</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>

                <td>{booking.booking_date}</td>

                <td>
                  {booking.start_time} - {booking.end_time}
                </td>

                <td>{booking.status}</td>

                <td>Rp {booking.estimated_cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}