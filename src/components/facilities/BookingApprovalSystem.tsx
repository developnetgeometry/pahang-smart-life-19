import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface BookingRequest {
  id: string;
  facility_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  notes: string;
  total_amount: number;
  status: string;
  created_at: string;
  facilities: {
    name: string;
    location?: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
  booking_approvals: Array<{
    id: string;
    approval_status: string;
    approval_notes: string;
    approved_at: string;
  }>;
}

export function BookingApprovalSystem() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(
    null
  );
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          facilities!facility_id(name, location),
          booking_approvals(id, approval_status, approval_notes, approved_at)
        `
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user profiles separately to avoid the relationship ambiguity
      const bookingsWithProfiles = await Promise.all(
        (data || []).map(async (booking) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", booking.user_id)
            .single();

          return {
            ...booking,
            profiles: profile || { full_name: "Unknown User", email: "" },
          };
        })
      );

      setBookings(bookingsWithProfiles);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async () => {
    if (!selectedBooking || !actionType) return;

    try {
      setProcessing(true);

      // Create or update booking approval
      const { data: approval, error: approvalError } = await supabase
        .from("booking_approvals")
        .upsert({
          booking_id: selectedBooking.id,
          approver_id: user?.id,
          approval_status: actionType === "approve" ? "approved" : "rejected",
          approval_notes: notes,
          approved_at:
            actionType === "approve" ? new Date().toISOString() : null,
          rejection_reason: actionType === "reject" ? notes : null,
        });

      if (approvalError) throw approvalError;

      // Update booking status
      const newStatus = actionType === "approve" ? "confirmed" : "cancelled";
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
          approved_by: actionType === "approve" ? user?.id : null,
          approved_at:
            actionType === "approve" ? new Date().toISOString() : null,
        })
        .eq("id", selectedBooking.id);

      if (bookingError) throw bookingError;

      // Send notification to the user
      await supabase.from("notifications").insert({
        recipient_id: selectedBooking.user_id,
        title: `Booking ${actionType === "approve" ? "Approved" : "Rejected"}`,
        message: `Your booking for ${
          selectedBooking.facilities.name
        } on ${new Date(
          selectedBooking.booking_date
        ).toLocaleDateString()} has been ${
          actionType === "approve" ? "approved" : "rejected"
        }.${notes ? ` Note: ${notes}` : ""}`,
        notification_type: "booking",
        category: "booking",
        reference_id: selectedBooking.id,
        reference_table: "bookings",
        created_by: user?.id,
        sent_at: new Date().toISOString(),
      });

      toast.success(
        `Booking ${
          actionType === "approve" ? "approved" : "rejected"
        } successfully`
      );

      // Refresh the list
      fetchPendingBookings();

      // Close dialog
      setSelectedBooking(null);
      setActionType(null);
      setNotes("");
    } catch (error) {
      console.error("Error processing booking:", error);
      toast.error("Failed to process booking request");
    } finally {
      setProcessing(false);
    }
  };

  const openActionDialog = (
    booking: BookingRequest,
    action: "approve" | "reject"
  ) => {
    setSelectedBooking(booking);
    setActionType(action);
    setNotes("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
    }).format(amount);
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Booking Approvals</h2>
        <p className="text-muted-foreground">
          Review and approve facility booking requests
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
            <p className="text-muted-foreground">
              No pending booking requests to review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-l-4 border-l-orange-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {booking.facilities.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {booking.profiles.full_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {booking.start_time} - {booking.end_time}
                        <span className="text-xs text-muted-foreground ml-1">
                          (
                          {calculateDuration(
                            booking.start_time,
                            booking.end_time
                          )}
                          )
                        </span>
                      </div>
                      {booking.facilities.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {booking.facilities.location}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">{booking.status}</Badge>
                    {booking.total_amount && (
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(booking.total_amount)}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {booking.purpose && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Purpose:</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {booking.purpose}
                    </p>
                  </div>
                )}
                {booking.notes && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Notes:</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {booking.notes}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Requested on {new Date(booking.created_at).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openActionDialog(booking, "reject")}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openActionDialog(booking, "approve")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog
        open={!!selectedBooking && !!actionType}
        onOpenChange={() => {
          setSelectedBooking(null);
          setActionType(null);
          setNotes("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Reject"} Booking Request
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Confirm that you want to approve this booking request."
                : "Please provide a reason for rejecting this booking request."}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium">
                  {selectedBooking.facilities.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.profiles.full_name} •{" "}
                  {new Date(selectedBooking.booking_date).toLocaleDateString()}{" "}
                  • {selectedBooking.start_time} - {selectedBooking.end_time}
                </p>
              </div>

              <div>
                <Label htmlFor="notes">
                  {actionType === "approve"
                    ? "Additional Notes (Optional)"
                    : "Rejection Reason"}
                  {actionType === "reject" && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    actionType === "approve"
                      ? "Any special instructions or notes for the user..."
                      : "Please explain why this booking request cannot be approved..."
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedBooking(null);
                setActionType(null);
                setNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookingAction}
              disabled={
                processing || (actionType === "reject" && !notes.trim())
              }
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {processing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              ) : actionType === "approve" ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {actionType === "approve" ? "Approve Booking" : "Reject Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
