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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
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
  satuan: string;
}

interface TransaksiDetail {
  id: string;
  jenis_sampah_id: string;
  jumlah_kg: number;
  harga_per_kg: number;
  subtotal: number;
  jenis_sampah?: JenisSampah;
}

interface Transaksi {
  id: string;
  nasabah_id: string;
  tanggal_transaksi: string;
  total_setoran: number;
  created_at: string;
  profiles?: Profile;
  transaksi_detail?: TransaksiDetail[];
}

interface EditItem {
  id?: string;
  jenis_sampah_id: string;
  nama_sampah: string;
  jumlah_kg: number;
  harga_per_kg: number;
  subtotal: number;
}

export default function ManajemenTransaksi() {
  const { toast } = useToast();
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [jenisSampah, setJenisSampah] = useState<JenisSampah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransaksi, setEditingTransaksi] = useState<Transaksi | null>(null);
  const [editTanggal, setEditTanggal] = useState("");
  const [editItems, setEditItems] = useState<EditItem[]>([]);
  const [currentEditItem, setCurrentEditItem] = useState({
    jenis_sampah_id: "",
    jumlah_kg: "",
  });

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTransaksi, setDeletingTransaksi] = useState<Transaksi | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadTransaksi(), loadProfiles(), loadJenisSampah()]);
    setLoading(false);
  };

  const loadTransaksi = async () => {
    const { data, error } = await supabase
      .from("transaksi")
      .select(`
        *,
        profiles:nasabah_id (id, nama, no_induk),
        transaksi_detail (
          id,
          jenis_sampah_id,
          jumlah_kg,
          harga_per_kg,
          subtotal,
          jenis_sampah:jenis_sampah_id (id, nama, harga_per_kg, satuan)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data transaksi",
        variant: "destructive",
      });
    } else {
      setTransaksi(data || []);
    }
  };

  const loadProfiles = async () => {
    const { data } = await supabase.from("profiles").select("id, nama, no_induk").order("nama");
    setProfiles(data || []);
  };

  const loadJenisSampah = async () => {
    const { data } = await supabase.from("jenis_sampah").select("*").order("nama");
    setJenisSampah(data || []);
  };

  const filteredTransaksi = transaksi.filter((t) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      t.profiles?.nama?.toLowerCase().includes(search) ||
      t.profiles?.no_induk?.includes(search)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransaksi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransaksi = filteredTransaksi.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleEdit = (t: Transaksi) => {
    setEditingTransaksi(t);
    setEditTanggal(t.tanggal_transaksi);
    setEditItems(
      t.transaksi_detail?.map((d) => ({
        id: d.id,
        jenis_sampah_id: d.jenis_sampah_id,
        nama_sampah: d.jenis_sampah?.nama || "",
        jumlah_kg: d.jumlah_kg,
        harga_per_kg: d.harga_per_kg,
        subtotal: d.subtotal,
      })) || []
    );
    setEditDialogOpen(true);
  };

  const handleAddEditItem = () => {
    if (!currentEditItem.jenis_sampah_id || !currentEditItem.jumlah_kg) {
      toast({
        title: "Error",
        description: "Pilih jenis sampah dan masukkan jumlah",
        variant: "destructive",
      });
      return;
    }

    const sampah = jenisSampah.find((s) => s.id === currentEditItem.jenis_sampah_id);
    if (!sampah) return;

    const jumlah = parseFloat(currentEditItem.jumlah_kg);
    const subtotal = jumlah * sampah.harga_per_kg;

    setEditItems([
      ...editItems,
      {
        jenis_sampah_id: sampah.id,
        nama_sampah: sampah.nama,
        jumlah_kg: jumlah,
        harga_per_kg: sampah.harga_per_kg,
        subtotal,
      },
    ]);

    setCurrentEditItem({ jenis_sampah_id: "", jumlah_kg: "" });
  };

  const handleRemoveEditItem = (index: number) => {
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const calculateEditTotal = () => {
    return editItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSaveEdit = async () => {
    if (!editingTransaksi) return;

    if (editItems.length === 0) {
      toast({
        title: "Error",
        description: "Minimal harus ada 1 item sampah",
        variant: "destructive",
      });
      return;
    }

    try {
      const newTotal = calculateEditTotal();

      // Update main transaction
      const { error: transaksiError } = await supabase
        .from("transaksi")
        .update({
          tanggal_transaksi: editTanggal,
          total_setoran: newTotal,
        })
        .eq("id", editingTransaksi.id);

      if (transaksiError) throw transaksiError;

      // Delete existing details
      const { error: deleteError } = await supabase
        .from("transaksi_detail")
        .delete()
        .eq("transaksi_id", editingTransaksi.id);

      if (deleteError) throw deleteError;

      // Insert new details
      const details = editItems.map((item) => ({
        transaksi_id: editingTransaksi.id,
        jenis_sampah_id: item.jenis_sampah_id,
        jumlah_kg: item.jumlah_kg,
        harga_per_kg: item.harga_per_kg,
        subtotal: item.subtotal,
      }));

      const { error: insertError } = await supabase
        .from("transaksi_detail")
        .insert(details);

      if (insertError) throw insertError;

      toast({
        title: "Berhasil",
        description: "Transaksi berhasil diperbarui",
      });

      setEditDialogOpen(false);
      setEditingTransaksi(null);
      loadTransaksi();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = (t: Transaksi) => {
    setDeletingTransaksi(t);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingTransaksi) return;

    try {
      // Delete details first (foreign key constraint)
      const { error: detailError } = await supabase
        .from("transaksi_detail")
        .delete()
        .eq("transaksi_id", deletingTransaksi.id);

      if (detailError) throw detailError;

      // Delete main transaction
      const { error: transaksiError } = await supabase
        .from("transaksi")
        .delete()
        .eq("id", deletingTransaksi.id);

      if (transaksiError) throw transaksiError;

      toast({
        title: "Berhasil",
        description: "Transaksi berhasil dihapus",
      });

      setDeleteDialogOpen(false);
      setDeletingTransaksi(null);
      loadTransaksi();
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
        <h1 className="text-3xl font-bold">Manajemen Transaksi</h1>
        <p className="text-muted-foreground">Edit dan hapus transaksi setoran sampah</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <CardTitle>Daftar Transaksi</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nasabah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
          ) : paginatedTransaksi.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Tidak ada transaksi yang cocok" : "Belum ada transaksi"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nasabah</TableHead>
                    <TableHead>No Induk</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total (Rp)</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransaksi.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        {format(new Date(t.tanggal_transaksi), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {t.profiles?.nama || "-"}
                      </TableCell>
                      <TableCell>{t.profiles?.no_induk || "-"}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {t.transaksi_detail?.map((d, i) => (
                            <div key={d.id}>
                              {d.jenis_sampah?.nama}: {d.jumlah_kg} {d.jenis_sampah?.satuan}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        Rp {t.total_setoran.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(t)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(t)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransaksi.length)} dari {filteredTransaksi.length} transaksi
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {getPageNumbers().map((page, idx) =>
                    page === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${idx}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaksi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nasabah</Label>
              <Input
                value={editingTransaksi?.profiles?.nama || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editTanggal">Tanggal Transaksi</Label>
              <Input
                id="editTanggal"
                type="date"
                value={editTanggal}
                onChange={(e) => setEditTanggal(e.target.value)}
              />
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Item Sampah</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {editItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-secondary rounded-md"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.nama_sampah}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.jumlah_kg} × Rp {item.harga_per_kg.toLocaleString("id-ID")} = Rp{" "}
                        {item.subtotal.toLocaleString("id-ID")}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEditItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}

                <div className="border-t pt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={currentEditItem.jenis_sampah_id}
                      onValueChange={(value) =>
                        setCurrentEditItem({ ...currentEditItem, jenis_sampah_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Jenis sampah" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {jenisSampah.map((sampah) => (
                          <SelectItem key={sampah.id} value={sampah.id}>
                            {sampah.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Jumlah"
                        value={currentEditItem.jumlah_kg}
                        onChange={(e) =>
                          setCurrentEditItem({ ...currentEditItem, jumlah_kg: e.target.value })
                        }
                      />
                      <Button onClick={handleAddEditItem} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      Rp {calculateEditTotal().toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi milik <strong>{deletingTransaksi?.profiles?.nama}</strong> sebesar{" "}
              <strong>Rp {deletingTransaksi?.total_setoran.toLocaleString("id-ID")}</strong> akan
              dihapus. Saldo nasabah akan dikurangi sesuai total transaksi. Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
