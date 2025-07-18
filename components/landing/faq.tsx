import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "What is Kubeasy?",
    answer:
      "Kubeasy is an interactive learning platform for mastering Kubernetes through real-world, hands-on challenges. It combines a CLI tool, local environment practice, and a vibrant community to help you learn by doing.",
    value: "item-1",
  },
  {
    question: "How do I get started with Kubeasy?",
    answer: "Simply install the Kubeasy CLI with 'npm install -g @kubeasy-dev/kubeasy-cli', authenticate your account, and start your first challenge. You can be up and running in under 5 minutes!",
    value: "item-2",
  },
  {
    question: "Is Kubeasy free?",
    answer: "Yes! Kubeasy is completely free and open source. Join the community and start learning without any cost.",
    value: "item-3",
  },
  {
    question: "Do I need to install anything besides the CLI?",
    answer: "You only need the Kubeasy CLI and a local Kubernetes environment (like Minikube or Kind). All challenges run locally on your machine for maximum control and privacy.",
    value: "item-4",
  },
  {
    question: "Is Kubeasy suitable for beginners?",
    answer: "Absolutely! Kubeasy is designed for all skill levels, from complete beginners to Kubernetes pros. Challenges come with guidance, and the community is here to help.",
    value: "item-5",
  },
  {
    question: "How does challenge validation work?",
    answer: "After completing a challenge, use the CLI to submit your solution. Kubeasy automatically validates your setup and provides instant feedback.",
    value: "item-6",
  },
  {
    question: "Can I contribute or create my own challenges?",
    answer: "Yes! Kubeasy is community-driven and open source. You can contribute challenges, improvements, or join discussions in our community.",
    value: "item-7",
  },
];

export const FAQSection = () => {
  return (
    <section id='faq' className='container md:w-[700px] py-16'>
      <div className='text-center mb-8'>
        <h2 className='text-lg text-primary text-center mb-2 tracking-wider'>FAQS</h2>

        <h2 className='text-3xl md:text-4xl text-center font-bold'>Common Questions</h2>
      </div>

      <Accordion type='single' collapsible className='AccordionRoot'>
        {FAQList.map(({ question, answer, value }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className='text-left'>{question}</AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
