import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi, transactionsApi } from '../../services/api'
import { formatRupiah } from '../../utils'
import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import ComponentCard from '../../components/common/ComponentCard'
import { Spinner, EmptyState } from '../../components/common'
import RevenueTable from '../../components/tables/owner/RevenueTable'
import Metric from '../../components/common/Metric'
import DatePicker from "../../components/form/DatePicker"

// Fungsi helper untuk memastikan format YYYY-MM-DD dengan zona waktu lokal
const formatDateToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function OwnerRevenue() {
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        return formatDateToYYYYMMDD(new Date())
    })

    const { data: summary, isLoading: loadingSummary } = useQuery({
        queryKey: ['reports-summary', selectedDate],
        queryFn: () => reportsApi.summary({ 
            from: selectedDate, 
            to: selectedDate 
        }).then((r) => r.data.data),
    })

    const { data: transactionsData, isLoading: loadingTransactions } = useQuery({
        queryKey: ['transactions-list', selectedDate],
        queryFn: () => transactionsApi.list({ 
            from: selectedDate, 
            to: selectedDate, 
            per_page: 100 
        }).then((r) => r.data.data),
    })

    return (
        <>
            <PageBreadcrumb items={[{ label: 'Pendapatan', path: '/owner/revenue' }]} />

            {/* Section Summary Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Metric
                    title='Total Sesi'
                    amount={summary?.transaction_count ?? 0}
                    icon="🎮"
                    iconBg="bg-brand-50 dark:bg-brand-500/15"
                    iconColor="text-brand-500 dark:text-brand-400"
                />
                <Metric
                    title='Gaming'
                    amount={formatRupiah(summary?.gaming_total ?? 0)}
                    icon="Rp"
                    iconBg="bg-brand-50 dark:bg-brand-500/15"
                    iconColor="text-brand-500 dark:text-brand-400"
                />
                <Metric
                    title='Jajanan'
                    amount={formatRupiah(summary?.fnb_total ?? 0)}
                    icon="Rp"
                    iconBg="bg-brand-50 dark:bg-brand-500/15"
                    iconColor="text-brand-500 dark:text-brand-400"
                />
                <Metric
                    title='Total Pendapatan'
                    amount={formatRupiah(summary?.total_revenue ?? 0)}
                    icon="Rp"
                    iconBg="bg-brand-50 dark:bg-brand-500/15"
                    iconColor="text-brand-500 dark:text-brand-400"
                />
            </div>

            {/* Section Rincian Tabel */}
            <div className="mt-6">
                <ComponentCard
                    title="Rincian Pendapatan"
                    headerAction={
                        <div className="w-40">
                            <DatePicker
                                id="filter-date"
                                value={selectedDate}
                                placeholder="Pilih Tanggal"
                                // PERBAIKAN: Tangkap objek Date (asumsi parameter pertama kalender adalah array of Date)
                                onChange={(dates: Date[]) => {
                                    if (dates && dates.length > 0) {
                                        // Ubah objek Date menjadi string YYYY-MM-DD
                                        setSelectedDate(formatDateToYYYYMMDD(dates[0]))
                                    }
                                }}
                            />
                        </div>
                    }>
                    {loadingTransactions || loadingSummary ? (
                        <Spinner className="py-12" />
                    ) : !transactionsData || transactionsData.length === 0 ? (
                        <EmptyState
                            icon="💰"
                            title="Tidak ada data"
                            description={`Belum ada transaksi pada tanggal ${selectedDate}.`}
                        />
                    ) : (
                        <RevenueTable items={transactionsData} />
                    )}
                </ComponentCard>
            </div>
        </>
    )
}