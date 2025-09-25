import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Phone, Shield, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [userType, setUserType] = useState<"citizen" | "authority">("citizen");
  const [authorityCredentials, setAuthorityCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    // TODO: Implement OTP sending logic
    const { error } = await supabase.auth.signInWithOtp({ phone: `+1${phoneNumber.replace(/\D/g, '')}` });
    if (error) {
      console.error("Error sending OTP:", error.message);
      // TODO: Display error to user
    } else {
      setOtpSent(true);
    }
  };

  const handleVerifyOTP = async () => {
    // TODO: Implement OTP verification logic
    const { data, error } = await supabase.auth.verifyOtp({ phone: `+1${phoneNumber.replace(/\D/g, '')}`, token: otp, type: 'sms' });
    if (error) {
      console.error("Error verifying OTP:", error.message);
      // TODO: Display error to user
    } else if (data.user) {
      console.log("OTP verified, user logged in:", data.user);
      navigate("/dashboard"); // Redirect to dashboard on successful login
    }
  };

  const handleAuthorityLogin = async () => {
    // TODO: Implement authority login logic
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authorityCredentials.username, // Assuming username is email for authority
      password: authorityCredentials.password,
    });
    if (error) {
      console.error("Error during authority login:", error.message);
      // TODO: Display error to user
    } else if (data.user) {
      console.log("Authority logged in:", data.user);
      navigate("/authority-dashboard"); // Redirect to authority dashboard on successful login
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Welcome */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">LifeLink</h1>
          <p className="text-muted-foreground">
            Connecting communities with civic solutions
          </p>
        </div>

        <Tabs defaultValue="citizen" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="citizen" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Citizen
            </TabsTrigger>
            <TabsTrigger value="authority" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Authority
            </TabsTrigger>
          </TabsList>

          <TabsContent value="citizen">
            <Card>
              <CardHeader>
                <CardTitle>Citizen Login</CardTitle>
                <CardDescription>
                  Enter your phone number to receive a verification code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!otpSent ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                          <span className="text-sm text-muted-foreground">+1</span>
                        </div>
                        <Input
                          id="phone"
                          placeholder="(555) 123-4567"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
                    <Button onClick={handleSendOTP} className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Send Verification Code
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp">Verification Code</Label>
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to {phoneNumber}
                      </p>
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                    <Button onClick={handleVerifyOTP} className="w-full">
                      Verify Code
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setOtpSent(false)}
                      className="w-full"
                    >
                      Back to Phone Number
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authority">
            <Card>
              <CardHeader>
                <CardTitle>Authority Login</CardTitle>
                <CardDescription>
                  Sign in with your government credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Government ID</Label>
                  <Input
                    id="username"
                    placeholder="Enter your government ID"
                    value={authorityCredentials.username}
                    onChange={(e) =>
                      setAuthorityCredentials({
                        ...authorityCredentials,
                        username: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={authorityCredentials.password}
                    onChange={(e) =>
                      setAuthorityCredentials({
                        ...authorityCredentials,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
                <Button onClick={handleAuthorityLogin} className="w-full">
                  Sign In
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Legal Links */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}