import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/templates";

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Learn Vocabulary Through
          <span className="text-primary"> Reading</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Transform your reading experience into a powerful vocabulary learning tool. 
          Import documents, take notes, and build your personal vocabulary library.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Get Started Free
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="text-lg px-8">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to master vocabulary
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📚 Document Import
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload PDFs, text files, and other documents to start learning from 
                your favorite reading materials.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✍️ Smart Note-Taking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Take notes while reading and automatically create vocabulary entries 
                with context and examples.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 Vocabulary Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize your vocabulary with tags, track learning progress, 
                and review words with spaced repetition.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          How NoteLingua Works
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold mb-2">Upload Document</h3>
            <p className="text-sm text-muted-foreground">
              Import your reading materials in various formats
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold mb-2">Read & Annotate</h3>
            <p className="text-sm text-muted-foreground">
              Take notes and highlight new vocabulary while reading
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold mb-2">Build Vocabulary</h3>
            <p className="text-sm text-muted-foreground">
              Words are automatically added to your personal vocabulary
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">4</span>
            </div>
            <h3 className="font-semibold mb-2">Practice & Review</h3>
            <p className="text-sm text-muted-foreground">
              Review and practice words to reinforce your learning
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-muted rounded-lg p-12">
        <h2 className="text-3xl font-bold mb-4">
          Ready to supercharge your vocabulary learning?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Join thousands of learners who are building their vocabulary through reading.
        </p>
        <Link href="/register">
          <Button size="lg" className="text-lg px-8">
            Start Learning Today
          </Button>
        </Link>
      </section>
    </div>
  );
}
