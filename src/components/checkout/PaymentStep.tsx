import { useState, useEffect } from 'react';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useCart } from '@/contexts/CartContext';
import { paymentService } from '@/services/payment';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Smartphone, 
  QrCode, 
  Shield, 
  Lock,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import type { PaymentMethod } from '@/types/checkout';

function PaymentStep() {
  const { payment, setPayment, shipping } = useCheckout();
  const { items, getTotalPrice } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    payment?.method || 'credit_card'
  );
  const [installments, setInstallments] = useState(payment?.installments || 1);
  // PIX não precisa mais de chave - será gerado automaticamente
  
  // Campos do cartão de crédito
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // PIX QR Code state
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeImage: string;
    pixKey: string;
    expiresAt: string;
  } | null>(null);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const totalPrice = getTotalPrice();
  const shippingCost = shipping?.cost || 0;
  const finalTotal = totalPrice + shippingCost;

  const paymentMethods = [
    {
      id: 'credit_card' as PaymentMethod,
      name: 'Cartão de Crédito',
      description: 'Visa, MasterCard, Elo, American Express',
      icon: CreditCard,
      features: ['Parcelamento', 'Segurança', 'Aceito em todo Brasil'],
      available: true
    },
    {
      id: 'debit_card' as PaymentMethod,
      name: 'Cartão de Débito',
      description: 'Débito online ou PIX',
      icon: CreditCard,
      features: ['Aprovação imediata', 'Sem juros', 'Seguro'],
      available: true
    },
    {
      id: 'pix' as PaymentMethod,
      name: 'PIX',
      description: 'Pagamento instantâneo',
      icon: Smartphone,
      features: ['Aprovação imediata', 'Sem taxas', '24h por dia'],
      available: true
    },
    {
      id: 'boleto' as PaymentMethod,
      name: 'Boleto Bancário',
      description: 'Pagamento em até 3 dias',
      icon: QrCode,
      features: ['Sem cartão', 'Até 3 dias para pagar', 'Desconto disponível'],
      available: true
    }
  ];

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setPayment({
      method,
      installments: method === 'credit_card' ? installments : undefined
    });
  };

  const handleInstallmentsChange = (value: number) => {
    setInstallments(value);
    if (selectedMethod === 'credit_card') {
      setPayment({
        method: selectedMethod,
        installments: value
      });
    }
  };

  // PIX será gerado automaticamente - não precisa de chave

  // Funções para formatar campos do cartão
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiry(value);
    setCardExpiry(formatted);
  };

  // Generate PIX QR Code
  const generatePixQRCode = async () => {
    if (selectedMethod !== 'pix') return;
    
    setIsGeneratingPix(true);
    try {
      console.log('Generating PIX QR Code...');
      
      // Create a mock order for PIX generation
      const mockOrder = {
        id: `temp_${Date.now()}`,
        customer: {
          nome: 'Cliente',
          email: 'cliente@email.com',
          telefone: '(11) 99999-9999',
          cpf: '000.000.000-00',
          endereco: {
            cep: '00000-000',
            logradouro: 'Rua Exemplo',
            numero: '123',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP',
            pais: 'Brasil'
          }
        },
        items: items.map(item => ({
          productId: item.product.id,
          productTitle: item.product.titulo,
          quantity: item.quantity,
          price: item.product.preco,
          type: item.product.tipo === 'fisico' ? 'physical' as const : 'ebook' as const
        })),
        payment: { method: 'pix' as const },
        shipping: shipping || { method: 'digital' as const, cost: 0 },
        total: finalTotal,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const pixPayment = await paymentService.createPixPayment(mockOrder);
      
      if (pixPayment.success) {
        setPixData({
          qrCode: pixPayment.qrCode!,
          qrCodeImage: pixPayment.qrCodeImage!,
          pixKey: pixPayment.pixKey!,
          expiresAt: pixPayment.expiresAt!
        });
        console.log('PIX QR Code generated successfully');
      } else {
        console.error('Failed to generate PIX QR Code:', pixPayment.message);
      }
    } catch (error) {
      console.error('Error generating PIX QR Code:', error);
    } finally {
      setIsGeneratingPix(false);
    }
  };

  // Generate PIX QR Code when PIX is selected
  useEffect(() => {
    if (selectedMethod === 'pix' && !pixData) {
      generatePixQRCode();
    } else if (selectedMethod !== 'pix') {
      // Clear PIX data when switching to other payment methods
      setPixData(null);
      setIsGeneratingPix(false);
    }
  }, [selectedMethod]);

  // Copy to clipboard function
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const getInstallmentOptions = () => {
    const maxInstallments = Math.min(12, Math.floor(totalPrice / 50));
    return Array.from({ length: maxInstallments }, (_, i) => i + 1);
  };

  const calculateInstallmentValue = (installments: number) => {
    const interestRate = installments > 1 ? 0.0299 : 0; // 2.99% per month
    const totalWithInterest = totalPrice * Math.pow(1 + interestRate, installments - 1);
    return totalWithInterest / installments;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-100 rounded-lg">
          <CreditCard className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Forma de Pagamento
          </h2>
          <p className="text-slate-600">
            Escolha como deseja pagar seu pedido
          </p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <Card
              key={method.id}
              className={`p-6 cursor-pointer transition-all ${
                isSelected
                  ? 'border-2 border-slate-900 bg-slate-50'
                  : 'border border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => handleMethodSelect(method.id)}
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
                      {method.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        Seguro
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 mb-3">
                    {method.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {method.features.map((feature, index) => (
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

      {/* Payment Details */}
      {selectedMethod && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Detalhes do Pagamento
          </h3>
          
          {selectedMethod === 'credit_card' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="installments">Parcelamento</Label>
                <select
                  id="installments"
                  value={installments}
                  onChange={(e) => handleInstallmentsChange(Number(e.target.value))}
                  className="w-full mt-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                >
                  {getInstallmentOptions().map(option => (
                    <option key={option} value={option}>
                      {option}x de R$ {calculateInstallmentValue(option).toFixed(2).replace('.', ',')}
                      {option > 1 && ' (com juros)'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardName">Nome no Cartão</Label>
                  <Input
                    id="cardName"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    placeholder="JOÃO DA SILVA"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardExpiry">Validade</Label>
                    <Input
                      id="cardExpiry"
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      Informações Seguras
                    </h4>
                    <p className="text-sm text-blue-700">
                      Seus dados são criptografados e protegidos. Não armazenamos informações de cartão em nossos servidores.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'debit_card' && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900 mb-1">
                      Cartão de Débito
                    </h4>
                    <p className="text-sm text-green-700">
                      Pagamento à vista com débito online. Aprovação imediata e sem juros.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="debitCardNumber">Número do Cartão</Label>
                  <Input
                    id="debitCardNumber"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="debitCardName">Nome no Cartão</Label>
                  <Input
                    id="debitCardName"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    placeholder="JOÃO DA SILVA"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="debitCardExpiry">Validade</Label>
                    <Input
                      id="debitCardExpiry"
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="debitCardCvv">CVV</Label>
                    <Input
                      id="debitCardCvv"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      Informações Seguras
                    </h4>
                    <p className="text-sm text-blue-700">
                      Seus dados são criptografados e protegidos. Não armazenamos informações de cartão em nossos servidores.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'pix' && (
            <div className="space-y-4">
              {isGeneratingPix ? (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">
                        Gerando QR Code PIX...
                      </h4>
                      <p className="text-sm text-green-700">
                        Aguarde enquanto geramos seu QR Code para pagamento instantâneo.
                      </p>
                    </div>
                  </div>
                </div>
              ) : pixData ? (
                <div className="bg-green-50 p-4 rounded-lg border-green-200">
                  <div className="flex items-start gap-3 mb-4">
                    <QrCode className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">
                        QR Code PIX Gerado
                      </h4>
                      <p className="text-sm text-green-700">
                        Escaneie o QR Code ou copie a chave PIX para pagar
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="inline-block p-4 bg-white rounded-lg border-2 border-green-200">
                        <img 
                          src={pixData.qrCodeImage} 
                          alt="QR Code PIX" 
                          className="w-48 h-48"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-green-900">Chave PIX:</label>
                      <div className="flex gap-2">
                        <Input 
                          value={pixData.pixKey} 
                          readOnly 
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(pixData.pixKey, 'pix')}
                        >
                          {copiedText === 'pix' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-green-700">
                        Expira em: {new Date(pixData.expiresAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <QrCode className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">
                        Pagamento PIX Instantâneo
                      </h4>
                      <p className="text-sm text-green-700">
                        Um QR Code será gerado automaticamente para pagamento instantâneo via PIX.
                        Não é necessário informar chave PIX.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedMethod === 'boleto' && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-1">
                    Boleto Bancário
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Após confirmar o pedido, você receberá o boleto para pagamento.
                    O pedido será processado após a confirmação do pagamento (até 3 dias úteis).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Shield className="w-4 h-4" />
              <span>
                Seus dados estão protegidos com criptografia.
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Summary */}
      <Card className="p-6 bg-slate-50">
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Resumo do Pagamento
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal:</span>
            <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
          </div>
          
          {shippingCost > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Frete:</span>
              <span>R$ {shippingCost.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          
          {selectedMethod === 'credit_card' && installments > 1 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Parcelamento:</span>
              <span>{installments}x de R$ {calculateInstallmentValue(installments).toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          
          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-slate-200">
            <span>Total:</span>
            <span>
              {selectedMethod === 'credit_card' && installments > 1
                ? `R$ ${(finalTotal * Math.pow(1.0299, installments - 1)).toFixed(2).replace('.', ',')}`
                : `R$ ${finalTotal.toFixed(2).replace('.', ',')}`
              }
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default PaymentStep;
