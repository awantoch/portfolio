import H1 from "./H1.astro";
import H2 from "./H2.astro";
import H3 from "./H3.astro";
import H4 from "./H4.astro";
import H5 from "./H5.astro";
import H6 from "./H6.astro";
import Pre from "./Pre.astro";
import Link from "./Link.astro";
import Image from "./Image.astro";
import Table from "./Table.astro";
import YouTube from "./YouTube.astro";
import OrthodoxCrosses from "../OrthodoxCrosses.astro";

export const webComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  pre: Pre, a: Link, img: Image, Image, Table, YouTube,
  FlowerOfLife: OrthodoxCrosses, OrthodoxCrosses,
};
