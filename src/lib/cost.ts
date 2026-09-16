import type { ChatMessage, MessageCostSnapshot, ModelPricing } from "@/lib/types";

type UsageLike = {
  inputTokens: number | undefined;
  outputTokens: number | undefined;
};

const ONE_MILLION = 1_000_000;

function computeSideCost(tokens: number | undefined, unitPricePerMillion: number | undefined) {
  if (tokens === undefined || unitPricePerMillion === undefined) {
    return undefined;
  }

  return (tokens * unitPricePerMillion) / ONE_MILLION;
}

// De ce: formula de cost trăiește într-un singur loc (tokeni * preț / 1.000.000),
// folosită atât per mesaj, cât și pentru totalul conversației.
export function calculateMessageCost(usage: UsageLike, pricing: ModelPricing | undefined): MessageCostSnapshot {
  const inputCostUsd = computeSideCost(usage.inputTokens, pricing?.inputPerMillionUsd);
  const outputCostUsd = computeSideCost(usage.outputTokens, pricing?.outputPerMillionUsd);

  const totalCostUsd =
    inputCostUsd !== undefined && outputCostUsd !== undefined ? inputCostUsd + outputCostUsd : undefined;

  return {
    inputCostUsd,
    outputCostUsd,
    totalCostUsd,
    billedCostUsd: totalCostUsd,
    pricingCheckedAt: pricing?.checkedAt
  };
}

export function toCachedCostSnapshot(cost: MessageCostSnapshot): MessageCostSnapshot {
  return {
    ...cost,
    billedCostUsd: 0
  };
}

export function formatUsd(value: number | undefined) {
  if (value === undefined) {
    return "—";
  }

  return `$${value.toFixed(6)}`;
}

export function formatTokenCount(value: number | undefined) {
  if (value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("ro-RO").format(value);
}

export function calculateConversationBilledCost(messages: ChatMessage[]) {
  let totalKnownUsd = 0;

  for (const message of messages) {
    const billed = message.metadata?.cost.billedCostUsd;
    if (typeof billed === "number") {
      totalKnownUsd += billed;
    }
  }

  return totalKnownUsd;
}
