export const runtime = "nodejs";

const STREAM_DELAY_MS = 120;

// De ce: păstrăm descrierea într-un singur loc pe server ca produsul să poată fi ajustat fără modificări în interfață.
const ABOUT_CHUNKS = [
  "SkillForge este un copilot personal pentru dezvoltare profesională.",
  "\n\nAplicatia te ajuta sa transformi un obiectiv de cariera in pasi concreti de invatare, adaptati profilului tau.",
  "\n\nIn faza actuala rulam pe date inventate si pe streaming simulat,",
  " astfel incat sa validam experienta cap-coada inainte de integrarea unui model de limbaj.",
  "\n\nUrmatorul pas este inlocuirea acestor bucati statice cu output real de la un provider LLM,",
  " folosind acelasi protocol de streaming pe care il vezi acum."
];

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// De ce: route handler-ul livrează stream incremental pentru a demonstra explicit transportul server -> client înainte de integrarea unui SDK.
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of ABOUT_CHUNKS) {
        const payload = JSON.stringify({ content: chunk });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        await wait(STREAM_DELAY_MS);
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform"
    }
  });
}
