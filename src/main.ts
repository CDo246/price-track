import { fetchProduct } from "./price";

async function main() {
  const url =
    "https://www.aliexpress.com/item/1005005443708260.html?src=google&aff_fcid=73d678c5f45b47d9b9f4bac9f69eab9c-1698062879110-00282-UneMJZVf&aff_fsk=UneMJZVf&aff_platform=aaf&sk=UneMJZVf&aff_trace_key=73d678c5f45b47d9b9f4bac9f69eab9c-1698062879110-00282-UneMJZVf&terminal_id=82f61d171f8b4e14921a8c3e533787d5&afSmartRedirect=y";

  const product = await fetchProduct(url);

  console.log(product);
}

main();
