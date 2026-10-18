/** One Roll20 character attribute, as stored in `character.attribs`. */
export interface Roll20Attribute {
  name: string;
  current: string;
  max?: string;
}

export interface Roll20Character {
  name: string;
  /** Free-text biography / notes (things the sheet has no field for). */
  bio: string;
  attributes: Roll20Attribute[];
  /** Human-readable notes about data that could not be mapped faithfully. */
  warnings: string[];
}
