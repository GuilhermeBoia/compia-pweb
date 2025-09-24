import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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
import { Checkbox } from "@/components/ui/checkbox";
import { users } from "@/data/seed";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const isLoggedIn = login(email);

    if (isLoggedIn) {
      const loggedInUser = users.find((u) => u.email === email);
      if (loggedInUser?.role === "admin") {
        navigate("/minha-conta");
      } else {
        navigate("/minha-conta");
      }
    }
  };

  if (user) {
    navigate(user.role === "admin" ? "/minha-conta" : "/minha-conta");
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 shadow-xl rounded-2xl overflow-hidden py-0">
        <div className="hidden md:flex flex-col justify-center p-12 bg-zinc-900 text-white">
          <h2 className="text-4xl font-bold mb-4">Bem vindo, novamente!</h2>
          <p className="text-zinc-300">
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
                  placeholder="ana@cliente.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" />
                  <Label htmlFor="remember-me" className="font-normal">
                    Lembre de mim
                  </Label>
                </div>
                <Link
                  to="#"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button type="submit" className="w-full text-lg py-6">
                Entrar
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-500">Novo por aqui? </span>
                <Link
                  to="#"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Criar uma conta
                </Link>
              </div>
            </CardContent>
          </form>
        </div>
      </Card>
    </div>
  );
}
