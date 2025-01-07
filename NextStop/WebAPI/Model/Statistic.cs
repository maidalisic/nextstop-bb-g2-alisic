namespace WebAPI.Model;

public partial class Statistic
{
    public int Id { get; set; }

    public int? Routeid { get; set; }

    public DateTime Reportdate { get; set; }

    public int? Averagedelay { get; set; }

    public decimal? OntimePercentage { get; set; }
}
