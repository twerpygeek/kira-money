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

export default function Intro() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const parallaxLayersRef = useRef<HTMLDivElement[]>([]);
  const mousePosRef = useRef({ x: 50, y: 50 });
  const scrollYRef = useRef(0);
  const rafRef = useRef<number>();

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
    if (!particlesRef.current) return;
    
    const particleCount = 20;
    const particles: { el: HTMLDivElement; x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement("div");
      const size = Math.random() * 4 + 2;
      el.className = "absolute rounded-full bg-primary pointer-events-none";
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.opacity = `${Math.random() * 0.3 + 0.1}`;
      el.dataset.testid = `particle-${i}`;
      particlesRef.current.appendChild(el);
      
      particles.push({
        el,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    const animateParticles = () => {
      particles.forEach(p => {
        const attractX = (mousePosRef.current.x - p.x) * 0.001;
        const attractY = (mousePosRef.current.y - p.y) * 0.001;
        
        p.x += p.vx + attractX;
        p.y += p.vy + attractY;
        
        if (p.x < 0) p.x = 100;
        if (p.x > 100) p.x = 0;
        if (p.y < 0) p.y = 100;
        if (p.y > 100) p.y = 0;
        
        p.el.style.left = `${p.x}%`;
        p.el.style.top = `${p.y}%`;
        p.el.style.transform = `translate(-50%, -50%)`;
      });
      
      rafRef.current = requestAnimationFrame(animateParticles);
    };
    
    rafRef.current = requestAnimationFrame(animateParticles);
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      particles.forEach(p => p.el.remove());
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      };
      
      if (!ticking) {
        requestAnimationFrame(() => {
          updateGradient();
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
      
      if (!ticking) {
        requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    };

    const updateGradient = () => {
      if (!gradientRef.current) return;
      const { x, y } = mousePosRef.current;
      gradientRef.current.style.background = `
        radial-gradient(ellipse 80% 50% at ${30 + x * 0.1}% ${20 + y * 0.1}%, hsl(160 84% 39% / 0.3) 0%, transparent 50%),
        radial-gradient(ellipse 60% 40% at ${70 - x * 0.05}% ${60 - y * 0.05}%, hsl(173 80% 40% / 0.2) 0%, transparent 50%),
        radial-gradient(ellipse 50% 60% at ${50 + x * 0.08}% ${80 - y * 0.08}%, hsl(200 70% 50% / 0.15) 0%, transparent 50%)
      `;
    };

    const updateParallax = () => {
      const scrollY = scrollYRef.current;
      parallaxLayersRef.current.forEach((layer, i) => {
        if (layer) {
          const depth = [0.3, 0.5, 0.2, 0.4, 0.6, 0.3][i] || 0.3;
          layer.style.transform = `translateY(${scrollY * depth * -0.3}px)`;
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
    { Icon: TrendingUp, delay: 0, x: 10, y: 15 },
    { Icon: PieChart, delay: 1, x: 85, y: 20 },
    { Icon: Wallet, delay: 2, x: 5, y: 70 },
    { Icon: BarChart3, delay: 1.5, x: 90, y: 65 },
    { Icon: Shield, delay: 0.5, x: 15, y: 45 },
    { Icon: Lock, delay: 2.5, x: 80, y: 40 },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-hidden relative">
      <div 
        ref={gradientRef}
        className="fixed inset-0 pointer-events-none overflow-hidden animate-morph-gradient opacity-30"
        data-testid="morphing-gradient"
      />

      <div 
        ref={particlesRef}
        className="fixed inset-0 pointer-events-none overflow-hidden"
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingIcons.map(({ Icon, delay, x, y }, index) => (
          <div
            key={index}
            ref={el => { if (el) parallaxLayersRef.current[index] = el; }}
            className="absolute text-primary/10 animate-float"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: `${delay}s`,
            }}
            data-testid={`floating-icon-${index}`}
          >
            <Icon className="h-12 w-12 md:h-16 md:w-16" />
          </div>
        ))}
      </div>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10">
        <header className="flex justify-between items-center gap-4 p-4 max-w-4xl glass-header rounded-2xl mt-4 mx-4 sm:mx-auto">
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
          <section className="max-w-4xl mx-auto text-center py-12 md:py-20">
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

          <section className="max-w-4xl mx-auto py-12">
            <h2 className="text-2xl font-bold text-center mb-8 tracking-tight">Why Choose KIRA?</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="rounded-2xl glass-card" 
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
            <Card className="rounded-2xl glass-card">
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
            <Card className="rounded-2xl glass-card-accent overflow-hidden relative">
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
