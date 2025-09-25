import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "new_issue" | "status_update" | "comment_reply" | "announcement" | "upvote";
  is_read: boolean;
  created_at: string;
  issue_id?: string;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error.message);
        setError("Failed to load notifications.");
      } else {
        setNotifications(data || []);
      }
      setLoading(false);
    };

    fetchNotifications();

    // Set up real-time listener
    const channel = supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotification = payload.new as Notification;
          // Only add if it's for the current user and not already present
          if (newNotification.user_id === supabase.auth.user()?.id &&
              !notifications.some(notif => notif.id === newNotification.id)) {
            setNotifications((prev) => [newNotification, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications' },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, notifications]); // Added notifications to dependency array to ensure `some` works correctly

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking notification as read:", error.message);
    } else {
      setNotifications(prev =>
        prev.map(notif => (notif.id === id ? { ...notif, is_read: true } : notif))
      );
    }
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "status_update":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "comment_reply":
        return <Bell className="w-5 h-5 text-blue-500" />;
      case "upvote":
        return <Bell className="w-5 h-5 text-purple-500" />;
      case "announcement":
        return <Bell className="w-5 h-5 text-yellow-500" />;
      case "new_issue":
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>

        {loading && <p>Loading notifications...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && notifications.length === 0 && (
          <p className="text-muted-foreground">No new notifications.</p>
        )}

        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={
                `flex items-start gap-4 p-4 ${!notification.is_read ? "bg-card border-l-4 border-primary" : "bg-muted"}`
              }
            >
              <div className="flex-shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              <div className="flex-grow space-y-1">
                <CardTitle className="text-lg leading-tight flex justify-between items-center">
                  <span>{notification.title}</span>
                  {!notification.is_read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-primary hover:text-primary-foreground"
                    >
                      Mark as Read
                    </Button>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">
                  {notification.message}
                </CardDescription>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
