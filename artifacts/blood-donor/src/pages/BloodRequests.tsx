import { useState } from "react";
import { Link } from "wouter";
import { Activity, Plus, MapPin, Building2, Droplet, Clock, CheckCircle2 } from "lucide-react";
import { useListBloodRequests, useUpdateBloodRequest, getListBloodRequestsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Button, Select, Badge } from "@/components/shared/UI";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useDonorAuth } from "@/contexts/DonorAuthContext";

export default function BloodRequests() {
  const [bloodType, setBloodType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [status, setStatus] = useState(""); // Show all statuses by default

  const { donorId, isRegistered } = useDonorAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: requests, isLoading } = useListBloodRequests({
    bloodType: bloodType || undefined,
    urgency: urgency || undefined,
    status: status || undefined
  });

  const { mutate: updateRequest, isPending: isUpdating } = useUpdateBloodRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBloodRequestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        toast({
          title: "Request Updated",
          description: "The blood request has been marked as fulfilled.",
        });
      }
    }
  });

  const handleFulfill = (id: number) => {
    updateRequest({ id, data: { status: "fulfilled" } });
  };

  const handleCancel = (id: number) => {
    updateRequest({ id, data: { status: "cancelled" } });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Blood Requests</h1>
          <p className="text-muted-foreground mt-2">View and respond to urgent blood needs.</p>
        </div>
        <Link href="/requests/new">
          <Button className="gap-2 w-full md:w-auto">
            <Plus className="w-5 h-5" /> Create Request
          </Button>
        </Link>
      </div>

      <Card className="p-4 bg-white/50 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="">All Urgency Levels</option>
            <option value="critical">Critical</option>
            <option value="urgent">Urgent</option>
            <option value="normal">Normal</option>
          </Select>
          <Select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
            <option value="">All Blood Types</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-64 animate-pulse bg-muted" />
          ))}
        </div>
      ) : !requests?.length ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <Activity className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display font-bold">No requests found</h3>
          <p className="text-muted-foreground mt-2">There are currently no blood requests matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 h-full flex flex-col border-l-4" style={{ 
                borderLeftColor: req.urgency === 'critical' ? 'hsl(var(--destructive))' : 
                                 req.urgency === 'urgent' ? '#f97316' : 
                                 '#f59e0b' 
              }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-rose-400 rounded-xl flex flex-col items-center justify-center shadow-sm text-white">
                      <Droplet className="w-5 h-5 mb-0.5" />
                      <span className="font-display font-bold text-sm leading-none">{req.bloodType}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{req.patientName}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="w-3.5 h-3.5 mr-1" /> {format(new Date(req.createdAt), "MMM d, h:mm a")}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={req.urgency as any}>{req.urgency}</Badge>
                    {req.status === "fulfilled" && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">✓ Fulfilled</Badge>
                    )}
                    {req.status === "cancelled" && (
                      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">✕ Cancelled</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4 p-4 bg-muted/50 rounded-xl text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Hospital</span>
                    <span className="font-medium flex items-center"><Building2 className="w-3.5 h-3.5 mr-1.5 text-primary" /> {req.hospital}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Location</span>
                    <span className="font-medium flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-primary" /> {req.city}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Units Needed</span>
                    <span className="font-bold text-lg text-foreground">{req.unitsNeeded}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Contact</span>
                    <a href={`tel:${req.contactPhone}`} className="font-medium hover:text-primary transition-colors">{req.contactPhone}</a>
                  </div>
                </div>

                {req.notes && (
                  <p className="text-sm text-muted-foreground mb-4 italic flex-1">"{req.notes}"</p>
                )}

                {req.status === 'open' && (
                  <div className="flex flex-col gap-2 mt-auto">
                    {/* Any registered donor with matching blood type can mark as fulfilled */}
                    {isRegistered && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleFulfill(req.id)}
                        isLoading={isUpdating}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Mark Fulfilled
                      </Button>
                    )}
                    
                    {/* Only the owner can cancel */}
                    {isRegistered && (req as any).requestedByDonorId === donorId && (
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        onClick={() => handleCancel(req.id)}
                        disabled={isUpdating}
                      >
                        Cancel Request
                      </Button>
                    )}

                    {/* Prompt to login if not registered */}
                    {!isRegistered && (
                      <div className="text-sm text-muted-foreground italic">
                        <Link href="/login" className="text-primary font-medium hover:underline">Login</Link> to respond to requests
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
