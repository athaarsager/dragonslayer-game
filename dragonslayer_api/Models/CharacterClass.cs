using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace dragonslayer_api.Models;

public partial class CharacterClass
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string? DenialText { get; set; }

    [JsonIgnore]
    public virtual ICollection<Attack> Attacks { get; set; } = new List<Attack>();
    [JsonIgnore]
    public virtual ICollection<Stat> Stats { get; set; } = new List<Stat>();
}
