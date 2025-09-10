import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Plus } from "lucide-react";

interface FacilityManagerComplaintFormProps {
  onComplaintSubmitted?: () => void;
  trigger?: React.ReactNode;
}

export default function FacilityManagerComplaintForm({
  onComplaintSubmitted,
  trigger,
}: FacilityManagerComplaintFormProps) {
  const { language, user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    priority: "high" as "low" | "medium" | "high",
    location: "",
    description: "",
    escalation_reason: "",
  });

  const handleSubmitUrgentIssue = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      // Get user's district_id from their profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("district_id")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      // Create the complaint with special marking for facility manager urgent issues
      const { error } = await supabase.from("complaints").insert({
        title: formData.title,
        description: `${formData.description}\n\n--- URGENT FACILITY ISSUE ---\nReason: ${formData.escalation_reason}`,
        category: formData.category,
        priority: formData.priority,
        location: formData.location,
        complainant_id: user.id,
        district_id: profileData.district_id,
        status: "pending",
        escalation_level: 1, // Start at escalation level 1 since it's urgent
        escalated_at: new Date().toISOString(),
        escalated_by: user.id,
      });

      if (error) throw error;

      toast({
        title:
          language === "en"
            ? "Urgent issue reported successfully"
            : "Isu segera berjaya dilaporkan",
        description:
          language === "en"
            ? "Your urgent facility issue has been escalated to the appropriate department"
            : "Isu kemudahan segera anda telah dinaikkan kepada jabatan yang berkaitan",
      });

      // Reset form
      setFormData({
        title: "",
        category: "",
        priority: "high",
        location: "",
        description: "",
        escalation_reason: "",
      });

      setIsOpen(false);
      onComplaintSubmitted?.();
    } catch (error) {
      console.error("Error submitting urgent issue:", error);
      toast({
        title:
          language === "en" ? "Error submitting issue" : "Ralat menghantar isu",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="destructive">
            <AlertTriangle className="w-4 h-4 mr-2" />
            {language === "en" ? "Report Urgent Issue" : "Laporkan Isu Segera"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {language === "en"
              ? "Report Urgent Facility Issue"
              : "Laporkan Isu Kemudahan Segera"}
          </DialogTitle>
          <DialogDescription>
            {language === "en"
              ? "Use this form to report urgent facility problems that you cannot handle yourself or that require escalation to other departments"
              : "Gunakan borang ini untuk melaporkan masalah kemudahan segera yang tidak dapat anda tangani sendiri atau yang memerlukan naikkan kepada jabatan lain"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              {language === "en" ? "Issue Title" : "Tajuk Isu"}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder={
                language === "en"
                  ? "Brief description of the urgent issue"
                  : "Penerangan ringkas isu segera"
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {language === "en"
                  ? "Escalate To Department"
                  : "Naikkan Kepada Jabatan"}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      language === "en" ? "Select department" : "Pilih jabatan"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="security">
                    <div className="flex flex-col">
                      <span>
                        {language === "en" ? "Security" : "Keselamatan"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {language === "en"
                          ? "Safety hazards, security breaches"
                          : "Bahaya keselamatan, pelanggaran keselamatan"}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="maintenance">
                    <div className="flex flex-col">
                      <span>
                        {language === "en" ? "Maintenance" : "Penyelenggaraan"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {language === "en"
                          ? "Critical equipment failures"
                          : "Kegagalan peralatan kritikal"}
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="general">
                    <div className="flex flex-col">
                      <span>
                        {language === "en"
                          ? "Community Admin"
                          : "Pentadbir Komuniti"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {language === "en"
                          ? "Policy decisions, resident disputes"
                          : "Keputusan polisi, pertikaian penduduk"}
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {language === "en" ? "Priority Level" : "Tahap Keutamaan"}
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medium">
                    {language === "en" ? "Medium" : "Sederhana"}
                  </SelectItem>
                  <SelectItem value="high">
                    {language === "en" ? "High" : "Tinggi"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              {language === "en" ? "Location" : "Lokasi"}
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder={
                language === "en"
                  ? "Specific location of the issue"
                  : "Lokasi khusus isu"
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="escalation_reason">
              {language === "en"
                ? "Why can't you handle this yourself?"
                : "Mengapa anda tidak dapat mengendalikan ini sendiri?"}
            </Label>
            <Textarea
              id="escalation_reason"
              value={formData.escalation_reason}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  escalation_reason: e.target.value,
                }))
              }
              placeholder={
                language === "en"
                  ? "Explain why this issue requires escalation (e.g., outside your authority, requires specialized skills, emergency situation)"
                  : "Terangkan mengapa isu ini memerlukan naikkan (cth: di luar kuasa anda, memerlukan kemahiran khusus, situasi kecemasan)"
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {language === "en"
                ? "Detailed Description"
                : "Penerangan Terperinci"}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={
                language === "en"
                  ? "Provide comprehensive details about the issue, what you've already tried, and why it's urgent..."
                  : "Berikan butiran menyeluruh tentang isu, apa yang telah anda cuba, dan mengapa ia segera..."
              }
              rows={4}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">
                  {language === "en"
                    ? "Note for Facility Managers"
                    : "Nota untuk Pengurus Kemudahan"}
                </p>
                <p className="text-amber-700">
                  {language === "en"
                    ? "This form is for urgent issues that require immediate attention from other departments. For routine work orders, use the Work Order system instead."
                    : "Borang ini adalah untuk isu segera yang memerlukan perhatian segera dari jabatan lain. Untuk arahan kerja rutin, gunakan sistem Arahan Kerja sebaliknya."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={submitting}
            >
              {language === "en" ? "Cancel" : "Batal"}
            </Button>
            <Button
              onClick={handleSubmitUrgentIssue}
              disabled={
                submitting ||
                !formData.title ||
                !formData.category ||
                !formData.location ||
                !formData.description ||
                !formData.escalation_reason
              }
              variant="destructive"
            >
              {language === "en"
                ? "Report Urgent Issue"
                : "Laporkan Isu Segera"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
