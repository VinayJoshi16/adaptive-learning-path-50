import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Eye, Target, BarChart3, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Eye,
      title: 'Real-time Engagement',
      description: 'Webcam-based attention tracking monitors your focus during learning sessions.',
    },
    {
      icon: Target,
      title: 'Adaptive Content',
      description: 'Get personalized recommendations based on your engagement and quiz performance.',
    },
    {
      icon: BarChart3,
      title: 'Progress Dashboard',
      description: 'Track your learning journey with detailed analytics and insights.',
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description: 'Choose between rule-based or ML-powered content recommendations.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-subtle" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--accent)/0.06),transparent_50%)]" />
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              Personalized Adaptive Learning
            </div>

            {/* Heading */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Learn Smarter with{' '}
              <span className="text-primary">PALM</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              An intelligent learning platform that adapts to your engagement level and performance, 
              delivering personalized content recommendations in real-time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="hero" size="xl">
                <Link to="/learn" className="flex items-center gap-2">
                  Start Learning
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How PALM Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our multimodal approach combines visual engagement tracking with performance assessment 
              to create a truly personalized learning experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group bg-background rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elevated animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Your Learning Journey
              </h2>
            </div>

            <div className="relative">
              {/* Connection line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block" />

              <div className="space-y-12">
                {[
                  { step: 1, title: 'Choose a Module', description: 'Select from beginner, intermediate, or advanced content based on your current level.' },
                  { step: 2, title: 'Learn with Engagement Tracking', description: 'Your webcam monitors attention levels while you study the material.' },
                  { step: 3, title: 'Take a Quiz', description: 'Test your understanding with targeted questions after each module.' },
                  { step: 4, title: 'Get Recommendations', description: 'Receive personalized suggestions for your next learning step.' },
                ].map((item, index) => (
                  <div 
                    key={item.step}
                    className={`flex items-center gap-6 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                  >
                    <div className={`flex-1 ${index % 2 === 1 ? 'md:text-right' : ''}`}>
                      <div className="bg-card rounded-xl p-6 border border-border shadow-soft">
                        <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground shadow-elevated z-10">
                      {item.step}
                    </div>
                    <div className="flex-1 hidden md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-muted-foreground mb-8">
              Start your personalized learning journey today and experience the power of adaptive education.
            </p>
            <Button asChild variant="hero" size="xl">
              <Link to="/learn" className="flex items-center gap-2">
                Begin Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
