export interface ITrait {
  id: string;
  name: string;
  description: string;
}

export interface ISkillSet {
  id: string;
  name: string;
  traits: ITrait[];
}

const traitDefinitions = {
  "gf": {
    units: [
      {
        "name": "Agile",
        "description": "Moves +1” on advance and +2” on rush and charge."
      },
      {
        "name": "Headstrong",
        "description": "Gets +1 to rolls when taking morale tests."
      },
      {
        "name": "Specialist",
        "description": "Gets +1 to rolls in melee or shooting (pick one)."
      },
      {
        "name": "Resilient",
        "description": "Gets +1 to rolls when blocking hits."
      },
      {
        "name": "Elite",
        "description": "May re-roll one roll of any kind once per game."
      }
    ],
    heroes: [
      {
        name: "Captain",
        traits: [
          {
            name: "Leader",
            description: "Friendly units within 6” get +1 to morale tests."
          },
          {
            name: "Instigator",
            description: "Friendly units within 6” get +1 to melee."
          },
          {
            name: "Tactician",
            description: "Friendly units within 6” get +1 to shooting."
          }
        ]
      },
      {
        name: "Support",
        traits: [
          {
            name: "Vanguard",
            description: "Friendly units within 6” get +1 to morale tests."
          },
          {
            name: "Scavenger",
            description: "Friendly units within 6” get +1 to melee."
          },
          {
            name: "Mastermind",
            description: "Friendly units within 6” get +1 to shooting."
          }
        ]
      },
      {
        name: "Fighter",
        traits: [
          {
            name: "Duellist",
            description: "Friendly units within 6” get +1 to morale tests."
          },
          {
            name: "Fanatic",
            description: "Friendly units within 6” get +1 to melee."
          },
          {
            name: "Berserker",
            description: "Friendly units within 6” get +1 to shooting."
          }
        ]
      }
    ]
  }
};

export function getTraitDefinitions(gameSystem: string): ITrait[] {
  return traitDefinitions[gameSystem];
}