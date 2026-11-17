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
import { extendTrial, overrideSubscriptionPlan, overrideSubscriptionStatus } from "@/actions/subscriptions";
import { SUBSCRIPTION_PLANS } from "@/lib/constants";
import { formatKES } from "@/lib/formatters";
import type { SubscriptionPlanType } from "@/types/database";
import { MoreHorizontal, CalendarPlus, Shield, Layers } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionActionsProps {
  subscriptionId: string;
  currentStatus: string;
  currentPlan: SubscriptionPlanType;
  trialEnd: string | null;
}

export function SubscriptionActions({
  subscriptionId,
  currentStatus,
  currentPlan,
  trialEnd,
}: SubscriptionActionsProps) {
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [newPlan, setNewPlan] = useState<SubscriptionPlanType>(currentPlan);
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

  async function handlePlanOverride() {
    if (newPlan === currentPlan) return;
    setLoading(true);
    const result = await overrideSubscriptionPlan(subscriptionId, newPlan);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Plan changed to ${SUBSCRIPTION_PLANS[newPlan].name}`);
      setShowPlanDialog(false);
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
          <DropdownMenuItem onClick={() => setShowPlanDialog(true)}>
            <Layers className="mr-2 h-4 w-4" />
            Change Plan
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

      {/* Change Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Current plan: {SUBSCRIPTION_PLANS[currentPlan]?.name || currentPlan}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newPlan} onValueChange={(v) => setNewPlan(v as SubscriptionPlanType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlanType[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {SUBSCRIPTION_PLANS[key].name} ({formatKES(SUBSCRIPTION_PLANS[key].price)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePlanOverride}
              disabled={newPlan === currentPlan || loading}
            >
              {loading ? "Updating..." : "Save Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
