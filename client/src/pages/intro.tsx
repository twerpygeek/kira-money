import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link, useLocation } from "wouter";
import {
  Shield,
  Smartphone,
  Lock,
  Eye,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Download,
  Upload,
  TrendingUp,
  PieChart,
  Wallet,
  BarChart3,
} from "lucide-react";
import { storage } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";
import kiraLogo from "@assets/image_1769091105203.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export default function Intro() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const initialParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.3 + 0.1,
    }));
    setParticles(initialParticles);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleMouseMove, handleScroll]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => {
        const attractionX = (mousePos.x - p.x) * 0.002;
        const attractionY = (mousePos.y - p.y) * 0.002;
        
        let newX = p.x + p.speedX + attractionX;
        let newY = p.y + p.speedY + attractionY;
        
        if (newX < 0 || newX > 100) newX = Math.random() * 100;
        if (newY < 0 || newY > 100) newY = Math.random() * 100;
        
        return { ...p, x: newX, y: newY };
      }));
    }, 50);
    return () => clearInterval(interval);
  }, [mousePos]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast({ title: "KIRA installed successfully!" });
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const handleImportFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.csv";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        
        if (file.name.endsWith(".csv")) {
          const result = storage.importCSV(content);
          if (result) {
            toast({ 
              title: "CSV imported successfully!", 
              description: `Added ${result.assets} assets and ${result.liabilities} liabilities` 
            });
            setLocation("/dashboard");
          } else {
            toast({ title: "Failed to import CSV", variant: "destructive" });
          }
        } else {
          if (storage.importData(content)) {
            toast({ title: "Data imported successfully!" });
            setLocation("/dashboard");
          } else {
            toast({ title: "Failed to import data", variant: "destructive" });
          }
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

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

  const floatingIcons = [
    { Icon: TrendingUp, delay: 0, x: 10, y: 15, depth: 0.3 },
    { Icon: PieChart, delay: 1, x: 85, y: 20, depth: 0.5 },
    { Icon: Wallet, delay: 2, x: 5, y: 70, depth: 0.2 },
    { Icon: BarChart3, delay: 1.5, x: 90, y: 65, depth: 0.4 },
    { Icon: Shield, delay: 0.5, x: 15, y: 45, depth: 0.6 },
    { Icon: Lock, delay: 2.5, x: 80, y: 40, depth: 0.3 },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 animate-morph-gradient opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at ${30 + mousePos.x * 0.1}% ${20 + mousePos.y * 0.1}%, hsl(160 84% 39% / 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at ${70 - mousePos.x * 0.05}% ${60 - mousePos.y * 0.05}%, hsl(173 80% 40% / 0.2) 0%, transparent 50%),
              radial-gradient(ellipse 50% 60% at ${50 + mousePos.x * 0.08}% ${80 - mousePos.y * 0.08}%, hsl(200 70% 50% / 0.15) 0%, transparent 50%)
            `,
          }}
          data-testid="morphing-gradient"
        />
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-primary"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              transform: `translate(-50%, -50%)`,
              transition: 'left 0.1s linear, top 0.1s linear',
            }}
            data-testid={`particle-${particle.id}`}
          />
        ))}
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingIcons.map(({ Icon, delay, x, y, depth }, index) => (
          <div
            key={index}
            className="absolute text-primary/10 animate-float"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: `${delay}s`,
              transform: `translateY(${scrollY * depth * -0.5}px)`,
            }}
            data-testid={`floating-icon-${index}`}
          >
            <Icon className="h-12 w-12 md:h-16 md:w-16" />
          </div>
        ))}
      </div>

      <div 
        className="fixed inset-0 pointer-events-none"
        style={{ transform: `translateY(${scrollY * 0.1}px)` }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10">
        <header className="flex justify-between items-center gap-4 p-4 max-w-4xl mx-auto glass-card rounded-2xl mt-4 mx-4 sm:mx-auto">
          <div className="flex items-center gap-2" data-testid="logo-header">
            <img src={kiraLogo} alt="KIRA" className="w-8 h-8 rounded-lg animate-fade-in" />
            <span className="font-bold text-lg tracking-tight">KIRA</span>
          </div>
          <div className="flex items-center gap-2">
            {isInstallable && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleInstallClick}
                className="animate-fade-in"
                data-testid="button-install-header"
              >
                <Download className="h-4 w-4 mr-1" />
                Install
              </Button>
            )}
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
          <section 
            className="max-w-4xl mx-auto text-center py-12 md:py-20"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6 animate-fade-in-up backdrop-blur-sm">
              <Shield className="h-4 w-4" />
              Privacy-First Finance
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Track Your Net Worth
              <br />
              <span className="text-primary bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Without Compromising Privacy</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              KIRA is a simple, beautiful net worth tracker that keeps your financial data 
              completely private. No accounts, no cloud sync, no data collection. 
              Everything stays on your device.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <Link href="/dashboard">
                <Button size="lg" className="gradient-primary w-full sm:w-auto" data-testid="button-get-started">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto backdrop-blur-sm"
                onClick={handleImportFile}
                data-testid="button-import-data"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Existing Data
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-3 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              Supports JSON and CSV files from other apps
            </p>
          </section>

          <section 
            className="max-w-4xl mx-auto py-12"
            style={{ transform: `translateY(${scrollY * -0.05}px)` }}
          >
            <h2 className="text-2xl font-bold text-center mb-8 tracking-tight">Why Choose KIRA?</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="rounded-2xl border-border/50 glass-card" 
                  data-testid={`card-feature-${index}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
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
            <Card className="rounded-2xl border-border/50 glass-card">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-4 tracking-tight">How It Works</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 animate-fade-in-left" style={{ animationDelay: "0.1s" }}>
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Add your assets and liabilities</p>
                      <p className="text-sm text-muted-foreground">Cash, investments, property, loans - track everything in one place</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 animate-fade-in-left" style={{ animationDelay: "0.2s" }}>
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">See your complete financial picture</p>
                      <p className="text-sm text-muted-foreground">Beautiful charts show your net worth, allocation, and progress</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 animate-fade-in-left" style={{ animationDelay: "0.3s" }}>
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
            <Card className="rounded-2xl border-primary/30 glass-card-accent overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <CardContent className="p-6 md:p-8 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/20 backdrop-blur-sm">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">Install KIRA on Your Device</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Add KIRA to your home screen for quick access - it works just like a native app!
                </p>
                
                {isInstallable ? (
                  <Button 
                    className="gradient-primary mb-4 w-full sm:w-auto" 
                    onClick={handleInstallClick}
                    data-testid="button-install-main"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Install KIRA Now
                  </Button>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl glass-panel" data-testid="install-quick-ios">
                      <p className="font-medium text-sm mb-1">iPhone / iPad</p>
                      <p className="text-xs text-muted-foreground">Tap Share, then "Add to Home Screen"</p>
                    </div>
                    <div className="p-3 rounded-xl glass-panel" data-testid="install-quick-android">
                      <p className="font-medium text-sm mb-1">Android</p>
                      <p className="text-xs text-muted-foreground">Tap menu, then "Install app"</p>
                    </div>
                  </div>
                )}
                
                <Link href="/faq">
                  <Button variant="outline" size="sm" className="backdrop-blur-sm" data-testid="link-detailed-instructions">
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

        <footer className="border-t border-border/50 py-6 text-center text-sm text-muted-foreground glass-panel">
          <p>KIRA - Your finances, your privacy, your control</p>
        </footer>
      </div>
    </div>
  );
}
