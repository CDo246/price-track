import { prisma } from "../../prisma";
import { fetchProduct } from "./price";

// async function fetchFromManyURL() {
//   const urls = [
//     "https://www.amazon.com.au/Clara-Clark-Bathroom-Non-Slip-Machine/dp/B09X6B38F1/?_encoding=UTF8&_ref=dlx_gate_dd_dcl_tlt_f81df1c0_dt&pd_rd_w=3zmBK&content-id=amzn1.sym.c3518474-f550-4d77-a0bf-030e9e012464&pf_rd_p=c3518474-f550-4d77-a0bf-030e9e012464&pf_rd_r=YBW2ACDXZASJX9AVV75Z&pd_rd_wg=tzjBS&pd_rd_r=a81e7f1d-45bc-4a42-8226-bbad258eaa77&ref_=pd_gw_unk",
//     "https://www.kmart.co.nz/product/command-mounting-hooks-small-40796338/",
//     "https://www.aliexpress.com/item/1005006116765149.html?spm=a2g0o.tm1000004346.3888118360.3.489b6690Td71fG&pdp_ext_f=%7B%22ship_from%22:%22CN%22,%22sku_id%22:%2212000035826815792%22%7D&scm=1007.25281.317569.0&scm_id=1007.25281.317569.0&scm-url=1007.25281.317569.0&pvid=df68b448-dd59-47dd-bd2e-9c49fa18218f&utparam=%257B%2522process_id%2522%253A%2522standard-item-process-1%2522%252C%2522x_object_type%2522%253A%2522product%2522%252C%2522pvid%2522%253A%2522df68b448-dd59-47dd-bd2e-9c49fa18218f%2522%252C%2522belongs%2522%253A%255B%257B%2522floor_id%2522%253A%252240192084%2522%252C%2522id%2522%253A%252232413544%2522%252C%2522type%2522%253A%2522dataset%2522%257D%252C%257B%2522id_list%2522%253A%255B%25221000507555%2522%255D%252C%2522type%2522%253A%2522gbrain%2522%257D%255D%252C%2522pageSize%2522%253A%252218%2522%252C%2522language%2522%253A%2522en%2522%252C%2522scm%2522%253A%25221007.25281.317569.0%2522%252C%2522countryId%2522%253A%2522AU%2522%252C%2522scene%2522%253A%2522TopSelection-Waterfall%2522%252C%2522tpp_buckets%2522%253A%252221669%25230%2523265320%252347_21669%25234190%252319163%2523515_15281%25230%2523317569%25230%2522%252C%2522x_object_id%2522%253A%25221005006116765149%2522%257D&pdp_npi=3%40dis%21AUD%21AU%20%244.90%21AU%20%240.78%21%21%21%21%21%402103241116996099740561272e23c3%2112000035826815792%21gdf%21%21&aecmd=true",
//     "https://www.uniqlo.com/au/en/products/E458034-000?colorCode=COL59&sizeCode=SMA003",
//     "https://www.asos.com/au/asics/asics-gel-sonoma-15-50-sneakers-in-safari-khaki-and-sand/prd/204486068#colourWayId-204486078",
//     "https://www.theiconic.com.au/paris-1131447.html",
//     "https://www.ebay.com/itm/155658749963?_trkparms=%26rpp_cid%3D653010d6397d9c6e63af9f61%26rpp_icid%3D653010d6397d9c6e63af9f60&_trkparms=parentrq%3Ab8a8778518b0a773db122617ffffda30%7Cpageci%3A484eeb9a-7faf-11ee-bc1f-5ed9fb4a9946%7Ciid%3A1%7Cvlpname%3Avlp_homepage",
//     "https://www.depop.com/products/laraaconn-slida-windbreaker-track-pants/?moduleOrigin=depop_edit",
//   ];

//   // const product = await fetchProduct(url);
//   // console.log(product);

//   // For each URL, fetch the product (in a Promise.all), log it alongside the domain name
//   const products = await Promise.all(
//     urls.map(async (url) => {
//       const product = await fetchProduct(url);
//       const domain = new URL(url).hostname;
//       return { domain, product };
//     })
//   );

//   console.log(products);

// }

export async function createNewItem(url: string) {
  const product = await fetchProduct(url);
  if (product === null) {
    throw new Error("Failed to fetch product");
  }
  const newItem = await prisma.item.create({
    data: {
      name: product.name,
      entries: {
        create: [
          {
            url: url,
            metas: {
              create: [
                {
                  fetchTime: new Date(),
                  name: product.name,
                  price: product.price,
                },
              ],
            },
          },
        ],
      },
    },
  });
  return newItem;
}

export async function createEntryForItem(itemId: number, url: string) {
  //checking for duplicate entry
  const existing = await prisma.entry.findFirst({
    where: { itemId: itemId, url: url },
  });
  if (existing != null) {
    throw new Error(`Entry ${url} already exists`);
  }

  const product = await fetchProduct(url);
  if (product === null) {
    throw new Error("Failed to fetch product");
  }
  console.log(`Creating new entry for ${product.name}`);
  const entry = await prisma.entry.create({
    data: { url: url, itemId: itemId },
  });
  await prisma.meta.create({
    data: {
      fetchTime: new Date(),
      name: product.name,
      price: product.price,
      entryId: entry.id,
    },
  });
  console.log(`Created new entry for ${entry.url}`);
}

export async function deleteEntry(entryId: number) {
  await prisma.entry.delete({ where: { id: entryId } });
}

export async function deleteItem(itemId: number) {
  await prisma.item.delete({ where: { id: itemId } });
}

export async function renameItem(itemId: number, newName: string) {
  await prisma.item.update({ where: { id: itemId }, data: { name: newName } });
  console.log(`Renamed item ${itemId} to ${newName}`);
}

export async function fetchAllItemsWithData() {
  const items = await prisma.item.findMany({
    include: {
      entries: {
        include: { metas: { orderBy: { fetchTime: "desc" }, take: 1 }},
      },
    },
  });
  console.log(items);
  return items;
}

export async function fetchItemData(itemId: number) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { entries: { include: { metas: true } } },
  });
  console.log(item);
  return item;
}
