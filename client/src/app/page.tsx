"use client";
import { inferReactQueryProcedureOptions } from "@trpc/react-query";
import { ProcedureOutput, trpc } from "../trpc";
import type { Item } from "@prisma/client";
import type { AppRouter } from "@server/src/routes";
import { useState } from "react";
import { create } from "domain";

export default function Home() {
  const items = trpc.fetchAllItemsWithData.useQuery();
  console.log(items.data);
  return (
    <div className="flex flex-col min-h-screen">
      <h1 className="text-3xl font-bold text-center">
        silly little pricetracker
      </h1>
      {!items.data ? (
        <div>page is loading, wait</div>
      ) : (
        <ul>
          {items.data.map((item) => (
            <ItemDisplay item={item} key={item.id} />
          ))}
        </ul>
      )}
      <div className="mt-auto">
        <AddItemForm />
      </div>
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

  const deleteItem = trpc.deleteItem.useMutation();
  const utils = trpc.useUtils();
  return (
    <li className="flex items-center mb-2">
      <div>
        {props.item.name}, <b>{aud.format(minPrice)}</b>
      </div>
      <button
        onClick={async (e) => {
          try {
            await deleteItem.mutateAsync({ itemId: props.item.id });
            utils.fetchAllItemsWithData.invalidate();
          } catch (e: any) {
            console.log("Failed to delete item.", e);
          }
        }}
        disabled={deleteItem.isPending}
        className="btn btn-error ml-2 p-2 h-auto min-h-fit"
      >
        delete
      </button>
    </li>
  );
}

function AddItemForm() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const createItem = trpc.createNewItem.useMutation();
  const utils = trpc.useUtils();
  return (
    <form
      className="form-control"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await createItem.mutateAsync({ url });
          utils.fetchAllItemsWithData.invalidate();
          setUrl("");
        } catch (e: any) {
          setError(e.message);
        }
      }}
    >
      <input
        type="text"
        className="input input-bordered"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={createItem.isPending}
      >
        Add item
      </button>
      {error && <div>{error}</div>}
      {createItem.isPending && <div>Adding item...</div>}
    </form>
  );
}
