import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, User, Truck, CreditCard, FileCheck } from 'lucide-react';
import CustomerStep from '@/components/checkout/CustomerStep';
import ShippingStep from '@/components/checkout/ShippingStep';
import PaymentStep from '@/components/checkout/PaymentStep';
import ConfirmationStep from '@/components/checkout/ConfirmationStep';

export default function Checkout() {
  const { currentStep, setCurrentStep, steps, canProceedToStep } = useCheckout();
  const { items, getTotalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = getTotalPrice();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearCart();
      // Order completion logic would go here
    } catch (error) {
      console.error('Error completing order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepIcon = (stepIndex: number, step: any) => {
    const icons = [User, Truck, CreditCard, FileCheck];
    const Icon = icons[stepIndex];
    
    if (step.completed) {
      return <Check className="w-5 h-5 text-green-600" />;
    }
    
    return <Icon className="w-5 h-5" />;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <CustomerStep />;
      case 1:
        return <ShippingStep />;
      case 2:
        return <PaymentStep />;
      case 3:
        return <ConfirmationStep />;
      default:
        return <CustomerStep />;
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Carrinho Vazio
          </h1>
          <p className="text-slate-600 mb-6">
            Adicione produtos ao seu carrinho antes de finalizar a compra.
          </p>
          <Button onClick={() => window.history.back()}>
            Voltar às Compras
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Finalizar Compra</h1>
          <p className="text-slate-600 mt-2">
            Complete seu pedido em poucos passos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps Progress */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">
                Progresso do Pedido
              </h2>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      step.current
                        ? 'bg-slate-100 border-2 border-slate-300'
                        : step.completed
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${
                      step.completed ? 'text-green-600' : 
                      step.current ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {renderStepIcon(index, step)}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${
                        step.completed ? 'text-green-900' : 
                        step.current ? 'text-slate-900' : 'text-slate-500'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${
                        step.completed ? 'text-green-700' : 
                        step.current ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderCurrentStep()}
              </motion.div>

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>

                {currentStep < steps.length - 1 && (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedToStep(currentStep + 1)}
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
