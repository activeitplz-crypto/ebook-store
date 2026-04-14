'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ShoppingCart, 
  Loader2, 
  CheckCircle2, 
  Upload, 
  Copy, 
  Check,
  Info
} from 'lucide-react';
import { submitOrder } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PaymentMethod {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
}

interface CheckoutDialogProps {
  product: {
    title: string;
    price: number;
  };
  trigger?: React.ReactNode;
}

export function CheckoutDialog({ product, trigger }: CheckoutDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function fetchPaymentMethods() {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (data && data.length > 0) {
        setPaymentMethods(data);
        // Only set default if one hasn't been selected yet
        if (!selectedMethodId) {
          setSelectedMethodId(data[0].id);
        }
      }
    }
    if (open) {
      fetchPaymentMethods();
    }
  }, [open, supabase, selectedMethodId]);

  const currentMethod = paymentMethods.find(m => m.id === selectedMethodId);

  const handleCopy = () => {
    if (currentMethod) {
      navigator.clipboard.writeText(currentMethod.account_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Number Copied",
        description: `${currentMethod.bank_name} account number copied.`,
      });
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentMethod) return;

    const formData = new FormData(e.currentTarget);
    const sender_name = formData.get('sender_name') as string;
    const sender_number = formData.get('sender_number') as string;
    const delivery_contact = formData.get('delivery_contact') as string;

    if (!file) {
      toast({
        variant: "destructive",
        title: "Missing Receipt",
        description: "Please upload a screenshot of your payment receipt.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);

        const result = await submitOrder({
          product_title: product.title,
          price: product.price,
          sender_name,
          sender_number,
          delivery_contact,
          screenshot_url: publicUrl,
          payment_method: currentMethod.bank_name,
        });

        if (result.success) {
          setIsSuccess(true);
          toast({
            title: "Order Submitted",
            description: "We are verifying your payment. Your product will be sent soon.",
          });
          setTimeout(() => {
            setOpen(false);
            setIsSuccess(false);
            setFile(null);
          }, 4000);
        } else {
          throw new Error(result.error || 'Failed to submit order');
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Order Failed",
          description: error.message || "Something went wrong. Please try again.",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full rounded-full gap-2 group-hover:bg-primary/90">
            <ShoppingCart className="h-4 w-4" />
            Complete Purchase
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[95vh] overflow-y-auto p-0 border-none bg-slate-50">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-white">
            <CheckCircle2 className="h-20 w-20 text-green-500 animate-in zoom-in duration-300" />
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Order Placed!</h3>
              <p className="text-muted-foreground">
                Your payment proof is being verified. 
                <br /> We'll send your digital product shortly.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <DialogHeader className="p-6 pb-0 text-center">
              <DialogTitle className="text-2xl font-bold uppercase tracking-tight text-slate-800">Your Order</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-2 p-4 border-b bg-slate-50/50 text-xs font-bold uppercase text-slate-500">
                  <span>Product</span>
                  <span className="text-right">Subtotal</span>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <span className="text-slate-600 leading-tight">{product.title} × 1</span>
                    <span className="text-right font-medium text-slate-400">Rs{product.price.toLocaleString()}.00</span>
                  </div>
                  <div className="border-t pt-4 grid grid-cols-2 text-base">
                    <span className="font-bold text-slate-800">Total</span>
                    <span className="text-right font-bold text-primary text-lg">Rs{product.price.toLocaleString()}.00</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Payment Selection */}
              <div className="space-y-4">
                <Label className="text-sm font-bold text-slate-700">Select Payment Method</Label>
                <RadioGroup 
                  value={selectedMethodId} 
                  onValueChange={(val) => setSelectedMethodId(val)} 
                  className="grid grid-cols-1 gap-3"
                >
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id} 
                      className={`flex items-center space-x-3 p-3 rounded-lg bg-white border transition-all cursor-pointer ${selectedMethodId === method.id ? 'border-primary ring-1 ring-primary' : 'border-slate-200'}`} 
                      onClick={() => setSelectedMethodId(method.id)}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex flex-1 items-center justify-between cursor-pointer">
                        <span className="font-bold">{method.bank_name}</span>
                        <div className="h-6 px-2 bg-slate-100 rounded flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          {method.bank_name.slice(0, 4)}
                        </div>
                      </Label>
                    </div>
                  ))}
                  {paymentMethods.length === 0 && <p className="text-xs text-muted-foreground italic">Loading payment methods...</p>}
                </RadioGroup>

                {/* Selected Method Details */}
                {currentMethod && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-in fade-in duration-300">
                    <div className="text-xs text-slate-500 space-y-2 leading-relaxed">
                      <p>After completing the payment to our <strong>{currentMethod.bank_name}</strong> account, please upload a screenshot of your receipt.</p>
                      <p className="text-right font-medium rtl text-slate-600" dir="rtl">
                        براہ کرم ادائیگی مکمل کرنے کے بعد، اپنی ادائیگی کا اسکرین شاٹ اپ لوڈ کریں۔
                      </p>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🏦</span>
                        <div className="text-sm">
                          <span className="font-bold text-slate-700">Account Name: </span>
                          <span className="text-slate-600">{currentMethod.account_name}</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-3 w-full hover:bg-blue-100/50 p-1 rounded transition-colors"
                      >
                        <span className="text-lg">📇</span>
                        <div className="flex flex-1 items-center justify-between">
                          <div className="text-sm">
                            <span className="font-bold text-slate-700">Account Number: </span>
                            <span className="text-blue-600 font-bold underline decoration-2 underline-offset-4">{currentMethod.account_number}</span>
                          </div>
                          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-blue-400" />}
                        </div>
                      </button>
                      <div className="text-[10px] text-blue-400 font-medium flex items-center gap-1.5 pl-8">
                        <span className="h-1 w-1 rounded-full bg-blue-400" />
                        Click on the number to copy
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label className="text-sm font-bold text-slate-700">Upload Payment Screenshot</Label>
                      <div className="relative group">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          required 
                          className="cursor-pointer opacity-0 absolute inset-0 z-10"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <div className="flex items-center justify-between px-4 py-2 border rounded-md bg-white text-sm text-slate-400 group-hover:border-primary transition-colors">
                          <span>{file ? file.name : "Choose file"}</span>
                          <Upload className="h-4 w-4 text-slate-300" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="sender_name" className="text-sm font-bold text-slate-700">Sender Name (Your Account Name)</Label>
                      <Input id="sender_name" name="sender_name" placeholder="Name on your receipt" required className="bg-white" />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="sender_number" className="text-sm font-bold text-slate-700">Sender Phone Number</Label>
                      <Input id="sender_number" name="sender_number" placeholder="03XXXXXXXXX" required className="bg-white" />
                    </div>

                    <div className="space-y-3">
                      {/* Delivery Instructions Note */}
                      <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 space-y-1">
                        <p className="text-[13px] font-medium text-slate-800 text-right leading-relaxed" dir="rtl">
                          📌 یہاں اپنا ای میل ایڈریس اور واٹس ایپ نمبر درج کریں جہاں آپ ای بک وصول کرنا چاہتے ہیں۔
                        </p>
                        <p className="text-[12px] text-primary font-bold text-right" dir="rtl">
                          📘 آپ کو ای بک 10 منٹ کے اندر موصول ہو جائے گی۔
                        </p>
                      </div>
                      
                      <Label htmlFor="delivery_contact" className="text-sm font-bold text-slate-700">Delivery Contact (Email or WhatsApp)</Label>
                      <Input id="delivery_contact" name="delivery_contact" placeholder="To receive your book" required className="bg-white" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Button type="submit" className="w-full h-12 text-base font-bold rounded-full shadow-lg shadow-primary/20" disabled={isPending || !currentMethod}>
                  {isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>PLACING ORDER...</span>
                    </div>
                  ) : (
                    'PLACE ORDER'
                  )}
                </Button>

                {/* Policy Section */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 text-[13px] leading-relaxed text-slate-600 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-slate-900 border-b pb-2 mb-2">
                    <Info className="h-4 w-4 text-primary" />
                    <span>📘 Payment Verification & Order Policy</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <span className="text-primary shrink-0">🔹</span>
                      <p>Payment verify hone ke baad hi aapko PDF book aapki email address par bhej di jayegi.</p>
                    </div>

                    <div className="flex gap-2">
                      <span className="text-primary shrink-0">🔹</span>
                      <p>Apni email aur WhatsApp (jo aap ne provide kiya hoga) check karte rahein. Aapko 10 minutes ke andar book receive ho jayegi. Book receive hone ke baad aap usay download bhi kar sakte hain.</p>
                    </div>

                    <div className="flex gap-2 items-start bg-red-50 p-2 rounded-lg border border-red-100">
                      <span className="text-red-500 shrink-0">🔹</span>
                      <p className="text-red-700">
                        <strong>⚠️ Warning:</strong> Agar aap payment ka screenshot fake dete hain ya payment humein receive nahi hoti, to aapka order bina kisi notice ke cancel kar diya jayega.
                      </p>
                    </div>

                    <div className="flex gap-2 font-medium bg-blue-50 p-2 rounded-lg border border-blue-100">
                      <span className="text-primary shrink-0">🔹</span>
                      <p>🙏 Request: Meherbani karke sahi information provide karein taake aapka order jaldi process ho sake.</p>
                    </div>
                  </div>

                  <div className="pt-2 text-center font-bold text-slate-800 border-t">
                    Shukriya! 😊
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center leading-relaxed px-4 opacity-70">
                Your personal data will be used to process your order and support your experience throughout this website.
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}