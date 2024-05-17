using System;
using System.Collections.Generic;

namespace dragonslayer_api.Models;

public partial class Attack
{
    public int Id { get; set; }

    public int CharacterClassId { get; set; }

    public int? DisplayId { get; set; }

    public string Name { get; set; } = null!;

    public int ManaCost { get; set; }

    public int Power { get; set; }

    public string Description { get; set; } = null!;

    public string AttackText { get; set; } = null!;

    public virtual CharacterClass CharacterClass { get; set; } = null!;

    public virtual ICollection<ExtraEffect> ExtraEffects { get; set; } = new List<ExtraEffect>();
}
