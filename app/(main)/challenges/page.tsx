import { getChallenges } from "@/lib/actions"
import ChallengesWrapper from "./ChallengesWrapper"

export default async function Challenges() {
  const challenges = await getChallenges(1)

  return <ChallengesWrapper initialChallenges={challenges} />
}

