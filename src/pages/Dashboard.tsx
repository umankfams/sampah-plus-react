import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trash2, Receipt, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalNasabah: 0,
    totalJenisSampah: 0,
    totalTransaksi: 0,
    totalSetoran: 0,
  });

  useEffect(() => {
    loadStats();
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
    </div>
  );
}
