import { SceneryGrid } from "~/components/scenery-grid";
import Wrapper from "~/wrapper";

export function meta() {
  return [
    { title: "Trackmania Scenery Hub" },
    { name: "description", content: "Welcome to the scenery hub!" },
  ];
}

export default function Scenery() {
  return (
    <Wrapper>
      <SceneryGrid />
    </Wrapper>
  );
}
