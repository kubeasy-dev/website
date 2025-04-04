import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CtaCreateChallenge() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Didn't find what you were looking for?</CardTitle>
        <CardDescription>
          Why not create your own challenge? It's easy and fun! Just click the button below to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>It's a great way to share your knowledge and help others learn. And it's only takes a few minutes!</p>
      </CardContent>
      <CardFooter>
      <Button className="w-full">
          <Link href="/create-challenge">
            Create a Challenge
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}