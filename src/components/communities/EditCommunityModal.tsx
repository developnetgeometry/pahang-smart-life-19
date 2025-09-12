import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Community {
  id: string;
  name: string;
  community_type: string;
  total_units?: number;
  occupied_units?: number;
  status: string;
  established_date?: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Community name is required").max(100, "Name too long"),
  community_type: z.enum(["residential", "commercial", "mixed", "industrial"]),
  total_units: z.number().min(1, "Must have at least 1 unit").optional(),
  occupied_units: z.number().min(0, "Cannot be negative").optional(),
  status: z.enum(["active", "inactive", "under_construction", "planned"]),
  established_date: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: Community | null;
  onUpdate: (id: string, updates: Partial<Community>) => Promise<boolean>;
}

export default function EditCommunityModal({
  isOpen,
  onClose,
  community,
  onUpdate,
}: EditCommunityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: community?.name || "",
      community_type: (community?.community_type as FormData["community_type"]) || "residential",
      total_units: community?.total_units || undefined,
      occupied_units: community?.occupied_units || undefined,
      status: (community?.status as FormData["status"]) || "active",
      established_date: community?.established_date ? new Date(community.established_date) : undefined,
    },
  });

  // Reset form when community changes
  useEffect(() => {
    if (community) {
      form.reset({
        name: community.name,
        community_type: (community.community_type as FormData["community_type"]) || "residential",
        total_units: community.total_units || undefined,
        occupied_units: community.occupied_units || undefined,
        status: (community.status as FormData["status"]) || "active",
        established_date: community.established_date ? new Date(community.established_date) : undefined,
      });
    }
  }, [community, form]);

  const onSubmit = async (values: FormData) => {
    if (!community) return;

    // Validate occupied units <= total units
    if (values.occupied_units && values.total_units && values.occupied_units > values.total_units) {
      form.setError("occupied_units", {
        type: "manual",
        message: "Occupied units cannot exceed total units",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updates = {
        ...values,
        established_date: values.established_date?.toISOString(),
      };

      const success = await onUpdate(community.id, updates);
      if (success) {
        toast.success("Community updated successfully");
        onClose();
      }
    } catch (error) {
      toast.error("Failed to update community");
    } finally {
      setIsSubmitting(false);
    }
  };

  const communityTypeLabels = {
    residential: "Residential",
    commercial: "Commercial", 
    mixed: "Mixed Use",
    industrial: "Industrial"
  };

  const statusLabels = {
    active: "Active",
    inactive: "Inactive",
    under_construction: "Under Construction", 
    planned: "Planned"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Community</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter community name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="community_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(communityTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Units</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupied_units"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupied Units</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="established_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Established Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Community"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}