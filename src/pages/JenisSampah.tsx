import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash } from "lucide-react";

interface JenisSampah {
  id: string;
  nama: string;
  harga_per_kg: number;
  satuan: "KG" | "Liter" | "Ml" | "Pcs";
}

export default function JenisSampah() {
  const { toast } = useToast();
  const [jenisSampah, setJenisSampah] = useState<JenisSampah[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JenisSampah | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    harga_per_kg: "",
    satuan: "KG" as "KG" | "Liter" | "Ml" | "Pcs",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadJenisSampah();
  }, []);

  const loadJenisSampah = async () => {
    try {
      const { data, error } = await supabase
        .from("jenis_sampah")
        .select("*")
        .order("nama");

      if (error) throw error;
      setJenisSampah(data || []);
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
    
    try {
      const data = {
        nama: formData.nama,
        harga_per_kg: parseFloat(formData.harga_per_kg),
        satuan: formData.satuan,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("jenis_sampah")
          .update(data)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast({ title: "Berhasil", description: "Jenis sampah berhasil diupdate" });
      } else {
        const { error } = await supabase.from("jenis_sampah").insert(data);
        if (error) throw error;
        toast({ title: "Berhasil", description: "Jenis sampah berhasil ditambahkan" });
      }

      setDialogOpen(false);
      setEditingItem(null);
      setFormData({ nama: "", harga_per_kg: "", satuan: "KG" });
      loadJenisSampah();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: JenisSampah) => {
    setEditingItem(item);
    setFormData({
      nama: item.nama,
      harga_per_kg: item.harga_per_kg.toString(),
      satuan: item.satuan,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus jenis sampah ini?")) return;

    try {
      const { error } = await supabase.from("jenis_sampah").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Berhasil", description: "Jenis sampah berhasil dihapus" });
      loadJenisSampah();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({ nama: "", harga_per_kg: "", satuan: "KG" });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Jenis Sampah</h1>
          <p className="text-muted-foreground">Kelola jenis sampah dan harga</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Jenis Sampah
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit" : "Tambah"} Jenis Sampah
              </DialogTitle>
              <DialogDescription>
                {editingItem ? "Update" : "Tambah"} jenis sampah baru
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Jenis Sampah</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="satuan">Satuan</Label>
                <Select
                  value={formData.satuan}
                  onValueChange={(value) => setFormData({ ...formData, satuan: value as "KG" | "Liter" | "Ml" | "Pcs" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KG">KG</SelectItem>
                    <SelectItem value="Liter">Liter</SelectItem>
                    <SelectItem value="Ml">Ml</SelectItem>
                    <SelectItem value="Pcs">Pcs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="harga_per_kg">Harga per Satuan (Rp)</Label>
                <Input
                  id="harga_per_kg"
                  type="number"
                  step="0.01"
                  value={formData.harga_per_kg}
                  onChange={(e) => setFormData({ ...formData, harga_per_kg: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Jenis Sampah</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Harga per Satuan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : jenisSampah.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">Belum ada data</TableCell>
              </TableRow>
            ) : (
              jenisSampah
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>{item.satuan}</TableCell>
                  <TableCell>Rp {item.harga_per_kg.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
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

      {/* Pagination */}
      {jenisSampah.length > itemsPerPage && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {(() => {
              const totalPages = Math.ceil(jenisSampah.length / itemsPerPage);
              const pages = [];
              for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                  pages.push(
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i)}
                        isActive={currentPage === i}
                        className="cursor-pointer"
                      >
                        {i}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (i === currentPage - 2 || i === currentPage + 2) {
                  pages.push(
                    <PaginationItem key={i}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
              }
              return pages;
            })()}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(jenisSampah.length / itemsPerPage), p + 1))}
                className={currentPage === Math.ceil(jenisSampah.length / itemsPerPage) ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
