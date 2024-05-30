using System.Text.Json.Serialization;

namespace dragonslayer_api.Models;

public partial class GameText 
{
    public int Id { get; set; }
    public bool IsStartText { get; set; }
    public bool IsFlavorText { get; set; }
    public bool IsNarrativeText { get; set; }
    public bool IsGoodEndText { get; set; }
    public bool IsBadEndText { get; set; }
    public string? TextContent { get; set; }
}