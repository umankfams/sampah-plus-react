import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpg";
import { z } from "zod";

const authSchema = z.object({
  phone: z.string().min(10, "Nomor telepon minimal 10 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const signupSchema = authSchema.extend({
  noInduk: z.string().min(1, "No Induk wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
});

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    noInduk: "",
    nama: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      authSchema.parse(formData);
      
      const { error } = await supabase.auth.signInWithPassword({
        phone: formData.phone,
        password: formData.password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login gagal",
          description: error.message,
        });
      } else {
        toast({
          title: "Login berhasil",
          description: "Selamat datang kembali!",
        });
        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Kesalahan validasi",
          description: error.errors[0].message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      signupSchema.parse(formData);
      
      const { data, error } = await supabase.auth.signUp({
        phone: formData.phone,
        password: formData.password,
        options: {
          data: {
            no_induk: formData.noInduk,
            nama: formData.nama,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Pendaftaran gagal",
          description: error.message,
        });
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            no_induk: formData.noInduk,
            no_hp: formData.phone,
            nama: formData.nama,
          });

        if (profileError) {
          toast({
            variant: "destructive",
            title: "Pembuatan profil gagal",
            description: profileError.message,
          });
          return;
        }

        // Assign admin role to super admin phone number (+6281255691234)
        if (formData.phone === "+6281255691234") {
          await supabase
            .from("user_roles")
            .insert({
              user_id: data.user.id,
              role: "admin",
            });
        } else {
          // Assign user role to regular users
          await supabase
            .from("user_roles")
            .insert({
              user_id: data.user.id,
              role: "user",
            });
        }

        toast({
          title: "Pendaftaran berhasil",
          description: "Selamat datang di SiBasTara!",
        });
        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Kesalahan validasi",
          description: error.errors[0].message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Bank Sampah Logo" className="h-24 w-24 rounded-full" />
          </div>
          <CardTitle className="text-2xl text-primary">SiBasTara</CardTitle>
          <CardDescription>
            {isLogin ? "Masuk ke akun Anda" : "Buat akun baru"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                type="text"
                placeholder="+6281234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="noInduk">No Induk</Label>
                  <Input
                    id="noInduk"
                    type="text"
                    placeholder="Masukkan No Induk"
                    value={formData.noInduk}
                    onChange={(e) => setFormData({ ...formData, noInduk: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama</Label>
                  <Input
                    id="nama"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>
              </>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : isLogin ? "Masuk" : "Daftar"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
