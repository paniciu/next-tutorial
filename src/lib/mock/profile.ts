import type { ProviderModelOption, UserProfile } from "@/lib/types";
import { providerModelOptions } from "@/lib/providers";

// De ce: ținem profilul demo într-un singur fișier ca trecerea la date reale să fie un swap controlat, nu căutare prin UI.
export const mockProfile: UserProfile = {
  name: "Andrei",
  currentStack: "Java + Spring Boot, SQL, puțin React",
  skills: [
    { id: "skill-java", name: "java", level: "avansat" },
    { id: "skill-sql", name: "sql", level: "intermediar" },
    { id: "skill-react", name: "react", level: "începător" },
    { id: "skill-ai", name: "ai fundamentals", level: "începător" }
  ],
  skillNotes: "Vreau să urc rapid pe practică AI aplicată și proiecte publice.",
  objective: "Vreau să fac tranziția spre AI Engineer în 6 luni, cu proiecte publice pe GitHub."
};

// De ce: lista de provideri/modele rămâne declarativă pentru viitorul pas când alegerea va conduce apeluri server-side reale.
export const mockProviderModels: ProviderModelOption[] = providerModelOptions;
