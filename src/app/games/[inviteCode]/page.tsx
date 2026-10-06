import { Badge, Button, Card, Container, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

import { getTableStore } from "../../../game/server";

type TablePageProps = {
  params: Promise<{ inviteCode: string }>;
};

export default async function TablePage({ params }: TablePageProps) {
  const { inviteCode } = await params;
  const table = await getTableStore().findByInviteCode(inviteCode);
  if (!table) {
    notFound();
  }

  const expansions = ["Base game", ...table.settings.expansions.map(expansionLabel)].join(" · ");
  const visibility = table.settings.visibility === "private" ? "Private link" : "Public lobby";

  return (
    <main className="table-setup-page">
      <Container py={{ base: 32, sm: 64 }} size="sm">
        <Stack gap="xl">
          <Group justify="space-between">
            <Text c="forest.8" component={Link} fw={800} href="/" size="lg">Forest Shuffle</Text>
            <Badge color="forest" variant="light">Waiting for players</Badge>
          </Group>
          <Paper p={{ base: "lg", sm: "xl" }} radius="lg" shadow="sm" withBorder>
            <Stack align="center" gap="lg">
              <div>
                <Title order={1} ta="center">Your table is ready</Title>
                <Text c="dimmed" mt="xs" ta="center">Share this code or the page link with your fellow forest keepers.</Text>
              </div>
              <Text className="invite-code" component="code">{table.inviteCode}</Text>
              <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="sm" w="100%">
                <Card padding="md" radius="md" withBorder>
                  <Text c="dimmed" size="xs" tt="uppercase">Visibility</Text>
                  <Text fw={700}>{visibility}</Text>
                </Card>
                <Card padding="md" radius="md" withBorder>
                  <Text c="dimmed" size="xs" tt="uppercase">In the lobby</Text>
                  <Text fw={700}>{table.playerDisplayNames.join(" · ")}</Text>
                  <Text c="dimmed" size="sm">{table.playerCount} of {table.settings.maxPlayers} seats</Text>
                </Card>
                <Card padding="md" radius="md" withBorder>
                  <Text c="dimmed" size="xs" tt="uppercase">Cards</Text>
                  <Text fw={700}>{expansions}</Text>
                </Card>
              </SimpleGrid>
              <Button component="a" href="/games/new" variant="light">Browse more tables</Button>
            </Stack>
          </Paper>
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
