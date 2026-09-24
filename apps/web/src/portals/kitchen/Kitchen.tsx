import StationBoard from "../../components/StationBoard.js";

export default function Kitchen(): JSX.Element {
  return (
    <section aria-labelledby="kitchen-title">
      <p className="text-sm font-medium text-green-700">Staff portal · food tickets only</p>
      <h1 id="kitchen-title" className="mt-1 text-2xl font-bold">
        Kitchen
      </h1>
      <StationBoard station="KITCHEN" />
    </section>
  );
}
