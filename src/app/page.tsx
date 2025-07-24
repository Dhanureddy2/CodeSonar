import { CodeSonarAI } from '@/components/code-sonar-ai';
import { Bot } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full max-w-4xl">
        <header className="flex flex-col items-center text-center mb-8">
          <div className="bg-primary text-primary-foreground p-3 rounded-full mb-4 shadow-lg">
            <Bot className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-primary font-headline">
            CodeSonar AI
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Paste your code snippet below, select the language, and let our AI provide you with expert code reviews, bug detection, and security vulnerability analysis.
          </p>
        </header>
        <CodeSonarAI />
      </div>
    </main>
  );
}
