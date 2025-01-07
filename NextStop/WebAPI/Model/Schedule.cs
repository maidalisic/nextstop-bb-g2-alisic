namespace WebAPI.Model;

public partial class Schedule
{
    public int Id { get; set; }

    public int? Routeid { get; set; }

    public int? Stopid { get; set; }

    public TimeSpan? Scheduledtime { get; set; }

    public bool? Isholiday { get; set; }
}
