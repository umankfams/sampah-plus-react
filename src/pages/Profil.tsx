import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, Key } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Edit } from "lucide-react";

interface Profile {
  id: string;
  no_induk: string;
  no_hp: string;
  nama: string;
  saldo: number;
}

export default function Profil() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [transactions, setTransactions] = useState<Array<{ id: string; tanggal_transaksi: string; total_setoran: number }>>([]);
  const [transLoading, setTransLoading] = useState(false);
  const [cashouts, setCashouts] = useState<Array<{ id: string; tanggal_cashout: string; jumlah: number; keterangan?: string }>>([]);
  const [cashLoading, setCashLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItems, setDetailItems] = useState<Array<{ jenis_sampah_id: string; jumlah_kg: number; harga_per_kg: number; subtotal: number; nama_sampah?: string }>>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedTransaksiId, setSelectedTransaksiId] = useState<string | null>(null);

  // Change password state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      // get current authenticated user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const user = userData.user;
      if (!user) {
        setProfiles([]);
        setSelected(null);
        return;
      }

      // fetch only the profile that matches the authenticated user's id
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .limit(1);

      if (error) throw error;

      const profile = data && data.length > 0 ? data[0] : null;
      setProfiles(profile ? [profile] : []);
      setSelected((prev) => prev || profile);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const handleOpenEdit = () => {
    if (!selected) return;
    setName(selected.nama);
    setEditOpen(true);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ nama: name })
        .eq("id", selected.id);
      if (error) throw error;
      toast({ title: "Berhasil", description: "Nama profil berhasil diubah" });
      setEditOpen(false);
      // refresh
      await loadProfiles();
      // update selected to new name
      setSelected((s) => (s ? { ...s, nama: name } : s));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const loadTransactions = useCallback(async (nasabahId: string | null) => {
    setTransLoading(true);
    try {
      if (!nasabahId) {
        setTransactions([]);
        return;
      }
      const { data, error } = await supabase
        .from("transaksi")
        .select("*")
        .eq("nasabah_id", nasabahId)
        .order("tanggal_transaksi", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setTransLoading(false);
    }
  }, [toast]);

  const loadCashouts = useCallback(async (nasabahId: string | null) => {
    setCashLoading(true);
    try {
      if (!nasabahId) {
        setCashouts([]);
        return;
      }

      const { data, error } = await supabase
        .from("cashout")
        .select("*")
        .eq("nasabah_id", nasabahId)
        .order("tanggal_cashout", { ascending: false });

      if (error) throw error;
      setCashouts(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setCashLoading(false);
    }
  }, [toast]);

  const activity = useMemo(() => {
    const tx = transactions.map((t) => ({
      id: t.id,
      type: "transaksi" as const,
      date: t.tanggal_transaksi,
      amount: t.total_setoran,
    }));

    const co = cashouts.map((c) => ({
      id: c.id,
      type: "cashout" as const,
      date: c.tanggal_cashout,
      amount: c.jumlah,
      note: c.keterangan,
    }));

    return [...tx, ...co].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, cashouts]);

  const openDetail = async (transaksiId: string) => {
    setSelectedTransaksiId(transaksiId);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      // fetch transaksi_detail (and optionally jenis_sampah details)
      const { data, error } = await supabase
        .from("transaksi_detail")
        .select("*, jenis_sampah(*)")
        .eq("transaksi_id", transaksiId);

      if (error) throw error;

      type DetailRow = {
        jenis_sampah_id: string;
        jumlah_kg: number;
        harga_per_kg: number;
        subtotal: number;
        jenis_sampah?: { nama?: string } | null;
      };
      const items = (data || []).map((d: DetailRow) => ({
        jenis_sampah_id: d.jenis_sampah_id,
        jumlah_kg: d.jumlah_kg,
        harga_per_kg: d.harga_per_kg,
        subtotal: d.subtotal,
        nama_sampah: d.jenis_sampah?.nama,
      }));
      setDetailItems(items);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  // Change password handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Password baru dan konfirmasi tidak sama", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password baru minimal 6 karakter", variant: "destructive" });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({ title: "Berhasil", description: "Password berhasil diubah" });
      setPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setPasswordLoading(false);
    }
  };

  // fetch transactions when selected profile changes
  useEffect(() => {
    void loadTransactions(selected?.id || null);
    void loadCashouts(selected?.id || null);
  }, [selected, loadTransactions, loadCashouts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profil Saya</h1>
          <p className="text-muted-foreground">Kelola profil dan lihat saldo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        

        <div className="md:col-span-2 bg-card rounded-lg border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{selected ? selected.nama : "-"}</h3>
                <p className="text-sm text-muted-foreground">{selected ? selected.no_induk : "Pilih profil untuk melihat detail"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleOpenEdit} disabled={!selected} title="Ubah Nama">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" onClick={() => setPasswordDialogOpen(true)} title="Ubah Password">
                  <Key className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Saldo</div>
                <div className="mt-2 text-4xl font-extrabold">
                  {selected ? (
                    
                    <span>
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                     
                        Rp {selected.saldo.toLocaleString("id-ID")}
                    </span>
                    
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Saldo tersedia untuk penarikan dan transaksi</div>
              </div>

              
            </div>
            </div>
            

          <div className="mt-6 flex gap-2 justify-center">
            
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <span />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ubah Nama Profil</DialogTitle>
                  <DialogDescription>Ganti nama profil yang dipilih</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveName} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profil_nama">Nama</Label>
                    <Input id="profil_nama" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
                    <Button type="submit">Simpan</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ubah Password</DialogTitle>
                  <DialogDescription>Masukkan password baru untuk akun Anda</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_password">Password Baru</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Konfirmasi Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setPasswordDialogOpen(false);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={passwordLoading}>
                      {passwordLoading ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <div className="flex w-full flex-col">
              {/* Transactions history */}
            <div className="mt-6 flex-1">
              <h4 className="text-lg font-medium mb-3">Riwayat Transaksi</h4>
              <div className="bg-card rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Total Setoran</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transLoading ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">Belum ada transaksi</TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{new Date(t.tanggal_transaksi).toLocaleDateString("id-ID")}</TableCell>
                          <TableCell className="text-right">Rp {t.total_setoran.toLocaleString("id-ID")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            {/* Cashout history */}
            <div className="mt-6 flex-1">
              <h4 className="text-lg font-medium mb-3">Riwayat Cashout</h4>
              <div className="bg-card rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : cashouts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">Belum ada cashout</TableCell>
                      </TableRow>
                    ) : (
                      cashouts.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{new Date(c.tanggal_cashout).toLocaleDateString("id-ID")}</TableCell>
                          <TableCell className="text-right">Rp {c.jumlah.toLocaleString("id-ID")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            </div>
          </div>
              </div>
          <Button onClick={loadProfiles} variant="outline"><RefreshCw/>Refresh</Button>
        
      </div>
    </div>
  );
}
