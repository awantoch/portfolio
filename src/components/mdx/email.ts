import H1 from "./email/h1.astro";
import H2 from "./email/h2.astro";
import H3 from "./email/h3.astro";
import H4 from "./email/h4.astro";
import H5 from "./email/h5.astro";
import H6 from "./email/h6.astro";
import P from "./email/p.astro";
import A from "./email/a.astro";
import Img from "./email/img.astro";
import Pre from "./email/pre.astro";
import Code from "./email/code.astro";
import Table from "./email/TableElement.astro";
import Th from "./email/th.astro";
import Td from "./email/td.astro";
import Blockquote from "./email/blockquote.astro";
import Ul from "./email/ul.astro";
import Ol from "./email/ol.astro";
import Li from "./email/li.astro";
import Strong from "./email/strong.astro";
import CustomTable from "./email/CustomTable.astro";
import YouTube from "./email/YouTube.astro";
import Empty from "./email/Empty.astro";

export const emailComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: P,
  a: A,
  img: Img,
  pre: Pre,
  code: Code,
  table: Table,
  th: Th,
  td: Td,
  blockquote: Blockquote,
  ul: Ul,
  ol: Ol,
  li: Li,
  strong: Strong,
  Image: Img, Table: CustomTable, YouTube, FlowerOfLife: Empty, OrthodoxCrosses: Empty,
};
