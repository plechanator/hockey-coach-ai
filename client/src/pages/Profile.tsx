import { useAuth } from "@/hooks/use-auth";
import { useCoachProfile } from "@/hooks/use-coach";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCoachProfileSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, createOrUpdate, isLoading } = useCoachProfile();
  const { t } = useLanguage();

  const form = useForm({
    resolver: zodResolver(insertCoachProfileSchema.omit({ userId: true })),
    defaultValues: {
      club: "",
      category: "",
      preferredMethodology: "Hybrid",
      defaultDrillRatio: 60
    }
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        club: profile.club || "",
        category: profile.category || "",
        preferredMethodology: profile.preferredMethodology || "Hybrid",
        defaultDrillRatio: profile.defaultDrillRatio || 60
      });
    }
  }, [profile, form]);

  const onSubmit = (data: any) => {
    createOrUpdate.mutate(data);
  };

  if (isLoading) return <div>{t.common.loading}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 fade-in">
      <h1 className="text-2xl font-semibold mb-8" data-testid="text-profile-title">{t.profile.title}</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.profile.accountDetails}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t.profile.firstName}</label>
                <div className="text-lg font-medium" data-testid="text-first-name">{user?.firstName}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t.profile.lastName}</label>
                <div className="text-lg font-medium" data-testid="text-last-name">{user?.lastName}</div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-muted-foreground">{t.profile.email}</label>
                <div className="text-lg font-medium" data-testid="text-email">{user?.email}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.profile.coachingDna}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="club"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.profile.clubOrg}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-club" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.profile.category}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder={t.profile.selectCategory} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["U9", "U11", "U13", "U15", "U18", "Junior", "Pro"].map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preferredMethodology"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.profile.preferredStyle}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-methodology">
                              <SelectValue placeholder={t.profile.selectStyle} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["Canadian", "Swedish", "American", "Czech", "Hybrid"].map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defaultDrillRatio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.profile.defaultDrillPercent}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} data-testid="input-drill-ratio" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-primary" disabled={createOrUpdate.isPending} data-testid="button-save-profile">
                    {createOrUpdate.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t.profile.saveChanges}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
