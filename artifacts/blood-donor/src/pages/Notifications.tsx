import { useState } from "react";
import { useDonorAuth } from "@/contexts/DonorAuthContext";
import { useListNotifications, useMarkNotificationRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Button } from "@/components/shared/UI";
import { Bell, CheckCircle2, ChevronRight, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { donorId, isRegistered } = useDonorAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [markingAll, setMarkingAll] = useState(false);

  const { data: notifications, isLoading } = useListNotifications(
    { donorId: donorId! },
    { query: { enabled: !!donorId } }
  );

  const { mutate: markRead } = useMarkNotificationRead({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      }
    }
  });

  if (!isRegistered || !donorId) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Please log in to see notifications</h2>
        <div className="flex gap-3 justify-center">
          <Link href="/login"><Button variant="outline">Log In</Button></Link>
          <Link href="/donors/register"><Button>Register as Donor</Button></Link>
        </div>
      </div>
    );
  }

  const unread = notifications?.filter(n => !n.isRead) ?? [];

  const handleMarkAll = async () => {
    if (unread.length === 0) return;
    setMarkingAll(true);
    await Promise.all(unread.map(n => new Promise<void>(resolve => markRead({ id: n.id }, { onSettled: () => resolve() }))));
    setMarkingAll(false);
    queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
    toast({ title: "All caught up!", description: "All notifications marked as read." });
  };

  const handleNotificationClick = (id: number, isRead: boolean) => {
    if (!isRead) markRead({ id });
    setLocation("/requests");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Your Alerts</h1>
            <p className="text-muted-foreground">Urgent matches for your blood type.</p>
          </div>
        </div>
        {unread.length > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAll}
            isLoading={markingAll}
            className="gap-2 shrink-0"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Card key={i} className="h-24 animate-pulse bg-muted" />)}
        </div>
      ) : !notifications?.length ? (
        <Card className="py-16 text-center border-dashed border-2">
          <Bell className="w-12 h-12 mx-auto text-muted mb-4" />
          <h3 className="text-xl font-bold mb-2">You're all caught up!</h3>
          <p className="text-muted-foreground">No urgent requests match your profile right now.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleNotificationClick(notif.id, notif.isRead)}
            >
              <Card className={`p-4 md:p-6 cursor-pointer transition-all duration-200 hover:shadow-md flex items-center gap-4 ${notif.isRead ? 'bg-white opacity-70' : 'bg-red-50 border-primary/30'}`}>
                
                <div className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-full items-center justify-center bg-white shadow-sm border border-border">
                  {notif.isRead ? <CheckCircle2 className="w-6 h-6 text-muted-foreground" /> : <Bell className="w-6 h-6 text-primary animate-pulse" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-base ${notif.isRead ? 'text-muted-foreground' : 'font-semibold text-foreground'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(notif.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
