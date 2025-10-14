
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, FileDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface Transaksi {
  id: string;
  nasabah_id: string;
  tanggal_transaksi: string;
  total_setoran: number;
  profiles: {
    nama: string;
  };
}

interface Profile {
  id: string;
  nama: string;
}

export default function LaporanTransaksi() {
  const { toast } = useToast();
  const [items, setItems] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileList, setProfileList] = useState<Profile[]>([]);
  
  // Filter states
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("id, nama");
      if (error) throw error;
      setProfileList(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error fetching profiles", description: message, variant: "destructive" });
    }
  }, [toast]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("transaksi")
        .select("*, profiles(nama)");

      if (selectedProfile && selectedProfile !== 'all') {
        query = query.eq("nasabah_id", selectedProfile);
      }
      if (selectedDate) {
        query = query.eq("tanggal_transaksi", format(selectedDate, "yyyy-MM-dd"));
      }
      if (selectedMonth && selectedMonth !== 'all') {
        const year = selectedYear && selectedYear !== 'all' ? selectedYear : new Date().getFullYear();
        const startDate = format(new Date(Number(year), Number(selectedMonth) - 1, 1), "yyyy-MM-dd");
        const endDate = format(new Date(Number(year), Number(selectedMonth), 0), "yyyy-MM-dd");
        query = query.gte("tanggal_transaksi", startDate).lte("tanggal_transaksi", endDate);
      } else if (selectedYear && selectedYear !== 'all') {
        const startDate = format(new Date(Number(selectedYear), 0, 1), "yyyy-MM-dd");
        const endDate = format(new Date(Number(selectedYear), 11, 31), "yyyy-MM-dd");
        query = query.gte("tanggal_transaksi", startDate).lte("tanggal_transaksi", endDate);
      }

      const { data, error } = await query.order("tanggal_transaksi", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, selectedProfile, selectedDate, selectedMonth, selectedYear]);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);
  
  const handleReset = () => {
    setSelectedProfile(null);
    setSelectedDate(undefined);
    setSelectedMonth(null);
    setSelectedYear(null);
  }

  const handleExportToExcel = () => {
    if (items.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data untuk diekspor",
        variant: "destructive",
      });
      return;
    }

    const exportData = items.map((t) => ({
      Tanggal: new Date(t.tanggal_transaksi).toLocaleDateString("id-ID"),
      Nasabah: t.profiles.nama,
      "Total Setoran": t.total_setoran,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Transaksi");

    const fileName = `Laporan_Transaksi_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Berhasil",
      description: "Data berhasil diekspor ke Excel",
    });
  };

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = Array.from({ length: 12 }, (_, i) => ({ value: (i + 1).toString(), label: new Date(0, i).toLocaleString('id-ID', { month: 'long' }) }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Laporan Transaksi</h1>
          <p className="text-muted-foreground">Lihat dan filter laporan setoran sampah.</p>
        </div>
        <Button onClick={handleExportToExcel} className="gap-2">
          <FileDown className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Select onValueChange={setSelectedProfile} value={selectedProfile || "all"}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Nasabah" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Nasabah</SelectItem>
            {profileList.map(p => <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>)}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pilih tanggal</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select onValueChange={setSelectedMonth} value={selectedMonth || "all"}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Bulan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Bulan</SelectItem>
            {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select onValueChange={setSelectedYear} value={selectedYear || "all"}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Tahun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Tahun</SelectItem>
            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        
        <Button onClick={handleReset} variant="ghost">Reset</Button>
      </div>

      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nasabah</TableHead>
              <TableHead className="text-right">Total Setoran</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Tidak ada transaksi</TableCell>
              </TableRow>
            ) : (
              items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.tanggal_transaksi).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell>{t.profiles.nama}</TableCell>
                  <TableCell className="text-right">Rp {t.total_setoran.toLocaleString("id-ID")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
