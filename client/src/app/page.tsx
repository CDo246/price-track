"use client";
import { trpc } from "../trpc";

export default function Home() {
  const items = trpc.fetchAllItems.useQuery();
  console.log(items.data);
  return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
}
