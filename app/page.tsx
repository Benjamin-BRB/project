import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const negotiations = await prisma.negotiation.findMany({
    include: {
      product: true,
      steps: { orderBy: { date: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return <DashboardClient negotiations={negotiations} />;
}
