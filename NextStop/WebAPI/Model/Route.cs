namespace WebAPI.Model;

public partial class Route
{
    public int Id { get; set; }

    public string? Routenumber { get; set; }

    public DateTime? Validfrom { get; set; }

    public DateTime? Validto { get; set; }

    public bool? Isweekend { get; set; }
}
