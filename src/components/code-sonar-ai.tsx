'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bug, Lightbulb, Shield, Send, Loader2 } from 'lucide-react';

import { analyzeCodeAction, type AnalysisState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  code: z.string().min(10, {
    message: 'Code snippet must be at least 10 characters.',
  }),
  language: z.enum(['javascript', 'python', 'java'], {
    required_error: 'Please select a language.',
  }),
});

function ResultsSkeleton() {
    return (
        <div className="space-y-4 mt-8">
            <div className="flex space-x-2 p-1 bg-secondary rounded-md">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start space-x-4">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                     <div className="flex items-start space-x-4">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

const ResultItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-start space-x-4 p-4 rounded-lg transition-colors hover:bg-secondary/50">
        <div className="flex-shrink-0 text-primary pt-1">{icon}</div>
        <p className="flex-grow text-sm text-foreground">{text}</p>
    </div>
);


export function CodeSonarAI() {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<AnalysisState>({});
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      language: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('code', values.code);
    formData.append('language', values.language);
    
    startTransition(async () => {
      const result = await analyzeCodeAction(formData);
      if (result.error) {
         toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: result.error,
         });
      }
      if (result.inputError) {
        toast({
            variant: 'destructive',
            title: 'Invalid Input',
            description: result.inputError,
         });
      }
      setState(result);
    });
  };

  const hasResults = !state.error && !state.inputError && (state.suggestions || state.bugs || state.vulnerabilities);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-base">Code Snippet</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your code here..."
                        className="min-h-[250px] font-mono text-sm bg-white dark:bg-card dark:text-primary-foreground focus:border-primary focus:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem className="w-full sm:max-w-xs">
                      <FormLabel className="font-semibold">Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Analyze Code
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isPending && <ResultsSkeleton />}

      {!isPending && hasResults && (
         <div className="animate-in fade-in-0 duration-500">
            <Tabs defaultValue="suggestions" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-secondary p-1 h-auto rounded-lg">
                    <TabsTrigger value="suggestions" className="py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
                        <Lightbulb className="mr-2 h-4 w-4" /> Suggestions ({(state.suggestions || []).length})
                    </TabsTrigger>
                    <TabsTrigger value="bugs" className="py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
                        <Bug className="mr-2 h-4 w-4" /> Bugs ({(state.bugs || []).length})
                    </TabsTrigger>
                    <TabsTrigger value="vulnerabilities" className="py-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-md">
                        <Shield className="mr-2 h-4 w-4" /> Vulnerabilities ({(state.vulnerabilities || []).length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="suggestions">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-primary">
                               <Lightbulb className="mr-3 h-6 w-6" /> Code Review Suggestions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {state.suggestions && state.suggestions.length > 0 ? (
                                <div className="space-y-2">
                                    {state.suggestions.map((suggestion, index) => (
                                        <ResultItem key={`sugg-${index}`} icon={<Lightbulb className="h-5 w-5" />} text={suggestion} />
                                    ))}
                                </div>
                            ) : <p className="text-muted-foreground p-4 text-center">No suggestions found.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bugs">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-primary">
                                <Bug className="mr-3 h-6 w-6" /> Potential Bugs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {state.bugs && state.bugs.length > 0 ? (
                                <div className="space-y-2">
                                    {state.bugs.map((bug, index) => (
                                       <ResultItem key={`bug-${index}`} icon={<Bug className="h-5 w-5" />} text={bug} />
                                    ))}
                                </div>
                            ) : <p className="text-muted-foreground p-4 text-center">No potential bugs detected.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="vulnerabilities">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-primary">
                                <Shield className="mr-3 h-6 w-6" /> Security Vulnerabilities
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             {state.vulnerabilities && state.vulnerabilities.length > 0 ? (
                                <div className="space-y-2">
                                    {state.vulnerabilities.map((vuln, index) => (
                                        <ResultItem key={`vuln-${index}`} icon={<Shield className="h-5 w-5" />} text={vuln} />
                                    ))}
                                </div>
                            ) : <p className="text-muted-foreground p-4 text-center">No security vulnerabilities detected.</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
      )}
    </div>
  );
}
