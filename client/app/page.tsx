export default function Home() {
  return (
    <div className="bg-blue-200 flex h-screen w-full justify-center items-center flex-col">
      <h1 className="font-bold text-2xl">Welcome to the game!</h1>
      <p>Go to route /game/:GameID to join the game</p>
    </div>
  );
}
