import { useEffect, useState } from 'react'
import { UserPlus, Pencil, Power } from 'lucide-react'

import { usersApi } from '../../services/api'
import type { User } from '../../types'

import PageBreadcrumb from '../../components/common/PageBreadCrumb'
import ComponentCard from '../../components/common/ComponentCard'

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

import Button from '../../components/ui/button/Button'
import Badge from '../../components/ui/badge/Badge'
import Modal from '../../components/ui/modal'

import { Field, Input } from '../../components/ui/Form'
import { Spinner, EmptyState } from '../../components/common'

interface CashierForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const emptyForm: CashierForm = { name: '', email: '', password: '', password_confirmation: '' };

export default function OwnerCashiers() {
  const [cashiers, setCashiers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<User | null>(null);
  const [form, setForm] = useState<CashierForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setIsLoading(true);
    usersApi.list()
      .then((res) => setCashiers(res.data.data.filter((u) => u.role === 'cashier')))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setSelected(null); setModal('add'); };
  const openEdit = (u: User) => {
    setSelected(u);
    setForm({ name: u.name, email: u.email, password: '', password_confirmation: '' });
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'add') {
        await usersApi.create({ ...form, role: 'cashier', is_active: true });
      } else if (selected) {
        const payload: any = { name: form.name, email: form.email };
        if (form.password) payload.password = form.password;
        await usersApi.update(selected.id, payload);
      }
      closeModal();
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (u: User) => {
    await usersApi.toggleActive(u.id);
    load();
  };

  return (
    <>
      <PageBreadcrumb
        pageTitle="Kasir"
        pageDescription="Kelola akun kasir"
      />

      <div className="space-y-6">
        <ComponentCard title="Daftar Kasir">
          {/* Header Action */}
          <div className="mb-5 flex items-center justify-end">
            <Button size="sm" onClick={openAdd}>
              <UserPlus size={16} />
              Tambah Kasir
            </Button>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner />
            </div>
          ) : cashiers.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <EmptyState
                icon="👤"
                title="Belum ada kasir"
                description="Tambahkan akun kasir baru"
              />
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
                        className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Nama
                      </TableCell>

                      <TableCell
                        isHeader
                        className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Email
                      </TableCell>

                      <TableCell
                        isHeader
                        className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Status
                      </TableCell>

                      <TableCell
                        isHeader
                        className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                      >
                        Aksi
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  {/* Body */}
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {cashiers.map((u) => (
                      <TableRow key={u.id}>
                        {/* Name */}
                        <TableCell className="px-5 py-4 text-start">
                          <span className="font-medium text-gray-800 dark:text-white/90">
                            {u.name}
                          </span>
                        </TableCell>

                        {/* Email */}
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {u.email}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="px-5 py-4 text-start">
                          <Badge
                            variant="light"
                            color={u.is_active ? 'success' : 'error'}
                          >
                            {u.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(u)}
                            >
                              <Pencil size={14} />
                            </Button>

                            <Button
                              size="sm"
                              variant={u.is_active ? 'danger' : 'info'}
                              onClick={() => handleToggle(u)}
                            >
                              <Power size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </ComponentCard>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modal !== null}
        onClose={closeModal}
        title={modal === 'add' ? 'Tambah Kasir' : 'Edit Kasir'}
      >
        <div className="space-y-4">
          <Field label="Nama" required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nama kasir"
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@mail.com"
            />
          </Field>
          <Field label={modal === 'edit' ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'} required={modal === 'add'}>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter a password"
            />
          </Field>
          <Field label={modal === 'edit' ? 'Konfirmasi Password Baru (kosongkan jika tidak diubah)' : 'Konfirmasi Password'} required={modal === 'add'}>
            <Input
              type="password"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              placeholder="Confirm password"
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={closeModal} className="flex-1">Batal</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
    </>
  );
}
