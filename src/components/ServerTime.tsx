import { connection } from "next/server";

// De ce: forțăm randarea la request ca exemplul să arate clar diferența dintre date calculate pe server și starea interactivă din browser.
export async function ServerTime() {
  await connection();

  const formatter = new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "full",
    timeStyle: "medium"
  });

  const serverTime = formatter.format(new Date());

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
      {/* De ce: afișăm o valoare dependentă de request pentru a vedea imediat că acest bloc se calculează pe server. */}
      <div>
        <p className="text-sm font-medium text-muted-foreground">Componentă server</p>
        <p className="text-lg font-semibold tracking-tight">{serverTime}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Ora vine din server la fiecare request și este un precursor util pentru viitoarele apeluri către providerul LLM.
      </p>
    </div>
  );
}
