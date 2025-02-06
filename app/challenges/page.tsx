import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, Search } from 'lucide-react';

export default function ChallengesPage() {
  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Kubernetes Challenges</h1>
          <p className="text-muted-foreground">
            Browse through our collection of hands-on Kubernetes challenges
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: 'Deploy Your First Application',
            description: 'Learn the basics of deploying applications to Kubernetes',
            difficulty: 'beginner',
            categories: ['Deployments', 'Pods'],
          },
          {
            title: 'Configure Persistent Storage',
            description: 'Master persistent volume claims and storage classes',
            difficulty: 'intermediate',
            categories: ['Storage', 'PersistentVolumes'],
          },
          {
            title: 'Implement RBAC Policies',
            description: 'Learn role-based access control in Kubernetes',
            difficulty: 'advanced',
            categories: ['Security', 'RBAC'],
          },
        ].map((challenge, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge
                  variant={
                    challenge.difficulty === 'beginner'
                      ? 'default'
                      : challenge.difficulty === 'intermediate'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {challenge.difficulty}
                </Badge>
              </div>
              <CardTitle>{challenge.title}</CardTitle>
              <CardDescription>{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {challenge.categories.map((category) => (
                  <Badge key={category} variant="outline">
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}