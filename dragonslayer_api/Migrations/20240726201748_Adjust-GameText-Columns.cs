using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dragonslayer_api.Migrations
{
    /// <inheritdoc />
    public partial class AdjustGameTextColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_bad_end_text",
                table: "game_text");

            migrationBuilder.DropColumn(
                name: "is_flavor_text",
                table: "game_text");

            migrationBuilder.DropColumn(
                name: "is_good_end_text",
                table: "game_text");

            migrationBuilder.DropColumn(
                name: "is_narrative_text",
                table: "game_text");

            migrationBuilder.DropColumn(
                name: "is_start_text",
                table: "game_text");

            migrationBuilder.AddColumn<string>(
                name: "type",
                table: "game_text",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "type",
                table: "game_text");

            migrationBuilder.AddColumn<bool>(
                name: "is_bad_end_text",
                table: "game_text",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_flavor_text",
                table: "game_text",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_good_end_text",
                table: "game_text",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_narrative_text",
                table: "game_text",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_start_text",
                table: "game_text",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
