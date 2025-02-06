import { Container } from '@/components/ui/container';

export default function DocsPage() {
  return (
    <Container className="py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Documentation</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <h2>Getting Started</h2>
        <p>
          Welcome to Kubeasy, your interactive platform for mastering Kubernetes through hands-on
          challenges. This guide will help you get started with our platform and make the most of your
          learning experience.
        </p>

        <h3>Prerequisites</h3>
        <ul>
          <li>Basic understanding of containers and Docker</li>
          <li>Familiarity with command-line interfaces</li>
          <li>A Kubernetes cluster for practice (local or cloud-based)</li>
        </ul>

        <h3>How Challenges Work</h3>
        <p>
          Each challenge is designed to teach specific Kubernetes concepts through practical
          exercises. You'll be presented with:
        </p>
        <ul>
          <li>A clear objective and expected outcomes</li>
          <li>Technical requirements and prerequisites</li>
          <li>Step-by-step guidance when needed</li>
          <li>Validation tests to verify your solution</li>
        </ul>

        <h3>Using the CLI</h3>
        <p>
          Our CLI tool helps you interact with challenges directly from your terminal. To get started:
        </p>
        <pre><code>npm install -g Kubeasy-cli
Kubeasy login
Kubeasy challenge list</code></pre>
      </div>
    </Container>
  );
}