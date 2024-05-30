using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dragonslayer_api.Migrations
{
    /// <inheritdoc />
    public partial class RenameGameTextTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "GameText",
                newName: "game_text");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameTable(
                name: "game_text",
                newName: "GameText");
        }
    }
}
