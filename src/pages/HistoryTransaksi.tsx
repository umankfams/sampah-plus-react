import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

interface Transaksi {
  id: string;
  nasabah_id: string;
  tanggal_transaksi: string;
  total_setoran: number;
}

export default function HistoryTransaksi() {
  const { toast } = useToast();
  const [items, setItems] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItems, setDetailItems] = useState<Array<{ nama_sampah?: string; jumlah_kg: number; harga_per_kg: number; subtotal: number }>>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const user = userData.user;
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("transaksi")
        .select("*")
        .eq("nasabah_id", user.id)
        .order("tanggal_transaksi", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Riwayat Transaksi</h1>
        <p className="text-muted-foreground">Riwayat setoran sampah Anda</p>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Total Setoran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center">Belum ada transaksi</TableCell>
              </TableRow>
            ) : (
              items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.tanggal_transaksi).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell className="text-right">Rp {t.total_setoran.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={async () => {
                        setSelectedTransaksi(t.id);
                        setDetailOpen(true);
                        setDetailLoading(true);
                        try {
                          const { data, error } = await supabase
                            .from('transaksi_detail')
                            .select('*, jenis_sampah(nama)')
                            .eq('transaksi_id', t.id);
                          if (error) throw error;
                          type DetailRow = { jenis_sampah?: { nama?: string } | null; jumlah_kg: number; harga_per_kg: number; subtotal: number };
                          const rows = (data || []).map((r: DetailRow) => ({
                            nama_sampah: r.jenis_sampah?.nama,
                            jumlah_kg: r.jumlah_kg,
                            harga_per_kg: r.harga_per_kg,
                            subtotal: r.subtotal,
                          }));
                          setDetailItems(rows);
                        } catch (err) {
                          const message = err instanceof Error ? err.message : String(err);
                          toast({ title: 'Error', description: message, variant: 'destructive' });
                        } finally {
                          setDetailLoading(false);
                        }
                      }}>View details</Button>
                    </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>Rincian item pada transaksi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {detailLoading ? (
              <div>Loading...</div>
            ) : detailItems.length === 0 ? (
              <div>Belum ada detail</div>
            ) : (
              <div className="space-y-2">
                {detailItems.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <div className="font-medium">{it.nama_sampah || 'Jenis Sampah'}</div>
                      <div className="text-sm text-muted-foreground">{it.jumlah_kg} kg × Rp {it.harga_per_kg.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="font-semibold">Rp {it.subtotal.toLocaleString('id-ID')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
