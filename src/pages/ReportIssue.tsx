import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Camera, MapPin, Upload, X, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = [
  "Roads & Traffic",
  "Water & Utilities", 
  "Sanitation & Waste",
  "Street Lighting",
  "Parks & Recreation",
  "Public Safety",
  "Buildings & Infrastructure",
  "Other",
];

export default function ReportIssue() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    anonymous: false,
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState("Auto-detected: 123 Main St, City");

  const navigate = useNavigate();

  useEffect(() => {
    const storedLat = localStorage.getItem('selectedLat');
    const storedLng = localStorage.getItem('selectedLng');
    if (storedLat && storedLng) {
      // In a real app, you would reverse geocode these coordinates to a human-readable address
      setLocation(`Selected: ${parseFloat(storedLat).toFixed(4)}, ${parseFloat(storedLng).toFixed(4)}`);
      localStorage.removeItem('selectedLat');
      localStorage.removeItem('selectedLng');
    }
  }, []);

  const handlePhotoCapture = () => {
    // TODO: Implement camera capture
    const mockPhoto = `https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=300&h=200&fit=crop`;
    setPhotos([...photos, mockPhoto]);
  };

  const handlePhotoUpload = () => {
    // TODO: Implement photo upload
    const mockPhoto = `https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop`;
    setPhotos([...photos, mockPhoto]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // TODO: Implement form submission
    if (!formData.title.trim()) {
      alert('Please enter a title for the issue.');
      return;
    }
    if (!formData.category.trim()) {
      alert('Please select a category.');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please provide a description.');
      return;
    }
    console.log("Submitting report:", { ...formData, photos, location });
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Report an Issue
          </h1>
          <p className="text-muted-foreground">
            Help improve your community by reporting problems
          </p>
        </div>

        {/* Photo Capture */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Photos</CardTitle>
            <CardDescription>
              Add photos to help authorities understand the issue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Issue photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={handlePhotoCapture}
              >
                <Camera className="w-6 h-6" />
                Take Photo
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={handlePhotoUpload}
              >
                <Upload className="w-6 h-6" />
                Upload Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Issue Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select issue category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about the issue..."
                className="min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm">{location}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/map')}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Location was detected automatically. Tap to edit if incorrect.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Options */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="anonymous">Report Anonymously</Label>
                <p className="text-sm text-muted-foreground">
                  Your name won't be visible to other users
                </p>
              </div>
              <Switch
                id="anonymous"
                checked={formData.anonymous}
                onCheckedChange={(checked) => setFormData({...formData, anonymous: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="space-y-3">
          <Button onClick={handleSubmit} className="w-full" size="lg">
            Submit Report
          </Button>
          <Button variant="outline" className="w-full">
            Save as Draft
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}