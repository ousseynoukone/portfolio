export  class Ability {
    constructor(
      public id : number | null | undefined,
      public name: string,
      public image: string | null,
      public rating : number,
    ) {}
  }