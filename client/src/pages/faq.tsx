import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import {
  ArrowLeft,
  Smartphone,
  Shield,
  Download,
  Upload,
  Trash2,
  Eye,
  Globe,
  Lock,
  HardDrive,
} from "lucide-react";
import kiraLogo from "@assets/image_1769091105203.png";

export default function FAQ() {
  const faqs = [
    {
      question: "Where is my data stored?",
      answer: "Your data is stored entirely on your device using your browser's local storage. It never leaves your device and is not sent to any server. This means your financial information stays completely private.",
      icon: HardDrive,
    },
    {
      question: "Is my data secure?",
      answer: "Yes! Since your data never leaves your device, there's no risk of server breaches or data leaks. Your browser's local storage is isolated to this app and cannot be accessed by other websites. For additional privacy, use the Privacy Mode feature to blur sensitive numbers when in public.",
      icon: Shield,
    },
    {
      question: "What happens if I clear my browser data?",
      answer: "If you clear your browser's cache and local storage, your KIRA data will be deleted. We strongly recommend using the Backup feature regularly to save your data as a JSON file. You can restore from this backup anytime.",
      icon: Trash2,
    },
    {
      question: "How do I backup my data?",
      answer: "Go to Settings (gear icon) and click 'Backup Data'. This downloads a JSON file containing all your assets, liabilities, settings, and history. Keep this file safe - you can use it to restore your data anytime.",
      icon: Download,
    },
    {
      question: "How do I restore my data?",
      answer: "Go to Settings and click 'Restore Data'. Select your backup JSON file, and all your data will be restored instantly. This is also useful for transferring data to a new device.",
      icon: Upload,
    },
    {
      question: "Does KIRA work offline?",
      answer: "Yes! Once you've loaded KIRA, it works completely offline. You can check your net worth, add transactions, and view charts without an internet connection. Install it as an app for the best offline experience.",
      icon: Globe,
    },
    {
      question: "What is Privacy Mode?",
      answer: "Privacy Mode blurs all sensitive financial numbers on screen. Toggle it on when checking your finances in public places to prevent others from seeing your account balances. Tap the eye icon in the header to enable it.",
      icon: Eye,
    },
    {
      question: "Can I sync data between devices?",
      answer: "KIRA intentionally doesn't have cloud sync to protect your privacy. To transfer data between devices, use the Backup feature to export your data, then use Restore on your other device to import it.",
      icon: Lock,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="flex justify-between items-center p-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <img src={kiraLogo} alt="KIRA" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-lg tracking-tight">KIRA</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="link-back">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="px-4 pb-12 max-w-3xl mx-auto">
        <section className="py-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">FAQ & Help</h1>
          <p className="text-muted-foreground">
            Everything you need to know about KIRA
          </p>
        </section>

        <Card className="rounded-2xl border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5 text-primary" />
              Install KIRA as an App
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Install KIRA on your device for quick access and the best experience. Here's how:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <h4 className="font-medium mb-2">iPhone / iPad (Safari)</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Tap the Share button (square with arrow)</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right</li>
                </ol>
              </div>
              
              <div className="p-4 rounded-xl bg-muted/50">
                <h4 className="font-medium mb-2">Android (Chrome)</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Tap the menu button (three dots)</li>
                  <li>Tap "Add to Home screen" or "Install app"</li>
                  <li>Tap "Add" or "Install"</li>
                </ol>
              </div>
              
              <div className="p-4 rounded-xl bg-muted/50">
                <h4 className="font-medium mb-2">Desktop (Chrome/Edge)</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Click the install icon in the address bar (or menu)</li>
                  <li>Click "Install"</li>
                </ol>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Once installed, KIRA will appear like a regular app on your device with its own icon.
            </p>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/50 rounded-xl px-4 data-[state=open]:bg-muted/30"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <faq.icon className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pl-8 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mt-12 text-center">
          <Card className="rounded-2xl border-primary/20 bg-primary/5">
            <CardContent className="py-8">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Your Privacy Matters</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                KIRA was built with privacy as the foundation. We don't collect any data, 
                don't use analytics, and don't track your usage. Your finances are yours alone.
              </p>
              <Link href="/dashboard">
                <Button className="gradient-primary" data-testid="button-start-now">
                  Start Using KIRA
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        <p>KIRA - Your finances, your privacy, your control</p>
      </footer>
    </div>
  );
}
