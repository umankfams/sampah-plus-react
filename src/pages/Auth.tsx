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
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

const signupSchema = authSchema.extend({
  noInduk: z.string().min(1, { message: "No Induk wajib diisi" }),
  noHp: z.string().min(10, { message: "No HP minimal 10 digit" }),
  nama: z.string().min(1, { message: "Nama wajib diisi" }),
});

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    noInduk: "",
    noHp: "",
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
      authSchema.parse({ email: formData.email, password: formData.password });

      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({
        title: "Berhasil login",
        description: "Selamat datang kembali!",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validasi gagal",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login gagal",
          description: error.message || "Terjadi kesalahan",
          variant: "destructive",
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

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("Gagal membuat akun");

      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        no_induk: formData.noInduk,
        no_hp: formData.noHp,
        nama: formData.nama,
      });

      if (profileError) throw profileError;

      toast({
        title: "Berhasil mendaftar",
        description: "Akun Anda telah dibuat",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validasi gagal",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Pendaftaran gagal",
          description: error.message || "Terjadi kesalahan",
          variant: "destructive",
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
          <CardTitle className="text-2xl text-primary">Bank Sampah Nusantara RT 17</CardTitle>
          <CardDescription>
            {isLogin ? "Login ke akun Anda" : "Daftar akun baru"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
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
                    value={formData.noInduk}
                    onChange={(e) => setFormData({ ...formData, noInduk: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noHp">No HP</Label>
                  <Input
                    id="noHp"
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>
              </>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : isLogin ? "Login" : "Daftar"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? "Belum punya akun? Daftar" : "Sudah punya akun? Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
