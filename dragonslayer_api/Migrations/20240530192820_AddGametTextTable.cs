using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace dragonslayer_api.Migrations
{
    /// <inheritdoc />
    public partial class AddGametTextTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GameText",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    is_start_text = table.Column<bool>(type: "boolean", nullable: false),
                    is_flavor_text = table.Column<bool>(type: "boolean", nullable: false),
                    is_narrative_text = table.Column<bool>(type: "boolean", nullable: false),
                    is_good_end_text = table.Column<bool>(type: "boolean", nullable: false),
                    is_bad_end_text = table.Column<bool>(type: "boolean", nullable: false),
                    text_content = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("game_text_pkey", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GameText");
        }
    }
}
