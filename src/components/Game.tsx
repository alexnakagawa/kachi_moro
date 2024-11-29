import { useState } from "react";
import { useGameRoom } from "@/hooks/useGameRoom";
import { stringToColor } from "@/utils";

interface GameProps {
  username: string;
  roomId: string;
}

const Game = ({ username, roomId }: GameProps) => {
  const { gameState, dispatch } = useGameRoom(username, roomId);

  // Indicated that the game is loading
  if (gameState === null) {
    return (
      <p>
        <span className="transition-all w-fit inline-block mr-4 animate-bounce">
          🎲
        </span>
        Waiting for server...
      </p>
    );
  }

  const handleRoll = (event: React.SyntheticEvent) => {
    event.preventDefault();
    const roll = Math.floor(Math.random() * 6) + 1;
    dispatch({ type: "roll", roll: roll });
  };

  return (
    <>
      <h1 className="text-2xl border-b border-yellow-400 text-center relative">
        🎲 Roll the dice!
      </h1>
      <section>
        <form
          className="flex flex-col gap-4 py-6 items-center"
          onSubmit={handleRoll}
        >
          <div className="text-7xl font-bold text-stone-50 bg-black rounded p-2">
            {gameState.rolledNumber || "?"}
          </div>
          <button className="rounded border p-5 bg-yellow-400 group text-black shadow hover:animate-wiggle">
            Roll!
          </button>
        </form>

        <div className="border-t border-yellow-400 py-2" />

        <div className=" bg-yellow-100 flex flex-col p-4 rounded text-sm">
          {gameState.log.map((logEntry, i) => (
            <p key={logEntry.dt} className="animate-appear text-black">
              {logEntry.message}
            </p>
          ))}
        </div>

        <h2>Player Coins</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(gameState.userInventories).map(([userId, inventory]) => {
            return (
              <div key={userId}>
                <p>USER: {userId}</p>
                <p>INCOME: {inventory.income}</p>
                {/* <p>CARDS: {inventory.landmarkCards}</p> */}
              </div>
            )
          })}
        </div>

        <h2 className="text-lg">
          Players in room <span className="font-bold">{roomId}</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {gameState.users.map((user) => {
            return (
              <p
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-white"
                style={{ backgroundColor: stringToColor(user.id + roomId) }}
                key={user.id}
              >
                {user.id}
              </p>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default Game;
