import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface Profile {
  id: string;
  nama: string;
  no_induk: string;
}

interface JenisSampah {
  id: string;
  nama: string;
  harga_per_kg: number;
}

interface TransaksiItem {
  jenis_sampah_id: string;
  nama_sampah: string;
  jumlah_kg: number;
  harga_per_kg: number;
  subtotal: number;
}

export default function Transaksi() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [jenisSampah, setJenisSampah] = useState<JenisSampah[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [selectedNasabah, setSelectedNasabah] = useState<Profile | null>(null);
  const [tanggalTransaksi, setTanggalTransaksi] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [items, setItems] = useState<TransaksiItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    jenis_sampah_id: "",
    jumlah_kg: "",
  });

  useEffect(() => {
    loadProfiles();
    loadJenisSampah();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = profiles.filter(
        (p) =>
          p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.no_induk.includes(searchTerm)
      );
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles([]);
    }
  }, [searchTerm, profiles]);

  const loadProfiles = async () => {
    const { data } = await supabase.from("profiles").select("*").order("nama");
    setProfiles(data || []);
  };

  const loadJenisSampah = async () => {
    const { data } = await supabase.from("jenis_sampah").select("*").order("nama");
    setJenisSampah(data || []);
  };

  const handleAddItem = () => {
    if (!currentItem.jenis_sampah_id || !currentItem.jumlah_kg) {
      toast({
        title: "Error",
        description: "Pilih jenis sampah dan masukkan jumlah kg",
        variant: "destructive",
      });
      return;
    }

    const sampah = jenisSampah.find((s) => s.id === currentItem.jenis_sampah_id);
    if (!sampah) return;

    const jumlah = parseFloat(currentItem.jumlah_kg);
    const subtotal = jumlah * sampah.harga_per_kg;

    setItems([
      ...items,
      {
        jenis_sampah_id: sampah.id,
        nama_sampah: sampah.nama,
        jumlah_kg: jumlah,
        harga_per_kg: sampah.harga_per_kg,
        subtotal,
      },
    ]);

    setCurrentItem({ jenis_sampah_id: "", jumlah_kg: "" });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = async () => {
    if (!selectedNasabah) {
      toast({
        title: "Error",
        description: "Pilih nasabah terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Tambahkan minimal 1 item sampah",
        variant: "destructive",
      });
      return;
    }

    try {
      const grandTotal = calculateGrandTotal();

      const { data: transaksi, error: transaksiError } = await supabase
        .from("transaksi")
        .insert({
          nasabah_id: selectedNasabah.id,
          tanggal_transaksi: tanggalTransaksi,
          total_setoran: grandTotal,
        })
        .select()
        .single();

      if (transaksiError) throw transaksiError;

      const details = items.map((item) => ({
        transaksi_id: transaksi.id,
        jenis_sampah_id: item.jenis_sampah_id,
        jumlah_kg: item.jumlah_kg,
        harga_per_kg: item.harga_per_kg,
        subtotal: item.subtotal,
      }));

      const { error: detailError } = await supabase
        .from("transaksi_detail")
        .insert(details);

      if (detailError) throw detailError;

      toast({
        title: "Berhasil",
        description: "Transaksi berhasil disimpan",
      });

      // Reset form
      setSelectedNasabah(null);
      setSearchTerm("");
      setItems([]);
      setTanggalTransaksi(format(new Date(), "yyyy-MM-dd"));
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
      <div>
        <h1 className="text-3xl font-bold">Create Transaksi</h1>
        <p className="text-muted-foreground">Tambah transaksi setoran sampah</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nasabah">Nasabah*</Label>
            <div className="relative">
              <Input
                id="nasabah"
                value={selectedNasabah?.nama || searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau no induk..."
                className={selectedNasabah ? "border-accent" : ""}
              />
              {searchTerm && !selectedNasabah && filteredProfiles.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        setSelectedNasabah(profile);
                        setSearchTerm("");
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="font-medium">{profile.nama}</div>
                      <div className="text-sm text-muted-foreground">
                        {profile.no_induk}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedNasabah && (
              <div className="text-sm text-primary font-medium">
                Dipilih: {selectedNasabah.nama} ({selectedNasabah.no_induk})
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggal">Tanggal Transaksi*</Label>
            <Input
              id="tanggal"
              type="date"
              value={tanggalTransaksi}
              onChange={(e) => setTanggalTransaksi(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tambah Item Sampah</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Jenis Sampah</Label>
              <Select
                value={currentItem.jenis_sampah_id}
                onValueChange={(value) =>
                  setCurrentItem({ ...currentItem, jenis_sampah_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis sampah" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {jenisSampah.map((sampah) => (
                    <SelectItem key={sampah.id} value={sampah.id}>
                      {sampah.nama} - Rp {sampah.harga_per_kg.toLocaleString("id-ID")}/({sampah.satuan})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jumlah">Jumlah</Label>
              <Input
                id="jumlah"
                type="number"
                step="0.01"
                value={currentItem.jumlah_kg}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, jumlah_kg: e.target.value })
                }
              />
            </div>

            <Button onClick={handleAddItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Item
            </Button>
          </CardContent>
        </Card>
      </div>

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Item Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary rounded-md"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.nama_sampah}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.jumlah_kg} kg × Rp {item.harga_per_kg.toLocaleString("id-ID")} = Rp{" "}
                      {item.subtotal.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Setoran (Rp)</span>
                  <span className="text-primary">
                    Rp {calculateGrandTotal().toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90">
          Create
        </Button>
      </div>
    </div>
  );
}
