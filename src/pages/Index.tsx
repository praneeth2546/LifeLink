import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Users, MapPin, CheckCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="px-4 py-12 text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">LifeLink</h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Connecting communities with civic solutions through transparent issue reporting
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/auth">
            <Button size="lg" className="w-full max-w-sm">
              Get Started
            </Button>
          </Link>
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Citizen Login
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm">
                <Shield className="w-4 h-4 mr-2" />
                Authority Login
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      {/* Removed the features section as per user request */}
    </div>
  );
};

export default Index;
