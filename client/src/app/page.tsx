"use client";
import { inferReactQueryProcedureOptions } from "@trpc/react-query";
import { ProcedureOutput, trpc } from "../trpc";
import type { Item } from "@prisma/client";
import type { AppRouter } from "@server/src/routes";
import { useState } from "react";

export default function Home() {
  const items = trpc.fetchAllItemsWithData.useQuery();
  console.log(items.data);
  return (
    <div>
      <h1 className="text-3xl font-bold underline">silly little pricetracker</h1>
      {!items.data ? (
        <div>page is loading, hold your horses</div>
      ) : (
        <ul>
          {items.data.map((item) => (
            <ItemDisplay item={item} key={item.id} />
          ))}
        </ul>
      )}
      <AddItemForm />
    </div>

  );
  // return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
}

type ItemWithData = ProcedureOutput<"fetchAllItemsWithData">[number];

function ItemDisplay(props: { item: ItemWithData }) {
  let prices = props.item.entries.map((entry) => entry.metas[0].price);
  let minPrice = Math.min(...prices);

  
  let aud = Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    useGrouping: false,
  });

  return (
    <li>
      {props.item.name}, {aud.format(minPrice)}
    </li>
  );
}

function AddItemForm() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const createItem = trpc.createNewItem.useMutation();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await createItem.mutateAsync({ url });
          setUrl("");
        } catch (e: any) {
          setError(e.message);
        }
      }}
    >
      <input
        type="text"
        className = "bg-violet-300"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button type="submit">Add item</button>
      {error && <div>{error}</div>}
    </form>
  );
}