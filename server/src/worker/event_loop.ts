import { prisma } from "../../prisma";
import { fetchProduct } from "./price";

export type UpdatedEntry = {
  name: string;
  url: string;
  beforePrice?: number;
  afterPrice: number;
  entryId: number;
};

export async function updateEntryMeta(
  entryId: number
): Promise<UpdatedEntry | null> {
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: { metas: { orderBy: { fetchTime: "desc" }, take: 1 } },
  });
  if (!entry) {
    throw new Error("Entry not found");
  }

  console.log("Fetching", entry.url);
  const product = await fetchProduct(entry.url);
  if (product === null) {
    return null;
  }
  await prisma.meta.create({
    data: {
      fetchTime: new Date(),
      name: product.name,
      price: product.price,
      entry: { connect: { id: entry.id } },
    },
  });

  console.log("Updated", product);
  return {
    name: product.name,
    url: entry.url,
    beforePrice: entry.metas[0]?.price,
    afterPrice: product.price,
    entryId: entry.id,
  };
}

export async function updateAndCheckEntryMetas(): Promise<UpdatedEntry[]> {
  const entries = await prisma.entry.findMany();
  let priceChanged: UpdatedEntry[] = [];

  for (let entry of entries) {
    const updated = await updateEntryMeta(entry.id);
    if (
      updated &&
      updated.beforePrice !== undefined &&
      updated.beforePrice !== updated.afterPrice
    ) {
      priceChanged.push(updated);
    }
  }

  return priceChanged;
}
