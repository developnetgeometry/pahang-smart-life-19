import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  Trash2, 
  Archive,
  RefreshCw,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import CommunityDataImpactAnalyzer from "./CommunityDataImpactAnalyzer";
import CommunityReassignmentSelector from "./CommunityReassignmentSelector";

interface Community {
  id: string;
  name: string;
  community_type: string;
  total_units?: number;
  occupied_units?: number;
  status: string;
}

type DeletionStrategy = "soft_delete" | "reassign_data" | "hard_delete";

interface DeleteCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: Community | null;
  districtId: string;
  onDelete: (id: string, strategy: DeletionStrategy, targetCommunityId?: string) => Promise<boolean>;
}

const DELETION_STEPS = [
  { id: 1, title: "Confirm Deletion", description: "Review community details" },
  { id: 2, title: "Impact Analysis", description: "Analyze affected data" },
  { id: 3, title: "Deletion Strategy", description: "Choose how to handle data" },
  { id: 4, title: "Final Confirmation", description: "Confirm your decision" },
];

export default function DeleteCommunityModal({
  isOpen,
  onClose,
  community,
  districtId,
  onDelete,
}: DeleteCommunityModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [deletionStrategy, setDeletionStrategy] = useState<DeletionStrategy>("soft_delete");
  const [targetCommunityId, setTargetCommunityId] = useState<string | null>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const resetModal = () => {
    setCurrentStep(1);
    setDeletionStrategy("soft_delete");
    setTargetCommunityId(null);
    setConfirmationText("");
    setIsDeleting(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const nextStep = () => {
    if (currentStep < DELETION_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return deletionStrategy !== "reassign_data" || targetCommunityId;
      case 4:
        return confirmationText === community?.name;
      default:
        return false;
    }
  };

  const handleConfirmDeletion = async () => {
    if (!community) return;

    setIsDeleting(true);
    try {
      const success = await onDelete(
        community.id,
        deletionStrategy,
        deletionStrategy === "reassign_data" ? targetCommunityId || undefined : undefined
      );

      if (success) {
        toast.success(`Community ${deletionStrategy === "soft_delete" ? "archived" : "deleted"} successfully`);
        handleClose();
      }
    } catch (error) {
      toast.error("Failed to delete community");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStrategyIcon = (strategy: DeletionStrategy) => {
    switch (strategy) {
      case "soft_delete":
        return Archive;
      case "reassign_data":
        return RefreshCw;
      case "hard_delete":
        return Trash2;
    }
  };

  const getStrategyColor = (strategy: DeletionStrategy) => {
    switch (strategy) {
      case "soft_delete":
        return "text-blue-600";
      case "reassign_data":
        return "text-yellow-600";
      case "hard_delete":
        return "text-red-600";
    }
  };

  if (!community) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span>Delete Community</span>
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Step {currentStep} of {DELETION_STEPS.length}</span>
            <span>{Math.round((currentStep / DELETION_STEPS.length) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / DELETION_STEPS.length) * 100} className="h-2" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            {DELETION_STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={`flex flex-col items-center space-y-1 ${
                  step.id <= currentStep ? 'text-primary' : ''
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  step.id < currentStep 
                    ? 'bg-primary border-primary' 
                    : step.id === currentStep 
                    ? 'border-primary bg-primary/10' 
                    : 'border-muted-foreground'
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircle className="h-3 w-3 text-primary-foreground" />
                  ) : (
                    <span className={step.id === currentStep ? 'text-primary font-medium' : ''}>
                      {step.id}
                    </span>
                  )}
                </div>
                <div className="text-center max-w-20">
                  <div className="font-medium">{step.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {/* Step 1: Basic Confirmation */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Community Details</CardTitle>
                  <CardDescription>
                    Please review the community you are about to delete
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Name:</span>
                      <p className="font-medium">{community.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Type:</span>
                      <div className="mt-1">
                        <Badge variant="secondary">{community.community_type}</Badge>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Total Units:</span>
                      <p className="font-medium">{community.total_units || 0}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Occupied Units:</span>
                      <p className="font-medium">{community.occupied_units || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Warning: This action requires careful consideration
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Deleting a community will affect residents, facilities, bookings, and other related data. 
                      The next steps will help you understand the impact and choose the appropriate action.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Impact Analysis */}
          {currentStep === 2 && (
            <CommunityDataImpactAnalyzer
              communityId={community.id}
              communityName={community.name}
            />
          )}

          {/* Step 3: Deletion Strategy */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Deletion Strategy</CardTitle>
                  <CardDescription>
                    Select how you want to handle the affected data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deletionStrategy}
                    onValueChange={(value) => setDeletionStrategy(value as DeletionStrategy)}
                    className="space-y-4"
                  >
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="soft_delete" id="soft_delete" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="soft_delete" className="flex items-center space-x-2 cursor-pointer">
                          <Archive className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Archive Community (Recommended)</span>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Mark the community as inactive instead of deleting it. All data is preserved and can be restored later.
                          Residents will lose access but data remains intact.
                        </p>
                        <Badge variant="secondary" className="mt-2">Safest Option</Badge>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="reassign_data" id="reassign_data" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="reassign_data" className="flex items-center space-x-2 cursor-pointer">
                          <RefreshCw className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">Transfer Data to Another Community</span>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Move all residents, bookings, and other data to another active community in this district.
                          The community record will then be deleted.
                        </p>
                        <Badge variant="secondary" className="mt-2">Data Preserved</Badge>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border rounded-lg border-red-200 bg-red-50">
                      <RadioGroupItem value="hard_delete" id="hard_delete" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="hard_delete" className="flex items-center space-x-2 cursor-pointer">
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span className="font-medium">Permanent Deletion</span>
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Permanently delete the community and ALL associated data. This action cannot be undone.
                          Use only if you are certain no data needs to be preserved.
                        </p>
                        <Badge variant="destructive" className="mt-2">Irreversible</Badge>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {deletionStrategy === "reassign_data" && (
                <CommunityReassignmentSelector
                  currentCommunityId={community.id}
                  currentCommunityName={community.name}
                  districtId={districtId}
                  onSelectionChange={setTargetCommunityId}
                  selectedCommunityId={targetCommunityId}
                />
              )}
            </div>
          )}

          {/* Step 4: Final Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span>Final Confirmation</span>
                  </CardTitle>
                  <CardDescription>
                    This is your last chance to review before the action is executed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Summary of Action:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Community:</span>
                        <span>{community.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Strategy:</span>
                        <div className="flex items-center space-x-1">
                          {(() => {
                            const Icon = getStrategyIcon(deletionStrategy);
                            return <Icon className={`h-4 w-4 ${getStrategyColor(deletionStrategy)}`} />;
                          })()}
                          <span className="capitalize">
                            {deletionStrategy.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      {deletionStrategy === "reassign_data" && targetCommunityId && (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Target Community:</span>
                          <span>Selected community will receive all data</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmation">
                      Type "{community.name}" to confirm:
                    </Label>
                    <Input
                      id="confirmation"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder={`Enter: ${community.name}`}
                      className={confirmationText === community.name ? "border-green-500" : ""}
                    />
                  </div>

                  {deletionStrategy === "hard_delete" && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Final Warning: Permanent Data Loss
                          </p>
                          <p className="text-sm text-red-700 mt-1">
                            You have chosen to permanently delete all data. This action is irreversible and 
                            will result in complete data loss. All residents, bookings, complaints, and 
                            associated records will be permanently removed from the system.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isDeleting}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            
            {currentStep < DELETION_STEPS.length ? (
              <Button
                onClick={nextStep}
                disabled={!canProceedToNext() || isDeleting}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleConfirmDeletion}
                disabled={!canProceedToNext() || isDeleting}
                variant="destructive"
              >
                {isDeleting ? "Processing..." : `Confirm ${deletionStrategy === "soft_delete" ? "Archive" : "Deletion"}`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}