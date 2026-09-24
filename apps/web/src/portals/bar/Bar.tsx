import StationBoard from "../../components/StationBoard.js";

export default function Bar(): JSX.Element {
  return (
    <section aria-labelledby="bar-title">
      <p className="text-sm font-medium text-amber-700">Staff portal · drink tickets only</p>
      <h1 id="bar-title" className="mt-1 text-2xl font-bold">
        Bar
      </h1>
      <StationBoard station="BAR" />
    </section>
  );
}
