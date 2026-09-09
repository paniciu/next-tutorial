import { NextResponse } from "next/server";

// De ce: ruta aceasta este repetiția pentru viitorul endpoint al agentului, fiindcă exact aici vom chema providerul LLM exclusiv de pe server.
export async function GET() {
  // De ce: în Next.js, variabilele fără prefix `NEXT_PUBLIC_` rămân pe server și nu ajung în browser; spre deosebire de convenția `VITE_*`, nu expunem automat cheia către client.
  const helloTarget = process.env.SKILLFORGE_HELLO_TARGET;

  return NextResponse.json({
    route: "/api/hello",
    helloTarget: helloTarget ?? null,
    message: helloTarget
      ? `Salut din server, ${helloTarget}!`
      : "Variabila SKILLFORGE_HELLO_TARGET nu este setată încă pe server (local sau platforma de deploy).",
    nextStep:
      "Pe aceeași formă de rută vom construi mai târziu endpoint-ul /api/chat, unde serverul va citi cheia providerului și va transmite răspunsul în streaming."
  });
}
