import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Shield, Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PendingApproval() {
  const { language, switchLanguage, logout } = useAuth();
  const { t } = useTranslation(language || "ms");

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden relative flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('/lovable-uploads/7687f368-63da-4bc0-a610-d88851aebf13.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
      
      {/* Language switcher */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          variant={language === "en" ? "default" : "outline"}
          size="sm"
          onClick={() => switchLanguage("en")}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          EN
        </Button>
        <Button
          variant={language === "ms" ? "default" : "outline"}
          size="sm"
          onClick={() => switchLanguage("ms")}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          BM
        </Button>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <Card className="shadow-elegant border-white/20 bg-card/95 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {language === "en" 
                ? "Account Pending Approval"
                : "Akaun Menunggu Kelulusan"
              }
            </CardTitle>
            <CardDescription className="text-lg">
              {language === "en"
                ? "Your registration has been submitted successfully"
                : "Pendaftaran anda telah dihantar dengan jayanya"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-base">
                {language === "en"
                  ? "Your account is currently under review by the community administrator. You will receive notification once your account has been approved and you can begin using the platform."
                  : "Akaun anda sedang dikaji semula oleh pentadbir komuniti. Anda akan menerima notifikasi sebaik sahaja akaun anda diluluskan dan anda boleh mula menggunakan platform."
                }
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                {language === "en" ? "What happens next?" : "Apa yang berlaku seterusnya?"}
              </h3>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">1</span>
                  </div>
                  <p>
                    {language === "en"
                      ? "Your application will be reviewed by the community administrator within 24-48 hours"
                      : "Permohonan anda akan dikaji semula oleh pentadbir komuniti dalam masa 24-48 jam"
                    }
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">2</span>
                  </div>
                  <p>
                    {language === "en"
                      ? "You will receive an email notification when your account status changes"
                      : "Anda akan menerima notifikasi e-mel apabila status akaun anda berubah"
                    }
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">3</span>
                  </div>
                  <p>
                    {language === "en"
                      ? "Once approved, you can sign in and access all platform features"
                      : "Setelah diluluskan, anda boleh log masuk dan mengakses semua ciri platform"
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                {language === "en"
                  ? "Need help or have questions about your application?"
                  : "Perlukan bantuan atau ada soalan tentang permohonan anda?"
                }
              </p>
              
              <div className="flex flex-col gap-3">
                <Button variant="default" className="w-full" asChild>
                  <Link to="/my-applications">
                    {language === "en" ? "View My Applications" : "Lihat Permohonan Saya"}
                  </Link>
                </Button>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleLogout}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {language === "en" ? "Back to Login" : "Kembali ke Log Masuk"}
                  </Button>
                  
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/login">
                      {language === "en" ? "Contact Administrator" : "Hubungi Pentadbir"}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}