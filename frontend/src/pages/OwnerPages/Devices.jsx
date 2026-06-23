import {
  TbDeviceDesktop,
  TbDeviceDesktopCog,
  TbDeviceDesktopCode,
  TbDeviceDesktopCheck,
} from "react-icons/tb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, EmptyState, ConfirmDialog } from "../../components/common";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import { DeviceForm } from "../../components/devices/DeviceForm";
import { RatePanel } from "../../components/devices/RatePanel";
import DeviceRow from "../../components/devices/DeviceRow";
import Button from "../../components/ui/button/Button";
import Metric from "../../components/common/Metric";
import Select from "../../components/form/Select";
import Modal from "../../components/ui/modal";
import { devicesApi } from "../../services/api";
import { useState } from "react";

export default function Devices() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [rateDevice, setRateDevice] = useState(null);
  const [deleteDevice, setDeleteDevice] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { data: devices, isLoading } = useQuery({
    queryKey: ["devices"],
    queryFn: () => devicesApi.list().then((r) => r.data.data),
    refetchInterval: 15000,
  });
  const deleteMutation = useMutation({
    mutationFn: (d) => devicesApi.delete(`/devices/${d.id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["devices"] });
      setDeleteDevice(null);
    },
  });
  const handleFormSuccess = () => {
    qc.invalidateQueries({ queryKey: ["devices"] });
    setShowForm(false);
    setEditDevice(null);
  };
  const allDevices = devices ?? [];
  const filtered = allDevices.filter((d) => {
    const matchType = filterType === "all" || d.ps_type === filterType;
    const matchStatus = filterStatus === "all" || d.status === filterStatus;

    return matchType && matchStatus;
  });
  const typeOptions = [
    { value: "all", label: "Semua tipe" },
    { value: "PS4", label: "PS4" },
    { value: "PS5", label: "PS5" },
  ];
  const statusOptions = [
    { value: "all", label: "Semua status" },
    { value: "available", label: "Tersedia" },
    { value: "in_use", label: "Digunakan" },
    { value: "booked", label: "Dibooking" },
    { value: "maintenance", label: "Perbaikan" },
  ];
  const counts = {
    total: allDevices.length,
    available: allDevices.filter((d) => d.status === "available").length,
    in_use: allDevices.filter((d) => d.status === "in_use").length,
    maintenance: allDevices.filter((d) => d.status === "maintenance").length,
  };

  return (
    <>
      <PageBreadcrumb
        items={[
          {
            label: "Perangkat",
            path: "/owner/devices",
          },
        ]}
        pageDescription="Kelola perangkat beserta tarifnya"
      />
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Metric
            title="Total unit"
            amount={counts.total}
            icon={<TbDeviceDesktop />}
            iconBg="bg-brand-50 dark:bg-brand-500/15"
            iconColor="text-brand-500 dark:text-brand-400"
          />
          <Metric
            title="Tersedia"
            amount={counts.available}
            icon={<TbDeviceDesktopCheck />}
            iconBg="bg-success-50 dark:bg-success-500/15"
            iconColor="text-success-600 dark:text-success-500"
          />
          <Metric
            title="Digunakan"
            amount={counts.in_use}
            icon={<TbDeviceDesktopCode />}
            iconBg="bg-warning-50 dark:bg-warning-500/15"
            iconColor="text-warning-600 dark:text-orange-400"
          />
          <Metric
            title="Perbaikan"
            amount={counts.maintenance}
            icon={<TbDeviceDesktopCog />}
            iconBg="bg-error-50 dark:bg-error-500/15"
            iconColor="text-error-600 dark:text-error-500"
          />
        </div>

        {/* Table */}
        <ComponentCard title="Daftar perangkat">
          {/* Filter */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              placeholder="Tipe"
              options={typeOptions}
              onChange={setFilterType}
              className="dark:bg-dark-900"
            ></Select>
            <Select
              placeholder="Status"
              options={statusOptions}
              onChange={setFilterStatus}
              className="dark:bg-dark-900"
            ></Select>
            <div className="w-full flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  setEditDevice(null);
                  setShowForm(true);
                }}
              >
                + Tambah Perangkat
              </Button>
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner />
            </div>
          ) : !filtered.length ? (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <EmptyState icon="" title="Data perangkat tidak ditemukan" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  {/* Header */}
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Perangkat
                      </TableCell>

                      <TableCell
                        isHeader
                        className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Status
                      </TableCell>

                      <TableCell
                        isHeader
                        className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Tarif Saat Ini
                      </TableCell>

                      <TableCell
                        isHeader
                        className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        IP TV
                      </TableCell>

                      <TableCell
                        isHeader
                        className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Aksi
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  {/* Body */}
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {filtered.map((device) => (
                      <DeviceRow
                        key={device.id}
                        device={device}
                        onRate={setRateDevice}
                        onEdit={(device) => {
                          setEditDevice(device);
                          setShowForm(true);
                        }}
                        onDelete={setDeleteDevice}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </ComponentCard>

        {/* Form Modal */}
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditDevice(null);
          }}
          title={
            editDevice ? `Edit - ${editDevice.name}` : "Tambah perangkat baru"
          }
          size="xl"
        >
          <DeviceForm
            device={editDevice}
            onClose={() => {
              setShowForm(false);
              setEditDevice(null);
            }}
            onSuccess={handleFormSuccess}
          />
        </Modal>

        {/* Rate Modal */}
        <Modal
          isOpen={!!rateDevice}
          onClose={() => setRateDevice(null)}
          title={`Tarif — ${rateDevice?.name}`}
          size="lg"
        >
          {rateDevice && (
            <RatePanel
              device={rateDevice}
              onClose={() => setRateDevice(null)}
            />
          )}
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteDevice}
          onClose={() => setDeleteDevice(null)}
          onConfirm={() => deleteDevice && deleteMutation.mutate(deleteDevice)}
          loading={deleteMutation.isPending}
          title={`Hapus ${deleteDevice?.name}?`}
          description="Perangkat akan dihapus permanen. Riwayat sesi dan transaksi yang sudah ada tetap tersimpan."
          confirmLabel="Hapus perangkat"
          variant="danger"
        />
      </div>
    </>
  );
}
