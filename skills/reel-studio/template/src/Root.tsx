import { Composition } from "remotion";
import { Demo, DEMO_SECONDS } from "./Demo";
import { Reel } from "./Reel";
import { FPS, TOTAL } from "./timeline";

// "Reel" is the project's edit (finish.sh renders it). "Demo" needs no media and proves the setup renders.
export const Root: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ music: true }} />
    <Composition id="Demo" component={Demo} durationInFrames={Math.round(DEMO_SECONDS * FPS)} fps={FPS} width={1080} height={1920} />
  </>
);
