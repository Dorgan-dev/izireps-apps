import EcommerceMetrics from "../../components/dashboard/EcommerceMetrics";
import MonthlySalesChart from "../../components/dashboard/owner/WeeklyBooking";
import StatisticsChart from "../../components/dashboard/StatisticsChart";
import MonthlyTarget from "../../components/dashboard/MonthlyTarget";
import RecentOrders from "../../components/dashboard/RecentOrders";
import DemographicCard from "../../components/dashboard/DemographicCard";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta title="Admin | Izireps" description="Dashboard Izireps" />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
