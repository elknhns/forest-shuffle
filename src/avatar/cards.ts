export const avatarCards = [
  { id: "birch", label: "Birch" },
  { id: "roe-deer", label: "Roe Deer" },
  { id: "european-hare", label: "European Hare" },
  { id: "oak", label: "Oak" },
  { id: "red-fox", label: "Red Fox" },
  { id: "tawny-owl", label: "Tawny Owl" }
] as const;

export type AvatarCardId = (typeof avatarCards)[number]["id"];

export function pickAvatarCard(random: () => number = Math.random): AvatarCardId {
  const index = Math.min(Math.floor(random() * avatarCards.length), avatarCards.length - 1);
  return avatarCards[index].id;
}

export function avatarCardLabel(card: AvatarCardId): string {
  return avatarCards.find((avatar) => avatar.id === card)?.label ?? "Forest";
}
