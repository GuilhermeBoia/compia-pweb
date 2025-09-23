import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { users } from "@/types/user";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate("/catalogo");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const isLoggedIn = login(email);

    if (isLoggedIn) {
      const foundUser = users.find(u => u.email === email);
      if (foundUser?.role === 'admin') {
        navigate("/catalogo");
      } else {
        navigate("/");
      }
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="relative flex justify-center items-center h-screen overflow-hidden bg-gray-100 p-4">
      <Card className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 shadow-xl rounded-2xl overflow-hidden py-0">
        <div className="flex flex-col justify-center p-8 md:p-12 bg-slate-900 text-white">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-6 inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <img
            src="/compia.svg"
            alt="Compia Logo"
            className="w-16 h-16 mb-6"
          />
          <h2 className="text-4xl font-bold mb-4">Olá, seja bem-vindo!</h2>
          <p className="text-slate-300">
            Você pode entrar para ter acesso a sua conta.
          </p>
        </div>

        <div className="p-8 md:p-12">
          <CardHeader className="p-0 mb-8 text-left">
            <CardTitle className="text-3xl font-bold">Entrar</CardTitle>
            <CardDescription>Use seu email para entrar.</CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="p-0 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="cliente@compia.com ou admin@compia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite qualquer senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full text-lg py-6 bg-slate-900 text-white">
                Entrar
              </Button>
            </CardContent>
          </form>
        </div>
      </Card>
    </div>
  );
}
