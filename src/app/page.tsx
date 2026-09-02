import Link from "next/link";

import { Counter } from "@/components/Counter";
import { ServerTime } from "@/components/ServerTime";
import { Button } from "@/components/ui/button";

// De ce: pagina principală fixează încă de acum punctul de pornire al aplicației și pune pe ecran diferența dintre codul de client și cel de server.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-16">
      <section className="space-y-5">
        <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">SkillForge</p>
        <div className="space-y-4">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Fundația pentru copilotul personal de skills și carieră.
          </h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            Pornim cu un schelet Next.js pregătit pentru rutare, cod separat client/server și un endpoint de server pe
            care vom construi apelul către agentul AI.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/demo">Deschide demo-ul</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/api/hello">Testează endpoint-ul de server</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ServerTime />
        <Counter />
      </section>
    </main>
  );
}
