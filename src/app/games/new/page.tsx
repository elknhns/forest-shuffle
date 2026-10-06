import {
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Group,
  NativeSelect,
  Paper,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
  Text,
  Title
} from "@mantine/core";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

import { getCurrentUser } from "../../../auth/server";
import { CardAvatar } from "../../components/card-avatar";
import { getTableStore } from "../../../game/server";
import { createTable, joinTable } from "./actions";

export default async function NewGamePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=%2Fgames%2Fnew");
  }
  const publicTables = await getTableStore().listPublicWaiting(user.id);

  return (
    <main className="table-setup-page">
      <Container py={{ base: 32, sm: 64 }} size="lg">
        <Stack gap="xl">
          <Group justify="space-between">
            <Text c="forest.8" component={Link} fw={800} href="/" size="lg">
              Forest Shuffle
            </Text>
            <Group gap="xs" wrap="nowrap">
              <CardAvatar card={user.avatarCard} name={user.displayName} />
              <Text c="dimmed" size="sm">Signed in as {user.displayName}</Text>
            </Group>
          </Group>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" verticalSpacing="xl">
            <Paper p="xl" radius="lg" shadow="sm" withBorder>
              <Stack gap="lg">
                <div>
                  <Text c="forest.7" fw={800} size="xs" tt="uppercase">New table</Text>
                  <Title order={1}>Host a table</Title>
                  <Text c="dimmed" mt="xs">Choose the forest rules, then invite your fellow keepers.</Text>
                </div>

                <form action={createTable} aria-label="Table settings">
                  <Stack gap="lg">
                    <RadioGroup defaultValue="public" label="Table visibility" name="visibility" withAsterisk>
                      <Stack gap="xs" mt="xs">
                        <Radio label="Public lobby — show this table to signed-in players" value="public" />
                        <Radio label="Private link — only invitees can find this table" value="private" />
                      </Stack>
                    </RadioGroup>

                    <NativeSelect
                      data={[
                        { value: "2", label: "2 players" },
                        { value: "3", label: "3 players" },
                        { value: "4", label: "4 players" },
                        { value: "5", label: "5 players" }
                      ]}
                      defaultValue="2"
                      label="Players"
                      name="maxPlayers"
                    />

                    <div>
                      <Text fw={500} size="sm">Expansions</Text>
                      <Text c="dimmed" mb="xs" size="sm">Base game is always included.</Text>
                      <Stack gap="xs">
                        <Checkbox label="Alpine" name="expansions" value="alpine" />
                        <Checkbox label="Woodland Edge" name="expansions" value="woodland-edge" />
                      </Stack>
                    </div>

                    <Button type="submit">Create table</Button>
                  </Stack>
                </form>
              </Stack>
            </Paper>

            <Stack gap="md">
              <div>
                <Text c="forest.7" fw={800} size="xs" tt="uppercase">Public lobby</Text>
                <Title order={2}>Available tables</Title>
                <Text c="dimmed" mt="xs">Join a waiting table and grow your forest together.</Text>
              </div>

              {publicTables.length === 0 ? (
                <Paper p="xl" radius="lg" withBorder>
                  <Text fw={700}>No tables are waiting right now.</Text>
                  <Text c="dimmed" size="sm">Create the first public table for other players to join.</Text>
                </Paper>
              ) : (
                <Stack gap="sm">
                  {publicTables.map((table) => (
                    <Card key={table.inviteCode} padding="lg" radius="lg" withBorder>
                      <Stack gap="md">
                        <Group justify="space-between" wrap="nowrap">
                          <div>
                            <Text fw={800}>{table.hostDisplayName}&apos;s table</Text>
                            <Text c="dimmed" size="sm">{table.playerDisplayNames.join(" · ")}</Text>
                            <Text c="dimmed" size="sm">{table.playerCount} / {table.settings.maxPlayers} players</Text>
                          </div>
                          <Badge color="forest" variant="light">Public</Badge>
                        </Group>
                        <Group gap="xs">
                          <Badge color="gray" variant="outline">Base</Badge>
                          {table.settings.expansions.map((expansion) => (
                            <Badge key={expansion} color="forest" variant="outline">{expansionLabel(expansion)}</Badge>
                          ))}
                        </Group>
                        {table.hasJoined ? (
                          <Button component="a" href={`/games/${table.inviteCode}`} variant="light">Open table</Button>
                        ) : (
                          <form action={joinTable}>
                            <input name="inviteCode" type="hidden" value={table.inviteCode} />
                            <Button fullWidth type="submit" variant="light">Join table</Button>
                          </form>
                        )}
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Stack>
          </SimpleGrid>
        </Stack>
      </Container>
    </main>
  );
}

function expansionLabel(expansion: "alpine" | "woodland-edge" | "exploration"): string {
  switch (expansion) {
    case "alpine":
      return "Alpine";
    case "woodland-edge":
      return "Woodland Edge";
    case "exploration":
      return "Exploration";
  }
}
