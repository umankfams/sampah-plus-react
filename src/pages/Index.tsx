import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Recycle, Coins, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Recycle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Bank Sampah Digital
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Kelola sampah Anda dengan bijak dan dapatkan keuntungan finansial. 
            Sistem manajemen bank sampah modern yang memudahkan transaksi dan monitoring.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
              Masuk
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Daftar Sekarang
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Coins className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Tukar Sampah Jadi Uang</CardTitle>
              <CardDescription>
                Sampah Anda memiliki nilai ekonomi. Kumpulkan, setor, dan dapatkan saldo yang bisa dicairkan kapan saja.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Laporan Transparan</CardTitle>
              <CardDescription>
                Pantau riwayat transaksi dan perkembangan saldo Anda secara real-time dengan sistem yang transparan.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Manajemen Mudah</CardTitle>
              <CardDescription>
                Sistem digital yang memudahkan pengelola dan nasabah dalam bertransaksi dan mengelola bank sampah.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="bg-card rounded-lg p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Cara Kerja</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Daftar</h3>
              <p className="text-sm text-muted-foreground">
                Buat akun sebagai nasabah bank sampah
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Kumpulkan Sampah</h3>
              <p className="text-sm text-muted-foreground">
                Pisahkan dan kumpulkan sampah berdasarkan jenisnya
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Setor Sampah</h3>
              <p className="text-sm text-muted-foreground">
                Setor sampah Anda ke bank sampah dan dapatkan saldo
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Cairkan Saldo</h3>
              <p className="text-sm text-muted-foreground">
                Tarik saldo Anda menjadi uang tunai
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-4">
            Bergabunglah dengan gerakan peduli lingkungan dan dapatkan manfaat finansial
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="gap-2">
            Mulai Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
