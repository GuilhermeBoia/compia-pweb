import { useState, useEffect } from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Truck, Package, Download, MapPin, Clock } from 'lucide-react';
import type { ShippingData, ShippingMethod } from '@/types/checkout';

export default function ShippingStep() {
  const { shipping, setShipping, customer } = useCheckout();
  const { items } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethod>(
    shipping?.method || 'correios'
  );

  // Check if cart has only e-books
  const hasOnlyEbooks = items.every(item => item.product.tipo === 'ebook');
  const hasPhysicalItems = items.some(item => item.product.tipo === 'fisico');

  const shippingOptions = [
    {
      id: 'correios' as ShippingMethod,
      name: 'Correios',
      description: 'Entrega pelos Correios',
      icon: Truck,
      cost: 15.90,
      estimatedDays: '5-7 dias úteis',
      available: hasPhysicalItems,
      features: ['Rastreamento', 'Seguro', 'Entrega em todo Brasil']
    },
    {
      id: 'pickup' as ShippingMethod,
      name: 'Retirada no Local',
      description: 'Retire seu pedido em nossa loja',
      icon: MapPin,
      cost: 0,
      estimatedDays: 'Imediato',
      available: hasPhysicalItems,
      features: ['Sem custo', 'Retirada imediata', 'Horário comercial']
    },
    {
      id: 'digital' as ShippingMethod,
      name: 'Download Digital',
      description: 'Acesso imediato aos e-books',
      icon: Download,
      cost: 0,
      estimatedDays: 'Imediato',
      available: hasOnlyEbooks,
      features: ['Acesso imediato', 'Download ilimitado', 'Sem custo de envio']
    }
  ];

  const availableOptions = shippingOptions.filter(option => option.available);

  useEffect(() => {
    if (availableOptions.length > 0 && !shipping) {
      const defaultOption = availableOptions[0];
      setShipping({
        method: defaultOption.id,
        cost: defaultOption.cost,
        estimatedDays: defaultOption.id === 'correios' ? 7 : 0
      });
      setSelectedMethod(defaultOption.id);
    }
  }, [availableOptions, shipping, setShipping]);

  const handleMethodSelect = (method: ShippingMethod) => {
    const option = shippingOptions.find(opt => opt.id === method);
    if (option) {
      setSelectedMethod(method);
      setShipping({
        method,
        cost: option.cost,
        estimatedDays: option.id === 'correios' ? 7 : 0,
        address: method === 'correios' ? customer?.endereco : undefined,
        pickupLocation: method === 'pickup' ? 'Loja Principal - Rua das Flores, 123' : undefined
      });
    }
  };

  if (availableOptions.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Nenhuma opção de entrega disponível
        </h3>
        <p className="text-slate-600">
          Adicione produtos ao seu carrinho para ver as opções de entrega.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-100 rounded-lg">
          <Truck className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Método de Entrega
          </h2>
          <p className="text-slate-600">
            Escolha como deseja receber seus produtos
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {availableOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedMethod === option.id;
          
          return (
            <Card
              key={option.id}
              className={`p-6 cursor-pointer transition-all ${
                isSelected
                  ? 'border-2 border-slate-900 bg-slate-50'
                  : 'border border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => handleMethodSelect(option.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-slate-900">
                      {option.name}
                    </h3>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-900">
                        {option.cost === 0 ? 'Grátis' : 
                          `R$ ${option.cost.toFixed(2).replace('.', ',')}`
                        }
                      </div>
                      <div className="text-sm text-slate-600 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {option.estimatedDays}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 mb-3">
                    {option.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {option.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900'
                    : 'border-slate-300'
                }`}>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Shipping Summary */}
      {shipping && (
        <Card className="p-6 bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Resumo da Entrega
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Método:</span>
              <span className="font-medium">
                {shippingOptions.find(opt => opt.id === shipping.method)?.name}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-600">Prazo:</span>
              <span className="font-medium">
                {shipping.estimatedDays === 0 ? 'Imediato' : `${shipping.estimatedDays} dias úteis`}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-600">Custo:</span>
              <span className="font-medium">
                {shipping.cost === 0 ? 'Grátis' : 
                  `R$ ${shipping.cost.toFixed(2).replace('.', ',')}`
                }
              </span>
            </div>
            
            {shipping.method === 'correios' && customer?.endereco && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-2">Endereço de entrega:</p>
                <p className="text-sm">
                  {customer.endereco.logradouro}, {customer.endereco.numero}
                  {customer.endereco.complemento && `, ${customer.endereco.complemento}`}
                  <br />
                  {customer.endereco.bairro} - {customer.endereco.cidade}/{customer.endereco.estado}
                  <br />
                  CEP: {customer.endereco.cep}
                </p>
              </div>
            )}
            
            {shipping.method === 'pickup' && shipping.pickupLocation && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-2">Local de retirada:</p>
                <p className="text-sm">{shipping.pickupLocation}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
