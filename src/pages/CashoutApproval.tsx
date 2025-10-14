import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CashoutRequest {
  id: string;
  nasabah_id: string;
  tanggal_cashout: string;
  jumlah: number;
  metode_pembayaran: string;
  nomor_akun: string | null;
  status: string;
  profiles: {
    nama: string;
    no_induk: string;
  };
}

export default function CashoutApproval() {
  const [cashouts, setCashouts] = useState<CashoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCashouts();
  }, []);

  const fetchCashouts = async () => {
    try {
      const { data, error } = await supabase
        .from("cashout")
        .select(`
          id,
          tanggal_cashout,
          jumlah,
          metode_pembayaran,
          nomor_akun,
          status,
          profiles:nasabah_id (
            nama,
            no_induk
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCashouts(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data cashout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("cashout")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Cashout berhasil disetujui",
      });
      fetchCashouts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyetujui cashout",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("cashout")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Cashout berhasil ditolak",
      });
      fetchCashouts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menolak cashout",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Disetujui</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Persetujuan Cashout</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Daftar Permintaan Cashout</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama Nasabah</TableHead>
                <TableHead>No. Induk</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Metode Pembayaran</TableHead>
                <TableHead>No. Akun/Tujuan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashouts.map((cashout) => (
                <TableRow key={cashout.id}>
                  <TableCell>{new Date(cashout.tanggal_cashout).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>{cashout.profiles?.nama}</TableCell>
                  <TableCell>{cashout.profiles?.no_induk}</TableCell>
                  <TableCell>Rp {cashout.jumlah.toLocaleString('id-ID')}</TableCell>
                  <TableCell>{cashout.metode_pembayaran}</TableCell>
                  <TableCell>{cashout.nomor_akun || '-'}</TableCell>
                  <TableCell>{getStatusBadge(cashout.status)}</TableCell>
                  <TableCell>
                    {cashout.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(cashout.id)}
                        >
                          Setuju
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(cashout.id)}
                        >
                          Tolak
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
