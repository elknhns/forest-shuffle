import type { ExpansionId, RoomSettings } from "./room";

const expansionIds = ["alpine", "woodland-edge", "exploration"] as const satisfies readonly ExpansionId[];
const playerCounts = [2, 3, 4, 5] as const;

export function parseRoomSettings(formData: FormData): RoomSettings {
  const visibility = formValue(formData, "visibility");
  if (visibility !== "public" && visibility !== "private") {
    throw new Error("Choose a public or private table");
  }

  const maxPlayers = Number(formValue(formData, "maxPlayers"));
  if (!playerCounts.includes(maxPlayers as (typeof playerCounts)[number])) {
    throw new Error("Choose between 2 and 5 players");
  }

  const submittedExpansions = formData.getAll("expansions");
  if (!submittedExpansions.every(isExpansionId)) {
    throw new Error("Choose only supported expansions");
  }

  return {
    visibility,
    maxPlayers: maxPlayers as RoomSettings["maxPlayers"],
    expansions: [...new Set(submittedExpansions)]
  };
}

function formValue(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

function isExpansionId(value: FormDataEntryValue): value is ExpansionId {
  return typeof value === "string" && expansionIds.includes(value as ExpansionId);
}
