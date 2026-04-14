import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Mail, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';

export default async function ContactPage() {
  const supabase = await createClient();
  
  const { data: settings } = await supabase
    .from('site_settings')
    .select('id, value');

  const getSetting = (id: string, fallback: string) => {
    return settings?.find(s => s.id === id)?.value || fallback;
  };

  const email = getSetting('contact_email', 'jnzbbusiness@gmail.com');
  const whatsapp = getSetting('contact_whatsapp', '03240681318');
  const headerText = getSetting('contact_text_header', 'If you have any questions, concerns, or need assistance, feel free to reach out to us. We’re happy to help.');
  const footerText = getSetting('contact_text_footer', 'Our support team aims to respond as quickly as possible during business hours. Please contact us using the details above, and we’ll get back to you promptly.');

  const whatsappUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8 md:py-24">
        <div className="text-center space-y-4 md:space-y-6 mb-12 md:mb-20">
          <h1 className="text-4xl md:text-7xl font-bold font-headline text-slate-900 tracking-tight leading-tight">
            Contact Us
          </h1>
          <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-4 opacity-80 italic">
            {headerText}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-20">
          {/* Email Card */}
          <Card className="border-none shadow-2xl hover:shadow-primary/5 transition-all bg-white rounded-3xl overflow-hidden group">
            <CardHeader className="bg-primary/5 pb-8 pt-10 md:pb-12 md:pt-16 text-center flex flex-col items-center">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-primary text-white flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg shadow-primary/20">
                <Mail className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-headline">Email Support</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <p className="text-sm md:text-base text-slate-500 font-medium">For inquiries and technical support.</p>
              <a 
                href={`mailto:${email}`}
                className="text-lg md:text-2xl font-bold text-primary hover:underline underline-offset-8 break-all block transition-all"
              >
                {email}
              </a>
            </CardContent>
          </Card>

          {/* WhatsApp Card */}
          <Card className="border-none shadow-2xl hover:shadow-green-500/5 transition-all bg-white rounded-3xl overflow-hidden group">
            <CardHeader className="bg-green-50 pb-8 pt-10 md:pb-12 md:pt-16 text-center flex flex-col items-center">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-[#25D366] text-white flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg shadow-green-500/20">
                <svg viewBox="0 0 24 24" className="h-8 w-8 md:h-10 md:w-10 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-headline">WhatsApp Support</CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <p className="text-sm md:text-base text-slate-500 font-medium">For fast responses and quick assistance.</p>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg md:text-2xl font-bold text-[#25D366] hover:underline underline-offset-8 block transition-all"
              >
                {whatsapp}
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="bg-primary/10 p-4 rounded-2xl hidden md:block shrink-0">
              <Info className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <Info className="h-6 w-6 text-primary md:hidden" />
                 <h3 className="text-xl md:text-2xl font-bold text-slate-900">Support Availability</h3>
              </div>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed opacity-80">
                {footerText}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
