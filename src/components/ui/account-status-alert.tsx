import {
  AlertTriangle,
  Ban,
  Clock,
  XCircle,
  CheckCircle,
  UserX,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface AccountStatusAlertProps {
  status: "inactive" | "pending" | "rejected" | "suspended" | "not_approved";
  language: "en" | "ms";
  onRetry?: () => void;
  onContactAdmin?: () => void;
}

export function AccountStatusAlert({
  status,
  language,
  onRetry,
  onContactAdmin,
}: AccountStatusAlertProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "inactive":
        return {
          icon: UserX,
          variant: "destructive" as const,
          title:
            language === "en" ? "Account Deactivated" : "Akaun Dinyahaktifkan",
          description:
            language === "en"
              ? "Your account has been deactivated. Please contact your administrator for assistance."
              : "Akaun anda telah dinyahaktifkan. Sila hubungi pentadbir anda untuk bantuan.",
          iconColor: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-950/20",
          borderColor: "border-red-200 dark:border-red-800",
        };

      case "pending":
        return {
          icon: Clock,
          variant: "default" as const,
          title:
            language === "en"
              ? "Account Pending Approval"
              : "Akaun Menunggu Kelulusan",
          description:
            language === "en"
              ? "Your account is still pending approval. Please wait for admin approval before signing in."
              : "Akaun anda masih menunggu kelulusan. Sila tunggu kelulusan pentadbir sebelum log masuk.",
          iconColor: "text-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-950/20",
          borderColor: "border-amber-200 dark:border-amber-800",
        };

      case "rejected":
        return {
          icon: XCircle,
          variant: "destructive" as const,
          title: language === "en" ? "Account Rejected" : "Akaun Ditolak",
          description:
            language === "en"
              ? "Your account application has been rejected. Please contact your administrator for more information."
              : "Permohonan akaun anda telah ditolak. Sila hubungi pentadbir anda untuk maklumat lanjut.",
          iconColor: "text-red-500",
          bgColor: "bg-red-50 dark:bg-red-950/20",
          borderColor: "border-red-200 dark:border-red-800",
        };

      case "suspended":
        return {
          icon: Ban,
          variant: "destructive" as const,
          title: language === "en" ? "Account Suspended" : "Akaun Digantung",
          description:
            language === "en"
              ? "Your account has been suspended. Please contact your administrator to resolve this issue."
              : "Akaun anda telah digantung. Sila hubungi pentadbir anda untuk menyelesaikan masalah ini.",
          iconColor: "text-orange-500",
          bgColor: "bg-orange-50 dark:bg-orange-950/20",
          borderColor: "border-orange-200 dark:border-orange-800",
        };

      case "not_approved":
      default:
        return {
          icon: AlertTriangle,
          variant: "default" as const,
          title:
            language === "en"
              ? "Account Not Approved"
              : "Akaun Belum Diluluskan",
          description:
            language === "en"
              ? "Your account has not been approved yet. Please contact your administrator."
              : "Akaun anda belum diluluskan lagi. Sila hubungi pentadbir anda.",
          iconColor: "text-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-950/20",
          borderColor: "border-amber-200 dark:border-amber-800",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="animate-in slide-in-from-top-4 duration-500">
      <Alert
        variant={config.variant}
        className={`${config.bgColor} ${config.borderColor} relative overflow-hidden`}
      >
        <div className="absolute inset-0 shimmer"></div>
        <div className="relative z-10">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur`}
            >
              <Icon className={`h-5 w-5 ${config.iconColor} animate-pulse`} />
            </div>
            <div className="flex-1 space-y-2">
              <AlertTitle className="text-base font-semibold">
                {config.title}
              </AlertTitle>
              <AlertDescription className="text-sm leading-relaxed">
                {config.description}
              </AlertDescription>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {onContactAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onContactAdmin}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    {language === "en"
                      ? "Contact Administrator"
                      : "Hubungi Pentadbir"}
                  </Button>
                )}
                {onRetry && status !== "rejected" && status !== "suspended" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onRetry}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    {language === "en" ? "Try Again" : "Cuba Lagi"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Alert>
    </div>
  );
}
