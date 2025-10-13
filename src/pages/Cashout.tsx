import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash } from "lucide-react";

interface Profile {
  id: string;
  no_induk: string;
  nama: string;
  saldo: number;
}

interface Cashout {
  id: string;
  nasabah_id: string;
  tanggal_cashout: string;
  jumlah: number;
  keterangan: string | null;
  metode_pembayaran: string;
  nomor_akun: string | null;
  status: string;
  profiles: {
    nama: string;
    no_induk: string;
  };
}

export default function Cashout() {
  const { toast } = useToast();
  const [cashouts, setCashouts] = useState<Cashout[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    jumlah: "",
    keterangan: "",
    metode_pembayaran: "Cash",
    nomor_akun: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const [cashoutResult, profileResult] = await Promise.all([
        supabase
          .from("cashout")
          .select("*, profiles(nama, no_induk)")
          .eq("nasabah_id", user.id)
          .order("tanggal_cashout", { ascending: false }),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);

      if (cashoutResult.error) throw cashoutResult.error;
      if (profileResult.error) throw profileResult.error;

      setCashouts(cashoutResult.data || []);
      setCurrentUser(profileResult.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    const jumlah = parseFloat(formData.jumlah);
    if (jumlah > currentUser.saldo) {
      toast({
        title: "Error",
        description: "Jumlah penarikan melebihi saldo",
        variant: "destructive",
      });
      return;
    }

    // Validate account number for digital wallets
    if (formData.metode_pembayaran !== "Cash" && !formData.nomor_akun) {
      toast({
        title: "Error",
        description: "Nomor akun harus diisi untuk metode pembayaran digital",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("cashout").insert({
        nasabah_id: user.id,
        jumlah: jumlah,
        keterangan: formData.keterangan || null,
        metode_pembayaran: formData.metode_pembayaran as any,
        nomor_akun: formData.metode_pembayaran === "Cash" ? null : formData.nomor_akun,
        status: "pending" as any,
      });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Permintaan cashout berhasil dikirim dan menunggu persetujuan admin",
      });

      setDialogOpen(false);
      setFormData({
        jumlah: "",
        keterangan: "",
        metode_pembayaran: "Cash",
        nomor_akun: "",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus cashout ini?")) return;

    try {
      const { error } = await supabase.from("cashout").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Berhasil", description: "Cashout berhasil dihapus" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cashout</h1>
          <p className="text-muted-foreground">
            Ajukan permintaan penarikan saldo
          </p>
          {currentUser && (
            <p className="text-sm mt-2">
              Saldo tersedia: <span className="font-semibold">Rp {currentUser.saldo.toLocaleString("id-ID")}</span>
            </p>
          )}
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajukan Cashout
        </Button>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead>Metode Pembayaran</TableHead>
              <TableHead>Nomor Akun</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : cashouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Belum ada data
                </TableCell>
              </TableRow>
            ) : (
              cashouts.map((cashout) => (
                <TableRow key={cashout.id}>
                  <TableCell>
                    {new Date(cashout.tanggal_cashout).toLocaleDateString(
                      "id-ID"
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    Rp {cashout.jumlah.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>{cashout.metode_pembayaran}</TableCell>
                  <TableCell>{cashout.nomor_akun || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={
                      cashout.status === "approved" ? "default" :
                      cashout.status === "rejected" ? "destructive" :
                      "secondary"
                    }>
                      {cashout.status === "approved" ? "Disetujui" :
                       cashout.status === "rejected" ? "Ditolak" :
                       "Menunggu"}
                    </Badge>
                  </TableCell>
                  <TableCell>{cashout.keterangan || "-"}</TableCell>
                  <TableCell className="text-right">
                    {cashout.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cashout.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajukan Cashout</DialogTitle>
            <DialogDescription>
              Ajukan permintaan penarikan saldo Anda
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentUser && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">
                  Saldo tersedia: <span className="font-semibold">Rp {currentUser.saldo.toLocaleString("id-ID")}</span>
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah Penarikan</Label>
              <Input
                id="jumlah"
                type="number"
                step="0.01"
                value={formData.jumlah}
                onChange={(e) =>
                  setFormData({ ...formData, jumlah: e.target.value })
                }
                placeholder="Masukkan jumlah"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metode_pembayaran">Metode Pembayaran</Label>
              <Select
                value={formData.metode_pembayaran}
                onValueChange={(value) =>
                  setFormData({ ...formData, metode_pembayaran: value, nomor_akun: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Gopay">Gopay</SelectItem>
                  <SelectItem value="OVO">OVO</SelectItem>
                  <SelectItem value="ShopeePay">ShopeePay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.metode_pembayaran !== "Cash" && (
              <div className="space-y-2">
                <Label htmlFor="nomor_akun">Nomor HP / Akun</Label>
                <Input
                  id="nomor_akun"
                  type="tel"
                  value={formData.nomor_akun}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor_akun: e.target.value })
                  }
                  placeholder="Masukkan nomor HP untuk dompet digital"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea
                id="keterangan"
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                placeholder="Keterangan (opsional)"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">Ajukan Cashout</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
