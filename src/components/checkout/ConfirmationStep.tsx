import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useCart } from '@/contexts/CartContext';
import { useCheckoutIntegrationTest } from '@/hooks/useCheckoutIntegrationTest';
import { paymentService } from '@/services/payment';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CheckCircle,
  Package,
  Download,
  MapPin,
  CreditCard,
  FileText,
  Truck,
  Clock,
  User,
  Mail,
  Phone,
  QrCode,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import type { OrderConfirmation } from '@/services/order';

export default function ConfirmationStep() {
  const navigate = useNavigate();
  const { customer, shipping, payment, order } = useCheckout();
  const { items, getTotalPrice } = useCart();
  const { completeOrderWithIntegration } = useCheckoutIntegrationTest();
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const totalPrice = getTotalPrice();

  useEffect(() => {
    if (order) {
      const generateConfirmation = async () => {
        try {
          const confirmationData: OrderConfirmation = {
            order,
            digitalDownloads: items
              .filter(item => item.product.tipo === 'ebook')
              .map(item => ({
                id: `download_${item.product.id}`,
                orderId: order.id,
                productId: item.product.id,
                productTitle: item.product.titulo,
                downloadUrl: `https://exemplo.com/download/${item.product.id}`,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                downloadCount: 0,
                maxDownloads: 5
              }))
          };

          // Generate PIX payment data if payment method is PIX
          if (order.payment.method === 'pix') {
            console.log('Generating PIX payment data...', { order });
            try {
              const pixPayment = await paymentService.createPixPayment(order);
              console.log('PIX payment response:', pixPayment);
              
              if (pixPayment.success) {
                confirmationData.pixPayment = {
                  qrCode: pixPayment.qrCode!,
                  qrCodeImage: pixPayment.qrCodeImage!,
                  pixKey: pixPayment.pixKey!,
                  expiresAt: pixPayment.expiresAt!
                };
                console.log('PIX payment data generated successfully:', confirmationData.pixPayment);
              } else {
                console.error('PIX payment generation failed:', pixPayment.message);
              }
            } catch (error) {
              console.error('Error generating PIX payment:', error);
            }
          }

          // Generate Boleto payment data if payment method is boleto
          if (order.payment.method === 'boleto') {
            console.log('Generating Boleto payment data...');
            const boletoPayment = await paymentService.createBoletoPayment(order);
            if (boletoPayment.success) {
              confirmationData.boletoPayment = {
                boletoUrl: boletoPayment.boletoUrl!,
                boletoCode: boletoPayment.boletoCode!,
                expiresAt: boletoPayment.expiresAt!
              };
              console.log('Boleto payment data generated successfully');
            }
          }

          setConfirmation(confirmationData);
        } catch (error) {
          console.error('Error generating confirmation data:', error);
          // Fallback to basic confirmation
          setConfirmation({
            order,
            digitalDownloads: items
              .filter(item => item.product.tipo === 'ebook')
              .map(item => ({
                id: `download_${item.product.id}`,
                orderId: order.id,
                productId: item.product.id,
                productTitle: item.product.titulo,
                downloadUrl: `https://exemplo.com/download/${item.product.id}`,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                downloadCount: 0,
                maxDownloads: 5
              }))
          });
        }
      };

      generateConfirmation();
    }
  }, [order, items]);

  const handleFinalizeOrder = async () => {
    setIsProcessing(true);
    try {
      // Use the integrated checkout function
      const completedOrder = await completeOrderWithIntegration();
      console.log('Order finalized and saved to history:', completedOrder);
      
      // Force close any open cart popup by dispatching a custom event
      window.dispatchEvent(new CustomEvent('force-close-cart'));
      
      // Redirect to purchase history after successful order
      setTimeout(() => {
        navigate('/historico-compras');
      }, 1000); // Small delay to show success state
    } catch (error) {
      console.error('Error finalizing order:', error);
      alert('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleDownload = (downloadUrl: string, _productTitle: string) => {
    // In a real implementation, you would track the download
    window.open(downloadUrl, '_blank');
  };

  const getPaymentMethodName = (method: string) => {
    const methods = {
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'pix': 'PIX',
      'boleto': 'Boleto Bancário'
    };
    return methods[method as keyof typeof methods] || method;
  };

  const getShippingMethodName = (method: string) => {
    const methods = {
      'correios': 'Correios',
      'pickup': 'Retirada no Local',
      'digital': 'Download Digital'
    };
    return methods[method as keyof typeof methods] || method;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Confirmação do Pedido
          </h2>
          <p className="text-slate-600">
            Revise os detalhes antes de finalizar
          </p>
        </div>
      </div>

      {/* Customer Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-medium text-slate-900">
            Dados do Cliente
          </h3>
        </div>
        
        {customer && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Nome</p>
                <p className="font-medium">{customer.nome}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Telefone</p>
                <p className="font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {customer.telefone}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">CPF</p>
                <p className="font-medium">{customer.cpf}</p>
              </div>
            </div>
            
            {customer.endereco && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-600">Endereço de Entrega</span>
                </div>
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
          </div>
        )}
      </Card>

      {/* Shipping Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Truck className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-medium text-slate-900">
            Informações de Entrega
          </h3>
        </div>
        
        {shipping && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Método</p>
                <p className="font-medium">{getShippingMethodName(shipping.method)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Prazo</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {shipping.estimatedDays === 0 ? 'Imediato' : `${shipping.estimatedDays} dias úteis`}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Custo</p>
                <p className="font-medium">
                  {shipping.cost === 0 ? 'Grátis' : `R$ ${shipping.cost.toFixed(2).replace('.', ',')}`}
                </p>
              </div>
            </div>
            
            {shipping.pickupLocation && (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-600">Local de Retirada</span>
                </div>
                <p className="text-sm">{shipping.pickupLocation}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Payment Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-medium text-slate-900">
            Informações de Pagamento
          </h3>
        </div>
        
        {payment && (
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Método</p>
              <p className="font-medium">{getPaymentMethodName(payment.method)}</p>
            </div>
            
            {payment.installments && payment.installments > 1 && (
              <div>
                <p className="text-sm text-slate-600">Parcelamento</p>
                <p className="font-medium">{payment.installments}x</p>
              </div>
            )}
            
            {payment.pixKey && (
              <div>
                <p className="text-sm text-slate-600">Chave PIX</p>
                <p className="font-medium">{payment.pixKey}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Order Items */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-medium text-slate-900">
            Itens do Pedido
          </h3>
        </div>
        
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-4 p-4 border border-slate-200 rounded-lg">
              <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
                <img
                  src={item.product.capaUrl || "https://via.placeholder.com/100x120"}
                  alt={item.product.titulo}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-slate-900">{item.product.titulo}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={item.product.tipo === 'ebook' ? 'default' : 'secondary'}>
                    {item.product.tipo === 'ebook' ? (
                      <>
                        <FileText className="w-3 h-3 mr-1" />
                        eBook
                      </>
                    ) : (
                      <>
                        <Package className="w-3 h-3 mr-1" />
                        Físico
                      </>
                    )}
                  </Badge>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-sm text-slate-600">
                    Quantidade: {item.quantity}
                  </span>
                  <span className="font-medium">
                    R$ {(item.product.preco * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Order Summary */}
      <Card className="p-6 bg-slate-50">
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Resumo do Pedido
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal:</span>
            <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
          </div>
          
          {shipping && shipping.cost > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600">Frete:</span>
              <span>R$ {shipping.cost.toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          
          <div className="flex justify-between font-semibold text-lg pt-2 border-t border-slate-200">
            <span>Total:</span>
            <span>R$ {(totalPrice + (shipping?.cost || 0)).toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </Card>

      {/* PIX Payment */}
      {confirmation?.pixPayment && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-3 mb-4">
            <QrCode className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 mb-1">
                Pagamento PIX
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
                  src={confirmation.pixPayment.qrCodeImage} 
                  alt="QR Code PIX" 
                  className="w-48 h-48"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-900">Chave PIX:</label>
              <div className="flex gap-2">
                <Input 
                  value={confirmation.pixPayment.pixKey} 
                  readOnly 
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(confirmation.pixPayment!.pixKey, 'pix')}
                >
                  {copiedText === 'pix' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-green-700">
                Expira em: {new Date(confirmation.pixPayment.expiresAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Boleto Payment */}
      {confirmation?.boletoPayment && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3 mb-4">
            <FileText className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">
                Boleto Bancário
              </h4>
              <p className="text-sm text-yellow-700">
                Imprima o boleto e pague em qualquer banco ou lotérica
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-yellow-900">Código do Boleto:</label>
              <div className="flex gap-2">
                <Input 
                  value={confirmation.boletoPayment.boletoCode} 
                  readOnly 
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(confirmation.boletoPayment!.boletoCode, 'boleto')}
                >
                  {copiedText === 'boleto' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => window.open(confirmation.boletoPayment!.boletoUrl, '_blank')}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Boleto
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-yellow-700">
                Vencimento: {new Date(confirmation.boletoPayment.expiresAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Digital Downloads */}
      {confirmation?.digitalDownloads && confirmation.digitalDownloads.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3 mb-4">
            <Download className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Downloads Disponíveis
              </h4>
              <p className="text-sm text-blue-700">
                Seus e-books estão prontos para download
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {confirmation.digitalDownloads.map((download) => (
              <div key={download.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">{download.productTitle}</p>
                    <p className="text-sm text-blue-700">
                      Downloads restantes: {download.maxDownloads - download.downloadCount}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDownload(download.downloadUrl, download.productTitle)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tracking Code */}
      {confirmation?.trackingCode && (
        <Card className="p-6 bg-slate-50 border-slate-200">
          <div className="flex items-start gap-3 mb-4">
            <Truck className="w-5 h-5 text-slate-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-900 mb-1">
                Código de Rastreamento
              </h4>
              <p className="text-sm text-slate-700">
                Acompanhe seu pedido pelos Correios
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input 
              value={confirmation.trackingCode} 
              readOnly 
              className="flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(confirmation.trackingCode!, 'tracking')}
            >
              {copiedText === 'tracking' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              onClick={() => window.open(`https://www.correios.com.br/tracking/${confirmation.trackingCode}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Rastrear
            </Button>
          </div>
        </Card>
      )}

      {/* Finalize Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleFinalizeOrder}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processando...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Finalizar Pedido
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
