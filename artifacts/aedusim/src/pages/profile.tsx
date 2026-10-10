import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { User, FileStack, Crown, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetProfile();
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm({
    defaultValues: {
      name: "",
      class: "",
      goals: "",
      interests: ""
    }
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        class: profile.class,
        goals: profile.goals,
        interests: profile.interests.join(", ")
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: any) => {
    const interestsArray = data.interests.split(",").map((i: string) => i.trim()).filter(Boolean);
    
    updateProfile.mutate({ 
      data: {
        name: data.name,
        class: data.class,
        goals: data.goals,
        interests: interestsArray
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        toast({ title: "Profile updated successfully" });
      }
    });
  };

  if (isLoading) return null;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Identity Matrix</h1>
          <p className="text-muted-foreground mt-1">Manage your educational profile and parameters.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/40 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/20 to-transparent" />
              <CardContent className="pt-12 pb-6 px-6 flex flex-col items-center text-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-background border-4 border-background flex items-center justify-center shadow-xl shadow-black/50 mb-4">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold">{profile?.name || "Student"}</h2>
                <div className="text-sm text-muted-foreground mt-1 mb-4">{profile?.class || "Unassigned"}</div>
                
                <div className="w-full flex items-center justify-between p-3 rounded-lg bg-background border border-border/50 mb-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Crown className="w-4 h-4 text-amber-400" /> Plan</span>
                  <span className="font-bold text-sm uppercase tracking-wider text-amber-400">{profile?.plan}</span>
                </div>
                
                <div className="w-full flex items-center justify-between p-3 rounded-lg bg-background border border-border/50">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><FileStack className="w-4 h-4 text-cyan-400" /> Files</span>
                  <span className="font-bold text-sm font-mono">{profile?.filesCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="border-border/50 bg-card/40">
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Adjust your system parameters to get better AI responses.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input id="name" {...register("name")} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class">Academic Level / Class</Label>
                      <Input id="class" {...register("class")} className="bg-background" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interests">Interests (comma separated)</Label>
                    <Input id="interests" {...register("interests")} placeholder="Physics, History, Coding" className="bg-background" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goals">Primary Goals</Label>
                    <Textarea 
                      id="goals" 
                      {...register("goals")} 
                      placeholder="What are you trying to achieve?"
                      className="min-h-[100px] bg-background resize-none" 
                    />
                  </div>

                  <div className="pt-4 border-t border-border/50 flex justify-end">
                    <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Parameters
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
