export default function Home() {
  return (
    <div className="bg-blue-200 flex h-screen w-full justify-center items-center flex-col">
      <h1 className="font-bold text-2xl">¡Bienvenido al juego!</h1>
      <p>Ve a la ruta /game/:GameID para unirte al juego</p>
    </div>
  );
}
