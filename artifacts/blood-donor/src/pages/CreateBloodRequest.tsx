import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateBloodRequest, getListBloodRequestsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Button, Input, Select, Textarea } from "@/components/shared/UI";
import { Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDonorAuth } from "@/contexts/DonorAuthContext";
import { Link } from "wouter";

const formSchema = z.object({
  patientName: z.string().min(2, "Patient name is required"),
  bloodType: z.string().min(1, "Blood type is required"),
  unitsNeeded: z.coerce.number().min(1, "At least 1 unit is required"),
  hospital: z.string().min(2, "Hospital name is required"),
  city: z.string().min(2, "City is required"),
  urgency: z.enum(["critical", "urgent", "normal"]),
  contactPhone: z.string().min(10, "Valid contact phone is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateBloodRequest() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isRegistered } = useDonorAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      urgency: "urgent",
      unitsNeeded: 1,
    }
  });

  const { mutate: createRequest, isPending } = useCreateBloodRequest({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBloodRequestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        toast({
          title: "Request Created",
          description: "Your blood request has been published to the network.",
        });
        setLocation("/requests");
      },
      onError: (error: any) => {
        const errorMsg = error?.response?.data?.error || error?.message || "Failed to create blood request. Please try again.";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    createRequest({ data });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Create Blood Request</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Post an urgent need to notify matching donors in your area.
        </p>
      </div>

      {!isRegistered && (
        <Card className="mb-6 p-6 bg-blue-50 border-blue-200 border-l-4 border-l-blue-500">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="font-bold text-blue-900 mb-2">Login Required</h2>
              <p className="text-sm text-blue-800 mb-4">
                You need to have a donor account to create blood requests. This ensures accountability and allows donors to track your requests.
              </p>
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-100">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register-donor">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Register as Donor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 md:p-8 border-t-4 border-t-primary">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Patient Name *</label>
              <Input placeholder="Jane Doe" {...register("patientName")} />
              {errors.patientName && <p className="text-sm text-destructive">{errors.patientName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Blood Type Needed *</label>
              <Select {...register("bloodType")}>
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </Select>
              {errors.bloodType && <p className="text-sm text-destructive">{errors.bloodType.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Units Needed *</label>
              <Input type="number" min="1" {...register("unitsNeeded")} />
              {errors.unitsNeeded && <p className="text-sm text-destructive">{errors.unitsNeeded.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Urgency Level *</label>
              <Select {...register("urgency")}>
                <option value="critical">Critical (Immediate)</option>
                <option value="urgent">Urgent (Within 24h)</option>
                <option value="normal">Normal (Next few days)</option>
              </Select>
              {errors.urgency && <p className="text-sm text-destructive">{errors.urgency.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Hospital Name *</label>
              <Input placeholder="City General Hospital" {...register("hospital")} />
              {errors.hospital && <p className="text-sm text-destructive">{errors.hospital.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">City *</label>
              <Input placeholder="New York" {...register("city")} />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-foreground">Contact Phone *</label>
              <Input type="tel" placeholder="+1 (555) 000-0000" {...register("contactPhone")} />
              {errors.contactPhone && <p className="text-sm text-destructive">{errors.contactPhone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Additional Notes</label>
            <Textarea placeholder="Any specific requirements or instructions for donors..." {...register("notes")} />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-lg" 
              variant="destructive" 
              isLoading={isPending}
              disabled={!isRegistered}
            >
              {!isRegistered ? "Login to Post Request" : "Publish Urgent Request"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
