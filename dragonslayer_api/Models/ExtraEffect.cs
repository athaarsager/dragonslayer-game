﻿using System;
using System.Collections.Generic;

namespace dragonslayer_api.Models;

public partial class ExtraEffect
{
    public int Id { get; set; }

    public int AttackId { get; set; }

    public string TargetCharacter { get; set; } = null!;

    public string? TargetStat { get; set; }

    public decimal? EffectMultiplier { get; set; }

    public int? TurnsLost { get; set; }

    public int? AttackToBeReplacedBy { get; set; }

    public string? SpecialText { get; set; }

    public virtual Attack Attack { get; set; } = null!;
}
