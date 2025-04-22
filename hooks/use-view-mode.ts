import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useMounted } from "@/hooks/use-mounted";

export type ViewMode = "board" | "table";

const viewModeAtom = atomWithStorage<ViewMode>("challengesViewMode", "board");

export function useViewMode() {
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const mounted = useMounted();

  return {
    isLoading: !mounted,
    viewMode,
    setViewMode: (mode: ViewMode) => setViewMode(mode),
  };
}
