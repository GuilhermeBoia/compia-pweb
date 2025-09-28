import { useState } from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import type { Customer } from '@/types/checkout';

export default function CustomerStep() {
  const { customer, setCustomer } = useCheckout();
  const [formData, setFormData] = useState<Partial<Customer>>({
    nome: customer?.nome || '',
    email: customer?.email || '',
    telefone: customer?.telefone || '',
    cpf: customer?.cpf || '',
    endereco: customer?.endereco || {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      pais: 'Brasil'
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome?.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefone?.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.cpf?.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    }

    if (!formData.endereco?.cep?.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    }

    if (!formData.endereco?.logradouro?.trim()) {
      newErrors.logradouro = 'Logradouro é obrigatório';
    }

    if (!formData.endereco?.numero?.trim()) {
      newErrors.numero = 'Número é obrigatório';
    }

    if (!formData.endereco?.bairro?.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
    }

    if (!formData.endereco?.cidade?.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    if (!formData.endereco?.estado?.trim()) {
      newErrors.estado = 'Estado é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setCustomer(formData as Customer);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco!,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-100 rounded-lg">
          <User className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Dados Pessoais
          </h2>
          <p className="text-slate-600">
            Informe seus dados para entrega e faturamento
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Informações Pessoais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="nome"
                  value={formData.nome || ''}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className="pl-10"
                  placeholder="Seu nome completo"
                />
              </div>
              {errors.nome && (
                <p className="text-sm text-red-600">{errors.nome}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  placeholder="seu@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="telefone"
                  value={formData.telefone || ''}
                  onChange={(e) => handleInputChange('telefone', formatPhone(e.target.value))}
                  className="pl-10"
                  placeholder="(11) 99999-9999"
                />
              </div>
              {errors.telefone && (
                <p className="text-sm text-red-600">{errors.telefone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf || ''}
                onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {errors.cpf && (
                <p className="text-sm text-red-600">{errors.cpf}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Endereço de Entrega
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="cep"
                    value={formData.endereco?.cep || ''}
                    onChange={(e) => handleAddressChange('cep', formatCEP(e.target.value))}
                    className="pl-10"
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
                {errors.cep && (
                  <p className="text-sm text-red-600">{errors.cep}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="logradouro">Logradouro *</Label>
                <Input
                  id="logradouro"
                  value={formData.endereco?.logradouro || ''}
                  onChange={(e) => handleAddressChange('logradouro', e.target.value)}
                  placeholder="Rua, Avenida, etc."
                />
                {errors.logradouro && (
                  <p className="text-sm text-red-600">{errors.logradouro}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  value={formData.endereco?.numero || ''}
                  onChange={(e) => handleAddressChange('numero', e.target.value)}
                  placeholder="123"
                />
                {errors.numero && (
                  <p className="text-sm text-red-600">{errors.numero}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={formData.endereco?.complemento || ''}
                  onChange={(e) => handleAddressChange('complemento', e.target.value)}
                  placeholder="Apto, Bloco, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  value={formData.endereco?.bairro || ''}
                  onChange={(e) => handleAddressChange('bairro', e.target.value)}
                  placeholder="Centro"
                />
                {errors.bairro && (
                  <p className="text-sm text-red-600">{errors.bairro}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={formData.endereco?.cidade || ''}
                  onChange={(e) => handleAddressChange('cidade', e.target.value)}
                  placeholder="São Paulo"
                />
                {errors.cidade && (
                  <p className="text-sm text-red-600">{errors.cidade}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  value={formData.endereco?.estado || ''}
                  onChange={(e) => handleAddressChange('estado', e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.estado && (
                  <p className="text-sm text-red-600">{errors.estado}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
