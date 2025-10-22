export function StatsSection() {
  const stats = [
    {
      value: "50+",
      label: "Interactive Challenges",
      description: "From basics to advanced",
    },
    {
      value: "100%",
      label: "Free Forever",
      description: "Open source learning",
    },
    {
      value: "10k+",
      label: "Developers Learning",
      description: "Join the community",
    },
    {
      value: "5min",
      label: "Average Setup",
      description: "Start learning fast",
    },
  ];

  return (
    <section className="py-20 px-4 border-y-4 border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-black text-primary">
                {stat.value}
              </div>
              <div className="text-lg font-black text-foreground">
                {stat.label}
              </div>
              <div className="text-sm font-bold text-muted-foreground">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
