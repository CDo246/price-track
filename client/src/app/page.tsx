"use client";
import { inferReactQueryProcedureOptions } from "@trpc/react-query";
import { ProcedureOutput, trpc } from "../trpc";
import type { Item } from "@prisma/client";
import type { AppRouter } from "@server/src/routes";
import { useState } from "react";
import { create } from "domain";

export default function Home() {
  const items = trpc.fetchAllItemsWithData.useQuery();

  return (
    <div className="min-h-screen bg-base-100 text-base-content py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary text-center mb-8">
          silly little pricetracker
        </h1>

        {!items.data ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-4 mb-8">
            {items.data.map((item) => (
              <ItemDisplay item={item} key={item.id} />
            ))}
          </div>
        )}

        <div className="card bg-base-200 mt-8">
          <div className="card-body">
            <AddItemForm />
          </div>
        </div>
      </div>
    </div>
  );
}

type ItemWithData = ProcedureOutput<"fetchAllItemsWithData">[number];

function ItemDisplay(props: { item: ItemWithData }) {
  let prices = props.item.entries.map((entry) => entry.metas[0].price);
  let minPrice = Math.min(...prices);
  let maxPrice = Math.max(...prices);
  let url = props.item.entries[0]?.url;

  let aud = Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    useGrouping: true,
  });

  const deleteItem = trpc.deleteItem.useMutation();
  const utils = trpc.useUtils();

  return (
    <div className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-200">
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-title text-primary hover:text-accent transition-colors duration-200"
            >
              {props.item.name}
            </a>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-accent">
                {aud.format(minPrice)}
              </span>
              {maxPrice > minPrice && (
                <span className="text-sm opacity-70">
                  was {aud.format(maxPrice)}
                </span>
              )}
            </div>
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
            {deleteItem.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>deleting...</span>
              </span>
            ) : (
              "delete"
            )}
          </button>
        </div>
      </div>
    </div>
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
        setError("");
        try {
          await createItem.mutateAsync({ url });
          utils.fetchAllItemsWithData.invalidate();
          setUrl("");
        } catch (e: any) {
          setError(e.message);
        }
      }}
    >
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Enter product URL"
          className="input input-bordered flex-1"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={createItem.isPending || !url.trim()}
        >
          {createItem.isPending ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Adding...
            </span>
          ) : (
            "Add item"
          )}
        </button>
      </div>

      {error && (
        <div className="alert alert-error mt-4">
          <p>{error}</p>
        </div>
      )}

      {createItem.isPending && (
        <div className="alert alert-info mt-4">
          <p>Adding item to your tracker...</p>
        </div>
      )}
    </form>
  );
}
