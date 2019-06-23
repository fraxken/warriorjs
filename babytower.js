class Player {

  constructor() {
    this.currHealth = 20;
    this.currDirection = "forward";
    this.pastWall = false;
  }

  /**
   * @param {Warrior} warrior The warrior.
   * @param {String} direction the direction
   */
  enemyAt(warrior, direction = this.currDirection) {
    for (const space of warrior.look(direction)) {
      if (space.isUnit() && space.getUnit().isEnemy()) {
        const [location] = space.getLocation();
        warrior.think(`find enemy at distance: ${location} for direction: ${direction}`);
        return [true, location]
      }
    }

    return [false, 0];
  }

    /**
   * @param {Warrior} warrior The warrior.
   * @param {String} direction the direction
   */
  countEnemy(warrior, direction = this.currDirection) {
    let count = 0;
    for (const space of warrior.look(direction)) {
      if (space.isUnit() && space.getUnit().isEnemy()) {
        count++;
      }
    }

    return count;
  }

  /**
   * @param {Warrior} warrior The warrior.
   * @param {String} direction the direction
   */
  boundAt(warrior, direction = this.currDirection) {
    for (const space of warrior.look(direction)) {
      if (space.isUnit() && space.getUnit().isBound()) {
        const [location] = space.getLocation();
        warrior.think(`find bound at distance: ${location} for direction: ${direction}`);
        return [true, location]
      }
    }

    return [false, 0];
  }

  reverse(warrior) {
    const reverseDirection = Player.Direction.get(this.currDirection);
    warrior.pivot(reverseDirection);
    this.currDirection = reverseDirection;
  }

  /**
   * Plays a warrior turn.
   *
   * @param {Warrior} warrior The warrior.
   */
  playTurn(warrior) {
    const warriorGettingDamaged = warrior.health() < this.currHealth;
    const feel = warrior.feel(this.currDirection);

    if (feel.isUnit()) {
      warrior.think("detecting unit");
      const unit = feel.getUnit();

      if (unit.isEnemy()) {
        warrior.attack(this.currDirection);
      }
      else if (unit.isBound()) {
        warrior.rescue(this.currDirection);
      }
    }
    else if (feel.isStairs()) {
      warrior.think("is stair!");
      warrior.walk(this.currDirection);
    }
    else if (feel.isWall()) {
      warrior.think("is wall!");
      this.reverse(warrior);
      this.pastWall = true;
    }
    else if (feel.isEmpty()) {
      warrior.think("is empty!");
      const reverseDirection = Player.Direction.get(this.currDirection);
      const [hasEnemyBehind, bDistance] = this.enemyAt(warrior, reverseDirection);
      const [hasBoundBehind] = this.boundAt(warrior, reverseDirection);
      const [hasEnemyForward, fDistance] = this.enemyAt(warrior);
      const [hasBoundForward, eDistance] = this.boundAt(warrior);

      if (hasBoundBehind && !hasEnemyForward) {
        this.reverse(warrior);
      }
      else if (hasBoundForward) {
        if (hasEnemyForward && eDistance < fDistance || !hasEnemyForward) {
          warrior.walk(this.currDirection);
        }
        else {
          warrior.shoot();
        }
      }
      else if (hasEnemyBehind && bDistance === -3) {
        warrior.walk(this.currDirection);
      }
      else if (!hasEnemyBehind && hasEnemyForward) {
        const enemyCount = this.countEnemy(warrior);
        // TODO: optimize here (dont shook if only one enemy at 1 or 2);
        if (fDistance >= 2 && enemyCount >= 2) {
          warrior.shoot();
        }
        else if (warrior.health() <= warrior.maxHealth() - 9) {
          warrior.rest();
        }
        else {
          warrior.walk(this.currDirection);
        }
      }
      else if (warrior.health() < warrior.maxHealth() - 5) {
        const enemyCount = this.countEnemy(warrior);
        if (enemyCount === 0) {
          warrior.walk(this.currDirection);
        }
        else {
          warrior.rest();
        }
      }
      else {
        warrior.think("nobody.. just walk!");
        warrior.walk(this.currDirection);
      }
    }
    else {
      warrior.think("walk reverse...");
      warrior.walk(Player.Direction.get(this.currDirection));
    }

    this.currHealth = warrior.health();
  }
}

Player.Direction = new Map([
  ["forward", "backward"],
  ["backward", "forward"]
]);
