import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Recycle, Coins, TrendingUp, Users, Leaf, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 50,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-20">
          <div 
            data-aos="zoom-in"
            data-aos-delay="100"
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-8 shadow-lg shadow-primary/20 animate-bounce"
          >
            <Recycle className="w-12 h-12 text-primary" />
          </div>
          
          <div data-aos="fade-up" data-aos-delay="200">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Platform Bank Sampah Digital Terpercaya
            </span>
          </div>
          
          <h1 
            data-aos="fade-up" 
            data-aos-delay="300"
            className="text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight"
          >
            Bank Sampah{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Digital
            </span>
          </h1>
          
          <p 
            data-aos="fade-up" 
            data-aos-delay="400"
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Kelola sampah Anda dengan bijak dan dapatkan keuntungan finansial. 
            Sistem manajemen bank sampah modern yang memudahkan transaksi dan monitoring.
          </p>
          
          <div 
            data-aos="fade-up" 
            data-aos-delay="500"
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="gap-2 px-8 py-6 text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
            >
              Masuk
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="px-8 py-6 text-lg hover:bg-primary/5 transition-all duration-300 hover:scale-105 border-2"
            >
              Daftar Sekarang
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div 
          data-aos="fade-up" 
          data-aos-delay="600"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 max-w-4xl mx-auto"
        >
          {[
            { value: "500+", label: "Nasabah Aktif" },
            { value: "10 Ton", label: "Sampah Terkelola" },
            { value: "50 Juta", label: "Total Transaksi" },
            { value: "99%", label: "Kepuasan" },
          ].map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:scale-105"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card 
            data-aos="fade-up" 
            data-aos-delay="100"
            className="group border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 bg-card/50 backdrop-blur-sm"
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Coins className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                Tukar Sampah Jadi Uang
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Sampah Anda memiliki nilai ekonomi. Kumpulkan, setor, dan dapatkan saldo yang bisa dicairkan kapan saja.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            data-aos="fade-up" 
            data-aos-delay="200"
            className="group border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 bg-card/50 backdrop-blur-sm"
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                Laporan Transparan
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Pantau riwayat transaksi dan perkembangan saldo Anda secara real-time dengan sistem yang transparan.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            data-aos="fade-up" 
            data-aos-delay="300"
            className="group border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 bg-card/50 backdrop-blur-sm"
          >
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                Manajemen Mudah
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Sistem digital yang memudahkan pengelola dan nasabah dalam bertransaksi dan mengelola bank sampah.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works Section */}
        <div 
          data-aos="fade-up"
          className="bg-gradient-to-br from-card via-card/80 to-card rounded-3xl p-10 md:p-14 shadow-xl border border-border/50 mb-20"
        >
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Leaf className="w-4 h-4" />
              Mudah & Cepat
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">Cara Kerja</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Daftar", desc: "Buat akun sebagai nasabah bank sampah" },
              { step: "2", title: "Kumpulkan Sampah", desc: "Pisahkan dan kumpulkan sampah berdasarkan jenisnya" },
              { step: "3", title: "Setor Sampah", desc: "Setor sampah Anda ke bank sampah dan dapatkan saldo" },
              { step: "4", title: "Cairkan Saldo", desc: "Tarik saldo Anda menjadi uang tunai" },
            ].map((item, index) => (
              <div 
                key={index}
                data-aos="zoom-in"
                data-aos-delay={index * 100}
                className="text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div 
          data-aos="fade-up"
          className="text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl blur-3xl" />
          <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-12 md:p-16 border border-primary/20">
            <Leaf className="w-12 h-12 text-primary mx-auto mb-6 animate-bounce" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Mulai Peduli Lingkungan Hari Ini
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan gerakan peduli lingkungan dan dapatkan manfaat finansial dari sampah yang Anda kumpulkan.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="gap-2 px-10 py-6 text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
            >
              Mulai Sekarang
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-border/50 text-center text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Recycle className="w-4 h-4" />
            © 2024 Bank Sampah Digital. Semua hak dilindungi.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
