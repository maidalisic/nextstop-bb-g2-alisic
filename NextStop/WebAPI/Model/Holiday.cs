namespace WebAPI.Model;

public partial class Holiday
{
    public int Id { get; set; }

    public DateTime? Date { get; set; }

    public string? Name { get; set; }

    public bool? Isschoolholiday { get; set; }
}
