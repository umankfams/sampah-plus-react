import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { CreditCard, Edit, User } from "lucide-react";

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
                <Button variant="ghost" onClick={handleOpenEdit} disabled={!selected}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Saldo</div>
                <div className="mt-2 text-4xl font-extrabold">
                  {selected ? (
                    <span>
                      Rp {selected.saldo.toLocaleString("id-ID")}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">Saldo tersedia untuk penarikan dan transaksi</div>
              </div>

              <div className="w-48 p-4 rounded-lg bg-muted/40 flex flex-col items-center justify-center">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div className="mt-2 text-xs text-muted-foreground">Ringkasan</div>
                <div className="mt-1 font-medium">{selected ? `Rp ${selected.saldo.toLocaleString("id-ID")}` : "-"}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2 justify-end">
            <Button onClick={loadProfiles} variant="outline">Refresh</Button>
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
          </div>
        </div>
      </div>
    </div>
  );
}
