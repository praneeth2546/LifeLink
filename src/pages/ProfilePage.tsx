import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, LogOut, Mail, Phone, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  user_type?: "citizen" | "authority";
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserProfile({
          name: user.user_metadata.full_name || user.email || "User",
          email: user.email || "",
          phone: user.phone || undefined,
          avatar: user.user_metadata.avatar_url || undefined,
          user_type: user.user_metadata.user_type || "citizen", // Assuming user_type is stored in user_metadata
        });
      } else {
        navigate("/auth"); // Redirect to login if no user session
      }
    };
    fetchUserProfile();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      navigate("/auth");
    }
  };

  if (!userProfile) {
    return <AppLayout><div className="p-4">Loading profile...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={userProfile.avatar} alt="User Avatar" />
              <AvatarFallback>{userProfile.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{userProfile.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{userProfile.user_type === "authority" ? "Authority" : "Citizen"}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{userProfile.email}</span>
            </div>
            {userProfile.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{userProfile.phone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings/Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <UserIcon className="w-4 h-4 mr-2" />
              Manage Account
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Edit className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/settings')}>
              <UserIcon className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
