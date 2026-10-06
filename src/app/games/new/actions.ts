"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "../../../auth/server";
import { parseRoomSettings } from "../../../game/room-settings";
import { getTableStore } from "../../../game/server";

export async function createTable(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=%2Fgames%2Fnew");
  }

  const table = await getTableStore().create({
    host: { id: user.id, displayName: user.displayName },
    settings: parseRoomSettings(formData)
  });

  redirect(`/games/${table.inviteCode}`);
}

export async function joinTable(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=%2Fgames%2Fnew");
  }

  const inviteCode = formData.get("inviteCode");
  if (typeof inviteCode !== "string" || inviteCode.length === 0) {
    throw new Error("A table code is required");
  }

  const table = await getTableStore().join({
    inviteCode,
    player: { id: user.id, displayName: user.displayName }
  });

  redirect(`/games/${table.inviteCode}`);
}
