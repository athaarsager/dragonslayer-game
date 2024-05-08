using System;
using System.Collections.Generic;

namespace dragonslayer_api.Models;

public partial class Stat
{
    public int Id { get; set; }

    public int CharacterClassId { get; set; }

    public int Hp { get; set; }

    public int Mana { get; set; }

    public int Defense { get; set; }

    public int Attack { get; set; }

    public virtual CharacterClass CharacterClass { get; set; } = null!;
}
