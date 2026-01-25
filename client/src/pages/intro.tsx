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
  const [animationsReady, setAnimationsReady] = useState(false);
  
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
    const timer = setTimeout(() => {
      setAnimationsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!animationsReady || !particlesRef.current) return;
    
    const particleCount = 12;
    const particles: { el: HTMLDivElement; x: number; y: number; vx: number; vy: number }[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement("div");
      const size = Math.random() * 3 + 2;
      el.className = "absolute rounded-full bg-primary pointer-events-none";
      el.style.cssText = `width:${size}px;height:${size}px;opacity:${Math.random() * 0.2 + 0.1};will-change:transform`;
      el.dataset.testid = `particle-${i}`;
      particlesRef.current.appendChild(el);
      
      particles.push({
        el,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      });
    }

    let lastTime = 0;
    const animateParticles = (time: number) => {
      if (time - lastTime < 33) {
        rafRef.current = requestAnimationFrame(animateParticles);
        return;
      }
      lastTime = time;

      particles.forEach(p => {
        const attractX = (mousePosRef.current.x - p.x) * 0.0008;
        const attractY = (mousePosRef.current.y - p.y) * 0.0008;
        
        p.x += p.vx + attractX;
        p.y += p.vy + attractY;
        
        if (p.x < 0) p.x = 100;
        if (p.x > 100) p.x = 0;
        if (p.y < 0) p.y = 100;
        if (p.y > 100) p.y = 0;
        
        p.el.style.transform = `translate3d(${p.x}vw, ${p.y}vh, 0)`;
      });
      
      rafRef.current = requestAnimationFrame(animateParticles);
    };
    
    rafRef.current = requestAnimationFrame(animateParticles);
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      particles.forEach(p => p.el.remove());
    };
  }, [animationsReady]);

  useEffect(() => {
    if (!animationsReady) return;

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
        radial-gradient(ellipse 80% 50% at ${30 + x * 0.1}% ${20 + y * 0.1}%, hsl(160 84% 39% / 0.25) 0%, transparent 50%),
        radial-gradient(ellipse 60% 40% at ${70 - x * 0.05}% ${60 - y * 0.05}%, hsl(173 80% 40% / 0.15) 0%, transparent 50%)
      `;
    };

    const updateParallax = () => {
      const scrollY = scrollYRef.current;
      parallaxLayersRef.current.forEach((layer, i) => {
        if (layer) {
          const depth = [0.2, 0.3, 0.15, 0.25, 0.35, 0.2][i] || 0.2;
          layer.style.transform = `translate3d(0, ${scrollY * depth * -0.2}px, 0)`;
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [animationsReady]);

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
      {animationsReady && (
        <>
          <div 
            ref={gradientRef}
            className="fixed inset-0 pointer-events-none overflow-hidden opacity-30"
            style={{ willChange: 'background' }}
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
                  willChange: 'transform',
                }}
                data-testid={`floating-icon-${index}`}
              >
                <Icon className="h-10 w-10 md:h-12 md:w-12" />
              </div>
            ))}
          </div>

          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
          </div>
        </>
      )}

      <div className="relative z-10">
        <header className="flex justify-between items-center gap-4 p-4 max-w-4xl glass-header rounded-2xl mt-4 mx-4 sm:mx-auto">
          <div className="flex items-center gap-2" data-testid="logo-header">
            <img src={kiraLogo} alt="KIRA" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg tracking-tight">KIRA</span>
          </div>
          <div className="flex items-center gap-2">
            {isInstallable && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleInstallClick}
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
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Shield className="h-4 w-4" />
              Privacy-First Finance
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Track Your Net Worth
              <br />
              <span className="text-primary bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Without Compromising Privacy</span>
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

            <div className="flex flex-col items-center gap-1 mt-3">
              <p className="text-xs text-muted-foreground">
                Supports JSON and CSV files
              </p>
              <button
                onClick={() => {
                  const template = storage.getCSVTemplate();
                  const blob = new Blob([template], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "kira_import_template.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-xs text-primary hover:underline"
                data-testid="link-download-template"
              >
                Download CSV template
              </button>
            </div>
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
