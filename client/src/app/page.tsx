"use client";
import { inferReactQueryProcedureOptions } from "@trpc/react-query";
import { trpc } from "../trpc";
import type { AppRouter, RouterOutputs } from "@server/src/routes";
import { useState } from "react";
import { create } from "domain";

// Import shadcn components
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function Home() {
  const items = trpc.fetchAllItemsWithData.useQuery();

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-foreground text-center mb-8">
          silly little pricetracker
        </h1>

        {!items.data ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 mb-8">
            {items.data.map((item) => (
              <ItemDisplay item={item} key={item.id} />
            ))}
          </div>
        )}

        <Card className="mt-8">
          <CardContent className="pt-6">
            <AddItemForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type ItemWithData = RouterOutputs['fetchAllItemsWithData'][number]

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
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {props.item.name}
            </a>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-primary">
                {aud.format(minPrice)}
              </span>
              {maxPrice > minPrice && (
                <span className="text-sm text-muted-foreground">
                  was {aud.format(maxPrice)}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={async (e) => {
              try {
                await deleteItem.mutateAsync({ itemId: props.item.id });
                utils.fetchAllItemsWithData.invalidate();
              } catch (e: any) {
                console.log("Failed to delete item.", e);
              }
            }}
            disabled={deleteItem.isPending}
          >
            {deleteItem.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>deleting...</span>
              </span>
            ) : (
              "delete"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddItemForm() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const createItem = trpc.createNewItem.useMutation();
  const utils = trpc.useUtils();

  return (
    <form
      className="space-y-4"
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
        <Input
          type="text"
          placeholder="Enter product URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={createItem.isPending || !url.trim()}>
          {createItem.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Adding...
            </span>
          ) : (
            "Add item"
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {createItem.isPending && (
        <Alert>
          <AlertDescription>Adding item to your tracker...</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
