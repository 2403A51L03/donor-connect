import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateDonor, getListDonorsQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, Button, Input, Select, Textarea } from "@/components/shared/UI";
import { useDonorAuth } from "@/contexts/DonorAuthContext";
import { HeartPulse } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  bloodType: z.string().min(1, "Blood type is required"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  city: z.string().min(2, "City is required"),
  address: z.string().optional(),
  lastDonationDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterDonor() {
  const [, setLocation] = useLocation();
  const { setDonorId } = useDonorAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const { mutate: createDonor, isPending } = useCreateDonor({
    mutation: {
      onSuccess: (data) => {
        setDonorId(data.id);
        queryClient.invalidateQueries({ queryKey: getListDonorsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        toast({
          title: "Registration Successful",
          description: "Thank you for becoming a donor! You will now receive alerts for urgent requests.",
        });
        setLocation("/");
      },
      onError: () => {
        toast({
          title: "Registration Failed",
          description: "There was an error creating your profile. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    createDonor({ data });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Become a Donor</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Join our network to save lives. It only takes a minute to register.
        </p>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Full Name *</label>
              <Input placeholder="John Doe" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Blood Type *</label>
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
              <label className="text-sm font-semibold text-foreground">Phone Number *</label>
              <Input type="tel" placeholder="+1 (555) 000-0000" {...register("phone")} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Email Address *</label>
              <Input type="email" placeholder="john@example.com" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">City *</label>
              <Input placeholder="New York" {...register("city")} />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Last Donation Date</label>
              <Input type="date" {...register("lastDonationDate")} />
              {errors.lastDonationDate && <p className="text-sm text-destructive">{errors.lastDonationDate.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Address (Optional)</label>
            <Textarea placeholder="Enter your full address" {...register("address")} />
          </div>

          <div className="pt-4">
            <Button type="submit" size="lg" className="w-full" isLoading={isPending}>
              Complete Registration
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              By registering, you agree to receive notifications for urgent blood requests in your area.
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
