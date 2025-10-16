import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trash2, Receipt, TrendingUp } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalNasabah: 0,
    totalJenisSampah: 0,
    totalTransaksi: 0,
    totalSetoran: 0,
  });

  const [monthlyChartData, setMonthlyChartData] = useState<Array<{ name: string; jumlah: number }>>([]);
  const [yearlyChartData, setYearlyChartData] = useState<Array<{ name: string; jumlah: number }>>([]);

  useEffect(() => {
    loadStats();
    loadChartData();
  }, []);

  const loadStats = async () => {
    try {
      const [nasabahRes, jenisSampahRes, transaksiRes, setoranRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("jenis_sampah").select("id", { count: "exact", head: true }),
        supabase.from("transaksi").select("id", { count: "exact", head: true }),
        supabase.from("transaksi").select("total_setoran"),
      ]);

      const totalSetoran = setoranRes.data?.reduce((sum, t) => sum + Number(t.total_setoran), 0) || 0;

      setStats({
        totalNasabah: nasabahRes.count || 0,
        totalJenisSampah: jenisSampahRes.count || 0,
        totalTransaksi: transaksiRes.count || 0,
        totalSetoran,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadChartData = async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Get data for current month
      const { data: monthlyData } = await supabase
        .from("transaksi_detail")
        .select(`
          jumlah_kg,
          jenis_sampah:jenis_sampah_id (nama),
          transaksi:transaksi_id (tanggal_transaksi)
        `)
        .gte("transaksi.tanggal_transaksi", `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
        .lt("transaksi.tanggal_transaksi", `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`);

      // Get data for current year
      const { data: yearlyData } = await supabase
        .from("transaksi_detail")
        .select(`
          jumlah_kg,
          jenis_sampah:jenis_sampah_id (nama),
          transaksi:transaksi_id (tanggal_transaksi)
        `)
        .gte("transaksi.tanggal_transaksi", `${currentYear}-01-01`)
        .lt("transaksi.tanggal_transaksi", `${currentYear + 1}-01-01`);

      // Process monthly data
      const monthlyMap = new Map<string, number>();
      monthlyData?.forEach((item: any) => {
        const name = item.jenis_sampah?.nama || "Unknown";
        const current = monthlyMap.get(name) || 0;
        monthlyMap.set(name, current + Number(item.jumlah_kg));
      });

      const monthlyTop10 = Array.from(monthlyMap.entries())
        .map(([name, jumlah]) => ({ name, jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah)
        .slice(0, 10);

      // Process yearly data
      const yearlyMap = new Map<string, number>();
      yearlyData?.forEach((item: any) => {
        const name = item.jenis_sampah?.nama || "Unknown";
        const current = yearlyMap.get(name) || 0;
        yearlyMap.set(name, current + Number(item.jumlah_kg));
      });

      const yearlyTop10 = Array.from(yearlyMap.entries())
        .map(([name, jumlah]) => ({ name, jumlah }))
        .sort((a, b) => b.jumlah - a.jumlah)
        .slice(0, 10);

      setMonthlyChartData(monthlyTop10);
      setYearlyChartData(yearlyTop10);
    } catch (error) {
      console.error("Error loading chart data:", error);
    }
  };

  const statCards = [
    {
      title: "Total Nasabah",
      value: stats.totalNasabah,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Jenis Sampah",
      value: stats.totalJenisSampah,
      icon: Trash2,
      color: "text-primary",
    },
    {
      title: "Total Transaksi",
      value: stats.totalTransaksi,
      icon: Receipt,
      color: "text-accent",
    },
    {
      title: "Total Setoran",
      value: `Rp ${stats.totalSetoran.toLocaleString("id-ID")}`,
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan SiBasTara</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Jenis Sampah - Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                jumlah: {
                  label: "Jumlah",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="jumlah" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Jenis Sampah - Tahun Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                jumlah: {
                  label: "Jumlah",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={yearlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="jumlah" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
