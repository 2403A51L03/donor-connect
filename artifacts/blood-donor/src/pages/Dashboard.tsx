import { motion } from "framer-motion";
import { Link } from "wouter";
import { Activity, ArrowRight, HeartPulse, UserCheck, Users, Droplet, User } from "lucide-react";
import { useDonorAuth } from "@/contexts/DonorAuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useGetStats, useListBloodRequests } from "@workspace/api-client-react";
import { Card, Button, Badge } from "@/components/shared/UI";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const { isRegistered } = useDonorAuth();
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: requests, isLoading: requestsLoading } = useListBloodRequests({ status: "open" });

  const recentRequests = requests?.slice(0, 4) || [];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden shadow-xl">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-medical.png`} 
            alt="Medical Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
        </div>
        
        <div className="relative z-10 p-8 md:p-12 lg:p-16 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="default" className="mb-4 text-sm px-4 py-1">Save Lives Today</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-4">
              Every drop counts. <br/>
              <span className="text-primary">Be someone's lifeline.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Join our network of life-savers. View urgent blood requests in your area and help those in critical need.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/requests">
                <Button size="lg" className="gap-2">
                  View Urgent Requests <Activity className="w-5 h-5" />
                </Button>
              </Link>
              {isRegistered ? (
                <Link href="/profile">
                  <Button variant="outline" size="lg" className="gap-2 bg-white/50 backdrop-blur-sm">
                    My Profile <User className="w-5 h-5 text-primary" />
                  </Button>
                </Link>
              ) : (
                <Link href="/donors/register">
                  <Button variant="outline" size="lg" className="gap-2 bg-white/50 backdrop-blur-sm">
                    Register as Donor <HeartPulse className="w-5 h-5 text-primary" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Network Overview</h2>
        </div>
        
        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 h-32 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Donors" 
              value={stats?.totalDonors || 0} 
              icon={<Users className="w-6 h-6 text-blue-500" />} 
              bgColor="bg-blue-50" 
            />
            <StatCard 
              title="Available Donors" 
              value={stats?.availableDonors || 0} 
              icon={<UserCheck className="w-6 h-6 text-green-500" />} 
              bgColor="bg-green-50" 
            />
            <StatCard 
              title="Open Requests" 
              value={stats?.openRequests || 0} 
              icon={<Activity className="w-6 h-6 text-orange-500" />} 
              bgColor="bg-orange-50" 
            />
            <StatCard 
              title="Critical Needs" 
              value={stats?.criticalRequests || 0} 
              icon={<Droplet className="w-6 h-6 text-primary" />} 
              bgColor="bg-red-50" 
            />
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <section className="lg:col-span-2">
          <Card className="p-6 h-full min-h-[400px]">
            <h3 className="text-xl font-display font-bold mb-6">Blood Type Distribution</h3>
            {statsLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart...</div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.bloodTypeStats || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="bloodType" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" />
                    <Bar dataKey="donorCount" name="Available Donors" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={32} />
                    <Bar dataKey="requestCount" name="Open Requests" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </section>

        {/* Recent Requests Section */}
        <section className="lg:col-span-1">
          <Card className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-bold">Recent Requests</h3>
              <Link href="/requests" className="text-sm font-semibold text-primary hover:underline flex items-center">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {requestsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse bg-muted rounded-xl" />
                ))}
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <Activity className="w-12 h-12 mb-3 text-muted" />
                <p>No open blood requests at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {recentRequests.map((req) => (
                  <Link key={req.id} href={`/requests`}>
                    <div className="group p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
                            {req.bloodType}
                          </span>
                          <div>
                            <p className="font-semibold text-sm line-clamp-1">{req.hospital}</p>
                            <p className="text-xs text-muted-foreground">{req.city}</p>
                          </div>
                        </div>
                        <Badge variant={req.urgency as any}>{req.urgency}</Badge>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-foreground">{req.unitsNeeded} units</span> needed
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bgColor }: { title: string; value: number; icon: React.ReactNode; bgColor: string }) {
  return (
    <Card className="p-6 hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center gap-4">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", bgColor)}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h4 className="text-3xl font-display font-bold text-foreground mt-1">{value}</h4>
        </div>
      </div>
    </Card>
  );
}
