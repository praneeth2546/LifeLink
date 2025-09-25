import { useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Calendar, 
  User, 
  ThumbsUp, 
  MessageCircle, 
  Share, 
  Flag,
  ArrowLeft,
  Camera
} from "lucide-react";

// Mock issue data
const mockIssue = {
  id: 1,
  title: "Large Pothole on Main Street",
  description: "There's a significant pothole at the intersection of Main Street and 5th Avenue that's causing damage to vehicles and creating a safety hazard. The hole is approximately 3 feet wide and 8 inches deep. Multiple cars have already suffered tire damage.",
  category: "Roads & Traffic",
  status: "in-progress",
  priority: "high",
  location: "Main St & 5th Ave",
  reportedBy: "Sarah Johnson",
  reportedAt: "2024-01-15T10:30:00Z",
  upvotes: 23,
  hasUpvoted: false,
  photos: [
    "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
  ],
  updates: [
    {
      id: 1,
      type: "status_change",
      message: "Issue assigned to Road Maintenance Department",
      author: "City Infrastructure",
      timestamp: "2024-01-15T14:20:00Z",
      status: "in-progress",
    },
    {
      id: 2,
      type: "comment",
      message: "We've scheduled an inspection for tomorrow morning. Repair crew will be dispatched within 48 hours.",
      author: "Road Maintenance Dept",
      timestamp: "2024-01-15T15:45:00Z",
    },
  ],
  comments: [
    {
      id: 1,
      author: "Mike Chen",
      message: "This pothole damaged my tire yesterday. Really needs urgent attention!",
      timestamp: "2024-01-15T12:15:00Z",
    },
    {
      id: 2,
      author: "Lisa Rodriguez",
      message: "Agreed, I've been avoiding this intersection. Thanks for reporting Sarah!",
      timestamp: "2024-01-15T13:30:00Z",
    },
  ],
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "resolved":
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export default function IssueDetails() {
  const { id } = useParams();
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [hasUpvoted, setHasUpvoted] = useState(mockIssue.hasUpvoted);
  const [upvoteCount, setUpvoteCount] = useState(mockIssue.upvotes);

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvoteCount(upvoteCount - 1);
      setHasUpvoted(false);
    } else {
      setUpvoteCount(upvoteCount + 1);
      setHasUpvoted(true);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      // TODO: Implement comment submission
      console.log("Adding comment:", newComment);
      setNewComment("");
    }
  };

  const handleStatusUpdate = () => {
    if (newStatus) {
      // TODO: Implement status update
      console.log("Updating status to:", newStatus);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Issue Details
            </h1>
            <p className="text-sm text-muted-foreground">#{id}</p>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="grid grid-cols-2 gap-2">
          {mockIssue.photos.map((photo, index) => (
            <div key={index} className="relative">
              <img
                src={photo}
                alt={`Issue photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg cursor-pointer"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2 h-8 w-8 p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Issue Information */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-lg">{mockIssue.title}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={getStatusColor(mockIssue.status)}>
                    {mockIssue.status}
                  </Badge>
                  <Badge variant="secondary">{mockIssue.category}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Share className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{mockIssue.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{mockIssue.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Reported by {mockIssue.reportedBy}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>January 15, 2024 at 10:30 AM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={hasUpvoted ? "default" : "outline"}
            onClick={handleUpvote}
            className="flex items-center gap-2"
          >
            <ThumbsUp className="w-4 h-4" />
            {upvoteCount} Upvotes
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            {mockIssue.comments.length} Comments
          </Button>
        </div>

        {/* Status Updates Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockIssue.updates.map((update, index) => (
              <div key={update.id} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{update.message}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{update.author}</span>
                    <span>•</span>
                    <span>Jan 15, 2:20 PM</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Authority Status Update (Authority users only) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Update Status</CardTitle>
            <CardDescription>Authority only - Update issue status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Change status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleStatusUpdate} className="w-full">
              Update Status
            </Button>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Community Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockIssue.comments.map((comment) => (
              <div key={comment.id} className="space-y-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.author}</span>
                  <span className="text-xs text-muted-foreground">
                    Jan 15, 12:15 PM
                  </span>
                </div>
                <p className="text-sm">{comment.message}</p>
              </div>
            ))}

            {/* Add Comment */}
            <div className="space-y-3 border-t pt-4">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <Button onClick={handleAddComment} className="w-full">
                Post Comment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}