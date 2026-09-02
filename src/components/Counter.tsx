"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

// De ce: directiva "use client" mută componenta în browser; fără ea, `useState` ar produce eroare pentru că hook-urile interactive nu pot rula într-o componentă de server.
export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
      {/* De ce: păstrăm interacțiunea minimă și vizibilă ca să se vadă imediat care cod ajunge pe client. */}
      <div>
        <p className="text-sm font-medium text-muted-foreground">Componentă client</p>
        <p className="text-3xl font-semibold tracking-tight">{count}</p>
      </div>
      <Button type="button" onClick={() => setCount(current => current + 1)}>
        Crește contorul
      </Button>
    </div>
  );
}
