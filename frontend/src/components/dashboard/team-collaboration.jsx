
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";

const members = [
{
  name: "Alexandra Deff",
  task: "Github Project Repository",
  status: "Completed",
  statusColor: "bg-emerald-100 text-emerald-700",
  avatar: "AD",
  avatarImage: "/avatars/avatar-1.jpg"
},
{
  name: "Edwin Adenike",
  task: "Integrate User Authentication System",
  status: "In Progress",
  statusColor: "bg-amber-100 text-amber-700",
  avatar: "EA",
  avatarImage: "/avatars/avatar-2.jpg"
},
{
  name: "Isaac Oluwatemilorun",
  task: "Develop Search and Filter Functionality",
  status: "Pending",
  statusColor: "bg-rose-100 text-rose-700",
  avatar: "IO",
  avatarImage: "/avatars/avatar-3.jpg"
},
{
  name: "David Oshodi",
  task: "Responsive Layout for Homepage",
  status: "In Progress",
  statusColor: "bg-amber-100 text-amber-700",
  avatar: "DO",
  avatarImage: "/avatars/avatar-4.jpg"
}];


export function TeamCollaboration() {
  return (
    <Card
      className="p-6 transition-all duration-500 hover:shadow-xl animate-slide-in-up"
      style={{ animationDelay: "600ms" }}>
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Team Collaboration</h2>
        <Button variant="outline" size="sm" className="transition-all duration-300 hover:scale-105 bg-transparent">
          <Plus className="w-4 h-4 mr-1" />
          Add Member
        </Button>
      </div>
      <div className="space-y-4">
        {members.map((member, index) =>
        <div
          key={member.name}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-all duration-300 cursor-pointer group"
          style={{ animationDelay: `${650 + index * 100}ms` }}>
          
            <Avatar className="w-12 h-12 ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40 group-hover:scale-110">
              <AvatarImage src={member.avatarImage || "/placeholder.svg"} alt={member.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">{member.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">{member.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                Working on <span className="font-medium">{member.task}</span>
              </p>
            </div>
            <span
            className={`${member.statusColor} text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-300 group-hover:scale-105 whitespace-nowrap`}>
            
              {member.status}
            </span>
          </div>
        )}
      </div>
    </Card>);

}