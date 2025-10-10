import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  profiles: {
    nama: string;
    no_induk: string;
  };
}

export default function Cashout() {
  const { toast } = useToast();
  const [cashouts, setCashouts] = useState<Cashout[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nasabah_id: "",
    tanggal_cashout: new Date().toISOString().split("T")[0],
    jumlah: "",
    keterangan: "",
  });
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cashoutResult, profileResult] = await Promise.all([
        supabase
          .from("cashout")
          .select("*, profiles(nama, no_induk)")
          .order("tanggal_cashout", { ascending: false }),
        supabase.from("profiles").select("*").order("nama"),
      ]);

      if (cashoutResult.error) throw cashoutResult.error;
      if (profileResult.error) throw profileResult.error;

      setCashouts(cashoutResult.data || []);
      setProfiles(profileResult.data || []);
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

  const handleProfileChange = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    setSelectedProfile(profile || null);
    setFormData({ ...formData, nasabah_id: profileId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProfile) return;

    const jumlah = parseFloat(formData.jumlah);
    if (jumlah > selectedProfile.saldo) {
      toast({
        title: "Error",
        description: "Jumlah penarikan melebihi saldo",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("cashout").insert({
        nasabah_id: formData.nasabah_id,
        tanggal_cashout: formData.tanggal_cashout,
        jumlah: jumlah,
        keterangan: formData.keterangan || null,
      });

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Cashout berhasil diproses",
      });

      setDialogOpen(false);
      setFormData({
        nasabah_id: "",
        tanggal_cashout: new Date().toISOString().split("T")[0],
        jumlah: "",
        keterangan: "",
      });
      setSelectedProfile(null);
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
            Penarikan saldo nasabah bank sampah
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Cashout
        </Button>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>No Induk</TableHead>
              <TableHead>Nama Nasabah</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : cashouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
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
                  <TableCell>{cashout.profiles.no_induk}</TableCell>
                  <TableCell>{cashout.profiles.nama}</TableCell>
                  <TableCell className="text-right font-semibold">
                    Rp {cashout.jumlah.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>{cashout.keterangan || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cashout.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
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
            <DialogTitle>Tambah Cashout</DialogTitle>
            <DialogDescription>
              Input data penarikan saldo nasabah
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nasabah_id">Nasabah</Label>
              <Select
                value={formData.nasabah_id}
                onValueChange={handleProfileChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih nasabah" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.no_induk} - {profile.nama} (Saldo: Rp{" "}
                      {profile.saldo.toLocaleString("id-ID")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal_cashout">Tanggal</Label>
              <Input
                id="tanggal_cashout"
                type="date"
                value={formData.tanggal_cashout}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal_cashout: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jumlah">
                Jumlah
                {selectedProfile && (
                  <span className="text-sm text-muted-foreground ml-2">
                    (Saldo: Rp {selectedProfile.saldo.toLocaleString("id-ID")})
                  </span>
                )}
              </Label>
              <Input
                id="jumlah"
                type="number"
                step="0.01"
                value={formData.jumlah}
                onChange={(e) =>
                  setFormData({ ...formData, jumlah: e.target.value })
                }
                required
              />
            </div>
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
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
