import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { bookingHistoryApi } from "../../services/api";

export default function BookingHistoryDetail() {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);

  useEffect(() => {
    bookingHistoryApi.detail(id).then((res) => {
      setBooking(res.data.data);
    });
  }, [id]);

  if (!booking) return <p>Loading...</p>;

  return (
    <div className="container py-4">
      <h2>Detail Booking</h2>

      <p>ID : {booking.id}</p>

      <p>Tanggal : {booking.booking_date}</p>

      <p>
        Jam : {booking.start_time} - {booking.end_time}
      </p>

      <p>Status : {booking.status}</p>

      <p>Total : Rp {booking.estimated_cost}</p>

      <p>DP : Rp {booking.dp_amount}</p>
    </div>
  );
}