namespace WebAPI.Model;

public partial class Person
{
    public int Id { get; set; }

    public string Firstname { get; set; } = null!;

    public string Lastname { get; set; } = null!;

    public DateTime? Dateofbirth { get; set; }

    public string? Email { get; set; }
}
