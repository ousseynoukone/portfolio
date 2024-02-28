export  class Ability {
    constructor(
      public id : string | null | undefined,
      public name: string,
      public image: string | null,
      public rating : number,
      public type : string | null
    ) {}
  }