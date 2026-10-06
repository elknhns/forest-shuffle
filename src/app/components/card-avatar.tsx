import React from "react";

import { avatarCardLabel, type AvatarCardId } from "../../avatar/cards";

type CardAvatarProps = {
  card: AvatarCardId;
  name: string;
  size?: "sm" | "md";
};

export function CardAvatar({ card, name, size = "sm" }: CardAvatarProps) {
  return (
    <span
      aria-label={`${name}'s ${avatarCardLabel(card)} avatar`}
      className="card-avatar"
      data-card={card}
      data-size={size}
      role="img"
    />
  );
}
