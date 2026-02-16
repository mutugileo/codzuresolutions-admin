"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { extendTrial, overrideSubscriptionStatus } from "@/actions/subscriptions";
import { MoreHorizontal, CalendarPlus, Shield } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionActionsProps {
  subscriptionId: string;
  currentStatus: string;
  trialEnd: string | null;
}

export function SubscriptionActions({
  subscriptionId,
  currentStatus,
  trialEnd,
}: SubscriptionActionsProps) {
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleExtend() {
    if (!newDate) return;
    setLoading(true);
    const result = await extendTrial(subscriptionId, new Date(newDate).toISOString());
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Trial extended successfully");
      setShowExtendDialog(false);
    }
  }

  async function handleStatusOverride() {
    if (newStatus === currentStatus) return;
    setLoading(true);
    const result = await overrideSubscriptionStatus(subscriptionId, newStatus);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Status changed to ${newStatus}`);
      setShowStatusDialog(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowExtendDialog(true)}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Extend Trial
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowStatusDialog(true)}>
            <Shield className="mr-2 h-4 w-4" />
            Override Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Extend Trial Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Trial</DialogTitle>
            <DialogDescription>
              Set a new trial end date. Current: {trialEnd ? new Date(trialEnd).toLocaleDateString() : "N/A"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExtend} disabled={!newDate || loading}>
              {loading ? "Extending..." : "Extend Trial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Override Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Subscription Status</DialogTitle>
            <DialogDescription>
              Current status: {currentStatus}. This will immediately change the subscription status.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TRIALING">TRIALING</SelectItem>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="PAST_DUE">PAST_DUE</SelectItem>
                <SelectItem value="GRACE_PERIOD">GRACE_PERIOD</SelectItem>
                <SelectItem value="LOCKED">LOCKED</SelectItem>
                <SelectItem value="CANCELED">CANCELED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusOverride}
              disabled={newStatus === currentStatus || loading}
              variant={newStatus === "LOCKED" || newStatus === "CANCELED" ? "destructive" : "default"}
            >
              {loading ? "Updating..." : `Set to ${newStatus}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
