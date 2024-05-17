using System;
using System.Collections.Generic;

namespace dragonslayer_api.Models;

public partial class CharacterClass
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string? DenialText { get; set; }

    public virtual ICollection<Attack> Attacks { get; set; } = new List<Attack>();

    public virtual ICollection<Stat> Stats { get; set; } = new List<Stat>();
}
