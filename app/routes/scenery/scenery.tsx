import { SceneryGrid } from "~/components/scenery-grid";
import Wrapper from "~/wrapper";

export function meta() {
  return [
    { title: "TM Bank" },
    { name: "description", content: "Welcome to the tm bank!" },
  ];
}

export default function Scenery() {
  return (
    <Wrapper>
      <SceneryGrid />
    </Wrapper>
  );
}
