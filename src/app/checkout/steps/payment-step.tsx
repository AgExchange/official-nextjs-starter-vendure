'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CreditCard, Check } from 'lucide-react';
import { useCheckout } from '../checkout-provider';
import { getPayfastAvailableMethods } from '../actions';

interface PaymentStepProps {
  onComplete: () => void;
}

export default function PaymentStep({ onComplete }: PaymentStepProps) {
  const {
    paymentMethods,
    selectedPaymentMethodCode,
    setSelectedPaymentMethodCode,
    payfastPaymentMethod,
    setPayfastPaymentMethod,
    payfastMethods,
    setPayfastMethods,
  } = useCheckout();

  useEffect(() => {
    getPayfastAvailableMethods()
      .then((methods) => {
        if (methods.length > 0) {
          setPayfastMethods(methods);
          // Auto-select when only one method is configured for this channel
          if (methods.length === 1) {
            setPayfastPaymentMethod(methods[0].code);
          }
        }
      })
      .catch(() => {/* silent — user will see an empty dialog */});
  }, []);

  const isPayfast = selectedPaymentMethodCode === 'payfast';
  const showDialog = isPayfast && payfastPaymentMethod === null;

  const handleMethodSelect = (code: string) => {
    setSelectedPaymentMethodCode(code);
    if (code !== 'payfast') {
      setPayfastPaymentMethod(null);
    }
  };

  const handlePayfastMethodSelect = (methodCode: string) => {
    setPayfastPaymentMethod(methodCode);
  };

  const handleContinue = () => {
    if (!selectedPaymentMethodCode) return;
    if (isPayfast && !payfastPaymentMethod) return;
    onComplete();
  };

  const selectedPayfastMethod = payfastMethods.find(m => m.code === payfastPaymentMethod);

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No payment methods available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold">Select payment method</h3>

      <RadioGroup value={selectedPaymentMethodCode || ''} onValueChange={handleMethodSelect}>
        {paymentMethods.map((method) => (
          <Label key={method.code} htmlFor={method.code} className="cursor-pointer">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <RadioGroupItem value={method.code} id={method.code} />
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{method.name}</p>
                  {method.code === 'payfast' && selectedPayfastMethod ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      via {selectedPayfastMethod.label} — {selectedPayfastMethod.description}
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setPayfastPaymentMethod(null); }}
                        className="ml-2 text-primary underline text-xs"
                      >
                        Change
                      </button>
                    </p>
                  ) : method.description ? (
                    <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                  ) : null}
                </div>
              </div>
            </Card>
          </Label>
        ))}
      </RadioGroup>

      {/* PayFast payment method selector dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setSelectedPaymentMethodCode(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select PayFast payment method</DialogTitle>
            <DialogDescription>
              Choose how you would like to pay. All options are processed securely via PayFast.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {payfastMethods.map((method) => (
              <button
                key={method.code}
                type="button"
                onClick={() => handlePayfastMethodSelect(method.code)}
                className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                  payfastPaymentMethod === method.code ? 'border-primary bg-accent' : 'border-border'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium text-sm">{method.label}</span>
                  {payfastPaymentMethod === method.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{method.description}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Button
        onClick={handleContinue}
        disabled={!selectedPaymentMethodCode || (isPayfast && payfastPaymentMethod === null)}
        className="w-full"
      >
        Continue to review
      </Button>
    </div>
  );
}
