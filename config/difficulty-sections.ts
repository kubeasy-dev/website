/**
 * Configuration for challenge difficulty sections
 * Defines metadata for each difficulty level throughout the application
 */

export type DifficultySection = {
  title: string;
  key: 'beginner' | 'intermediate' | 'advanced';
  description: string;
}

export const difficultySections: DifficultySection[] = [
  {
    title: "Beginner Challenges",
    key: "beginner",
    description: "Perfect for those just starting with Kubernetes. Learn the basics."
  },
  {
    title: "Intermediate Challenges",
    key: "intermediate",
    description: "Build on your foundation with more complex concepts and applications."
  },
  {
    title: "Advanced Challenges",
    key: "advanced",
    description: "Master advanced Kubernetes features and tackle real-world scenarios."
  }
];
