import { lazy, Suspense, type ComponentProps } from "react";
import { ClientOnly } from "@tanstack/react-router";

const HornetMap = lazy(() => import("./HornetMap"));

const Fallback = () => <div className="grid h-full w-full place-items-center bg-muted text-sm text-muted-foreground">Loading map…</div>;

export function LazyMap(props: ComponentProps<typeof HornetMap>) {
  return (
    <ClientOnly fallback={<Fallback />}>
      <Suspense fallback={<Fallback />}>
        <HornetMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}
