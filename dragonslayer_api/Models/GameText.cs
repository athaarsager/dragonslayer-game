using System.Text.Json.Serialization;

namespace dragonslayer_api.Models;

public partial class GameText 
{
    public int Id { get; set; }
    public string? Type { get; set; }
    public string? TextContent { get; set; }
}