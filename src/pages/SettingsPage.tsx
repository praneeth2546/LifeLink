import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Shield, User as UserIcon, Palette, Language } from "lucide-react";
import { useState } from "react";
import { getMessagingIfSupported } from "@/integrations/firebase/client";
import { getToken } from "firebase/messaging";

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [language, setLanguage] = useState("en");
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const handleSaveSettings = () => {
    console.log("Saving settings:", { notificationsEnabled, darkModeEnabled, language });
    // TODO: Implement actual settings saving (e.g., to Supabase or local storage)
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkModeEnabled}
                onCheckedChange={setDarkModeEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="language">Language</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred language
                </p>
              </div>
              {/* TODO: Implement a Select component for language selection */}
              <span className="text-muted-foreground">English (US)</span>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for important updates and activities
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications on your device
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notificationsEnabled} // Reusing for now, but should be a separate state
                onCheckedChange={setNotificationsEnabled} // Reusing for now
              />
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  try {
                    const messaging = await getMessagingIfSupported();
                    if (!messaging) {
                      alert('Push not supported in this browser.');
                      return;
                    }
                    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
                    const token = await getToken(messaging, { vapidKey });
                    setFcmToken(token || null);
                    if (token) {
                      alert('FCM token obtained.');
                      console.log('FCM token:', token);
                    } else {
                      alert('Failed to get FCM token.');
                    }
                  } catch (e: any) {
                    console.error('FCM registration failed', e);
                    alert('FCM registration failed');
                  }
                }}
              >
                Register Device for Push (FCM)
              </Button>
              {fcmToken && (
                <div className="text-xs break-all text-muted-foreground">
                  {fcmToken}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Settings (Links to Profile) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <UserIcon className="w-4 h-4 mr-2" />
              Go to Profile
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Security Settings
            </Button>
          </CardContent>
        </Card>

        <Button onClick={handleSaveSettings} className="w-full" size="lg">
          Save Changes
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            if (!('Notification' in window)) {
              alert('This browser does not support notifications.');
              return;
            }
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              new Notification('LifeLink', {
                body: 'Test notification from Settings.',
              });
            } else {
              alert('Notification permission was not granted.');
            }
          }}
        >
          Send Test Push Notification
        </Button>
      </div>
    </AppLayout>
  );
}
