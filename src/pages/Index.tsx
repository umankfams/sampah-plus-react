import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Recycle, Coins, TrendingUp, Users, Leaf, ArrowRight, Sparkles, MapPin, Phone, Mail } from "lucide-react";
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
      offset: 50
    });
  }, []);
  return <div className="min-h-screen bg-background overflow-hidden font-poppins">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{
        animationDelay: '2s'
      }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-secondary rounded-full blur-3xl animate-float" style={{
        animationDelay: '4s'
      }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-[78px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Recycle className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SiBastara</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#tentang" className="text-muted-foreground hover:text-primary transition-colors">Tentang</a>
            <a href="#layanan" className="text-muted-foreground hover:text-primary transition-colors">Layanan</a>
            <a href="#cara-kerja" className="text-muted-foreground hover:text-primary transition-colors">Cara Kerja</a>
            <a href="#kontak" className="text-muted-foreground hover:text-primary transition-colors">Kontak</a>
          </nav>
          <Button onClick={() => navigate("/auth")} className="font-semibold">
            Masuk
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-78px)] flex items-center relative">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div data-aos="fade-up" data-aos-delay="100">
                <span className="hero-subtitle text-sm mb-4 inline-block">
                  Platform Bank Sampah Digital
                </span>
              </div>
              
              <h1 data-aos="fade-up" data-aos-delay="200" className="hero-title mb-6">
                Ubah Sampah Menjadi{" "}
                <span className="text-primary">Berkah</span>
              </h1>
              
              <p data-aos="fade-up" data-aos-delay="300" className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed font-lora">
                Kelola sampah Anda dengan bijak dan dapatkan keuntungan finansial. 
                Sistem manajemen bank sampah modern yang memudahkan transaksi dan monitoring.
              </p>
              
              <div data-aos="fade-up" data-aos-delay="400" className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate("/auth")} className="gap-2 px-8 py-6 text-lg font-semibold shadow-elegant hover:shadow-carousel transition-all duration-300 hover:scale-105 animate-pulse-glow">
                  Mulai Sekarang
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="px-8 py-6 text-lg font-semibold hover:bg-secondary transition-all duration-300 hover:scale-105 border-2 border-primary">
                  Daftar Gratis
                </Button>
              </div>
            </div>

            {/* Hero Visual */}
            <div data-aos="zoom-in" data-aos-delay="500" className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full animate-ken-burns" />
                <div className="absolute inset-8 bg-gradient-to-tr from-secondary to-background rounded-full flex items-center justify-center shadow-carousel">
                  <Recycle className="w-32 h-32 text-primary animate-float" />
                </div>
                {/* Floating elements */}
                <div className="absolute top-10 right-10 w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center animate-float" style={{
                animationDelay: '1s'
              }}>
                  <Coins className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute bottom-20 left-5 w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center animate-float" style={{
                animationDelay: '2s'
              }}>
                  <Leaf className="w-7 h-7 text-accent" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div data-aos="fade-up" data-aos-delay="600" className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
            {[{
            value: "500+",
            label: "Nasabah Aktif"
          }, {
            value: "10 Ton",
            label: "Sampah Terkelola"
          }, {
            value: "50 Juta",
            label: "Total Transaksi"
          }, {
            value: "99%",
            label: "Kepuasan"
          }].map((stat, index) => <div key={index} className="text-center p-6 rounded-2xl glass-card hover-lift">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="layanan" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span data-aos="fade-up" className="hero-subtitle text-sm mb-4 inline-block">
              Layanan Kami
            </span>
            <h2 data-aos="fade-up" data-aos-delay="100" className="section-heading text-4xl md:text-5xl">
              Kenapa Memilih Kami?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card data-aos="fade-up" data-aos-delay="100" className="group border-0 shadow-elegant hover:shadow-carousel transition-all duration-500 hover-lift bg-card">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Coins className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                  Tukar Sampah Jadi Uang
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed font-lora">
                  Sampah Anda memiliki nilai ekonomi. Kumpulkan, setor, dan dapatkan saldo yang bisa dicairkan kapan saja.
                </CardDescription>
              </CardContent>
            </Card>

            <Card data-aos="fade-up" data-aos-delay="200" className="group border-0 shadow-elegant hover:shadow-carousel transition-all duration-500 hover-lift bg-card">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                  Laporan Transparan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed font-lora">
                  Pantau riwayat transaksi dan perkembangan saldo Anda secara real-time dengan sistem yang transparan.
                </CardDescription>
              </CardContent>
            </Card>

            <Card data-aos="fade-up" data-aos-delay="300" className="group border-0 shadow-elegant hover:shadow-carousel transition-all duration-500 hover-lift bg-card">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                  Manajemen Mudah
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed font-lora">
                  Sistem digital yang memudahkan pengelola dan nasabah dalam bertransaksi dan mengelola bank sampah.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="cara-kerja" className="py-20">
        <div className="container mx-auto px-4">
          <div data-aos="fade-up" className="glass-card rounded-3xl p-10 md:p-14 shadow-carousel">
            <div className="text-center mb-12">
              <span className="hero-subtitle text-sm mb-4 inline-flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Mudah & Cepat
              </span>
              <h2 className="section-heading text-4xl md:text-5xl">Cara Kerja</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[{
              step: "1",
              title: "Daftar",
              desc: "Buat akun sebagai nasabah bank sampah"
            }, {
              step: "2",
              title: "Kumpulkan",
              desc: "Pisahkan dan kumpulkan sampah berdasarkan jenisnya"
            }, {
              step: "3",
              title: "Setor",
              desc: "Setor sampah Anda ke bank sampah dan dapatkan saldo"
            }, {
              step: "4",
              title: "Cairkan",
              desc: "Tarik saldo Anda menjadi uang tunai"
            }].map((item, index) => <div key={index} data-aos="zoom-in" data-aos-delay={index * 150} className="text-center group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-elegant group-hover:scale-110 transition-transform duration-300 group-hover:shadow-glow">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-xl mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-lora">
                    {item.desc}
                  </p>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div data-aos="fade-up" className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 rounded-3xl blur-3xl" />
            <div className="relative bg-gradient-to-br from-primary/10 to-accent/5 rounded-3xl p-12 md:p-16 border border-primary/20 shadow-carousel">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8 animate-float">
                <Leaf className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Mulai Peduli Lingkungan <span className="font-handlee text-primary">Hari Ini</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-lora">
                Bergabunglah dengan gerakan peduli lingkungan dan dapatkan manfaat finansial dari sampah yang Anda kumpulkan.
              </p>
              <Button size="lg" onClick={() => navigate("/auth")} className="gap-2 px-10 py-6 text-lg font-semibold shadow-elegant hover:shadow-carousel transition-all duration-300 hover:scale-105">
                Bergabung Sekarang
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="bg-foreground text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Recycle className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">SiBasTaRa</span>
              </div>
              <p className="text-primary-foreground/70 font-lora leading-relaxed">
                Platform digital untuk pengelolaan bank sampah yang modern dan efisien.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-primary-foreground/70">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Setoran Sampah</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Pencairan Saldo</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Laporan Transaksi</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Informasi</h4>
              <ul className="space-y-2 text-primary-foreground/70">
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-primary-foreground transition-colors">Syarat & Ketentuan</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <ul className="space-y-3 text-primary-foreground/70">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Samarinda, Kaltim, Indonesia</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+62 81255691234</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>info@sibastara.id</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-primary-foreground/20 text-center text-primary-foreground/60">
            <p className="flex items-center justify-center gap-2">
              <Recycle className="w-4 h-4" />
              © 2024 e-Bank Sampah Jakarta. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;