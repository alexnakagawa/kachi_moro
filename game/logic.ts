// util for easy adding logs
const addLog = (message: string, logs: GameState["log"]): GameState["log"] => {
  return [{ dt: new Date().getTime(), message: message }, ...logs].slice(
    0,
    MAX_LOG_SIZE
  );
};

// If there is anything you want to track for a specific user, change this interface
export interface User {
  id: string;
}

// Do not change this! Every game has a list of users and log of actions
interface BaseGameState {
  users: User[];
  log: {
    dt: number;
    message: string;
  }[];
}

interface Card {
  id: string;
  name: string;
  cost: number;
  earns: number;
  effect: string; // Description of what the card does
}

// The baseline establishment card
interface EstablishmentCard extends Card {
  numbersToActivate: number[];
  type: ECType;
}

// Add enum for card types
enum ECType {
  PRIMARY_INDUSTRY = 'PRIMARY_INDUSTRY',     // Activates on anyone's turn
  SECONDARY_INDUSTRY = 'SECONDARY_INDUSTRY', // Activates on owner's turn only
  RESTAURANT = 'RESTAURANT',                // Activates on opponent's turns
  MAJOR_ESTABLISHMENT = 'MAJOR_ESTABLISHMENT' // Activates on owner's turn only
}

interface LandmarkCard extends Card {
  isActive: boolean;
}

const startingEstablishmentMap: Record<number, EstablishmentCard[]> = {
  1: [
    {
      id: "wheat_field_0",
      name: "Wheat Field",
      cost: 0,
      effect: "Get 1 coin from the bank.",
      earns: 1,
      numbersToActivate: [1],
      type: ECType.PRIMARY_INDUSTRY,
    }
  ],
  2: [
    {
      id: "bakery_1",
      name: "Bakery",
      cost: 0,
      effect: "Get 1 coin from the bank.",
      earns: 1, 
      numbersToActivate: [2],
      type: ECType.SECONDARY_INDUSTRY,
    }
  ]
}

interface UserInventory {
  establishmentMap: Record<number, EstablishmentCard[]>;
  landmarkCards: LandmarkCard[];
  income: number;
}

// Do not change!
export type Action = DefaultAction | GameAction;

// Do not change!
export type ServerAction = WithUser<DefaultAction> | WithUser<GameAction>;

// The maximum log size, change as needed
const MAX_LOG_SIZE = 4;

type WithUser<T> = T & { user: User };

export type DefaultAction = { type: "UserEntered" } | { type: "UserExit" };

// This interface holds all the information about your game
export interface GameState extends BaseGameState {
  userInventories: Record<string, UserInventory> | {};
  rolledNumber: number | null;
}

// This is how a fresh new game starts out, it's a function so you can make it dynamic!
// In the case of the guesser game we start out with a random target
export const initialGame = () => ({
  users: [],
  log: addLog("Game Created!", []),
  userInventories: {},
  rolledNumber: null,
});

// Here are all the actions we can dispatch for a user
type GameAction = { type: "roll"; roll: number } | { type: "build"; buildingId: string };

const updateInventories = (action: GameAction, userInventories: Record<string, UserInventory>): Record<string, UserInventory> => {
  if (action.type == "roll" ){
    Object.entries(userInventories).forEach(([userId, inventory]) => {
      Object.entries(inventory.establishmentMap).forEach(([cardId, cards]) => {
        cards.forEach(card => {
          if (card.numbersToActivate.includes(action.roll)) {
            // console.log(`User ${userId}'s card ${card.name} activated on roll ${action.roll}`);
            
            userInventories[userId].income += card.earns;
          }
        });
      });
    });
  }
  // else if action.type == "build" {
    
  // }
  return userInventories;
}




export const gameUpdater = (
  action: ServerAction,
  state: GameState
): GameState => {
  // This switch should have a case for every action type you add.

  // "UserEntered" & "UserExit" are defined by default

  // Every action has a user field that represent the user who dispatched the action,
  // you don't need to add this yourself

  switch (action.type) {
    case "UserEntered":
      const userInventory: UserInventory = {
        establishmentMap: startingEstablishmentMap,
        landmarkCards: [],
        income: 0
      };

      return {
        ...state,
        userInventories: {
          ...state.userInventories,
          [action.user.id]: userInventory
        },
        users: [...state.users, action.user],
        log: addLog(`user ${action.user.id} joined 🎉`, state.log),
      };

    case "UserExit":
      return {
        ...state,
        users: state.users.filter((user) => user.id !== action.user.id),
        log: addLog(`user ${action.user.id} left 😢`, state.log),
      };

    case "roll":
      return {
        ...state,
        userInventories: updateInventories(action, state.userInventories),
        rolledNumber: action.roll,
        log: addLog(`user ${action.user.id} rolled a ${action.roll}`, state.log),
      };
  }
  return state;
};
