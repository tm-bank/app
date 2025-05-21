import { BlocksGrid } from "~/components/blocks-grid";
import Wrapper from "~/wrapper";

export function meta() {
  return [
    { title: "TM Bank | Blocks" },
    { name: "description", content: "Welcome to the TM Bank!" },
  ];
}

export default function Blocks() {
  return (
    <Wrapper>
      <BlocksGrid />
    </Wrapper>
  );
}
