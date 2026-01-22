import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import {
  Shield,
  Smartphone,
  Lock,
  Eye,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Download,
} from "lucide-react";
import kiraLogo from "@assets/image_1769091105203.png";

export default function Intro() {
  const features = [
    {
      icon: Lock,
      title: "100% Private",
      description: "Your financial data never leaves your device. No accounts, no servers, no tracking.",
    },
    {
      icon: Smartphone,
      title: "Works Offline",
      description: "Access your net worth anytime, even without internet connection.",
    },
    {
      icon: Eye,
      title: "Privacy Mode",
      description: "Blur sensitive numbers when checking your finances in public.",
    },
    {
      icon: Shield,
      title: "Your Data, Your Control",
      description: "Backup, restore, or delete your data anytime. You're in complete control.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="flex justify-between items-center gap-4 p-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2" data-testid="logo-header">
          <img src={kiraLogo} alt="KIRA" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-lg tracking-tight">KIRA</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/faq">
            <Button variant="ghost" size="sm" data-testid="link-faq">
              <HelpCircle className="h-4 w-4 mr-1" />
              FAQ
            </Button>
          </Link>
        </div>
      </header>

      <main className="px-4 pb-12">
        <section className="max-w-4xl mx-auto text-center py-12 md:py-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Privacy-First Finance
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Track Your Net Worth
            <br />
            <span className="text-primary">Without Compromising Privacy</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            KIRA is a simple, beautiful net worth tracker that keeps your financial data 
            completely private. No accounts, no cloud sync, no data collection. 
            Everything stays on your device.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="gradient-primary w-full sm:w-auto" data-testid="button-get-started">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-learn-more">
                Learn More
              </Button>
            </Link>
          </div>
        </section>

        <section className="max-w-4xl mx-auto py-12">
          <h2 className="text-2xl font-bold text-center mb-8 tracking-tight">Why Choose KIRA?</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="rounded-2xl border-border/50" data-testid={`card-feature-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="max-w-2xl mx-auto py-12">
          <Card className="rounded-2xl border-border/50 bg-card/50">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4 tracking-tight">How It Works</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Add your assets and liabilities</p>
                    <p className="text-sm text-muted-foreground">Cash, investments, property, loans - track everything in one place</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">See your complete financial picture</p>
                    <p className="text-sm text-muted-foreground">Beautiful charts show your net worth, allocation, and progress</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Data stays on your device</p>
                    <p className="text-sm text-muted-foreground">Install as an app, backup when needed, complete privacy</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="max-w-2xl mx-auto py-12">
          <Card className="rounded-2xl border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/20">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Install KIRA on Your Device</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Add KIRA to your home screen for quick access - it works just like a native app!
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-background/50" data-testid="install-quick-ios">
                  <p className="font-medium text-sm mb-1">iPhone / iPad</p>
                  <p className="text-xs text-muted-foreground">Tap Share, then "Add to Home Screen"</p>
                </div>
                <div className="p-3 rounded-xl bg-background/50" data-testid="install-quick-android">
                  <p className="font-medium text-sm mb-1">Android</p>
                  <p className="text-xs text-muted-foreground">Tap menu, then "Install app"</p>
                </div>
              </div>
              <Link href="/faq">
                <Button variant="outline" size="sm" data-testid="link-detailed-instructions">
                  See detailed instructions
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="max-w-2xl mx-auto text-center py-8">
          <p className="text-muted-foreground mb-4">
            Ready to take control of your finances privately?
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gradient-primary" data-testid="button-start-tracking">
              Start Tracking Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground">
        <p>KIRA - Your finances, your privacy, your control</p>
      </footer>
    </div>
  );
}
