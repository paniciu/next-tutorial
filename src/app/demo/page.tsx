import Link from "next/link";

import { Button } from "@/components/ui/button";

// De ce: ruta separată fixează convenția de rutare din App Router înainte să apară ecranele reale pentru profil, chat și progres.
export default function DemoPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">Rută demo</p>
        <h1 className="text-3xl font-semibold tracking-tight">Structura de navigare este deja stabilită.</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Aici putem atașa în pașii următori ecrane dedicate pentru profil, planuri sau testarea fluxurilor agentului
          fără să rescriem fundația aplicației.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">
          Pagina aceasta există intenționat separat de `/`, ca să vedem încă de acum cum arată o rută nouă în App
          Router.
        </p>
      </div>

      <div>
        <Button asChild variant="secondary">
          <Link href="/">Înapoi la pagina principală</Link>
        </Button>
      </div>
    </main>
  );
}
